import {NextRequest, NextResponse} from 'next/server'
import {PrismaClient} from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {familyName, parent, children} = body

    // バリデーション
    if (!familyName || !parent?.name || !parent?.email || !parent?.password) {
      return NextResponse.json({error: '必須項目が不足しています'}, {status: 400})
    }

    if (!children || children.length === 0) {
      return NextResponse.json({error: '子どもの情報が必要です'}, {status: 400})
    }

    // メールアドレスの重複チェック
    const existingParent = await prisma.saraParent.findUnique({
      where: {email: parent.email},
    })

    if (existingParent) {
      return NextResponse.json({error: 'このメールアドレスは既に使用されています'}, {status: 409})
    }

    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(parent.password, 10)

    // トランザクションで一括作成
    const result = await prisma.$transaction(async tx => {
      // 家族を作成
      const family = await tx.saraFamily.create({
        data: {
          name: familyName,
        },
      })

      // 親を作成
      const parentRecord = await tx.saraParent.create({
        data: {
          name: parent.name,
          email: parent.email,
          password: hashedPassword,
          familyId: family.id,
        },
      })

      // 子どもたちを作成
      const childrenRecords = await Promise.all(
        children.map(async (child: any) =>
          tx.saraChild.create({
            data: {
              name: child.name,
              avatar: child.avatar,
              password: child.password ? await bcrypt.hash(child.password, 10) : null,
              familyId: family.id,
            },
          })
        )
      )

      return {
        family,
        parent: parentRecord,
        children: childrenRecords,
      }
    })

    return NextResponse.json({
      message: '家族の登録が完了しました',
      family: {
        id: result.family.id,
        name: result.family.name,
        parent: {
          id: result.parent.id,
          name: result.parent.name,
          email: result.parent.email,
        },
        children: result.children.map(child => ({
          id: child.id,
          name: child.name,
          avatar: child.avatar,
        })),
      },
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({error: '登録に失敗しました'}, {status: 500})
  } finally {
    await prisma.$disconnect()
  }
}
