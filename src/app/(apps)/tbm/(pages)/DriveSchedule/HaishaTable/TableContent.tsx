'use client'
import React from 'react'

import {Days} from '@class/Days/Days'
import {formatDate} from '@class/Days/date-utils/formatters'
import {C_Stack} from '@components/styles/common-components/common-components'
import {CsvTable} from '@components/styles/common-components/CsvTable/CsvTable'

import {Cell} from '@app/(apps)/tbm/(pages)/DriveSchedule/HaishaTable/Cell'
import {TbmDriveSchedule} from '@prisma/client'
import useGlobal from '@hooks/globalHooks/useGlobal'
import UserTh from '@app/(apps)/tbm/(pages)/DriveSchedule/HaishaTable/UserTh'
import {haishaListData} from '@app/(apps)/tbm/(pages)/DriveSchedule/HaishaTable/getListData'
import {doTransaction} from '@lib/server-actions/common-server-actions/doTransaction/doTransaction'
import useDoStandardPrisma from '@hooks/useDoStandardPrisma'
import {TBM_CODE} from '@app/(apps)/tbm/(class)/TBM_CODE'
import DateThCell from '@app/(apps)/tbm/(pages)/DriveSchedule/HaishaTable/DateThCell'

export default function TableContent({mode, listDataState, days, tbmBase, fetchData, setModalOpen}) {
  const {query, accessScopes} = useGlobal()
  const {admin} = accessScopes()
  const {data: holidays = []} = useDoStandardPrisma(`calendar`, `findMany`, {
    where: {holidayType: `祝日`},
  })

  const {TbmDriveSchedule, userList, tbmRouteGroup} = listDataState as haishaListData
  const userWorkStatusByDate = userList.reduce((acc, user) => {
    acc[user.id] = user.UserWorkStatus.reduce((acc, userWorkStatus) => {
      acc[formatDate(userWorkStatus.date)] = userWorkStatus.workStatus
      return acc
    }, {})
    return acc
  }, {})

  if (mode === `ROUTE`) {
    const {scheduleByDateAndRoute} = getScheduleByDateAndRoute({TbmDriveSchedule})

    return (
      <>
        {tbmRouteGroup.length > 0 ? (
          CsvTable({
            records: tbmRouteGroup
              .sort((a, b) => a.code.localeCompare(b.code))
              .map(route => {
                const color = new TBM_CODE(TBM_CODE.ROUTE.KBN).findByCode(route.seikyuKbn ?? '')?.color
                // const userWorkStatusList = userWorkStatusByDate?.[user.id]
                return {
                  csvTableRow: [
                    // ユーザー情報
                    {
                      label: `便`,
                      cellValue: <span>{route.name}</span>,
                      style: {minWidth: 240, left: 0, position: 'sticky', background: `#d8d8d8`},
                    },
                    //日付別
                    ...days.map(date => {
                      const scheduleListOnDate = scheduleByDateAndRoute?.[formatDate(date)]?.[String(route.id)] ?? []
                      const isHoliday = Days.day.isHoliday(date, holidays)

                      const holidayType = route.TbmRouteGroupCalendar.find(calendar =>
                        Days.validate.isSameDate(calendar.date, date)
                      )?.holidayType

                      const must = route?.id > 0 && holidayType === '稼働'
                      const dateStr = formatDate(date, 'M/D(ddd)')

                      const thStyle = {background: '#d8d8d8', ...isHoliday?.style, fontWeight: 'bold'}

                      return {
                        label: (
                          <div id={`#${dateStr}`}>
                            <DateThCell {...{tbmBase, mode, date, userList, scheduleListOnDate, doTransaction, fetchData}}>
                              {dateStr}
                            </DateThCell>
                          </div>
                        ),

                        cellValue: (
                          <C_Stack className={` items-start min-h-full justify-start,`}>
                            <Cell
                              {...{
                                fetchData,
                                setModalOpen,
                                scheduleListOnDate,
                                date,
                                tbmRouteGroup: route,
                                tbmBase,
                              }}
                            />
                          </C_Stack>
                        ),
                        style: {
                          height: 1,
                          background: must ? '#fff1cd' : '',
                        },
                        thStyle,
                      }
                    }),
                  ],
                }
              }),
          }).WithWrapper({className: `max-w-[calc(95vw-50px)] max-h-[75vh] `})
        ) : (
          <div>データがありません</div>
        )}
      </>
    )
  } else {
    const {scheduleByDateAndUser} = getScheduleByDateAndUser({TbmDriveSchedule})

    return (
      <>
        {userList.length > 0 ? (
          CsvTable({
            records: userList
              .sort((a, b) => a.code?.localeCompare(b.code ?? '') ?? 0)
              .map(user => {
                user[`userWorkStatusList`] = userWorkStatusByDate?.[user.id]
                return {
                  csvTableRow: [
                    // ユーザー情報
                    {
                      label: `ユーザー`,
                      cellValue: <UserTh {...{user, admin, query}} />,
                      style: {minWidth: 240, left: 0, position: 'sticky', background: `#d8d8d8`},
                    },

                    //日付別
                    ...days.map(date => {
                      const scheduleListOnDate = scheduleByDateAndUser?.[formatDate(date)]?.[String(user.id)] ?? []

                      const dateStr = formatDate(date, 'M/D(ddd)')

                      const isHoliday = Days.day.isHoliday(date, holidays)

                      const thStyle = {background: '#d8d8d8', ...isHoliday?.style, fontWeight: 'bold'}

                      return {
                        label: (
                          <div id={`#${dateStr}`}>
                            <DateThCell {...{tbmBase, mode, date, userList, scheduleListOnDate, doTransaction, fetchData}}>
                              {dateStr}
                            </DateThCell>
                          </div>
                        ),
                        cellValue: (
                          <Cell
                            {...{
                              fetchData,
                              setModalOpen,
                              scheduleListOnDate,
                              user,
                              date,
                              tbmBase,
                            }}
                          />
                        ),
                        thStyle,
                      }
                    }),
                  ],
                }
              }),
          }).WithWrapper({className: `max-w-[calc(95vw-50px)] max-h-[75vh] `})
        ) : (
          <div>データがありません</div>
        )}
      </>
    )
  }
}

const getScheduleByDateAndUser = ({TbmDriveSchedule}) => {
  const scheduleByDateAndUser = TbmDriveSchedule.reduce((acc, schedule) => {
    const dateKey = formatDate(schedule.date)
    const userKey = schedule.userId
    if (!acc[dateKey]) {
      acc[dateKey] = {}
    }
    if (!acc[dateKey][userKey]) {
      acc[dateKey][userKey] = []
    }
    acc[dateKey][userKey].push(schedule)
    return acc
  }, {})

  return {scheduleByDateAndUser} as {scheduleByDateAndUser: Record<string, Record<string, TbmDriveSchedule[]>>}
}
const getScheduleByDateAndRoute = ({TbmDriveSchedule}) => {
  const scheduleByDateAndRoute = TbmDriveSchedule.reduce((acc, schedule) => {
    const dateKey = formatDate(schedule.date)
    const routeKey = schedule.tbmRouteGroupId
    if (!acc[dateKey]) {
      acc[dateKey] = {}
    }
    if (!acc[dateKey][routeKey]) {
      acc[dateKey][routeKey] = []
    }
    acc[dateKey][routeKey].push(schedule)
    return acc
  }, {})

  return {scheduleByDateAndRoute} as {scheduleByDateAndRoute: Record<string, Record<string, TbmDriveSchedule[]>>}
}
