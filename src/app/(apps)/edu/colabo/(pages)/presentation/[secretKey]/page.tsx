import {initServerComopnent} from 'src/non-common/serverSideFunction'
import prisma from 'src/lib/prisma'
import {PresentationClient} from './PresentationClient'

const Page = async props => {
  const {secretKey} = await props.params
  const query = await props.searchParams
  const {session} = await initServerComopnent({query})

  const userRole = query.as || 'student' // 'teacher' or 'student'

  // Get game with slides and student data
  const game = await prisma.game.findUnique({
    where: {secretKey},
    include: {
      School: true,
      Teacher: true,
      SubjectNameMaster: true,
      Slide: {
        orderBy: {sortOrder: 'asc'},
        include: {
          SlideBlock: {
            orderBy: {sortOrder: 'asc'},
          },
          SlideResponse: {
            include: {
              Student: true,
            },
          },
        },
      },
      GameStudent: {
        include: {
          Student: {
            include: {
              Classroom: true,
            },
          },
        },
      },
    },
  })

  if (!game) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-800">授業が見つかりません</h2>
          <p className="text-red-600">指定された授業が存在しないか、まだ開始されていません。</p>
        </div>
      </div>
    )
  }

  // For teacher access, verify they own this game
  if (userRole === 'teacher' && session?.id !== game.teacherId) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-800">アクセス権限がありません</h2>
          <p className="text-red-600">この授業の担当教師ではありません。</p>
        </div>
      </div>
    )
  }

  // For student access, check if they're registered for this game
  let currentStudent: any = null
  if (userRole === 'student' && session?.id) {
    const gameStudent = await prisma.gameStudent.findFirst({
      where: {
        gameId: game.id,
        studentId: session.id,
      },
      include: {
        Student: true,
      },
    })
    currentStudent = gameStudent?.Student
  }

  return (
    <div className="min-h-screen">
      <PresentationClient game={game} userRole={userRole} currentStudent={currentStudent} session={session} />
    </div>
  )
}

export default Page
