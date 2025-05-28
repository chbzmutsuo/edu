'use client'

import PurchaseHistoryTable from '@app/(apps)/shinsei/(pages)/purchase/PurchaseHistoryTable'
import useGlobal from '@hooks/globalHooks/useGlobal'

export default function PurchaseResultPage() {
  const useGlobalProps = useGlobal()
  const {session} = useGlobalProps
  const userId = session.id
  return <PurchaseHistoryTable {...{dataFetchProps: {where: {Approval: {some: {userId}}}}}} />
}
