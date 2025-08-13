'use client'

import {useState, useCallback} from 'react'
import {getExpenses} from '../actions/expense-actions'
import {ExpenseRecord} from '../types'
import {useExpenseQueryState} from './useExpenseQueryState'

interface ExpenseListState {
  loading: boolean
  expenses: ExpenseRecord[]
  selectedIds: string[]
  totalCount: number
  totalPages: number
}

export const useExpenseList = () => {
  const {queryState} = useExpenseQueryState()
  const [state, setState] = useState<ExpenseListState>({
    loading: true,
    expenses: [],
    selectedIds: [],
    totalCount: 0,
    totalPages: 0,
  })

  // 経費記録を取得
  const fetchExpenses = useCallback(async () => {
    setState(prev => ({...prev, loading: true}))

    try {
      const result = await getExpenses({
        page: queryState.page,
        limit: queryState.limit,
        filter: queryState.filter,
        sort: queryState.sort,
      })

      if (result.success) {
        setState(prev => ({
          ...prev,
          expenses: result.data.expenses,
          totalCount: result.data.totalCount,
          totalPages: Math.ceil(result.data.totalCount / queryState.limit),
        }))
      }
    } catch (error) {
      console.error('経費記録取得エラー:', error)
    } finally {
      setState(prev => ({...prev, loading: false}))
    }
  }, [queryState])

  // 選択状態の切り替え
  const toggleSelect = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      selectedIds: prev.selectedIds.includes(id)
        ? prev.selectedIds.filter(selectedId => selectedId !== id)
        : [...prev.selectedIds, id],
    }))
  }, [])

  // 全選択/全解除の切り替え
  const toggleSelectAll = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedIds: prev.selectedIds.length === filteredExpenses.length ? [] : filteredExpenses.map(expense => expense.id),
    }))
  }, [])

  // ステータス更新
  const updateExpenseStatus = useCallback(async (id: string, status: string) => {
    setState(prev => ({
      ...prev,
      expenses: prev.expenses.map(expense => (expense.id === id ? {...expense, status} : expense)),
    }))
  }, [])

  // フィルター適用済みの経費記録
  const filteredExpenses = state.expenses

  return {
    state,
    setState,
    fetchExpenses,
    toggleSelect,
    toggleSelectAll,
    updateExpenseStatus,
    filteredExpenses,
  }
}
