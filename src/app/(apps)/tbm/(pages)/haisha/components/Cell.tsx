'use client'
import React, {useMemo} from 'react'

import {Days} from '@class/Days/Days'
import {formatDate} from '@class/Days/date-utils/formatters'
import {C_Stack, NodataPlaceHolder, R_Stack} from '@components/styles/common-components/common-components'

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
export const Cell = React.memo(
  (props: {
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

    const ConfigArea = useMemo(() => {
      const userWorkStatus = user?.userWorkStatusList?.[formatDate(date)] ?? ''

      return (
        <section className="mb-2">
          <R_Stack className="w-full items-center justify-between gap-1">
            <R_Stack className="gap-1">
              {/* 勤怠 */}
              <div>
                <select
                  value={userWorkStatus}
                  className="w-12  rounded-sm border border-gray-300 p-0.5"
                  onChange={async e => {
                    const unique_userId_date = {
                      userId: user.id,
                      date: date,
                    }
                    const res = await doStandardPrisma(`userWorkStatus`, `upsert`, {
                      where: {unique_userId_date},
                      ...createUpdate({...unique_userId_date, workStatus: e.target.value}),
                    })

                    fetchData()
                  }}
                >
                  <option value="">-</option>
                  <option value="稼働">稼</option>
                  <option value="休み">休</option>
                  <option value="有給">有</option>
                </select>
              </div>

              {/* 入力ページ */}
              <div>
                {!!scheduleListOnDate.length && (
                  <Link target="_blank" href={HREF('/tbm/driveInput', {g_userId: user?.id, from: formatDate(date)}, query)}>
                    <TruckIcon className="text-yellow-main w-4 h-4 hover:opacity-80" />
                  </Link>
                )}
              </div>
            </R_Stack>

            {/* 追加ボタン */}
            <div>
              <PlusCircleIcon
                className="onHover text-gray-500 h-4 w-4 hover:text-gray-700"
                onClick={async () =>
                  setModalOpen({
                    user,
                    date,
                    tbmBase,
                    tbmRouteGroup,
                  })
                }
              />
            </div>
          </R_Stack>
        </section>
      )
    }, [user, date, tbmBase, tbmRouteGroup, setModalOpen, fetchData])

    const ScheduleArea = useMemo(() => {
      if (!scheduleListOnDate?.length) return <small>配車未設定</small>

      return (
        <section>
          <C_Stack className="gap-1">
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
                // const carInputCompleted = odometerStart && odometerEnd

                // const color =
                //   tbmDriveSchedule &&
                //   TbmRouteGroup?.seikyuKbn &&
                //   new TBM_CODE(TBM_CODE.ROUTE.KBN).findByCode(TbmRouteGroup?.seikyuKbn ?? '')?.color

                return (
                  <div
                    key={tbmDriveSchedule.id}
                    className={`border border-gray-300 rounded-sm p-1 bg-white hover:shadow-sm transition-shadow`}
                  >
                    <C_Stack className="gap-1">
                      {/* ルート名とアイコン */}
                      <R_Stack className="justify-between items-center">
                        <div className="  flex-1">
                          <div className={` flex`}>
                            <small className={`text-gray-600`}>便:</small>
                            {TbmRouteGroup.name}
                          </div>
                        </div>
                        <SquarePen
                          className="text-blue-main onHover h-3.5 w-3.5 flex-shrink-0 ml-1"
                          onClick={() => {
                            setModalOpen({
                              tbmDriveSchedule,
                              user,
                              date,
                              tbmBase,
                            })
                          }}
                        />
                      </R_Stack>

                      {/* 車両番号 */}
                      <div className=" ">
                        <small className={`text-gray-600`}>車両No:</small> {TbmVehicle?.vehicleNumber}
                      </div>

                      {/* ステータスボタン */}
                      <R_Stack className="justify-end gap-1">
                        {Object.entries(TBM_STATUS).map(([key, value], i) => {
                          const {label, color} = value
                          const active = tbmDriveSchedule[key]

                          return (
                            <button
                              key={i}
                              className={twMerge(
                                'px-2 py-0.5 text-[10px] rounded-sm border transition-opacity',
                                !active && 'opacity-30',
                                key === 'approved' && 'cursor-pointer hover:opacity-100',
                                active ? 'bg-gray-100' : 'bg-white'
                              )}
                              style={{
                                borderColor: color,
                                color: active ? color : '#999',
                              }}
                              onClick={async () => {
                                if (key === 'approved') {
                                  const isApproved = tbmDriveSchedule.approved

                                  if (isApproved) {
                                    if (confirm('承認を取り消してよろしいですか？')) {
                                      await doStandardPrisma(`tbmDriveSchedule`, `update`, {
                                        where: {id: tbmDriveSchedule.id},
                                        data: {approved: false},
                                      })
                                      fetchData()
                                    }
                                  } else {
                                    if (!confirmed) {
                                      if (confirm('ドライバーが確定処理を実施していません。強制承認をしてもよろしいですか？')) {
                                        if (confirm('承認してよろしいですか？')) {
                                          await doStandardPrisma(`tbmDriveSchedule`, `update`, {
                                            where: {id: tbmDriveSchedule.id},
                                            data: {approved: true},
                                          })
                                          fetchData()
                                        }
                                      }
                                    }
                                  }
                                } else {
                                  alert('「運行」、「締め」入力はドライバー画面から実施できます。')
                                }
                              }}
                            >
                              {label}
                            </button>
                          )
                        })}
                      </R_Stack>
                    </C_Stack>
                  </div>
                )
              }
            )}
          </C_Stack>
        </section>
      )
    }, [scheduleListOnDate, user, date, tbmBase, setModalOpen, fetchData])

    return (
      <C_Stack className={` justify-start text-xs leading-3   `} {...{style: {width: 200}}}>
        <div className={`mb-auto`}>{ConfigArea}</div>
        <div className={``}>{ScheduleArea}</div>
      </C_Stack>
    )
  }
)
