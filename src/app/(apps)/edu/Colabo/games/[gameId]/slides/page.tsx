import {initServerComopnent} from 'src/non-common/serverSideFunction'
import prisma from 'src/lib/prisma'
import Redirector from '@cm/components/utils/Redirector'
import SlideManagementPage from './SlideManagementPage'

const Page = async props => {
  const params = await props.params
  const query = await props.searchParams
  const {session} = await initServerComopnent({query})

  if (!session?.id) {
    return <Redirector redirectPath={`/login`} />
  }

  const gameId = Number(params.gameId)

  // Gameの詳細を取得
  const game = await prisma.game.findUnique({
    where: {id: gameId},
    include: {
      School: true,
      Teacher: true,
      SubjectNameMaster: true,
      GameStudent: {
        include: {
          Student: {
            select: {
              id: true,
              name: true,
              kana: true,
              attendanceNumber: true,
            },
          },
        },
        orderBy: {
          sortOrder: 'asc',
        },
      },
      Slide: {
        where: {active: true},
        orderBy: {sortOrder: 'asc'},
      },
    },
  })

  if (!game) {
    return <div className="p-6 text-center">Gameが見つかりません</div>
  }

  // 教師本人かチェック
  if (game.teacherId !== session.id) {
    return <div className="p-6 text-center text-red-600">このGameにアクセスする権限がありません</div>
  }

  return <SlideManagementPage game={JSON.parse(JSON.stringify(game))} />
}

export default Page
