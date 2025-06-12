import {NextRequest, NextResponse} from 'next/server'
import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const {searchParams} = new URL(request.url)
    const saraFamilyId = searchParams.get('saraFamilyId')

    if (!saraFamilyId) {
      return NextResponse.json({error: '家族IDが必要です'}, {status: 400})
    }

    // 家族の存在確認
    const family = await prisma.family.findUnique({
      where: {id: Number(saraFamilyId)},
      include: {
        Child: {
          select: {
            id: true,
            name: true,
            avatar: true,
            password: true, // パスワードが設定されているかの確認用
          },
        },
      },
    })

    if (!family) {
      return NextResponse.json({error: '家族が見つかりません'}, {status: 404})
    }

    // パスワードの有無のみを返す（実際のパスワードは返さない）
    const children = family.Child.map(child => ({
      id: child.id,
      name: child.name,
      avatar: child.avatar,
      hasPassword: !!child.password,
    }))

    return NextResponse.json({
      saraFamilyId: family.id,
      familyName: family.name,
      children,
    })
  } catch (error) {
    console.error('Get children error:', error)
    return NextResponse.json({error: '子どもリストの取得に失敗しました'}, {status: 500})
  } finally {
    await prisma.$disconnect()
  }
}
