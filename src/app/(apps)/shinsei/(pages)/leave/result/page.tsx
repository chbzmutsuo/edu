'use client'

import LeaveHistoryTable from '@app/(apps)/shinsei/(pages)/leave/LeaveHistoryTable'
import useGlobal from '@hooks/globalHooks/useGlobal'

export default function PurchaseResultPage() {
  const useGlobalProps = useGlobal()
  const {session} = useGlobalProps
  const userId = session.id
  return (
    <LeaveHistoryTable
      {...{
        dataFetchProps: {where: {Approval: {some: {userId}}}},
        requestModelName: `leaveRequest`,
      }}
    />
  )
}
