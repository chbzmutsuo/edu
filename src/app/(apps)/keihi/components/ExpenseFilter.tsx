'use client'

import {useCallback} from 'react'
import {ExpenseFilterType} from '../hooks/useExpenseFilter'
import {useAllOptions} from '../hooks/useOptions'

interface ExpenseFilterProps {
  filter: ExpenseFilterType
  onFilterChange: (updates: Partial<ExpenseFilterType>) => void
  onReset: () => void
}

export const ExpenseFilter = ({filter, onFilterChange, onReset}: ExpenseFilterProps) => {
  const {allOptions} = useAllOptions()

  const handleDateChange = useCallback(
    (field: 'start' | 'end') => (e: React.ChangeEvent<HTMLInputElement>) => {
      onFilterChange({
        dateRange: {
          ...filter.dateRange,
          [field]: e.target.value || null,
        },
      })
    },
    [filter.dateRange, onFilterChange]
  )

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">検索・フィルター</h3>
        <button onClick={onReset} className="text-sm text-gray-600 hover:text-gray-900 underline focus:outline-none">
          リセット
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 日付範囲 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">日付範囲</label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filter.dateRange.start || ''}
              onChange={handleDateChange('start')}
              className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="text-gray-500">〜</span>
            <input
              type="date"
              value={filter.dateRange.end || ''}
              onChange={handleDateChange('end')}
              className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* 科目 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">科目</label>
          <select
            value={filter.subject || ''}
            onChange={e => onFilterChange({subject: e.target.value || null})}
            className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">すべて</option>
            {allOptions.subjects?.map(subject => (
              <option key={subject.value} value={subject.value}>
                {subject.label}
              </option>
            ))}
          </select>
        </div>

        {/* ステータス */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">ステータス</label>
          <select
            value={filter.status || ''}
            onChange={e => onFilterChange({status: e.target.value || null})}
            className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">すべて</option>
            <option value="一次チェック済">一次チェック済</option>
            <option value="MF連携済み">MF連携済み</option>
          </select>
        </div>

        {/* キーワード */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">キーワード</label>
          <input
            type="text"
            value={filter.keyword || ''}
            onChange={e => onFilterChange({keyword: e.target.value || null})}
            placeholder="相手名、場所、要約、洞察など"
            className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  )
}
