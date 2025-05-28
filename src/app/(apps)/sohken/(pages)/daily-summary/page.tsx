import {DailySummaryCC} from '@app/(apps)/sohken/(pages)/daily-summary/DailySummaryCC'
import {genbaDaySorter} from '@app/(apps)/sohken/(pages)/genbaDay/genbaDaySorter'
import {QueryBuilder} from '@app/(apps)/sohken/class/QueryBuilder'

import {getMidnight} from '@class/Days/date-utils/calculations'
import {formatDate} from '@class/Days/date-utils/formatters'
import Redirector from '@components/utils/Redirector'

import {addQuerySentence} from '@lib/methods/urls'
import prisma from '@lib/prisma'

export default async function DynamicMasterPage(props) {
  const query = await props.searchParams
  // const params = await props.params
  // const {session, scopes} = await initServerComopnent({query})

  const tomorrow = getMidnight(query.from)

  const include = QueryBuilder.getInclude({}).genbaDay.include as any

  const genbaDayList = await prisma.genbaDay.findMany({
    where: {date: tomorrow},
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

  genbaDayList.sort((a, b) => {
    return genbaDaySorter(a, b)
  })

  if (!query.from) {
    return (
      <Redirector
        {...{
          redirectPath: '/sohken/daily-summary' + addQuerySentence({from: formatDate(tomorrow), myPage: true}),
        }}
      />
    )
  }

  const records = genbaDayList

  return <DailySummaryCC {...{genbaDayList, allShiftBetweenDays, records}} />
}
