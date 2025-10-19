import {initServerComopnent} from 'src/non-common/serverSideFunction'
import prisma from 'src/lib/prisma'
import Redirector from '@cm/components/utils/Redirector'
import ColaboGamePlayPage from './ColaboGamePlayPage'

const Page = async props => {
  const params = await props.params
  const query = await props.searchParams
  const {session} = await initServerComopnent({query})

  const gameId = Number(params.gameId)
  const role = (query.as as string) || 'teacher'
  const studentId = query.sid ? Number(query.sid) : null

  // ログインチェック
  if (!session?.id && role === 'teacher') {
    return <Redirector redirectPath={`/login`} />
  }

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
              gender: true,
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
      Group: {
        where: {active: true},
        include: {
          Squad: {
            include: {
              Student: true,
            },
          },
        },
      },
    },
  })

  if (!game) {
    return <div className="p-6 text-center">Gameが見つかりません</div>
  }

  // 教師の場合、本人確認
  if (role === 'teacher' && game.teacherId !== session.id) {
    return <div className="p-6 text-center text-red-600">このGameにアクセスする権限がありません</div>
  }

  // 生徒の場合、studentIdが必要
  if (role === 'student' && !studentId) {
    return <div className="p-6 text-center text-red-600">生徒IDが指定されていません</div>
  }

  // 生徒の情報を取得
  let student: any | null = null
  if (role === 'student' && studentId) {
    const gameStudent = game.GameStudent.find(gs => gs.Student.id === studentId)
    if (gameStudent) {
      student = gameStudent.Student
    } else {
      return <div className="p-6 text-center text-red-600">このGameに参加していない生徒です</div>
    }
  }

  return (
    <ColaboGamePlayPage
      game={JSON.parse(JSON.stringify(game))}
      role={role as 'teacher' | 'student'}
      userId={role === 'teacher' ? session.id : studentId!}
      student={student ? JSON.parse(JSON.stringify(student)) : null}
    />
  )
}

export default Page
