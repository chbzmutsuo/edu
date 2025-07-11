'use client'
import React from 'react'

import {Days} from '@class/Days/Days'
import {formatDate} from '@class/Days/date-utils/formatters'
import {C_Stack, R_Stack} from '@components/styles/common-components/common-components'
import {CsvTableChunked} from '@components/styles/common-components/CsvTable/CsvTableChunked'

import {Cell} from '@app/(apps)/tbm/(pages)/haisha/components/Cell'
import {TbmDriveSchedule} from '@prisma/client'

import UserTh from '@app/(apps)/tbm/(pages)/haisha/components/UserTh'

import {doTransaction} from '@lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {TBM_CODE} from '@app/(apps)/tbm/(class)/TBM_CODE'
import DateThCell from '@app/(apps)/tbm/(pages)/haisha/components/DateThCell'
import {Z_INDEX} from '@lib/constants/constants'
import {haishaListData} from '@app/(apps)/tbm/(pages)/haisha/components/getListData'

type props = {
  userList: haishaListData['userList']
  TbmDriveSchedule: haishaListData['TbmDriveSchedule']
  tbmRouteGroup: haishaListData['tbmRouteGroup']
  mode
  tbmBase
  days
  holidays

  fetchData
  setModalOpen
  admin
  query
}

export const TableContent = React.memo((props: props) => {
  const {mode, tbmBase, userList, TbmDriveSchedule, tbmRouteGroup, days, holidays, fetchData, setModalOpen, admin, query} = props

  if (mode === 'DRIVER') {
    const {scheduleByDateAndUser} = getScheduleByDateAndUser({TbmDriveSchedule})

    const userWorkStatusByDate = userList.reduce((acc, user) => {
      acc[user.id] = user.UserWorkStatus.reduce((acc, userWorkStatus) => {
        acc[formatDate(userWorkStatus.date)] = userWorkStatus.workStatus
        return acc
      }, {})
      return acc
    }, {})

    return (
      <>
        {CsvTableChunked({
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
                    style: {
                      minWidth: 130,
                      left: 0,
                      position: 'sticky',
                      zIndex: 30,
                      background: `#d8d8d8`,
                      height: 10,
                    },
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
          // 🔥 CsvTableでチャンク処理を有効化
          chunked: {
            enabled: true,

            showProgress: true,
            showControls: true,
          },
        }).WithWrapper({className: `max-w-[calc(95vw-50px)] max-h-[75vh] `})}
      </>
    )
  }

  if (mode === `ROUTE`) {
    const {scheduleByDateAndRoute} = getScheduleByDateAndRoute({TbmDriveSchedule})

    return (
      <>
        {CsvTableChunked({
          records: tbmRouteGroup
            .sort((a, b) => a.code.localeCompare(b.code))
            .map(route => {
              return {
                csvTableRow: [
                  // ルート情報
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
          // 🔥 CsvTableでチャンク処理を有効化
          chunked: {
            enabled: true,

            showProgress: true,
            showControls: true,
          },
        }).WithWrapper({className: `max-w-[calc(95vw-50px)] max-h-[75vh] `})}
      </>
    )
  }

  return <></>
})

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
export default TableContent
