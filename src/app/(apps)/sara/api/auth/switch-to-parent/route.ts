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
    const parent = await prisma.saraParent.findFirst({
      where: {
        familyId: session.user.familyId,
      },
      include: {
        family: {
          include: {
            children: true,
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
        familyName: parent.family.name,
        children: parent.family.children.map(child => ({
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
