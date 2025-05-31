import {chechIsHoliday} from '@app/(apps)/sohken/api/cron/refreshGoogleCalendar/chechIsHoliday'
import {getHolidayCalendar} from '@app/(apps)/sohken/api/cron/refreshGoogleCalendar/getHolidayCalendar'
import {Days} from '@class/Days/Days'

import {getMidnight, toUtc} from '@class/Days/date-utils/calculations'
import {Center, C_Stack, R_Stack} from '@components/styles/common-components/common-components'
import {CsvTable} from '@components/styles/common-components/CsvTable/CsvTable'
import {T_LINK} from '@components/styles/common-components/links'
import {Paper} from '@components/styles/common-components/paper'
import {TableBordered, TableWrapper} from '@components/styles/common-components/Table'
import NewDateSwitcher from '@components/utils/dates/DateSwitcher/NewDateSwitcher'
import MyPopover from '@components/utils/popover/MyPopover'
import Redirector from '@components/utils/Redirector'
import {doStandardPrisma} from '@lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {dateSwitcherTemplate} from '@lib/methods/redirect-method'
import {HREF} from '@lib/methods/urls'

import React from 'react'
import {formatDate} from '@class/Days/date-utils/formatters'
import {NumHandler} from '@class/NumHandler'
import prisma from '@lib/prisma'

export default async function CalendarPage(props) {
  const query = await props.searchParams
  const tomorrow = Days.day.add(getMidnight(), 1)
  const {whereQuery, redirectPath} = await dateSwitcherTemplate({
    defaultWhere: {from: tomorrow},
    query,
  })

  if (redirectPath) {
    return <Redirector {...{redirectPath}} />
  }

  const from = toUtc(query.from)
  const to = Days.day.add(from, 14)

  const days = Days.day.getDaysBetweenDates(from, to)

  const {holidays} = await getHolidayCalendar({whereQuery: {gte: from, lte: to}})

  const prev_next_Query = {
    from: Days.day.add(from, -15),
    to: Days.day.add(from, 15),
  }

  const allGenbaTasks = await prisma.genbaTask.findMany({
    include: {
      GenbaDayTaskMidTable: {include: {GenbaDay: {}}},
      Genba: {include: {PrefCity: true}},
    },
    where: {from: {gte: from, lte: to}},
  })

  const dayRemarks = await prisma.dayRemarks.findMany({
    where: {date: {gte: from, lte: to}},
  })

  const userList = await prisma.user.findMany({
    where: {
      OR: [{app: `sohken`}, {apps: {has: `sohken`}}],
      UserRole: {none: {RoleMaster: {name: `監督者`}}},
    },
  })

  const userCount = userList.length

  const allGenbaDaysInPeriod = await prisma.genbaDay.findMany({
    where: {date: {gte: from, lte: to}},
    include: {
      GenbaDayTaskMidTable: {
        include: {
          GenbaDay: {},
          GenbaTask: {include: {GenbaDayTaskMidTable: {include: {GenbaDay: {}}}}},
        },
      },
      Genba: true,
    },
  })

  const result: {
    [date: string]: {
      [genbaId: string]: {
        [taskId: string]: {
          requiredNinku: number | null
          scheduleCount: number
          ninkuAveragedPerDay: number | null
        }
      }
    }
  } = {}

  allGenbaDaysInPeriod.forEach(genbaDay => {
    const {date, GenbaDayTaskMidTable, Genba} = genbaDay ?? {}
    const genbaId = Genba.id

    const dateStr = formatDate(date)

    const taskStartingToday = GenbaDayTaskMidTable?.filter(mid => {
      const {GenbaTask} = mid
      const {from, requiredNinku} = GenbaTask
      return from && Days.validate.isSameDate(from, date)
    })

    taskStartingToday.forEach(mid => {
      const {genbaTaskId} = mid
      const GenbaTask = allGenbaTasks.find(t => t.id === genbaTaskId)

      const {requiredNinku = 0} = GenbaTask ?? {}

      let scheduleCount = 0

      if (requiredNinku && requiredNinku < 1) {
        scheduleCount = 0.5
      } else {
        scheduleCount =
          GenbaTask?.GenbaDayTaskMidTable.filter(t => {
            const {date} = t.GenbaDay
            return date && Days.validate.isSameDate(date, date)
          }).length ?? 0
      }

      const ninkuAveragedPerDay = requiredNinku && scheduleCount ? requiredNinku / scheduleCount : null

      if (!result[dateStr]) {
        result[dateStr] = {}
      }
      if (!result[dateStr][genbaId]) {
        result[dateStr][genbaId] = {}
      }
      result[dateStr][genbaId][genbaTaskId] = {
        requiredNinku,
        scheduleCount,
        ninkuAveragedPerDay,
      }
    })
  })

  const debug = () => {
    Object.keys(result).forEach(dateStr => {
      Object.keys(result[dateStr]).forEach(genbaId => {
        Object.keys(result[dateStr][genbaId]).forEach(taskId => {
          const {requiredNinku, scheduleCount, ninkuAveragedPerDay} = result[dateStr][genbaId][taskId] ?? {}

          const GenbaDay = allGenbaDaysInPeriod.find(g => g.Genba.id === Number(genbaId))
          const Genba = GenbaDay?.Genba
          const Task = GenbaDay?.GenbaDayTaskMidTable.find(t => t.GenbaTask.id === Number(taskId))?.GenbaTask

          const taskName = Task?.name
          const genbaName = Genba?.name

          if (dateStr === `2025-06-05`) {
            console.log({
              genbaId,
              genbaName,
              taskName,
              ninkuAveragedPerDay,
              requiredNinku,
              scheduleCount,
            })
          }
        })
      })
    })
  }

  return (
    <Center>
      <Paper className={`mx-auto w-fit p-2`}>
        <C_Stack className={` items-center gap-4`}>
          <section>
            <R_Stack className={` mx-auto w-fit items-center`}>
              基準日: <NewDateSwitcher {...{}} />
            </R_Stack>
          </section>

          <section className={`text-sm`}>
            <C_Stack>
              <div>
                <small>必要人工</small>
                <p>各日付を「初日」とするタスクの必要人工を合計した数です。</p>
              </div>
              <div>
                <small>余力</small>
                <p>アプリ登録ユーザー数から、必要人工を引いた数です。</p>
              </div>
            </C_Stack>
          </section>

          <section>
            <Table {...{holidays, days, dayRemarks, allGenbaTasks, userCount, query}} />
          </section>
          <section>
            <R_Stack className={`w-[200px] justify-between`}>
              <T_LINK href={HREF(`/sohken/calendar`, {from: prev_next_Query.from}, query)}>前へ</T_LINK>
              <T_LINK href={HREF(`/sohken/calendar`, {from: prev_next_Query.to}, query)}>次へ</T_LINK>
            </R_Stack>
          </section>
        </C_Stack>
      </Paper>
    </Center>
  )
}

