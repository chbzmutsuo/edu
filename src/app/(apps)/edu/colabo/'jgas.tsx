import {initServerComopnent} from 'src/non-common/serverSideFunction'
import prisma from '@cm/lib/prisma'
import Redirector from '@components/utils/Redirector'

const Page = async props => {
  const query = await props.searchParams
  const {session} = await initServerComopnent({query})
  
  if (!session?.id) {
    return <Redirector redirectPath={`/login`} />
  }

  // Get teacher's games for colabo
  const myGames = await prisma.game.findMany({
    where: {teacherId: session.id},
    orderBy: [{date: 'desc'}],
    include: {
      School: true,
      Teacher: true,
      GameStudent: {
        include: {
          Student: true
        }
      }
    }
  })

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Colabo - インタラクティブスライド授業</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">新しい授業を作成</h2>
          <p className="text-gray-600 mb-4">スライドを使ったインタラクティブな授業を開始しましょう</p>
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            授業を作成
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">過去の授業</h2>
          <p className="text-gray-600 mb-4">これまでの授業データを確認できます</p>
          <div className="space-y-2">
            {myGames.length > 0 ? (
              myGames.slice(0, 3).map(game => (
                <div key={game.id} className="border rounded p-2">
                  <div className="font-medium">{game.name}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(game.date).toLocaleDateString('ja-JP')}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">まだ授業がありません</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page