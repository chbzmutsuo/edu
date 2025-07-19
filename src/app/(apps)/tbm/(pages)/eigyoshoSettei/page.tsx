import {Days} from '@cm/class/Days/Days'
import {getMidnight} from '@cm/class/Days/date-utils/calculations'
import EigyoshoSetteiClient from '@app/(apps)/tbm/(pages)/eigyoshoSettei/components/EigyoshoSetteiClient'

import {dateSwitcherTemplate} from '@cm/lib/methods/redirect-method'
import prisma from 'src/lib/prisma'

import {initServerComopnent} from 'src/non-common/serverSideFunction'

export default async function Page(props) {
  const query = await props.searchParams
  const {session, scopes} = await initServerComopnent({query})
  const {tbmBaseId} = scopes.getTbmScopes()

  const {firstDayOfMonth, lastDayOfMonth} = Days.month.getMonthDatum(new Date())
  const {whereQuery} = await dateSwitcherTemplate({
    query,
    defaultWhere: {from: firstDayOfMonth, to: lastDayOfMonth},
  })

  const today = whereQuery?.gte ?? getMidnight()
  const currentMonthData = Days.month.getMonthDatum(today)

  const tbmBase = await prisma.tbmBase.findUnique({where: {id: tbmBaseId}})

  return (
    <div className="print-target ">
      <EigyoshoSetteiClient
        {...{
          tbmBase,
          currentMonth: currentMonthData.firstDayOfMonth,
          days: currentMonthData.days,
          tbmBaseId,
          whereQuery,
        }}
      />
    </div>
  )
}
