import {NextRequest, NextResponse} from 'next/server'
import {getServerSession} from 'next-auth'
import {PrismaClient} from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user || session.user.type !== 'parent') {
      return NextResponse.json({error: '親の認証が必要です'}, {status: 401})
    }

    const body = await request.json()
    const {childId, password} = body

    if (!childId) {
      return NextResponse.json({error: '子どもIDが必要です'}, {status: 400})
    }

    // 子どもの存在確認と家族の確認
    const child = await prisma.child.findFirst({
      where: {
        id: childId,
        familyId: session.user.saraFamilyId,
      },
      include: {
        Family: true,
      },
    })

    if (!child) {
      return NextResponse.json({error: '子どもが見つかりません'}, {status: 404})
    }

    // パスワードが設定されている場合は確認
    if (child.password) {
      if (!password) {
        return NextResponse.json({error: 'パスワードが必要です'}, {status: 400})
      }

      const isValidPassword = await bcrypt.compare(password, child.password)
      if (!isValidPassword) {
        return NextResponse.json({error: 'パスワードが間違っています'}, {status: 401})
      }
    }

    // 子どもの情報を返す（フロントエンドでセッション更新に使用）
    return NextResponse.json({
      message: '子どもモードに切り替えました',
      child: {
        id: child.id,
        name: child.name,
        type: 'child',
        saraFamilyId: child.familyId,
        familyName: child.Family.name,
        avatar: child.avatar,
      },
    })
  } catch (error) {
    console.error('Switch to child error:', error)
    return NextResponse.json({error: '切り替えに失敗しました'}, {status: 500})
  } finally {
    await prisma.$disconnect()
  }
}
