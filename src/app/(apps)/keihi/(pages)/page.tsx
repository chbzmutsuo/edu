'use client'

import {useState, useEffect, useCallback} from 'react'
import {toast} from 'react-toastify'
import {getExpenses, deleteExpenses, exportExpensesToCsv} from '../actions/expense-actions'
import {ExpenseRecord, ExpenseListState} from '../types'
import {ExpenseListHeader} from './components/ExpenseListHeader'
import {ExpenseListItem} from './components/ExpenseListItem'
import {LoadingSpinner} from '../components/ui/LoadingSpinner'
import {ProcessingStatus} from '../components/ui/ProcessingStatus'

const ExpenseListPage = () => {
  const [state, setState] = useState<ExpenseListState>({
    expenses: [],
    loading: true,
    selectedIds: [],
    pagination: {page: 1, limit: 20, total: 0, totalPages: 0},
  })

  const [isExporting, setIsExporting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // データ取得
  const fetchExpenses = useCallback(async () => {
    try {
      setState(prev => ({...prev, loading: true}))
      const result = await getExpenses()

      if (result.success && result.data) {
        setState(prev => ({
          ...prev,
          expenses: result.data as ExpenseRecord[],
          loading: false,
          pagination: {
            ...prev.pagination,
            total: result.data.length,
            totalPages: Math.ceil(result.data.length / prev.pagination.limit),
          },
        }))
      } else {
        toast.error(result.error || '経費記録の取得に失敗しました')
        setState(prev => ({...prev, loading: false}))
      }
    } catch (error) {
      console.error('経費記録取得エラー:', error)
      toast.error('経費記録の取得に失敗しました')
      setState(prev => ({...prev, loading: false}))
    }
  }, [])

  // 初期データ取得
  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  // 選択状態の切り替え
  const toggleSelect = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      selectedIds: prev.selectedIds.includes(id)
        ? prev.selectedIds.filter(selectedId => selectedId !== id)
        : [...prev.selectedIds, id],
    }))
  }, [])

  // 全選択/全解除
  const toggleSelectAll = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedIds: prev.selectedIds.length === prev.expenses.length ? [] : prev.expenses.map(expense => expense.id),
    }))
  }, [])

  // CSV出力（全件）
  const handleExportAll = useCallback(async () => {
    try {
      setIsExporting(true)
      const result = await exportExpensesToCsv()

      if (result.success && result.data) {
        // CSVファイルのダウンロード
        const blob = new Blob([result.data], {type: 'text/csv;charset=utf-8'})
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `経費記録_全件_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        toast.success('CSV出力が完了しました')
      } else {
        toast.error(result.error || 'CSV出力に失敗しました')
      }
    } catch (error) {
      console.error('CSV出力エラー:', error)
      toast.error('CSV出力に失敗しました')
    } finally {
      setIsExporting(false)
    }
  }, [])

  // CSV出力（選択）
  const handleExportSelected = useCallback(async () => {
    if (state.selectedIds.length === 0) {
      toast.error('出力する記録を選択してください')
      return
    }

    try {
      setIsExporting(true)
      const result = await exportExpensesToCsv(state.selectedIds)

      if (result.success && result.data) {
        // CSVファイルのダウンロード
        const blob = new Blob([result.data], {type: 'text/csv;charset=utf-8'})
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `経費記録_選択_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        toast.success(`${state.selectedIds.length}件のCSV出力が完了しました`)
      } else {
        toast.error(result.error || 'CSV出力に失敗しました')
      }
    } catch (error) {
      console.error('CSV出力エラー:', error)
      toast.error('CSV出力に失敗しました')
    } finally {
      setIsExporting(false)
    }
  }, [state.selectedIds])

  // 選択削除
  const handleDeleteSelected = useCallback(async () => {
    if (state.selectedIds.length === 0) {
      toast.error('削除する記録を選択してください')
      return
    }

    if (!confirm(`選択した${state.selectedIds.length}件の記録を削除しますか？`)) {
      return
    }

    try {
      setIsDeleting(true)
      const result = await deleteExpenses(state.selectedIds)

      if (result.success) {
        toast.success(`${state.selectedIds.length}件の記録を削除しました`)
        setState(prev => ({
          ...prev,
          selectedIds: [],
        }))
        await fetchExpenses() // データを再取得
      } else {
        toast.error(result.error || '削除に失敗しました')
      }
    } catch (error) {
      console.error('削除エラー:', error)
      toast.error('削除に失敗しました')
    } finally {
      setIsDeleting(false)
    }
  }, [state.selectedIds, fetchExpenses])

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">経費記録を読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-sm">
          {/* ヘッダー */}
          <ExpenseListHeader
            totalCount={state.expenses.length}
            selectedCount={state.selectedIds.length}
            onExportAll={handleExportAll}
            onExportSelected={handleExportSelected}
            onDeleteSelected={handleDeleteSelected}
          />

          {/* 処理状況 */}
          <div className="px-6">
            <ProcessingStatus isVisible={isExporting} message="CSV出力中..." variant="info" />
            <ProcessingStatus isVisible={isDeleting} message="削除処理中..." variant="info" />
          </div>

          {/* 一覧ヘッダー（全選択チェックボックス） */}
          {state.expenses.length > 0 && (
            <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={state.selectedIds.length === state.expenses.length}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">
                  {state.selectedIds.length === state.expenses.length ? '全解除' : '全選択'}
                </span>
              </div>
            </div>
          )}

          {/* 経費記録一覧 */}
          <div className="divide-y divide-gray-200">
            {state.expenses.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">経費記録がありません</h3>
                <p className="text-gray-600 mb-6">新しい経費記録を作成してください。</p>
              </div>
            ) : (
              state.expenses.map(expense => (
                <ExpenseListItem
                  key={expense.id}
                  expense={expense}
                  isSelected={state.selectedIds.includes(expense.id)}
                  onToggleSelect={toggleSelect}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExpenseListPage
