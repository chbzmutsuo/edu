//classを切り替える

import {initServerComopnent} from 'src/non-common/serverSideFunction'

import prisma from '@cm/lib/prisma'

import {QueryBuilder} from '@app/(apps)/Grouping/class/QueryBuilder'
import GameList from '@app/(apps)/Grouping/parts/GameList'
import Redirector from '@components/utils/Redirector'

const Page = async props => {
  const query = await props.searchParams
  const {session, scopes} = await initServerComopnent({query})
  if (!session?.id) {
    return <Redirector redirectPath={`/login`} />
  }
  const gameInclude = QueryBuilder.getInclude({session, query})?.['game']?.include
  const myGame = await prisma.game.findMany({
    where: {teacherId: session.id},
    orderBy: [{date: `desc`}],
    include: gameInclude as any,
  })

  return (
    <div>
      <GameList {...{myGame}} />
    </div>
  )
}

export default Page
