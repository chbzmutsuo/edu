import {NextRequest, NextResponse} from 'next/server'
import {getServerSession} from 'next-auth'
import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({error: '認証が必要です'}, {status: 401})
    }

    // 親の情報を取得
    const parent = await prisma.parent.findFirst({
      where: {
        familyId: session.user.saraFamilyId,
      },
      include: {
        Family: {
          include: {
            Child: true,
          },
        },
      },
    })

    if (!parent) {
      return NextResponse.json({error: '親が見つかりません'}, {status: 404})
    }

    // 親の情報を返す（フロントエンドでセッション更新に使用）
    return NextResponse.json({
      message: '親モードに切り替えました',
      parent: {
        id: parent.id,
        name: parent.name,
        email: parent.email,
        type: 'parent',
        familyId: parent.familyId,
        familyName: parent.Family.name,
        children: parent.Family.Child.map(child => ({
          id: child.id,
          name: child.name,
          avatar: child.avatar,
        })),
      },
    })
  } catch (error) {
    console.error('Switch to parent error:', error)
    return NextResponse.json({error: '切り替えに失敗しました'}, {status: 500})
  } finally {
    await prisma.$disconnect()
  }
}
