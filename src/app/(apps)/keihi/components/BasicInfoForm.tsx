'use client'

import {type ExpenseFormData} from '../actions/expense-actions'

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
  return (
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
    </div>
  )
}
