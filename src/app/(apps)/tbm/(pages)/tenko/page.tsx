'use client'

import TenkoPaperHeader from '@app/(apps)/tbm/(pages)/tenko/TenkoPaperHeader'

import TenkoPaperBody from '@app/(apps)/tbm/(pages)/tenko/TenkoPaperBody'
import {toUtc} from '@class/Days/date-utils/calculations'

import {Button} from '@components/styles/common-components/Button'
import {C_Stack} from '@components/styles/common-components/common-components'
import useGlobal from '@hooks/globalHooks/useGlobal'
import useDoStandardPrisma from '@hooks/useDoStandardPrisma'
import {TbmDriveSchedule, TbmRouteGroup, TbmVehicle, User} from '@prisma/client'
import React, {useRef} from 'react'
import {useReactToPrint} from 'react-to-print'
import {Card} from '@cm/shadcn-ui/components/ui/card'

export default function TenkoPage(props) {
  const {query} = useGlobal()

  const printRef = useRef<any>(null)

  const prinfFunc = useReactToPrint({
    contentRef: printRef,
    pageStyle: '@page { size: A4 landscape; }',
    suppressErrors: true,
  })

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

  const wrapperStyle = {
    width: 1700,
    minWidth: 1700,
    maxWidth: 1700,
    margin: 'auto',
    padding: 10,
  }

  const tableStyle = {
    width: wrapperStyle.width - 80,
    minWidth: wrapperStyle.width - 80,
    maxWidth: wrapperStyle.width - 80,
    margin: 'auto',
  }

  return (
    <div>
      <Button onClick={() => prinfFunc()}>印刷</Button>

      <Card className={` w-fit mx-auto`}>
        <div style={wrapperStyle} ref={printRef}>
          <C_Stack className={`mx-auto text-xs print-target mt-4 `}>
            {/* ヘッダー */}

            <>
              <TenkoPaperHeader {...{date, tableStyle}} />
              <TenkoPaperBody {...{OrderByPickUpTime, tableStyle}} />
            </>
          </C_Stack>
        </div>
      </Card>
    </div>
  )
}
