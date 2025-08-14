'use client'

import ExpenseEditor from '@app/(apps)/keihi/(pages)/expense/[id]/edit/ExpenseEditor'
import {useParams} from 'next/navigation'
import React from 'react'

export default function Page() {
  const params = useParams()
  const expenseId = params?.id as string
  return <ExpenseEditor expenseId={expenseId} />
}
