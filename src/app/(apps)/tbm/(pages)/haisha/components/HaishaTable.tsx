'use client'
import React, {useMemo} from 'react'
import {C_Stack} from '@cm/components/styles/common-components/common-components'
import useHaishaTableEditorGMF from '@app/(apps)/tbm/(globalHooks)/useHaishaTableEditorGMF'
import PlaceHolder from '@cm/components/utils/loader/PlaceHolder'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import HaishaTableSwitcher from './HaishaTableSwitcher'
import TableContent from './HaishaTableContent'
import PaginationControl from './PaginationControl'
import {TbmBase} from '@prisma/client'
import useDoStandardPrisma from '@cm/hooks/useDoStandardPrisma'
import {useHaishaData} from '../hooks/useHaishaData'
import {usePagination} from '../hooks/usePagination'

export type haishaTableMode = 'ROUTE' | 'DRIVER'

export default function HaishaTable({
  days,
  tbmBase,
  whereQuery,
}: {
  tbmBase: TbmBase | null
  days: Date[]
  whereQuery: {
    gte?: Date
    lt?: Date
  }
}) {
  const {query, session} = useGlobal()
  const {admin} = session.scopes
  const tbmBaseId = tbmBase?.id ?? 0
  const mode: haishaTableMode = query.mode

  // ページネーション管理
  const {currentPage, itemsPerPage, handlePageChange, handleItemsPerPageChange} = usePagination()

  // データ取得管理
  const {listDataState, maxRecord, LocalLoader, fetchData, updateScheduleInState, removeScheduleFromState} = useHaishaData({
    tbmBaseId,
    whereQuery,
    mode,
    currentPage,
    itemsPerPage,
  })

  const HK_HaishaTableEditorGMF = useHaishaTableEditorGMF({
    afterDelete: ({res, tbmDriveSchedule}) => {
      fetchData()
      // removeScheduleFromState(tbmDriveSchedule?.id)
    },
    afterUpdate: ({res}) => {
      fetchData()
      // updateScheduleInState(res.result)
    },
  })

  const setModalOpen = HK_HaishaTableEditorGMF.setGMF_OPEN

  const {data: holidays = []} = useDoStandardPrisma(`calendar`, `findMany`, {
    where: {holidayType: `祝日`},
  })

  // テーブルコンテンツのメモ化
  const HaishaTableMemo = useMemo(() => {
    if (listDataState) {
      const {TbmDriveSchedule, userList, tbmRouteGroup, userWorkStatusCount} = listDataState

      return (
        <TableContent
          {...{
            mode,
            tbmBase,
            days,
            holidays,
            fetchData,
            setModalOpen,
            admin,
            query,
            TbmDriveSchedule,
            tbmRouteGroup,
            userList,
            userWorkStatusCount,
          }}
        />
      )
    }
  }, [listDataState, mode, tbmBase, days, holidays, fetchData, setModalOpen, admin, query])

  const ModalMemo = useMemo(() => <HK_HaishaTableEditorGMF.Modal />, [HK_HaishaTableEditorGMF.GMF_OPEN])

  if (!listDataState) return <PlaceHolder />

  return (
    <C_Stack className="p-3">
      <LocalLoader />
      {ModalMemo}

      <HaishaTableSwitcher />

      {HaishaTableMemo}

      <PaginationControl
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        maxRecord={maxRecord}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    </C_Stack>
  )
}
