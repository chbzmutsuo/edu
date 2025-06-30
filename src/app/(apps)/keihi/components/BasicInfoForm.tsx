'use client'

import {ExpenseFormData} from '@app/(apps)/keihi/types'
import {useState} from 'react'

interface BasicInfoFormProps {
  formData: ExpenseFormData
  setFormData: React.Dispatch<React.SetStateAction<ExpenseFormData>>
  allOptions: {
    subjects: Array<{value: string; label: string}>
    purposes: Array<{value: string; label: string}>
  }
  getFieldClass: (value: string | number | string[], required?: boolean) => string
}

export default function BasicInfoForm({formData, setFormData, allOptions, getFieldClass}: BasicInfoFormProps) {
  const [keywordInput, setKeywordInput] = useState('')

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

  return (
    <div className="space-y-6">
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
          <label className="block text-sm font-medium text-gray-700 mb-2">場所</label>
          <input
            type="text"
            value={formData.location}
            onChange={e => setFormData(prev => ({...prev, location: e.target.value}))}
            className={getFieldClass(formData.location || '')}
            placeholder="会場や店舗名など"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">相手名</label>
          <input
            type="text"
            value={formData.counterpartyName}
            onChange={e => setFormData(prev => ({...prev, counterpartyName: e.target.value}))}
            className={getFieldClass(formData.counterpartyName || '')}
            placeholder="個人名または法人名"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">相手の職種・業種</label>
          <input
            type="text"
            value={formData.counterpartyIndustry}
            onChange={e => setFormData(prev => ({...prev, counterpartyIndustry: e.target.value}))}
            className={getFieldClass(formData.counterpartyIndustry || '')}
            placeholder="例：飲食店経営、小学校教師、人事担当者、運送業"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">会話の目的</label>
          <select
            value={formData.conversationPurpose}
            onChange={e => setFormData(prev => ({...prev, conversationPurpose: e.target.value}))}
            className={getFieldClass(formData.conversationPurpose || '')}
          >
            <option value="">選択してください</option>
            {allOptions.purposes.map(purpose => (
              <option key={purpose.value} value={purpose.value}>
                {purpose.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">学びの深さ・重要度</label>
          <select
            value={formData.learningDepth}
            onChange={e => setFormData(prev => ({...prev, learningDepth: parseInt(e.target.value)}))}
            className={getFieldClass(formData.learningDepth || 0)}
          >
            <option value={1}>1 - 低い</option>
            <option value={2}>2</option>
            <option value={3}>3 - 普通</option>
            <option value={4}>4</option>
            <option value={5}>5 - 高い</option>
          </select>
        </div>

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

          <p className="text-xs text-gray-500">
            キーワードは、AIインサイト生成時の情報として利用されます。未設定の場合は、AIが自動的にキーワードを生成します。
          </p>
        </div>
      </div>
    </div>
  )
}
