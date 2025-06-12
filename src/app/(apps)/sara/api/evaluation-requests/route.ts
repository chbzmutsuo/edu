import {NextRequest, NextResponse} from 'next/server'
import {PrismaClient} from '@prisma/client'
import {requireParentAuth, requireChildAuth, requireAnyAuth} from '../middleware/auth'

const prisma = new PrismaClient()

// 評価申請一覧取得
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAnyAuth(request)
    if (!auth) {
      return NextResponse.json({error: '認証が必要です'}, {status: 401})
    }

    const {searchParams} = new URL(request.url)
    const status = searchParams.get('status')
    const childId = searchParams.get('childId')
    const date = searchParams.get('date')

    // フィルター条件を構築
    const where: any = {
      evaluationItem: {
        saraFamilyId: auth.saraFamilyId,
      },
    }

    // 子どもの場合は自分の申請のみ
    if (auth.type === 'child') {
      where.childId = auth.childId
    }

    // 特定の子どもの申請を取得（親用）
    if (childId && auth.type === 'parent') {
      where.childId = childId
    }

    // ステータスフィルター
    if (status) {
      where.status = status
    }

    // 日付フィルター
    if (date) {
      const targetDate = new Date(date)
      const nextDate = new Date(targetDate)
      nextDate.setDate(nextDate.getDate() + 1)

      where.createdAt = {
        gte: targetDate,
        lt: nextDate,
      }
    }

    const requests = await prisma.saraEvaluationRequest.findMany({
      where,
      include: {
        evaluationItem: {
          include: {
            scores: true,
          },
        },
        evaluationScore: true,
        child: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {createdAt: 'desc'},
    })

    return NextResponse.json({requests})
  } catch (error) {
    console.error('Get evaluation requests error:', error)
    return NextResponse.json({error: '評価申請の取得に失敗しました'}, {status: 500})
  } finally {
    await prisma.$disconnect()
  }
}

// 評価申請作成（子ども用）
export async function POST(request: NextRequest) {
  try {
    const auth = await requireChildAuth(request)
    if (!auth) {
      return NextResponse.json({error: '子どもの認証が必要です'}, {status: 401})
    }

    const body = await request.json()
    const {evaluationItemId, evaluationScoreId} = body

    // バリデーション
    if (!evaluationItemId || !evaluationScoreId) {
      return NextResponse.json({error: '評価項目とスコアが必要です'}, {status: 400})
    }

    // 評価項目の存在確認
    const evaluationItem = await prisma.saraEvaluationItem.findFirst({
      where: {
        id: evaluationItemId,
        saraFamilyId: auth.saraFamilyId,
      },
      include: {
        scores: true,
      },
    })

    if (!evaluationItem) {
      return NextResponse.json({error: '評価項目が見つかりません'}, {status: 404})
    }

    // スコアの存在確認
    const evaluationScore = evaluationItem.scores.find(score => score.id === evaluationScoreId)

    if (!evaluationScore) {
      return NextResponse.json({error: '評価スコアが見つかりません'}, {status: 404})
    }

    // 今日の同じ項目の申請があるかチェック
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const existingRequest = await prisma.saraEvaluationRequest.findFirst({
      where: {
        childId: auth.childId!,
        evaluationItemId,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    })

    if (existingRequest) {
      return NextResponse.json({error: '今日はすでにこの項目で申請済みです'}, {status: 409})
    }

    // 申請を作成
    const newRequest = await prisma.saraEvaluationRequest.create({
      data: {
        childId: auth.childId!,
        evaluationItemId,
        evaluationScoreId,
        status: 'pending',
      },
      include: {
        evaluationItem: true,
        evaluationScore: true,
        child: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: '評価申請を送信しました',
      request: newRequest,
    })
  } catch (error) {
    console.error('Create evaluation request error:', error)
    return NextResponse.json({error: '評価申請の作成に失敗しました'}, {status: 500})
  } finally {
    await prisma.$disconnect()
  }
}

// 評価申請更新（親用：承認・却下）
export async function PUT(request: NextRequest) {
  try {
    const auth = await requireParentAuth(request)
    if (!auth) {
      return NextResponse.json({error: '親の認証が必要です'}, {status: 401})
    }

    const body = await request.json()
    const {id, status, comment} = body

    // バリデーション
    if (!id || !status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({error: '無効なパラメータです'}, {status: 400})
    }

    // 申請の存在確認と権限チェック
    const existingRequest = await prisma.saraEvaluationRequest.findFirst({
      where: {
        id,
        evaluationItem: {
          saraFamilyId: auth.saraFamilyId,
        },
      },
    })

    if (!existingRequest) {
      return NextResponse.json({error: '評価申請が見つかりません'}, {status: 404})
    }

    if (existingRequest.status !== 'pending') {
      return NextResponse.json({error: 'この申請は既に処理済みです'}, {status: 409})
    }

    // 申請を更新
    const updatedRequest = await prisma.saraEvaluationRequest.update({
      where: {id},
      data: {
        status,
        comment: comment || null,
        approvedById: status === 'approved' ? auth.parentId : null,
      },
      include: {
        evaluationItem: true,
        evaluationScore: true,
        child: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: status === 'approved' ? '申請を承認しました' : '申請を却下しました',
      request: updatedRequest,
    })
  } catch (error) {
    console.error('Update evaluation request error:', error)
    return NextResponse.json({error: '評価申請の更新に失敗しました'}, {status: 500})
  } finally {
    await prisma.$disconnect()
  }
}
