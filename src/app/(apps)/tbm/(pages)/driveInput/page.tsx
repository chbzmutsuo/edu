import DriveInputCC from '@app/(apps)/tbm/(pages)/driveInput/DriveInputCC'
import {getMidnight} from '@class/Days/date-utils/calculations'
import {C_Stack, FitMargin, Padding} from '@components/styles/common-components/common-components'
import NewDateSwitcher from '@components/utils/dates/DateSwitcher/NewDateSwitcher'
import Redirector from '@components/utils/Redirector'
import {dateSwitcherTemplate} from '@lib/methods/redirect-method'
import prisma from '@lib/prisma'
import {initServerComopnent} from 'src/non-common/serverSideFunction'

export default async function Page(props) {
  const query = await props.searchParams

  const params = await props.params
  const {session, scopes} = await initServerComopnent({query})

  const {redirectPath, whereQuery} = await dateSwitcherTemplate({
    query,
    defaultWhere: {from: getMidnight()},
  })
  if (redirectPath) return <Redirector {...{redirectPath}} />

  const {userId} = scopes.getTbmScopes()
  const user = await prisma.user.findUnique({where: {id: userId}})

  const driveScheduleList: any = await getData({user, whereQuery})

  return (
    <Padding>
      <FitMargin>
        <C_Stack className={` h-full justify-between gap-6`}>
          <NewDateSwitcher {...{}} />

          {/* 入力欄 */}
          <DriveInputCC {...{driveScheduleList}} />
        </C_Stack>
      </FitMargin>
    </Padding>
  )
}

const getData = async ({user, whereQuery}) => {
  const driveScheduleList = await prisma.tbmDriveSchedule.findMany({
    where: {userId: user.id, date: {equals: whereQuery.gte}},
    orderBy: {sortOrder: `asc`},
    include: {
      TbmBase: {},
      TbmRouteGroup: {},
      TbmVehicle: {
        include: {
          OdometerInput: {
            where: {date: {lte: whereQuery.gte}},
            orderBy: {date: `desc`},
            take: 2,
          },
        },
      },
    },
  })
  return driveScheduleList
}
