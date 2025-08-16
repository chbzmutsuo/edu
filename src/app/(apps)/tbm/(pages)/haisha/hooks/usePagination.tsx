'use client'
import {useState, useCallback} from 'react'
import {UsePaginationParams, UsePaginationReturn} from '../types/haisha-page-types'

export function usePagination({initialPage = 1, initialItemsPerPage = 900}: UsePaginationParams = {}): UsePaginationReturn {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage)

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1) // ページサイズが変更されたら最初のページに戻る
  }, [])

  // const resetPagination = useCallback(() => {
  //   setCurrentPage(1)
  // }, [])

  return {
    currentPage,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
    // resetPagination,
  }
}