const Table = ({holidays, days, dayRemarks, allGenbaTasks, userCount, query}) => {
  return (
    <TableWrapper>
      <TableBordered>
        {CsvTable({
          headerRecords: [
            {
              csvTableRow: [
                //
                {cellValue: `日付`},
                // {cellValue: `人工`},
                // {cellValue: `余力`},
                {cellValue: `＃`},
                // {cellValue: `①タスク\n必要人工計`},
                // {cellValue: `②タスク\nスケジュール計`},
                // {cellValue: `① / ②`},
              ],
            },
          ],
          bodyRecords: days
            .filter(d => {
              return chechIsHoliday({holidays, date: d}) === false
            })
            .map((d, dayIdx) => {
              // const isHoliday = holidays.find(h => {
              //   return Days.validate.isSameDate(h.date, d)
              // })

              const ninkuCount = dayRemarks.find(dayRemark => Days.validate.isSameDate(dayRemark.date, d))?.ninkuCount

              const GenbaTaskStartingToday = allGenbaTasks.filter(task => Days.validate.isSameDate(task.from, d))

              // const requiredNinkuSum = GenbaTaskStartingToday.reduce((acc, task) => {
              //   return acc + task.requiredNinku
              // }, 0)

              // const calcRequiredNinkuSum = GenbaTaskStartingToday.filter(data => {
              //   return data.Genba.name.includes(`鈴木`)
              // }).reduce(
              //   (acc, task) => {
              //     const requiredNinku = acc.requiredNinku + task.requiredNinku
              //     const scheduleCount =
              //       acc.scheduleCount +
              //       task.GenbaDayTaskMidTable.filter(t => {
              //         const date = t.GenbaDay.date
              //         const isHoliday = chechIsHoliday({holidays, date: date})

              //         return isHoliday === false
              //       }).length

              //     return {
              //       requiredNinku,
              //       scheduleCount,
              //     }
              //   },
              //   {requiredNinku: 0, scheduleCount: 0}
              // )

              // const genbaNameList = GenbaTaskStartingToday.map(t => t.Genba.name).join(`, `)
              const href = HREF(`/sohken/genbaDay`, {from: formatDate(d)}, query)

              return {
                csvTableRow: [
                  //
                  {
                    cellValue: (
                      <T_LINK href={href} className={`t-link`}>
                        {formatDate(d, 'YYYY-MM-DD(ddd)')}
                      </T_LINK>
                    ),
                  },

                  // {
                  //   cellValue: (
                  //     <MyPopover
                  //       {...{
                  //         mode: `click`,
                  //         button: requiredNinkuSum,
                  //       }}
                  //     >
                  //       <Paper>{genbaNameList}</Paper>
                  //     </MyPopover>
                  //   ),
                  // },

                  // {cellValue: userCount - requiredNinkuSum},
                  {
                    cellValue:
                      ninkuCount === undefined ? '' : ninkuCount === 0 ? '0' : ninkuCount >= 0 ? ninkuCount : `▲${ninkuCount}`,
                    style: {width: 100, textAlign: 'right'},
                  },
                  {
                    cellValue: `test`,
                  },
                ],
              }
            }),
        }).ALL()}
      </TableBordered>
    </TableWrapper>
  )
}
