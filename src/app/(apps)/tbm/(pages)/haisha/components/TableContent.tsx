'use client'
import React from 'react'
import {CsvTableVirtualized} from '@cm/components/styles/common-components/CsvTable/CsvTableVirtualized'
import {TableRowBuilder} from './TableRowBuilder'
import {haishaListData} from './getListData'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

type props = {
  userList: haishaListData['userList']
  TbmDriveSchedule: haishaListData['TbmDriveSchedule']
  tbmRouteGroup: haishaListData['tbmRouteGroup']
  userWorkStatusCount: haishaListData['userWorkStatusCount']
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
  const {
    mode,
    tbmBase,
    userList,
    TbmDriveSchedule,
    tbmRouteGroup,
    days,
    holidays,
    fetchData,
    setModalOpen,
    admin,
    query,
    userWorkStatusCount,
  } = props

  // スケジュールデータを整理
  const {scheduleByDateAndUser, scheduleByDateAndRoute} = React.useMemo(() => {
    return {
      scheduleByDateAndUser: getScheduleByDateAndUser({TbmDriveSchedule}),
      scheduleByDateAndRoute: getScheduleByDateAndRoute({TbmDriveSchedule}),
    }
  }, [TbmDriveSchedule])

  const tableRowBuilderProps = {
    mode,
    tbmBase,
    days,
    holidays,
    fetchData,
    setModalOpen,
    admin,
    query,
    userWorkStatusCount,
    scheduleByDateAndUser: scheduleByDateAndUser.scheduleByDateAndUser,
    scheduleByDateAndRoute: scheduleByDateAndRoute.scheduleByDateAndRoute,
  }

  if (mode === 'DRIVER') {
    const records = TableRowBuilder.buildDriverRows(userList, tableRowBuilderProps)
    return <div>{CsvTableVirtualized({records}).WithWrapper({})}</div>
  }

  if (mode === 'ROUTE') {
    const records = TableRowBuilder.buildRouteRows(tbmRouteGroup, tableRowBuilderProps)

    return <div>{CsvTableVirtualized({records}).WithWrapper({})}</div>
  }

  return <></>
})

const getScheduleByDateAndUser = ({TbmDriveSchedule}) => {
  const scheduleByDateAndUser = TbmDriveSchedule.reduce((acc, schedule) => {
    const dateKey = formatDate(schedule.date)
    const userKey = String(schedule.userId)
    if (!acc[dateKey]) {
      acc[dateKey] = {}
    }
    if (!acc[dateKey][userKey]) {
      acc[dateKey][userKey] = []
    }
    acc[dateKey][userKey].push(schedule)
    return acc
  }, {})

  return {scheduleByDateAndUser} as {scheduleByDateAndUser: Record<string, Record<string, any[]>>}
}
const getScheduleByDateAndRoute = ({TbmDriveSchedule}) => {
  const scheduleByDateAndRoute = TbmDriveSchedule.reduce((acc, schedule) => {
    const dateKey = formatDate(schedule.date)
    const routeKey = String(schedule.tbmRouteGroupId)
    if (!acc[dateKey]) {
      acc[dateKey] = {}
    }
    if (!acc[dateKey][routeKey]) {
      acc[dateKey][routeKey] = []
    }
    acc[dateKey][routeKey].push(schedule)
    return acc
  }, {})

  return {scheduleByDateAndRoute} as {scheduleByDateAndRoute: Record<string, Record<string, any[]>>}
}
export default TableContent
