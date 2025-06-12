import {NextRequest, NextResponse} from 'next/server'
import {PrismaClient} from '@prisma/client'
import {requireParentAuth, requireAnyAuth} from '../middleware/auth'

const prisma = new PrismaClient()

// 評価項目一覧取得
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAnyAuth(request)
    if (!auth) {
      return NextResponse.json({error: '認証が必要です'}, {status: 401})
    }

    const items = await prisma.saraEvaluationItem.findMany({
      where: {saraFamilyId: auth.saraFamilyId},
      include: {
        scores: {
          orderBy: {score: 'asc'},
        },
      },
      orderBy: {order: 'asc'},
    })

    return NextResponse.json({items})
  } catch (error) {
    console.error('Get evaluation items error:', error)
    return NextResponse.json({error: '評価項目の取得に失敗しました'}, {status: 500})
  } finally {
    await prisma.$disconnect()
  }
}

// 評価項目作成
export async function POST(request: NextRequest) {
  try {
    const auth = await requireParentAuth(request)
    if (!auth) {
      return NextResponse.json({error: '親の認証が必要です'}, {status: 401})
    }

    const body = await request.json()
    const {title, description, scores} = body

    // バリデーション
    if (!title || !scores || scores.length === 0) {
      return NextResponse.json({error: 'タイトルとスコアが必要です'}, {status: 400})
    }

    // 最大のorderを取得
    const maxOrderItem = await prisma.saraEvaluationItem.findFirst({
      where: {saraFamilyId: auth.saraFamilyId},
      orderBy: {order: 'desc'},
    })

    const newOrder = (maxOrderItem?.order || 0) + 1

    // トランザクションで作成
    const result = await prisma.$transaction(async tx => {
      const item = await tx.saraEvaluationItem.create({
        data: {
          title,
          description: description || '',
          order: newOrder,
          saraFamilyId: auth.saraFamilyId,
        },
      })

      const scoreRecords = await Promise.all(
        scores.map((scoreData: any) =>
          tx.saraEvaluationScore.create({
            data: {
              score: scoreData.score,
              title: scoreData.title,
              description: scoreData.description || '',
              iconUrl: scoreData.iconUrl || '',
              animationLevel: scoreData.animationLevel || 'light',
              evaluationItemId: item.id,
            },
          })
        )
      )

      return {
        ...item,
        scores: scoreRecords,
      }
    })

    return NextResponse.json({
      message: '評価項目を作成しました',
      item: result,
    })
  } catch (error) {
    console.error('Create evaluation item error:', error)
    return NextResponse.json({error: '評価項目の作成に失敗しました'}, {status: 500})
  } finally {
    await prisma.$disconnect()
  }
}

// 評価項目更新
export async function PUT(request: NextRequest) {
  try {
    const auth = await requireParentAuth(request)
    if (!auth) {
      return NextResponse.json({error: '親の認証が必要です'}, {status: 401})
    }

    const body = await request.json()
    const {id, title, description, scores, order} = body

    // バリデーション
    if (!id || !title) {
      return NextResponse.json({error: 'IDとタイトルが必要です'}, {status: 400})
    }

    // 項目の存在確認と権限チェック
    const existingItem = await prisma.saraEvaluationItem.findFirst({
      where: {
        id,
        saraFamilyId: auth.saraFamilyId,
      },
    })

    if (!existingItem) {
      return NextResponse.json({error: '評価項目が見つかりません'}, {status: 404})
    }

    // トランザクションで更新
    const result = await prisma.$transaction(async tx => {
      // 項目を更新
      const item = await tx.saraEvaluationItem.update({
        where: {id},
        data: {
          title,
          description: description || '',
          order: order !== undefined ? order : existingItem.order,
        },
      })

      // 既存のスコアを削除
      await tx.saraEvaluationScore.deleteMany({
        where: {evaluationItemId: id},
      })

      // 新しいスコアを作成
      const scoreRecords = scores
        ? await Promise.all(
            scores.map((scoreData: any) =>
              tx.saraEvaluationScore.create({
                data: {
                  score: scoreData.score,
                  title: scoreData.title,
                  description: scoreData.description || '',
                  iconUrl: scoreData.iconUrl || '',
                  animationLevel: scoreData.animationLevel || 'light',
                  evaluationItemId: item.id,
                },
              })
            )
          )
        : []

      return {
        ...item,
        scores: scoreRecords,
      }
    })

    return NextResponse.json({
      message: '評価項目を更新しました',
      item: result,
    })
  } catch (error) {
    console.error('Update evaluation item error:', error)
    return NextResponse.json({error: '評価項目の更新に失敗しました'}, {status: 500})
  } finally {
    await prisma.$disconnect()
  }
}

// 評価項目削除
export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireParentAuth(request)
    if (!auth) {
      return NextResponse.json({error: '親の認証が必要です'}, {status: 401})
    }

    const {searchParams} = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({error: 'IDが必要です'}, {status: 400})
    }

    // 項目の存在確認と権限チェック
    const existingItem = await prisma.saraEvaluationItem.findFirst({
      where: {
        id,
        saraFamilyId: auth.saraFamilyId,
      },
    })

    if (!existingItem) {
      return NextResponse.json({error: '評価項目が見つかりません'}, {status: 404})
    }

    // トランザクションで削除
    await prisma.$transaction(async tx => {
      // 関連する評価申請を削除
      await tx.saraEvaluationRequest.deleteMany({
        where: {evaluationItemId: id},
      })

      // スコアを削除
      await tx.saraEvaluationScore.deleteMany({
        where: {evaluationItemId: id},
      })

      // 項目を削除
      await tx.saraEvaluationItem.delete({
        where: {id},
      })
    })

    return NextResponse.json({
      message: '評価項目を削除しました',
    })
  } catch (error) {
    console.error('Delete evaluation item error:', error)
    return NextResponse.json({error: '評価項目の削除に失敗しました'}, {status: 500})
  } finally {
    await prisma.$disconnect()
  }
}
