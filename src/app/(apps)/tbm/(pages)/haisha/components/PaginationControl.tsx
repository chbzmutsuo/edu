'use client'
import React from 'react'
import {Button} from '@cm/components/styles/common-components/Button'
import {R_Stack} from '@cm/components/styles/common-components/common-components'

interface PaginationControlProps {
  currentPage: number
  itemsPerPage: number
  maxRecord: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (itemsPerPage: number) => void
}

export default function PaginationControl({
  currentPage,
  itemsPerPage,
  maxRecord,
  onPageChange,
  onItemsPerPageChange,
}: PaginationControlProps) {
  const totalPages = Math.ceil(maxRecord / itemsPerPage)

  return (
    <R_Stack className="mt-4 justify-center gap-2 p-2">
      <Button color="blue" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        前へ
      </Button>

      <div className="px-4 py-2 font-bold">
        {currentPage} / {totalPages}
      </div>

      <Button color="blue" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
        次へ
      </Button>

      <select
        className="ml-4 rounded-sm border px-2 py-1"
        value={itemsPerPage}
        onChange={e => onItemsPerPageChange(Number(e.target.value))}
      >
        <option value={15}>15件</option>
        <option value={30}>30件</option>
        <option value={50}>50件</option>
        <option value={100}>100件</option>
        <option value={300}>300件</option>
      </select>
    </R_Stack>
  )
}
