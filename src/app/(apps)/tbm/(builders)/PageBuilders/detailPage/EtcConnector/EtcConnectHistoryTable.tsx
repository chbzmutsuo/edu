import {formatDate} from '@class/Days/date-utils/formatters'
import {NumHandler} from '@class/NumHandler'
import {C_Stack} from '@components/styles/common-components/common-components'
import {CsvTable} from '@components/styles/common-components/CsvTable/CsvTable'
import {IconBtn} from '@components/styles/common-components/IconBtn'
import BasicModal from '@components/utils/modal/BasicModal'
import useDoStandardPrisma from '@hooks/useDoStandardPrisma'
import {TbmDriveSchedule, TbmRouteGroup, TbmVehicle, User} from '@prisma/client'
import React from 'react'
import {twMerge} from 'tailwind-merge'
type TbmDriveScheduleData = TbmDriveSchedule & {
  User: User
  TbmVehicle: TbmVehicle
  TbmRouteGroup: TbmRouteGroup
}
export default function EtcConnectHistoryTable({
  tbmVehicleId,
  selectedDriveSchedule,
}: {
  tbmVehicleId: number
  selectedDriveSchedule?: TbmDriveSchedule
}) {
  const {data: tbmVehicle = {}} = useDoStandardPrisma(`tbmVehicle`, `findUnique`, {
    where: {id: tbmVehicleId},
    include: {
      TbmEtcMeisai: {orderBy: [{month: `desc`}, {groupIndex: `asc`}]},
      TbmDriveSchedule: {
        include: {
          TbmRouteGroup: {},
          User: {},
          TbmVehicle: {},
        },
      },
    },
  })

  const groupByMonth = {}

  tbmVehicle?.TbmEtcMeisai?.forEach(item => {
    const month = item.month
    if (!groupByMonth[month]) {
      groupByMonth[month] = {month, data: []}
    }
    groupByMonth[month].data.push(item)
  })

  const groupedList = Object.values(groupByMonth)
  const TB = CsvTable({
    records: groupedList.map((monthData: any) => {
      const {month, data} = monthData ?? {}
      const sum = data.reduce((acc, item) => acc + item.sum, 0)
      return {
        csvTableRow: [
          //
          {
            label: '月',
            className: `w-[100px]`,
            cellValue: (
              <C_Stack className={` items-center font-bold text-xl`}>
                <div>{formatDate(month, 'YYYY/MM')}</div>
                <div>{NumHandler.WithUnit(sum, `円`)}</div>
              </C_Stack>
            ),
          },

          {
            label: '明細',
            cellValue: CsvTable({
              records: data.map(item => {
                const {TbmDriveSchedule, info: meisaiList} = item

                const firstMeisai = JSON.parse(meisaiList[0])
                const lastMeisai = JSON.parse(meisaiList[meisaiList.length - 1])

                const Route = () => {
                  // return TbmDriveSchedule ? <IconBtn></IconBtn> : <></>
                  if (TbmDriveSchedule) {
                    return <IconBtn>{TbmDriveSchedule?.routeName}</IconBtn>
                  } else {
                    return <IconBtn color={`red`}>未</IconBtn>
                  }
                }

                return {
                  csvTableRow: [
                    {label: '連番', cellValue: item.groupIndex},
                    {label: '出発', cellValue: firstMeisai.fromDatetime},
                    {label: '到着', cellValue: lastMeisai.toDatetime},
                    {label: '出発IC', cellValue: firstMeisai.fromIc},
                    {label: '到着IC', cellValue: lastMeisai.toIc},
                    {label: '請求額', cellValue: item.sum},
                    {label: '明細件数', cellValue: meisaiList.length},
                    {
                      label: '紐付先の運行',
                      cellValue: (
                        <BasicModal Trigger={<Route />}>
                          {TbmDriveSchedule ? (
                            <HimodukeKaijo {...{TbmDriveSchedule}} />
                          ) : (
                            <DriveScheduleSelector {...{TbmDriveSchedule}} />
                          )}
                        </BasicModal>
                      ),
                    },
                  ],
                }
              }),
            }).WithWrapper({
              size: `sm`,
              className: twMerge(
                //
                `rounded-none`,
                `t-paper`,
                `[&_th]:font-bold`,
                // `[&_td]:!px-`,
                `text-xs`
              ),
            }),
          },
        ],
      }
    }),
  })
  return (
    <div>
      {TB.WithWrapper({
        className: twMerge(`t-paper`),
      })}
    </div>
  )
}

const HimodukeKaijo = ({TbmDriveSchedule}: {TbmDriveSchedule: TbmDriveScheduleData}) => {
  const {User, TbmVehicle} = TbmDriveSchedule
  return (
    <div>
      <div>下記の運行データとの紐付けを解除しますか？</div>
      <div>
        <div>
          <div>{User.name}</div>
          <div>{User.name}</div>
          <div>{TbmVehicle.vehicleNumber}</div>
        </div>
      </div>
    </div>
  )
}

const DriveScheduleSelector = ({TbmDriveSchedule}: {TbmDriveSchedule: TbmDriveScheduleData}) => {
  const {data: tbmDriveScheduleList = []} = useDoStandardPrisma(`tbmDriveSchedule`, `findMany`, {
    where: {TbmEtcMeisai: null},
    include: {
      User: {},
      TbmVehicle: {},
      TbmRouteGroup: {},
    },
  })

  return (
    <div>
      <div>紐付け先の運行を選択してください。</div>

      <small>紐付けのない運行データ一覧</small>
      {CsvTable({
        records: tbmDriveScheduleList.map(schedule => {
          const {TbmRouteGroup, User, TbmVehicle} = schedule ?? {}
          return {
            csvTableRow: [
              //
              {cellValue: formatDate(schedule.date, 'YYYY/MM/DD(ddd)')},
              {cellValue: TbmRouteGroup?.name},
              {cellValue: User?.name},
              {cellValue: TbmVehicle?.vehicleNumber},
            ],
          }
        }),
      }).WithWrapper({})}
      <div></div>
    </div>
  )
}
