import NempiKanriCC from '@app/(apps)/tbm/(pages)/nempiKanri/NempiKanriCC'
import {getTbmBase_MonthConfig} from '@app/(apps)/tbm/(server-actions)/getBasics'
import {getNenpiDataByCar} from '@app/(apps)/tbm/(server-actions)/getNenpiDataByCar'
import {FitMargin} from '@components/styles/common-components/common-components'
import NewDateSwitcher from '@components/utils/dates/DateSwitcher/NewDateSwitcher'
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

  const {TbmBase_MonthConfig} = await getTbmBase_MonthConfig({yearMonth: whereQuery.gte, tbmBaseId})
  const {nenpiKanriDataListByCar} = await getNenpiDataByCar({tbmBaseId, whereQuery, TbmBase_MonthConfig})

  const vehicleList = await prisma.tbmVehicle.findMany({
    where: {tbmBaseId},
    orderBy: [{code: 'asc'}, {id: 'asc'}],
    include: {
      TbmRefuelHistory: {
        where: {date: whereQuery},
        orderBy: [{date: 'asc'}, {id: 'asc'}],
      },
    },
  })

  const lastRefuelHistoryByCar = await prisma.tbmVehicle.findMany({
    where: {tbmBaseId},
    orderBy: [{code: 'asc'}, {id: 'asc'}],
    include: {TbmRefuelHistory: {where: {date: {lt: whereQuery.gte}}}},
  })

  return (
    <FitMargin className={`pt-4`}>
      <NewDateSwitcher {...{monthOnly: true}} />
      <NempiKanriCC {...{vehicleList, nenpiKanriDataListByCar, lastRefuelHistoryByCar}} />
    </FitMargin>
  )
}
