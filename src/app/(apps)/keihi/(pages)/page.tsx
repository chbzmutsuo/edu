'use client'

import {useState, useEffect} from 'react'
import {toast} from 'react-toastify'
import {getExpenses, deleteMultipleExpenses, type ExpenseFormData} from '../actions/expense-actions'
import {exportAllExpensesToCSV, exportSelectedExpensesToCSV} from '../actions/csv-actions'
import {T_LINK} from '@components/styles/common-components/links'
import {R_Stack} from '@components/styles/common-components/common-components'

interface Expense extends ExpenseFormData {
  id: string
  createdAt: Date
  businessInsightSummary?: string
  techInsightSummary?: string
  autoTags: string[]
  mfSubject?: string
  mfMemo?: string
}

export default function KeihiPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isExporting, setIsExporting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // データ取得
  const fetchExpenses = async () => {
    setIsLoading(true)
    try {
      const result = await getExpenses(1, 1000) // 全件取得（最大1000件）
      if (result.success) {
        setExpenses(result.data as unknown as Expense[])
      } else {
        toast.error(result.error || 'データの取得に失敗しました')
      }
    } catch (error) {
      console.error('データ取得エラー:', error)
      toast.error('データの取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchExpenses()
  }, [])

  // 全選択/全解除
  const toggleSelectAll = () => {
    if (selectedIds.length === expenses.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(expenses.map(expense => expense.id))
    }
  }

  // 個別選択
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]))
  }

  // 一括削除処理
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.error('削除する記録を選択してください')
      return
    }

    setIsDeleting(true)
    try {
      const result = await deleteMultipleExpenses(selectedIds)
      if (result.success) {
        toast.success(`${result.deletedCount}件の記録を削除しました`)
        setSelectedIds([])
        await fetchExpenses() // データを再取得
      } else {
        toast.error(result.error || '削除に失敗しました')
      }
    } catch (error) {
      console.error('一括削除エラー:', error)
      toast.error('削除に失敗しました')
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  // CSV出力（全件）
  const handleExportAll = async () => {
    setIsExporting(true)
    try {
      const result = await exportAllExpensesToCSV()
      if (result.success && result.csvData) {
        // CSVダウンロード
        const blob = new Blob([result.csvData], {type: 'text/csv;charset=utf-8;'})
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `keihi_all_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        toast.success('CSVファイルをダウンロードしました')
      } else {
        toast.error(result.error || 'CSV出力に失敗しました')
      }
    } catch (error) {
      console.error('CSV出力エラー:', error)
      toast.error('CSV出力に失敗しました')
    } finally {
      setIsExporting(false)
    }
  }

  // CSV出力（選択）
  const handleExportSelected = async () => {
    if (selectedIds.length === 0) {
      toast.error('出力する記録を選択してください')
      return
    }

    setIsExporting(true)
    try {
      const result = await exportSelectedExpensesToCSV(selectedIds)
      if (result.success && result.csvData) {
        const blob = new Blob([result.csvData], {type: 'text/csv;charset=utf-8;'})
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `keihi_selected_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        toast.success('CSVファイルをダウンロードしました')
      } else {
        toast.error(result.error || 'CSV出力に失敗しました')
      }
    } catch (error) {
      console.error('CSV出力エラー:', error)
      toast.error('CSV出力に失敗しました')
    } finally {
      setIsExporting(false)
    }
  }

  // 金額フォーマット
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ja-JP').format(amount)
  }

  // 日付フォーマット
  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleDateString('ja-JP')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-[90vw] mx-auto px-2 sm:px-4">
        <div className="bg-white rounded-lg shadow-md">
          {/* ヘッダー */}
          <div className="px-3 sm:px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">経費記録一覧</h1>

              {/* モバイル用ボタングリッド */}
              <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-3">
                <T_LINK
                  href="/keihi/master"
                  className="px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-center text-sm sm:text-base"
                >
                  🛠 マスタ
                </T_LINK>
                <T_LINK
                  href="/keihi/new/bulk"
                  className="px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-center text-sm sm:text-base"
                >
                  📋 一括登録
                </T_LINK>
                <button
                  onClick={handleExportAll}
                  disabled={isExporting}
                  className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm sm:text-base"
                >
                  {isExporting ? '出力中...' : 'CSV全件'}
                </button>
                <button
                  onClick={handleExportSelected}
                  disabled={isExporting || selectedIds.length === 0}
                  className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base"
                >
                  選択CSV ({selectedIds.length})
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  disabled={selectedIds.length === 0}
                  className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 text-sm sm:text-base"
                >
                  削除 ({selectedIds.length})
                </button>
                <T_LINK
                  href="/keihi/new"
                  className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-center text-sm sm:text-base"
                >
                  新規登録
                </T_LINK>
              </div>
            </div>
          </div>

          {/* 全選択チェックボックス（モバイル用） */}
          <div className="px-3 sm:px-6 py-3 border-b border-gray-200 bg-gray-50 sm:hidden">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedIds.length === expenses.length && expenses.length > 0}
                onChange={toggleSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">全選択</span>
            </label>
          </div>

          {/* デスクトップ用テーブル */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === expenses.length && expenses.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日付</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金額</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">科目</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">相手名</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">場所</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">目的</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">内容</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">支払方法</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">インサイト</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">タグ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MF</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">添付</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">作成日</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={15} className="px-6 py-12 text-center text-gray-500">
                      <div className="text-center">
                        <p className="text-lg mb-2">まだ経費記録がありません</p>
                        <T_LINK href="/keihi/new" className="text-blue-600 hover:text-blue-800 underline">
                          最初の記録を作成する
                        </T_LINK>
                      </div>
                    </td>
                  </tr>
                ) : (
                  expenses.map(expense => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(expense.id)}
                          onChange={() => toggleSelect(expense.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(expense.date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">¥{formatAmount(expense.amount)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.subject}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.counterpartyName || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.location || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-32">
                        <div className="truncate" title={expense.purpose || '-'}>
                          {expense.purpose || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-40">
                        <div className="truncate" title={expense.memo || '-'}>
                          {expense.memo || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.paymentMethod || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-48">
                        <div className="space-y-1">
                          {expense.businessInsightSummary && (
                            <div
                              className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded truncate"
                              title={expense.businessInsightSummary}
                            >
                              営業: {expense.businessInsightSummary}
                            </div>
                          )}
                          {expense.techInsightSummary && (
                            <div
                              className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded truncate"
                              title={expense.techInsightSummary}
                            >
                              技術: {expense.techInsightSummary}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-32">
                        <div className="flex flex-wrap gap-1">
                          {expense.autoTags.slice(0, 2).map((tag, index) => (
                            <span key={index} className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                              {tag}
                            </span>
                          ))}
                          {expense.autoTags.length > 2 && (
                            <span className="text-xs text-gray-500">+{expense.autoTags.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-32">
                        {expense.mfSubject || expense.mfMemo ? (
                          <div className="space-y-1">
                            {expense.mfSubject && (
                              <div
                                className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded truncate"
                                title={expense.mfSubject}
                              >
                                科目: {expense.mfSubject}
                              </div>
                            )}
                            {expense.mfMemo && (
                              <div
                                className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded truncate"
                                title={expense.mfMemo}
                              >
                                メモ: {expense.mfMemo}
                              </div>
                            )}
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        {(expense as any).KeihiAttachment?.length > 0 ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            📎 {(expense as any).KeihiAttachment.length}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(expense.createdAt)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <R_Stack className={`gap-8`}>
                          <T_LINK href={`/keihi/expense/${expense.id}`} className="text-blue-600 hover:text-blue-900">
                            詳細
                          </T_LINK>
                          <T_LINK href={`/keihi/expense/${expense.id}/edit`} className="text-blue-600 hover:text-blue-900">
                            編集
                          </T_LINK>
                        </R_Stack>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* モバイル用カードリスト */}
          <div className="sm:hidden">
            {expenses.length === 0 ? (
              <div className="px-3 py-12 text-center text-gray-500">
                <p className="text-lg mb-2">まだ経費記録がありません</p>
                <T_LINK href="/keihi/new" className="text-blue-600 hover:text-blue-800 underline">
                  最初の記録を作成する
                </T_LINK>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {expenses.map(expense => (
                  <div key={expense.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(expense.id)}
                          onChange={() => toggleSelect(expense.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{formatDate(expense.date)}</div>
                          <div className="text-lg font-bold text-blue-600">¥{formatAmount(expense.amount)}</div>
                        </div>
                      </div>
                      <T_LINK
                        href={`/keihi/expense/${expense.id}`}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        詳細
                      </T_LINK>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-600">科目:</span>
                        <span className="text-sm text-gray-900">{expense.subject}</span>
                      </div>

                      {expense.counterpartyName && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-600">相手:</span>
                          <span className="text-sm text-gray-900">{expense.counterpartyName}</span>
                        </div>
                      )}

                      {expense.location && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-600">場所:</span>
                          <span className="text-sm text-gray-900">{expense.location}</span>
                        </div>
                      )}

                      {/* インサイト */}
                      {(expense.businessInsightSummary || expense.techInsightSummary) && (
                        <div className="space-y-1 mt-3">
                          {expense.businessInsightSummary && (
                            <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              営業: {expense.businessInsightSummary}
                            </div>
                          )}
                          {expense.techInsightSummary && (
                            <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              技術: {expense.techInsightSummary}
                            </div>
                          )}
                        </div>
                      )}

                      {/* タグ */}
                      {expense.autoTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {expense.autoTags.slice(0, 4).map((tag, index) => (
                            <span key={index} className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                              {tag}
                            </span>
                          ))}
                          {expense.autoTags.length > 4 && (
                            <span className="text-xs text-gray-500 px-2 py-1">+{expense.autoTags.length - 4}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 一括削除確認モーダル */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{selectedIds.length}件の記録を削除しますか？</h3>
            <div className="mb-4">
              <p className="text-gray-600 mb-2">以下の記録を削除します：</p>
              <div className="bg-gray-50 p-3 rounded border max-h-40 overflow-y-auto">
                {expenses
                  .filter(expense => selectedIds.includes(expense.id))
                  .map(expense => (
                    <div key={expense.id} className="text-sm mb-1">
                      <span className="font-medium">
                        {formatDate(expense.date)} - {expense.subject}
                      </span>
                      <span className="text-gray-600 ml-2">¥{formatAmount(expense.amount)}</span>
                    </div>
                  ))}
              </div>
              <p className="text-red-600 text-sm mt-2">⚠️ この操作は取り消せません。関連する添付ファイルも削除されます。</p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDeleting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                {isDeleting ? '削除中...' : `${selectedIds.length}件削除する`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
