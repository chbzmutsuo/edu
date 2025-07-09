import {initServerComopnent} from 'src/non-common/serverSideFunction'
import prisma from '@cm/lib/prisma'
import Redirector from '@cm/components/utils/Redirector'
import {SlideEditorClient} from './SlideEditorClient'

const Page = async props => {
  const {gameId} = await props.params
  const query = await props.searchParams
  const {session} = await initServerComopnent({query})

  if (!session?.id) {
    return <Redirector redirectPath={'/login'} />
  }

  // Get game with slides
  const game = await prisma.game.findUnique({
    where: {
      id: parseInt(gameId),
      teacherId: session.id, // Ensure teacher owns this game
    },
    include: {
      Slide: {
        orderBy: {sortOrder: 'asc'},
        include: {
          SlideBlock: {
            orderBy: {sortOrder: 'asc'},
          },
        },
      },
      School: true,
      SubjectNameMaster: true,
    },
  })

  if (!game) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-800">授業が見つかりません</h2>
          <p className="text-red-600">指定された授業が存在しないか、アクセス権限がありません。</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <SlideEditorClient game={game} />
    </div>
  )
}

export default Page
