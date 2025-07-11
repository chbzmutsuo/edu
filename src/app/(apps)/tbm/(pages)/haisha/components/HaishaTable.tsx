'use client'
import React, {useEffect, useMemo, useState} from 'react'

import {C_Stack, R_Stack} from '@components/styles/common-components/common-components'

import useHaishaTableEditorGMF from '@app/(apps)/tbm/(globalHooks)/useHaishaTableEditorGMF'
import PlaceHolder from '@components/utils/loader/PlaceHolder'
import {Button} from '@components/styles/common-components/Button'
import useGlobal from '@hooks/globalHooks/useGlobal'
import {getListData, haishaListData} from '@app/(apps)/tbm/(pages)/haisha/components/getListData'
import HaishaTableSwitcher from '@app/(apps)/tbm/(pages)/haisha/components/HaishaTableSwitcher'
import TableContent from '@app/(apps)/tbm/(pages)/haisha/components/TableContent'
import {TbmBase} from '@prisma/client'
import {formatDate} from '@class/Days/date-utils/formatters'
import useDoStandardPrisma from '@hooks/useDoStandardPrisma'
import {showSpendTime} from '@lib/methods/toast-helper'
import useLocalLoading from '@hooks/globalHooks/useLocalLoading'
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
  const {query, session, toggleLoad} = useGlobal()
  const {admin} = session.scopes
  const [listDataState, setlistDataState] = useState<haishaListData | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [maxRecord, setMaxRecord] = useState(0)

  const {LocalLoader, toggleLocalLoading} = useLocalLoading()

  const tbmBaseId = tbmBase?.id ?? 0
  const mode: haishaTableMode = query.mode

  const fetchData = async () => {
    await showSpendTime(async () => {
      const takeSkip = {take: itemsPerPage, skip: (currentPage - 1) * itemsPerPage}

      const data = await getListData({tbmBaseId, whereQuery, mode, takeSkip})

      setMaxRecord(data.maxCount)
      setlistDataState(data)
    })
  }

  useEffect(() => {
    toggleLocalLoading(async () => {
      await fetchData()
    })
  }, [currentPage, itemsPerPage, mode, tbmBaseId, whereQuery])

  const HK_HaishaTableEditorGMF = useHaishaTableEditorGMF({
    afterDelete: ({res, tbmDriveSchedule}) => {
      setlistDataState(prev => {
        if (prev) {
          const newList = [...prev?.TbmDriveSchedule]
          const findIndex = newList.findIndex(item => item.id === tbmDriveSchedule?.id)
          if (findIndex !== -1) {
            newList.splice(findIndex, 1)
          }

          return {
            ...prev,
            TbmDriveSchedule: newList,
          }
        } else {
          return null
        }
      })
    },
    afterUpdate: ({res}) => {
      setlistDataState(prev => {
        if (prev) {
          const newList = [...prev.TbmDriveSchedule]
          const newDriveSchedale = res.result
          const findIndex = newList.findIndex(item => item.id === newDriveSchedale.id)

          if (findIndex !== -1) {
            newList[findIndex] = newDriveSchedale
          } else {
            newList.push(newDriveSchedale)
          }

          return {
            ...prev,
            TbmDriveSchedule: newList,
          }
        } else {
          return null
        }
      })
    },
  })

  const setModalOpen = HK_HaishaTableEditorGMF.setGMF_OPEN

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const {data: holidays = []} = useDoStandardPrisma(`calendar`, `findMany`, {
    where: {holidayType: `祝日`},
  })

  const HaishaTableMemo = useMemo(() => {
    if (listDataState) {
      const {TbmDriveSchedule, userList, tbmRouteGroup} = listDataState as haishaListData

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
          }}
        ></TableContent>
      )
    }
  }, [listDataState, mode, tbmBase, days, holidays, fetchData, setModalOpen, admin, query])

  const PaginationControl = useMemo(() => {
    if (listDataState) {
      return (
        <R_Stack className="mt-4 justify-center gap-2 p-2">
          <Button color="blue" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
            前へ
          </Button>

          <div className="px-4 py-2 font-bold">
            {currentPage} / {Math.ceil(maxRecord / itemsPerPage)}
          </div>

          <Button
            color="blue"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === Math.ceil(maxRecord / itemsPerPage)}
          >
            次へ
          </Button>

          <select
            className="ml-4 rounded-sm border px-2 py-1"
            value={itemsPerPage}
            onChange={async e => {
              setItemsPerPage(Number(e.target.value))
              setCurrentPage(1)
            }}
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
  }, [currentPage, itemsPerPage, maxRecord, listDataState])

  const ModalMemo = useMemo(() => <HK_HaishaTableEditorGMF.Modal />, [HK_HaishaTableEditorGMF.GMF_OPEN])

  if (!listDataState) return <PlaceHolder />

  return (
    <C_Stack className={` p-3`}>
      <LocalLoader />
      {ModalMemo}

      <HaishaTableSwitcher />

      {HaishaTableMemo}

      {/* ページネーションコントロール */}
      {PaginationControl}
    </C_Stack>
  )
}
