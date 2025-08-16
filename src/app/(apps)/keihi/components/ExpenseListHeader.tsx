'use client'

import {T_LINK} from '@cm/components/styles/common-components/links'

interface ExpenseListHeaderProps {
  totalCount: number
  selectedCount: number
  onExportAll: () => void
  onExportSelected: () => void
  onExportLocationsAll: () => void
  onExportLocationsSelected: () => void
  onDeleteSelected: () => void
}

export const ExpenseListHeader = ({
  totalCount,
  selectedCount,
  onExportAll,
  onExportSelected,
  onExportLocationsAll,
  onExportLocationsSelected,
  onDeleteSelected,
}: ExpenseListHeaderProps) => {
  return (
    <div className="px-6 py-4 border-b border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">経費記録一覧</h1>
          <p className="text-sm text-gray-600 mt-1">
            全{totalCount}件{selectedCount > 0 && ` (${selectedCount}件選択中)`}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* 新規作成ボタン */}
          <T_LINK href="/keihi/new" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium">
            新規作成
          </T_LINK>

          {/* 一括登録ボタン */}
          <T_LINK
            href="/keihi/new/bulk"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
          >
            一括登録
          </T_LINK>

          {/* CSV出力ボタン（経費データ） */}
          <div className="flex flex-col gap-2">
            <button
              onClick={onExportAll}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm font-medium"
            >
              経費CSV出力（全件）
            </button>
            <button
              onClick={onExportLocationsAll}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium"
            >
              取引先CSV出力（全件）
            </button>
          </div>

          {/* 選択時のアクション */}
          {selectedCount > 0 && (
            <div className="flex flex-col gap-2">
              <button
                onClick={onExportSelected}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm font-medium"
              >
                経費CSV出力（選択）
              </button>
              <button
                onClick={onExportLocationsSelected}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm font-medium"
              >
                取引先CSV出力（選択）
              </button>
              <button
                onClick={onDeleteSelected}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
              >
                削除（選択）
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
