import {initServerComopnent} from 'src/non-common/serverSideFunction'
import prisma from 'src/lib/prisma'
import Redirector from '@cm/components/utils/Redirector'
import SlideEditPage from './SlideEditPage'

const Page = async props => {
  const params = await props.params
  const query = await props.searchParams
  const {session} = await initServerComopnent({query})

  if (!session?.id) {
    return <Redirector redirectPath={`/login`} />
  }

  const gameId = Number(params.gameId)
  const slideId = Number(params.slideId)

  // Gameの詳細を取得
  const game = await prisma.game.findUnique({
    where: {id: gameId},
    include: {
      Teacher: true,
    },
  })

  if (!game) {
    return <div className="p-6 text-center">Gameが見つかりません</div>
  }

  // 教師本人かチェック
  if (game.teacherId !== session.id) {
    return <div className="p-6 text-center text-red-600">このGameにアクセスする権限がありません</div>
  }

  // スライドを取得
  const slide = await prisma.slide.findUnique({
    where: {id: slideId},
  })

  if (!slide) {
    return <div className="p-6 text-center">スライドが見つかりません</div>
  }

  if (slide.gameId !== gameId) {
    return <div className="p-6 text-center text-red-600">このスライドはこのGameに属していません</div>
  }

  return <SlideEditPage game={JSON.parse(JSON.stringify(game))} slide={JSON.parse(JSON.stringify(slide))} />
}

export default Page
