import KyuyoCC from '@app/(apps)/tbm/(pages)/kyuyo/KyuyoCC'

import {getMidnight} from '@class/Days/date-utils/calculations'
import Redirector from '@components/utils/Redirector'
import {dateSwitcherTemplate} from '@lib/methods/redirect-method'
import prisma from '@lib/prisma'

import {initServerComopnent} from 'src/non-common/serverSideFunction'

export default async function Page(props) {
  const query = await props.searchParams
  const {session, scopes} = await initServerComopnent({query})
  const {tbmBaseId} = scopes.getTbmScopes()
  const {redirectPath, whereQuery} = await dateSwitcherTemplate({query})
  if (redirectPath) return <Redirector {...{redirectPath}} />

  const TbmBase_MonthConfig = await prisma.tbmBase_MonthConfig.findUnique({
    where: {
      unique_tbmBaseId_yearMonth: {yearMonth: whereQuery.gte ?? getMidnight(), tbmBaseId},
    },
  })

  return (
    <KyuyoCC
      {...{
        TbmBase_MonthConfig,
        yearMonth: TbmBase_MonthConfig?.yearMonth,
        whereQuery,
        tbmBaseId,
      }}
    />
  )
}
