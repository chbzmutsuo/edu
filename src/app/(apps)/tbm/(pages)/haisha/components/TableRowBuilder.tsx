'use client'
import React from 'react'
import {Days} from '@cm/class/Days/Days'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {Cell} from './Cell'
import UserTh from './UserTh'
import DateThCell from './DateThCell'
import {doTransaction} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {haishaListData} from './getListData'
import {haishaTableMode} from './HaishaTable'

// 固定列のスタイル定数
const STICKY_COLUMN_STYLE = {
  left: 0,
  position: 'sticky' as const,
  zIndex: 31,
  background: '#d8d8d8',
  borderRight: '2px solid #c8c8c8',
  boxShadow: '2px 0 4px rgba(0,0,0,0.1)',
}

const HEADER_STYLE = {
  background: '#d8d8d8',
  fontWeight: 'bold' as const,
}

interface TableRowBuilderProps {
  mode: haishaTableMode
  tbmBase: any
  days: Date[]
  holidays: any[]
  fetchData: () => void
  setModalOpen: (props: any) => void
  admin: boolean
  query: any
  userWorkStatusCount: haishaListData['userWorkStatusCount']
  scheduleByDateAndUser?: Record<string, Record<string, any[]>>
  scheduleByDateAndRoute?: Record<string, Record<string, any[]>>
}

export const TableRowBuilder = {
  // ドライバーモード用の行生成
  buildDriverRows: (userList: haishaListData['userList'], props: TableRowBuilderProps) => {
    const {
      mode,
      tbmBase,
      days,
      holidays,
      fetchData,
      setModalOpen,
      admin,
      query,
      userWorkStatusCount,
      scheduleByDateAndUser = {},
    } = props

    return userList
      .sort((a, b) => a.code?.localeCompare(b.code ?? '') ?? 0)
      .map(user => ({
        csvTableRow: [
          // ユーザー情報（固定列）
          {
            label: 'ユーザー',
            cellValue: <UserTh {...{user, admin, query, userWorkStatusCount}} />,
            style: {
              ...STICKY_COLUMN_STYLE,
              minWidth: 130,
              height: 10,
            },
          },
          // 日付別セル
          ...days.map(date =>
            TableRowBuilder.buildDateCell({
              date,
              scheduleListOnDate: scheduleByDateAndUser[formatDate(date)]?.[String(user.id)] ?? [],
              user,
              mode,
              tbmBase,
              holidays,
              fetchData,
              setModalOpen,
              query,
            })
          ),
        ],
      }))
  },

  // ルートモード用の行生成
  buildRouteRows: (tbmRouteGroup: haishaListData['tbmRouteGroup'], props: TableRowBuilderProps) => {
    const {mode, tbmBase, days, holidays, fetchData, setModalOpen, query, scheduleByDateAndRoute = {}} = props

    return tbmRouteGroup
      .sort((a, b) => a.code.localeCompare(b.code))
      .map(route => ({
        csvTableRow: [
          // ルート情報（固定列）
          {
            label: '便',
            cellValue: <span>{route.name}</span>,
            style: {
              ...STICKY_COLUMN_STYLE,
              minWidth: 240,
            },
          },
          // 日付別セル
          ...days.map(date => {
            const scheduleListOnDate = scheduleByDateAndRoute[formatDate(date)]?.[String(route.id)] ?? []
            const holidayType = route.TbmRouteGroupCalendar.find(calendar =>
              Days.validate.isSameDate(calendar.date, date)
            )?.holidayType
            const must = route?.id > 0 && holidayType === '稼働'

            return {
              ...TableRowBuilder.buildDateCell({
                date,
                scheduleListOnDate,
                tbmRouteGroup: route,
                mode,
                tbmBase,
                holidays,
                fetchData,
                setModalOpen,
                query,
              }),
              style: {
                height: 1,
                background: must ? '#fff1cd' : '',
              },
            }
          }),
        ],
      }))
  },

  // 日付セルの共通ビルダー
  buildDateCell: ({
    date,
    scheduleListOnDate,
    user,
    tbmRouteGroup,
    mode,
    tbmBase,
    holidays,
    fetchData,
    setModalOpen,
    query,
  }: {
    date: Date
    scheduleListOnDate: any[]
    user?: any
    tbmRouteGroup?: any
    mode: haishaTableMode
    tbmBase: any
    holidays: any[]
    fetchData: () => void
    setModalOpen: (props: any) => void
    query: any
  }) => {
    const dateStr = formatDate(date, 'M/D(ddd)')
    const isHoliday = Days.day.isHoliday(date, holidays)
    const thStyle = {...HEADER_STYLE, ...isHoliday?.style}

    return {
      label: (
        <div id={`#${dateStr}`}>
          <DateThCell
            {...{
              tbmBase,
              mode,
              date,
              userList: user ? [user] : [],
              scheduleListOnDate,
              doTransaction,
              fetchData,
            }}
          >
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
            tbmRouteGroup,
            date,
            tbmBase,
          }}
        />
      ),
      thStyle,
    }
  },
}
