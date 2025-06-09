import {NextRequest, NextResponse} from 'next/server'
import {PrismaClient} from '@prisma/client'
import {requireChildAuth} from '../../../middleware/auth'

const prisma = new PrismaClient()

export async function PUT(request: NextRequest, {params}: {params: {id: string}}) {
  try {
    const auth = requireChildAuth(request)
    if (!auth) {
      return NextResponse.json({error: '子どもの認証が必要です'}, {status: 401})
    }

    const requestId = params.id

    // 申請の存在確認と権限チェック
    const existingRequest = await prisma.saraEvaluationRequest.findFirst({
      where: {
        id: requestId,
        childId: auth.childId,
        status: 'approved',
      },
    })

    if (!existingRequest) {
      return NextResponse.json({error: '承認された申請が見つかりません'}, {status: 404})
    }

    // 開封状態を更新
    const updatedRequest = await prisma.saraEvaluationRequest.update({
      where: {id: requestId},
      data: {
        openedByChild: true,
      },
      include: {
        evaluationItem: true,
        evaluationScore: true,
      },
    })

    return NextResponse.json({
      message: '演出を確認しました',
      request: updatedRequest,
    })
  } catch (error) {
    console.error('Open evaluation request error:', error)
    return NextResponse.json({error: '開封状態の更新に失敗しました'}, {status: 500})
  } finally {
    await prisma.$disconnect()
  }
}
