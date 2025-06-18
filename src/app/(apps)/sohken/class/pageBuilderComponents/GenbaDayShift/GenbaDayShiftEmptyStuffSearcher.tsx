import {toUtc} from '@class/Days/date-utils/calculations'

import NewDateSwitcher from '@components/utils/dates/DateSwitcher/NewDateSwitcher'
import useDoStandardPrisma from '@hooks/useDoStandardPrisma'

import {DetailPagePropType} from '@cm/types/types'
import useWindowSize from '@hooks/useWindowSize'

const GenbaDayShiftEmptyStuffSearcher = (props: DetailPagePropType) => {
  const {query} = props.useGlobalProps
  const {PC} = useWindowSize()

  if (!PC) return null

  return (
    <div>
      {PC && (
        <NewDateSwitcher {...{selectPeriod: true, additionalCols: [{id: `genbaId`, label: `現場`, forSelect: {}, form: {}}]}} />
      )}
    </div>
  )
}

export default GenbaDayShiftEmptyStuffSearcher

const useAbailableUsers = ({query}) => {
  const isReady = query?.from && query?.to
  const from = isReady ? toUtc(query.from).toISOString() : undefined
  const to = isReady ? toUtc(query.to).toISOString() : undefined

  const dateWhere = {
    gte: from,
    lte: to,
  }

  const {data: genbaDay} = useDoStandardPrisma(`genbaDay`, `findMany`, {
    where: {
      date: dateWhere,
    },
    include: {
      GenbaDayShift: {},
    },
  })

  const {data: Users} = useDoStandardPrisma(`user`, `findMany`, {
    where: {OR: [{app: `sohken`}, {apps: {has: `sohken`}}]},
  })

  const availableUsers = !isReady
    ? []
    : (Users?.filter(user => {
        const hasShift = genbaDay?.some(day => day.GenbaDayShift.some(shift => shift.userId === user.id))
        return !hasShift
      }) ?? [])

  return {
    availableUsers,
  }
}
