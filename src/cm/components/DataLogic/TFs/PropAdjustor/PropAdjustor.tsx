'use client'

import {useGlobalPropType} from 'src/cm/hooks/globalHooks/useGlobal'

import React from 'react'
import {ClientPropsType} from '@cm/types/types'
import {HK_USE_RECORDS_TYPE} from 'src/cm/components/DataLogic/TFs/PropAdjustor/usePropAdjustorProps'
import {getInitModelRecordsProps, serverFetchProps} from '@components/DataLogic/TFs/Server/fetchers/getInitModelRecordsProps'
import RecordHandler from '@components/DataLogic/TFs/PropAdjustor/RecordHandler'
// const RecordHandler = dynamic(() => import('@components/DataLogic/TFs/PropAdjustor/RecordHandler'), {
//   loading: () => <TableSkelton />,
// })

export type PropAdjustorPropsType = {
  ClientProps: ClientPropsType
  serverFetchProps: serverFetchProps
  initialModelRecords: Awaited<ReturnType<typeof getInitModelRecordsProps>>
  fetchTime: Date
}

const PropAdjustor = React.memo((props: PropAdjustorPropsType) => {
  const {ClientProps, serverFetchProps, initialModelRecords, fetchTime} = props

  return <RecordHandler {...{serverFetchProps, initialModelRecords, fetchTime, ClientProps}} />
})

export default PropAdjustor

export type ClientPropsType2 = ClientPropsType & {
  HK_USE_RECORDS?: HK_USE_RECORDS_TYPE
  useGlobalProps: useGlobalPropType
  columns
  formData
  setformData
  records
  setrecords
  totalCount
  mutateRecords
  deleteRecord
}
