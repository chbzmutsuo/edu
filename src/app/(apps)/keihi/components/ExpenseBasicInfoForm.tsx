'use client'

import {ExpenseFormData} from '@app/(apps)/keihi/types'
import {CONVERSATION_PURPOSES, DEFAULT_CONVERSATION_PURPOSES} from '@app/(apps)/keihi/(constants)/conversation-purposes'
import {generateKeywordsFromContext} from '@app/(apps)/keihi/actions/expense/analyzeReceipt'
import {useState, useEffect} from 'react'

interface ExpenseBasicInfoFormProps {
  formData: ExpenseFormData
  setFormData: React.Dispatch<React.SetStateAction<ExpenseFormData>>
  allOptions: {
    subjects: Array<{value: string; label: string}>
    purposes: Array<{value: string; label: string}>
  }
  getFieldClass: (value: string | number | string[], required?: boolean) => string
}

export function ExpenseBasicInfoForm({formData, setFormData, allOptions, getFieldClass}: ExpenseBasicInfoFormProps) {
  const [keywordInput, setKeywordInput] = useState('')
  const [counterpartyInput, setCounterpartyInput] = useState('')

  // 初期値設定（会話の目的のデフォルト値）
  useEffect(() => {
    if (formData.conversationPurpose.length === 0) {
      setFormData(prev => ({
        ...prev,
        conversationPurpose: [...DEFAULT_CONVERSATION_PURPOSES],
      }))
    }
  }, [formData.conversationPurpose.length, setFormData])

  // キーワード追加
  const addKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()],
      }))
      setKeywordInput('')
    }
  }

  // キーワード削除
  const removeKeyword = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index),
    }))
  }

  // 相手名追加
  const addCounterparty = () => {
    if (counterpartyInput.trim()) {
      const currentValue = formData.counterpartyName || ''
      const newValue = currentValue ? `${currentValue}, ${counterpartyInput.trim()}` : counterpartyInput.trim()

      setFormData(prev => ({
        ...prev,
        counterpartyName: newValue,
      }))
      setCounterpartyInput('')
    }
  }

  // 「その他複数名」を追加
  const addMultipleOthers = () => {
    const currentValue = formData.counterpartyName || ''
    const newValue = currentValue ? `${currentValue}, その他複数名` : 'その他複数名'

    setFormData(prev => ({
      ...prev,
      counterpartyName: newValue,
    }))
  }

  // 会話の目的のチェックボックス変更
  const handlePurposeChange = (purpose: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      conversationPurpose: checked ? [...prev.conversationPurpose, purpose] : prev.conversationPurpose.filter(p => p !== purpose),
    }))
  }

  // キーワード自動生成
  const generateKeywords = async () => {
    const generatedKeywords = await generateKeywordsFromContext(
      formData.counterpartyName,
      formData.conversationPurpose,
      formData.location,
      formData.subject
    )

    // 既存のキーワードと重複しないものを追加
    const newKeywords = generatedKeywords.filter(keyword => !formData.keywords.includes(keyword))

    if (newKeywords.length > 0) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, ...newKeywords],
      }))
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">基本情報</h2>

      {/* 基本情報フィールド */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            日付 <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={e => setFormData(prev => ({...prev, date: e.target.value}))}
            className={getFieldClass(formData.date, true)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            金額 <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.amount}
            onChange={e => setFormData(prev => ({...prev, amount: parseInt(e.target.value) || 0}))}
            className={getFieldClass(formData.amount, true)}
            placeholder="0"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            科目 <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.subject}
            onChange={e => setFormData(prev => ({...prev, subject: e.target.value}))}
            className={getFieldClass(formData.subject, true)}
            required
          >
            <option value="">選択してください</option>
            {allOptions.subjects.map(subject => (
              <option key={subject.value} value={subject.value}>
                {subject.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">ステータス</label>
          <select
            value={(formData as any).status || ''}
            onChange={e => setFormData(prev => ({...(prev as any), status: e.target.value}))}
            className={getFieldClass((formData as any).status || '')}
          >
            <option value="">未設定</option>
            <option value="一次チェック済">一次チェック済</option>
            <option value="MF連携済み">MF連携済み</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">場所</label>
          <input
            type="text"
            value={formData.location}
            onChange={e => setFormData(prev => ({...prev, location: e.target.value}))}
            className={getFieldClass(formData.location || '')}
            placeholder="会場や店舗名など"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">相手名</label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={counterpartyInput}
                onChange={e => setCounterpartyInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addCounterparty())}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="例：Aさん（教師）、Bさん（エンジニア）"
              />
              <button
                type="button"
                onClick={addCounterparty}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                追加
              </button>
              <button
                type="button"
                onClick={addMultipleOthers}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                その他複数名
              </button>
            </div>
            <input
              type="text"
              value={formData.counterpartyName || ''}
              onChange={e => setFormData(prev => ({...prev, counterpartyName: e.target.value}))}
              className={getFieldClass(formData.counterpartyName || '')}
              placeholder="相手名（複数の場合はカンマ区切り）"
            />
          </div>
        </div>

        {/* 相手の職種・業種 フィールドは削除 */}

        {/* 学びの深さ・重要度 フィールドは削除 */}

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">会話内容の要約</label>
          <textarea
            value={formData.conversationSummary || ''}
            onChange={e => setFormData(prev => ({...prev, conversationSummary: e.target.value}))}
            className={getFieldClass(formData.conversationSummary || '')}
            rows={3}
            placeholder="話した内容や気づいた点を記録してください"
          />
        </div>
      </div>

      {/* 会話の目的（チェックボックス） */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">会話の目的（複数選択可）</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {CONVERSATION_PURPOSES.map(purpose => (
            <label key={purpose.value} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.conversationPurpose.includes(purpose.value)}
                onChange={e => handlePurposeChange(purpose.value, e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="text-sm text-gray-700">{purpose.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* キーワード設定セクション */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">キーワード設定</h3>
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={keywordInput}
              onChange={e => setKeywordInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="キーワードを入力してEnterで追加"
            />
            <button
              type="button"
              onClick={addKeyword}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              追加
            </button>
            <button
              type="button"
              onClick={generateKeywords}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              自動生成
            </button>
          </div>

          {/* 既存キーワード表示 */}
          {formData.keywords.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">設定済みキーワード:</p>
              <div className="flex flex-wrap gap-2">
                {formData.keywords.map((keyword, index) => (
                  <span key={index} className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {keyword}
                    <button type="button" onClick={() => removeKeyword(index)} className="ml-2 text-blue-600 hover:text-blue-800">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
