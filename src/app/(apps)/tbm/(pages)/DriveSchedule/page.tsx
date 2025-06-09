import DriveScheduleCC from '@app/(apps)/tbm/(pages)/DriveSchedule/DriveScheduleCC'
import {Days} from '@class/Days/Days'
import {getMidnight} from '@class/Days/date-utils/calculations'
import {formatDate} from '@class/Days/date-utils/formatters'
import Redirector from '@components/utils/Redirector'

import {dateSwitcherTemplate} from '@lib/methods/redirect-method'
import prisma from '@lib/prisma'

import {initServerComopnent} from 'src/non-common/serverSideFunction'

export default async function Page(props) {
  const query = await props.searchParams
  const {session, scopes} = await initServerComopnent({query})
  const {tbmBaseId} = scopes.getTbmScopes()

  const {firstDayOfMonth} = Days.month.getMonthDatum(new Date())
  const {redirectPath, whereQuery} = await dateSwitcherTemplate({
    query,
    defaultWhere: {
      mode: 'DRIVER',
      month: formatDate(firstDayOfMonth),
    },
  })

  if (redirectPath) return <Redirector {...{redirectPath}} />

  const theDate = whereQuery?.gte ?? getMidnight()
  const MONTH = Days.month.getMonthDatum(theDate)

  const tbmBase = await prisma.tbmBase.findUnique({where: {id: tbmBaseId}})

  return (
    <div className="print-target">
      <DriveScheduleCC {...{tbmBase, days: MONTH.days, tbmBaseId, whereQuery}} />
    </div>
  )
}
