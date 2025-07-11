'use client'

import TenkoPaperHeader from '@app/(apps)/tbm/(pages)/tenko/TenkoPaperHeader'

import TenkoPaperBody from '@app/(apps)/tbm/(pages)/tenko/TenkoPaperBody'
import {toUtc} from '@class/Days/date-utils/calculations'

import {Button} from '@components/styles/common-components/Button'
import {C_Stack} from '@components/styles/common-components/common-components'
import {Paper} from '@components/styles/common-components/paper'
import useGlobal from '@hooks/globalHooks/useGlobal'
import useDoStandardPrisma from '@hooks/useDoStandardPrisma'
import {TbmDriveSchedule, TbmRouteGroup, TbmVehicle, User} from '@prisma/client'
import React, {useRef} from 'react'
import {useReactToPrint} from 'react-to-print'

export default function TenkoPage(props) {
  const {query} = useGlobal()

  const printRef = useRef<any>(null)

  const prinfFunc = useReactToPrint({contentRef: printRef, pageStyle: '@page { size: landscape; }', suppressErrors: true})

  const date = toUtc(query.date || query.month)
  const tbmBaseId = Number(query.tbmBaseId)

  const {data = []} = useDoStandardPrisma(`tbmDriveSchedule`, `findMany`, {
    where: {date: date, tbmBaseId},
    include: {User: {}, TbmVehicle: {}, TbmRouteGroup: {}},
  })

  const drives: (TbmDriveSchedule & {
    User: User
    TbmVehicle: TbmVehicle
    TbmRouteGroup: TbmRouteGroup
  })[] = data

  const OrderByPickUpTime = drives.sort((a, b) => {
    const aPickUpTime = a.TbmRouteGroup.pickupTime
    const bPickUpTime = b.TbmRouteGroup.pickupTime

    if (!aPickUpTime || !bPickUpTime) {
      return 0
    }
    return aPickUpTime.localeCompare(bPickUpTime)
  })

  return (
    <div>
      <Button onClick={() => prinfFunc()}>印刷</Button>
      <div className={`mx-auto t-paper`} style={{width: 1700}}>
        <C_Stack className={`p-4  mx-auto text-xs print-target`} ref={printRef}>
          {/* ヘッダー */}

          <Paper>
            <TenkoPaperHeader {...{date}} />
          </Paper>
          <Paper>
            <TenkoPaperBody {...{OrderByPickUpTime}} />
          </Paper>
        </C_Stack>
      </div>
    </div>
  )
}
