//classを切り替える
import {QueryBuilder} from '@app/(apps)/sohken/class/QueryBuilder'

import {Days} from '@cm/class/Days/Days'
import {toUtc} from '@cm/class/Days/date-utils/calculations'
import GenbadayListClient from '@app/(apps)/sohken/(pages)/genbaDay/GenbadayListClient'
import prisma from 'src/lib/prisma'

import {C_Stack} from '@cm/components/styles/common-components/common-components'

import {getHolidayCalendar} from '@app/(apps)/sohken/api/cron/refreshGoogleCalendar/getHolidayCalendar'
import {genbaDaySorter} from '@app/(apps)/sohken/(pages)/genbaDay/genbaDaySorter'

const include = QueryBuilder.getInclude({}).genbaDay.include as any

export default async function Page(props) {
  const query = await props.searchParams
  const isMyPage = query[`myPage`] === `true`
  const genbaId = query.genbaId ? Number(query.genbaId) : undefined
  const queryFrom = query.from ? toUtc(query.from) : null

  if (!queryFrom) {
    return <div>日付を選択してください</div>
  }

  // 今日と明日を取得
  let today = queryFrom
  let tomorrow = Days.day.add(today, 1)

  const {holidays} = await getHolidayCalendar({
    whereQuery: {gte: Days.day.subtract(today, 30), lte: Days.day.add(tomorrow, 30)},
  })

  // マイページにて、休日だった場合は、翌日にリダイレクト

  if (!isMyPage) {
    while (holidays.find(holiday => Days.validate.isSameDate(holiday.date, tomorrow))) {
      tomorrow = Days.day.add(tomorrow, 1)
    }

    while (holidays.find(holiday => Days.validate.isSameDate(holiday.date, today))) {
      today = Days.day.add(today, -1)
    }
  }

  const records = await prisma.genbaDay.findMany({
    include,
    where: {
      genbaId,
      OR: [{status: {not: `不要`}}, {status: null}],
      date: {gte: today, lte: tomorrow},
    },
  })

  records.sort((a: any, b: any) => {
    return genbaDaySorter(a, b)
  })

  // const tomorrowShifts =
  const genbaDayRecords = {
    today: records.filter(record => Days.validate.isSameDate(record.date, today)),
    tomorrow: records.filter(record => Days.validate.isSameDate(record.date, tomorrow)),
    // today: [],
    // tomorrow: [],
  }

  // シフトデータの取得
  const shifts = {
    today: await prisma.genbaDayShift.findMany({
      include: {GenbaDay: {}},
      where: {genbaDayId: {in: genbaDayRecords.today.map(item => item.id)}},
    }),
    tomorrow: await prisma.genbaDayShift.findMany({
      include: {GenbaDay: {}},
      where: {genbaDayId: {in: genbaDayRecords.tomorrow.map(item => item.id)}},
    }),
  }

  const users = {
    today: await prisma.user.findMany({
      include: {
        UserRole: {include: {RoleMaster: {}}},
        GenbaDayShift: {where: {GenbaDay: {date: today}}},
        DayRemarksUser: {
          include: {DayRemarks: {}},
          where: {DayRemarks: {date: today}},
        },
      },
      where: {apps: {has: `sohken`}},
      orderBy: [{sortOrder: `asc`}],
    }),
    tomorrow: await prisma.user.findMany({
      include: {
        UserRole: {include: {RoleMaster: {}}},
        GenbaDayShift: {where: {GenbaDay: {date: tomorrow}}},
        DayRemarksUser: {
          include: {DayRemarks: {}},
          where: {DayRemarks: {date: tomorrow}},
        },
      },
      where: {apps: {has: `sohken`}},
      orderBy: [{sortOrder: `asc`}],
    }),
  }

  const dayRemarksStates = {
    today: await prisma.dayRemarks.upsert({
      where: {date: today},
      create: {date: today},
      update: {date: today},
      include: {
        DayRemarksFile: {},
        DayRemarksUser: {include: {User: true}},
      },
    }),
    tomorrow: await prisma.dayRemarks.upsert({
      where: {date: tomorrow},
      create: {date: tomorrow},
      update: {date: tomorrow},
      include: {
        DayRemarksFile: {},
        DayRemarksUser: {include: {User: true}},
      },
    }),
  }

  //カレンダーの取得
  const calendars = {
    today: await prisma.sohkenGoogleCalendar.findMany({where: {date: today}}),
    tomorrow: await prisma.sohkenGoogleCalendar.findMany({where: {date: tomorrow}}),
  }

  return (
    <div>
      <C_Stack className={` items-center`}>
        <GenbadayListClient
          {...{
            holidays,
            calendars,
            shifts,
            genbaDayRecords,
            users,
            dayRemarksStates,
            today,
            tomorrow,
            isMyPage,
          }}
        />
      </C_Stack>
    </div>
  )
}
