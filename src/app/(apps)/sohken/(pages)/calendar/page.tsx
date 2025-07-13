import {chechIsHoliday} from '@app/(apps)/sohken/api/cron/refreshGoogleCalendar/chechIsHoliday'
import {getHolidayCalendar} from '@app/(apps)/sohken/api/cron/refreshGoogleCalendar/getHolidayCalendar'
import {Days} from '@class/Days/Days'

import {getMidnight, toUtc} from '@class/Days/date-utils/calculations'
import {Center, C_Stack, R_Stack} from '@components/styles/common-components/common-components'
import {CsvTable} from '@components/styles/common-components/CsvTable/CsvTable'
import {T_LINK} from '@components/styles/common-components/links'
import {Paper} from '@components/styles/common-components/paper'
import NewDateSwitcher from '@components/utils/dates/DateSwitcher/NewDateSwitcher'
import Redirector from '@components/utils/Redirector'
import {dateSwitcherTemplate} from '@lib/methods/redirect-method'
import {HREF} from '@lib/methods/urls'

import React from 'react'
import {formatDate} from '@class/Days/date-utils/formatters'
import {NumHandler} from '@class/NumHandler'
import prisma from 'src/lib/prisma'

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
    from: formatDate(Days.day.add(from, -15)),
    to: formatDate(Days.day.add(from, 15)),
  }

  const allGenbaDaysInPeriod = await prisma.genbaDay.findMany({
    where: {
      date: {gte: from, lte: to},
      // finished: {not: true},
      OR: [{status: {not: `不要`}}, {status: null}],
    },
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

  const allGenbaTasks = await prisma.genbaTask.findMany({
    include: {
      GenbaDayTaskMidTable: {include: {GenbaDay: {}}},
      Genba: {include: {PrefCity: true}},
    },
    where: {genbaId: {in: allGenbaDaysInPeriod.map(g => g.Genba.id)}},
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

  const ninkuObj: {
    [date: string]: {
      [genbaId: string]: {
        [taskId: string]: {
          genbaName: string | null
          taskName: string | null
          taskId: number | null
          from?: Date
          to?: Date
          requiredNinku: number | null
          scheduleCount: number
          ninkuAveragedPerDay: number | null
        }
      }
    }
  } = {}

  const foo: {
    [taskId: string]: {
      taskName: string | null
      taskId: number | null
      from?: Date
      to?: Date
      requiredNinku: number
      scheduleCount: number
      ninkuAveragedPerDay: number | null
    }
  } = {}

  allGenbaTasks.forEach(task => {
    const genbaDaySorted = task.GenbaDayTaskMidTable.map(mid => mid.GenbaDay)
      .filter(data => {
        const isHoliday = chechIsHoliday({holidays, date: data.date})
        return isHoliday === false
      })
      .sort((a, b) => {
        return a.date.getTime() - b.date.getTime()
      })

    const taskName = task.name
    const taskId = task.id

    const from = formatDate(genbaDaySorted[0]?.date)
    const to = formatDate(genbaDaySorted[genbaDaySorted.length - 1]?.date)

    const requiredNinku = task.requiredNinku ?? 0

    const scheduleCount = genbaDaySorted.length
    const ninkuAveragedPerDay = scheduleCount > 0 ? Math.round((requiredNinku / scheduleCount) * 100) / 100 : null

    const data = {
      from,
      to,
      taskName,
      taskId,
      requiredNinku,
      scheduleCount,
      ninkuAveragedPerDay,
    }

    if (!foo[taskId]) {
      foo[taskId] = data
    } else {
      foo[taskId] = {
        ...foo[taskId],
        ...data,
      }
    }

    // const requiredNinku = task.requiredNinku
    // const scheduleCount = task.GenbaDayTaskMidTable.length
    // const ninkuAveragedPerDay = requiredNinku / scheduleCount
  })

  allGenbaDaysInPeriod.forEach(genbaDay => {
    const {date, GenbaDayTaskMidTable, Genba} = genbaDay ?? {}
    const genbaId = Genba.id
    const dateStr = formatDate(date)
    const genbaName = Genba.name

    GenbaDayTaskMidTable.map(mid => {
      const taskInfo = foo[mid.genbaTaskId]

      if (taskInfo) {
        const {taskName, taskId, requiredNinku} = taskInfo

        const taskIsOnGenbaDay = genbaDay.GenbaDayTaskMidTable.some(t => t.genbaTaskId === mid.genbaTaskId)
        if (!ninkuObj[dateStr]) {
          ninkuObj[dateStr] = {}
        }
        if (!ninkuObj[dateStr][genbaId]) {
          ninkuObj[dateStr][genbaId] = {}
        }

        let scheduleCount = 0
        const ninkuUnderOne = requiredNinku && requiredNinku < 1

        if (ninkuUnderOne) {
          scheduleCount = 0.5
        } else {
          scheduleCount = taskInfo.scheduleCount
        }

        let ninkuAveragedPerDay: number | null = requiredNinku && scheduleCount ? requiredNinku / scheduleCount : null
        if (ninkuUnderOne) {
          if (genbaDay.date && taskInfo?.from && Days.validate.isSameDate(genbaDay.date, taskInfo?.from)) {
            ninkuAveragedPerDay = 0.5
          } else {
            ninkuAveragedPerDay = null
          }
        }

        ninkuAveragedPerDay = NumHandler.round(ninkuAveragedPerDay ?? 0, 2)

        ninkuObj[dateStr][genbaId][mid.genbaTaskId] = {
          genbaName,
          taskName,
          taskId,
          requiredNinku,
          scheduleCount,

          ninkuAveragedPerDay,
        }
      }
    })
  })

  const genbaDaysTest = allGenbaDaysInPeriod.filter(g => formatDate(g.date) === `2025-06-04`)

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
            {CsvTable({
              records: days
                .filter(d => {
                  return chechIsHoliday({holidays, date: d}) === false
                })
                .map((d, dayIdx) => {
                  const ninkuCount = dayRemarks.find(dayRemark => Days.validate.isSameDate(dayRemark.date, d))?.ninkuCount ?? null

                  // const genbaNameList = GenbaTaskStartingToday.map(t => t.Genba.name).join(`, `)
                  const href = HREF(`/sohken/genbaDay`, {from: formatDate(d)}, query)
                  const ninku = Object.keys(ninkuObj[formatDate(d)] ?? {}).reduce((acc, genbaId) => {
                    return (
                      acc +
                      (Object.keys(ninkuObj[formatDate(d)][genbaId]) ?? {}).reduce((acc, taskId) => {
                        const {ninkuAveragedPerDay, requiredNinku, scheduleCount} = ninkuObj[formatDate(d)][genbaId][taskId] ?? {}

                        const Genba = allGenbaDaysInPeriod.find(g => g.Genba.id === Number(genbaId))?.Genba
                        const genbaName = Genba?.name
                        const Task = allGenbaTasks.find(t => t.id === Number(taskId))
                        const taskName = Task?.name

                        return acc + (ninkuAveragedPerDay ?? 0)
                      }, 0)
                    )
                  }, 0)

                  return {
                    csvTableRow: [
                      //
                      {
                        label: `日付`,
                        cellValue: (
                          <T_LINK href={href} className={`t-link`}>
                            {formatDate(d, 'YYYY-MM-DD(ddd)')}
                          </T_LINK>
                        ),
                      },

                      {
                        label: `＃`,
                        cellValue:
                          ninkuCount === null ? '' : ninkuCount === 0 ? '0' : ninkuCount >= 0 ? ninkuCount : `▲${ninkuCount}`,
                        style: {width: 100, textAlign: 'right'},
                      },
                      {
                        label: `人工(NEW)`,
                        cellValue: NumHandler.round(ninku, 1),
                      },
                    ],
                  }
                }),
            }).WithWrapper({})}
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
