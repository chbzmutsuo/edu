'use client'

import {ExpenseFormData} from '@app/(apps)/keihi/types'
import {CONVERSATION_PURPOSES, DEFAULT_CONVERSATION_PURPOSES} from '@app/(apps)/keihi/(constants)/conversation-purposes'
import {generateKeywordsFromContext} from '@app/(apps)/keihi/actions/expense/analyzeReceipt'
import {useState, useEffect, useCallback} from 'react'

interface ExpenseBasicInfoFormProps {
  formData: ExpenseFormData
  setFormData: any
  allOptions: {
    subjects: Array<{value: string; label: string}>
    purposes: Array<{value: string; label: string}>
  }
  getFieldClass: (value: string | number | string[], required?: boolean) => string
}

export function ExpenseBasicInfoForm({formData, setFormData, allOptions, getFieldClass}: ExpenseBasicInfoFormProps) {
  const [keywordInput, setKeywordInput] = useState('')

  const [conversationPurposeList, setConversationPurposeList] = useState<string[]>(formData.conversationPurpose || [])

  // キーワード追加
  const addKeyword = useCallback(() => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData('keywords', [...(formData.keywords || []), keywordInput.trim()])
      setKeywordInput('')
    }
  }, [keywordInput, formData.keywords, setFormData])

  // キーワード削除
  const removeKeyword = useCallback(
    (index: number) => {
      setFormData(
        'keywords',
        formData.keywords.filter((_, i) => i !== index)
      )
    },
    [setFormData]
  )

  // キーワード自動生成
  const generateKeywords = useCallback(async () => {
    const generatedKeywords = await generateKeywordsFromContext(
      formData.counterpartyName,
      formData.conversationPurpose,
      formData.location,
      formData.subject
    )

    setFormData('keywords', [...(formData.keywords || []), ...generatedKeywords])
  }, [formData.counterpartyName, formData.conversationPurpose, formData.location, formData.subject, setFormData])

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
            value={formData.date ?? ''}
            onChange={e => setFormData('date', e.target.value)}
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
            onChange={e => {
              setFormData('amount', parseInt(e.target.value) || 0)
            }}
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
            value={formData.subject ?? ''}
            onChange={e => setFormData('subject', e.target.value)}
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
          <div className="flex space-x-2">
            {[
              {value: '', label: '未設定'},
              {value: '一次チェック済', label: '一次チェック済'},
              {value: 'MF連携済み', label: 'MF連携済み'},
            ].map(status => (
              <button
                type="button"
                key={status.value}
                onClick={() => setFormData('status', status.value)}
                className={`px-3 py-2 rounded-md text-sm ${
                  formData.status === status.value ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">場所</label>
          <input
            type="text"
            value={formData.location ?? ''}
            onChange={e => setFormData('location', e.target.value)}
            className={getFieldClass(formData.location || '')}
            placeholder="会場や店舗名など"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">相手名</label>
          <div className="space-y-2">
            <input
              id="counterpartyInput"
              type="text"
              value={formData.counterpartyName || ''}
              onChange={e => setFormData('counterpartyName', e.target.value)}
              className={getFieldClass(formData.counterpartyName || '')}
              placeholder="相手名（複数の場合はカンマ区切り）"
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">会話内容の要約</label>
          <textarea
            value={formData.conversationSummary || ''}
            onChange={e => setFormData('conversationSummary', e.target.value)}
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
                checked={conversationPurposeList.includes(purpose.value)}
                onChange={e => {
                  setConversationPurposeList((prev: string[]) => {
                    if (prev.includes(purpose.value)) {
                      return prev.filter(p => p !== purpose.value)
                    }
                    const result = [...prev, purpose.value]

                    return result
                  })
                }}
                onBlur={() => {
                  setFormData('conversationPurpose', conversationPurposeList)
                }}
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
              value={keywordInput ?? ''}
              onChange={e => {
                setKeywordInput(e.target.value)
              }}
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
          {formData.keywords?.length > 0 && (
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
