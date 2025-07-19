'use client'

import {ExpenseRecord} from '../types'
import {formatAmount, formatDate} from '../utils'
import {T_LINK} from '@cm/components/styles/common-components/links'

interface ExpenseListItemProps {
  expense: ExpenseRecord
  isSelected: boolean
  onToggleSelect: (id: string) => void
}

export const ExpenseListItem = ({expense, isSelected, onToggleSelect}: ExpenseListItemProps) => {
  return (
    <div className="border-b border-gray-200 hover:bg-gray-50">
      <div className="px-6 py-4">
        <div className="flex items-center gap-4">
          {/* チェックボックス */}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(expense.id)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />

          {/* メイン情報 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm text-gray-500">{formatDate(expense.date)}</span>
                  <span className="text-lg font-semibold text-gray-900">¥{formatAmount(expense.amount)}</span>
                  <span className="text-sm text-gray-600">{expense.subject}</span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {expense.counterpartyName && <span>相手: {expense.counterpartyName}</span>}
                  {expense.location && <span>場所: {expense.location}</span>}
                  {expense.keywords.length > 0 && <span>キーワード: {expense.keywords.slice(0, 3).join(', ')}</span>}
                </div>

                {/* AIインサイトの要約 */}
                {expense.insight && (
                  <div className="mt-2">
                    <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                      インサイト: {expense.insight.length > 100 ? expense.insight.substring(0, 100) + '...' : expense.insight}
                    </span>
                  </div>
                )}
              </div>

              {/* アクションボタン */}
              <div className="flex items-center gap-2 ml-4">
                {/* <T_LINK
                  href={`/keihi/expense/${expense.id}`}
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                >
                  詳細
                </T_LINK> */}
                <T_LINK
                  href={`/keihi/expense/${expense.id}/edit`}
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded"
                >
                  詳細 / 編集
                </T_LINK>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
