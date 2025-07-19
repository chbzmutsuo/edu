import {DailySummaryCC} from '@app/(apps)/sohken/(pages)/daily-summary/DailySummaryCC'
import {genbaDaySorter} from '@app/(apps)/sohken/(pages)/genbaDay/genbaDaySorter'
import {QueryBuilder} from '@app/(apps)/sohken/class/QueryBuilder'

import {getMidnight, toUtc} from '@cm/class/Days/date-utils/calculations'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import Redirector from '@cm/components/utils/Redirector'

import {addQuerySentence} from '@cm/lib/methods/urls'
import prisma from 'src/lib/prisma'

export default async function Page(props) {
  const query = await props.searchParams
  const tomorrow = getMidnight(toUtc(new Date(query.from ?? new Date())))
  if (!query.from) {
    return (
      <Redirector
        {...{
          redirectPath: '/sohken/daily-summary' + addQuerySentence({from: formatDate(tomorrow), myPage: true}),
        }}
      />
    )
  }

  // const params = await props.params
  // const {session, scopes} = await initServerComopnent({query})

  const include = QueryBuilder.getInclude({}).genbaDay.include as any

  const genbaDayList = await prisma.genbaDay.findMany({
    where: {date: tomorrow, OR: [{status: {not: `不要`}}, {status: null}]},
    include: {
      ...include,
      // Genba: {
      //   include: {
      //     PrefCity: {},

      //     GenbaDayShift: {
      //       include: {
      //         GenbaDay: {include: {GenbaDayTaskMidTable: {}}},
      //       },
      //     },
      //     GenbaDay: {
      //       include: {
      //         GenbaDayTaskMidTable: {
      //           include: {
      //             GenbaTask: {},
      //           },
      //         },
      //       },
      //     },
      //   },
      // },
      // GenbaDayShift: {include: {User: {}, GenbaDay: {}}},
      // GenbaDayTaskMidTable: {include: {GenbaTask: {}}},
      // GenbaDaySoukenCar: {include: {SohkenCar: {}}},
    },
  })

  const allShiftBetweenDays = await prisma.genbaDayShift.findMany({
    include: {GenbaDay: {}},
    where: {genbaDayId: {in: genbaDayList.map(item => item.id)}},
  })

  // dayRemarksStateを取得（upsertで確実に存在させる）
  const dayRemarksState = await prisma.dayRemarks.upsert({
    where: {date: tomorrow},
    create: {date: tomorrow},
    update: {date: tomorrow},
    include: {
      DayRemarksFile: {},
      DayRemarksUser: {
        include: {
          User: {
            include: {
              UserRole: {
                include: {
                  RoleMaster: true,
                },
              },
            },
          },
        },
      },
    },
  })

  // usersを取得（DayRemarkComponentで使用されているロジックと同様）
  const users = await prisma.user.findMany({
    where: {apps: {has: `sohken`}},
    include: {
      UserRole: {include: {RoleMaster: {}}},
      GenbaDayShift: {
        where: {
          GenbaDay: {
            date: tomorrow,
          },
        },
      },
      DayRemarksUser: {
        include: {DayRemarks: {}},
        where: {DayRemarks: {date: tomorrow}},
      },
    },
    orderBy: {
      sortOrder: 'asc',
    },
  })

  // Googleカレンダー情報を取得
  const calendar = await prisma.sohkenGoogleCalendar.findMany({
    where: {date: tomorrow},
  })

  genbaDayList.sort((a, b) => {
    return genbaDaySorter(a, b)
  })

  const records = genbaDayList

  return <DailySummaryCC {...{genbaDayList, allShiftBetweenDays, records, users, dayRemarksState, calendar}} />
}
