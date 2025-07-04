'use client'
import React from 'react'

import {Days} from '@class/Days/Days'
import {formatDate} from '@class/Days/date-utils/formatters'
import {C_Stack, R_Stack} from '@components/styles/common-components/common-components'

import {SquarePen, PlusCircleIcon, TruckIcon} from 'lucide-react'
import {OdometerInput, TbmDriveSchedule, TbmRouteGroup, TbmVehicle, TbmBase, UserWorkStatus} from '@prisma/client'
import {TextRed, TextSub} from '@components/styles/common-components/Alert'
import Link from 'next/link'
import {HREF} from '@lib/methods/urls'
import {createUpdate} from '@lib/methods/createUpdate'
import useGlobal from '@hooks/globalHooks/useGlobal'
import {TBM_STATUS} from '@app/(apps)/tbm/(constants)/TBM_STATUS'

import {doStandardPrisma} from '@lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {TBM_CODE} from '@app/(apps)/tbm/(class)/TBM_CODE'
import {IconBtn} from '@components/styles/common-components/IconBtn'
import {twMerge} from 'tailwind-merge'
export const Cell = (props: {
  //
  fetchData
  scheduleListOnDate: TbmDriveSchedule[]
  setModalOpen
  user?: any & {
    UserWorkStatus: UserWorkStatus[]
    userWorkStatusList: Record<string, string>
  }
  tbmRouteGroup?: TbmRouteGroup
  date: Date
  tbmBase: TbmBase
}) => {
  const {query, toggleLoad} = useGlobal()
  const {fetchData, scheduleListOnDate, setModalOpen, user, tbmRouteGroup, date, tbmBase} = props

  const {seikyuKbn} = tbmRouteGroup ?? {}

  return (
    <C_Stack className={` min-h-full justify-start `} {...{style: {width: 160}}}>
      <ConfigArea
        {...{
          fetchData,
          tbmRouteGroup,
          user,
          date,
          scheduleListOnDate,
          setModalOpen,
          tbmBase,
          toggleLoad,
          query,
        }}
      />

      <ScheduleArea
        {...{
          user,
          date,
          scheduleListOnDate,
          setModalOpen,
          tbmBase,
          fetchData,
        }}
      />
    </C_Stack>
  )
}

const ScheduleArea = ({scheduleListOnDate, user, date, tbmBase, setModalOpen, fetchData}) => {
  return (
    <section>
      <C_Stack>
        {scheduleListOnDate.map(
          (
            tbmDriveSchedule: TbmDriveSchedule & {
              TbmRouteGroup: TbmRouteGroup
              TbmVehicle: TbmVehicle & {
                OdometerInput: OdometerInput[]
              }
            }
          ) => {
            const {TbmRouteGroup, TbmVehicle, finished, confirmed, approved} = tbmDriveSchedule

            const OdometerInputOnDate = TbmVehicle?.OdometerInput?.find(item => Days.validate.isSameDate(item.date, date))
            const {odometerStart, odometerEnd} = OdometerInputOnDate ?? {}
            const carInputCompleted = odometerStart && odometerEnd

            const RouteDisplay = confirmed ? TextSub : TextRed
            const CarDispaly = carInputCompleted ? TextSub : TextRed

            const color =
              tbmDriveSchedule &&
              TbmRouteGroup?.seikyuKbn &&
              new TBM_CODE(TBM_CODE.ROUTE.KBN).findByCode(TbmRouteGroup?.seikyuKbn ?? '')?.color

            return (
              <IconBtn
                {...{
                  color: color as any,
                  rounded: false,
                }}
                key={tbmDriveSchedule.id}
                className={` hover:opacity-100`}
              >
                <R_Stack className={`  justify-between gap-1  pb-1 `}>
                  <C_Stack className={`w-full gap-1.5 `}>
                    <RouteDisplay className={` text-[12px] `}>{TbmRouteGroup.name}</RouteDisplay>
                    <R_Stack className={` justify-end `}>
                      <CarDispaly className={`text-end text-sm`}>({TbmVehicle?.vehicleNumber})</CarDispaly>
                      <SquarePen
                        className={`text-blue-main onHover h-5 w-5`}
                        onClick={() => {
                          setModalOpen({tbmDriveSchedule, user, date, tbmBase})
                        }}
                      />
                    </R_Stack>
                    <R_Stack className={`justify-end gap-0`}>
                      {Object.entries(TBM_STATUS).map(([key, value], i) => {
                        const {label, color} = value

                        const active = tbmDriveSchedule[key]

                        return (
                          <IconBtn
                            color={color}
                            rounded={false}
                            key={i}
                            className={twMerge(
                              //
                              !active && 'opacity-30',
                              key === 'approved' && 'cursor-pointer',
                              ` px-2 text-xs `
                            )}
                            onClick={async () => {
                              if (key === 'approved') {
                                if (!confirmed) {
                                  alert('ドライバーが確定していません。')
                                  return
                                }

                                const msg = active
                                  ? '承認を取り消してよろしいですか？'
                                  : `承認してよろしいですか？承認がなされると、実績に反映されます。`

                                if (confirm(msg)) {
                                  await doStandardPrisma(`tbmDriveSchedule`, `update`, {
                                    where: {id: tbmDriveSchedule.id},
                                    data: {approved: active ? false : true},
                                  })
                                  fetchData()
                                }
                              }
                            }}
                          >
                            {label}
                          </IconBtn>
                        )
                      })}
                    </R_Stack>
                  </C_Stack>
                </R_Stack>
              </IconBtn>
            )
          }
        )}
      </C_Stack>
    </section>
  )
}

const ConfigArea = ({fetchData, user, date, tbmRouteGroup, setModalOpen, tbmBase, scheduleListOnDate, query}) => {
  const userWorkStatus = user?.userWorkStatusList?.[formatDate(date)] ?? ''

  return (
    <section>
      <R_Stack className={` w-full  items-center justify-between`}>
        <R_Stack>
          {/* 勤怠 */}
          <div>
            <select
              value={userWorkStatus}
              className={` w-[60px] rounded-sm  border`}
              {...{
                onChange: async e => {
                  const unique_userId_date = {userId: user.id, date: date}
                  const res = await doStandardPrisma(`userWorkStatus`, `upsert`, {
                    where: {unique_userId_date},
                    ...createUpdate({...unique_userId_date, workStatus: e.target.value}),
                  })

                  fetchData()
                },
              }}
            >
              <option value=""></option>
              <option value="稼働">稼働</option>
              <option value="休み">休み</option>
              <option value="有給">有給</option>
            </select>
          </div>

          {/* 入力ページ */}
          <div>
            {!!scheduleListOnDate.length && (
              <Link target="_blank" href={HREF('/tbm/driveInput', {g_userId: user?.id, from: formatDate(date)}, query)}>
                <TruckIcon className={`text-yellow-main w-5`} />
              </Link>
            )}
          </div>
        </R_Stack>

        {/* 追加ボタン */}
        <div>
          <PlusCircleIcon
            {...{
              className: ` onHover  text-gray-500 h-5 w-5 text-end`,
              onClick: async () => setModalOpen({user, date, tbmBase, tbmRouteGroup}),
            }}
          >
            追加
          </PlusCircleIcon>
        </div>
      </R_Stack>
    </section>
  )
}
