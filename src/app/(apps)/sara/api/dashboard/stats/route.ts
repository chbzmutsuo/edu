import {NextRequest, NextResponse} from 'next/server'
import {PrismaClient} from '@prisma/client'
import {requireAnyAuth} from '../../middleware/auth'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAnyAuth(request)
    if (!auth) {
      return NextResponse.json({error: '認証が必要です'}, {status: 401})
    }

    const {searchParams} = new URL(request.url)
    const childId = searchParams.get('childId')

    // 今日の日付範囲
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // 今週の日付範囲
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)

    // 今月の日付範囲
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1)

    // フィルター条件
    const baseWhere = {
      evaluationItem: {
        saraFamilyId: auth.saraFamilyId,
      },
    }

    // 子どもの場合は自分のデータのみ、親の場合は指定された子どものデータ
    if (auth.type === 'child') {
      Object.assign(baseWhere, {childId: auth.childId})
    } else if (childId) {
      Object.assign(baseWhere, {childId})
    }

    // 並列でデータを取得
    const [todayRequests, weekRequests, monthRequests, pendingRequests, approvedRequests, totalRequests, children] =
      await Promise.all([
        // 今日の申請
        prisma.evaluationRequest.findMany({
          where: {
            ...baseWhere,
            createdAt: {gte: today, lt: tomorrow},
          },
          include: {
            evaluationItem: true,
            evaluationScore: true,
            child: {select: {id: true, name: true, avatar: true}},
          },
        }),

        // 今週の申請
        prisma.evaluationRequest.findMany({
          where: {
            ...baseWhere,
            createdAt: {gte: weekStart, lt: weekEnd},
          },
          include: {
            evaluationScore: true,
          },
        }),

        // 今月の申請
        prisma.evaluationRequest.findMany({
          where: {
            ...baseWhere,
            createdAt: {gte: monthStart, lt: monthEnd},
          },
          include: {
            evaluationScore: true,
          },
        }),

        // 承認待ち申請
        prisma.evaluationRequest.findMany({
          where: {
            ...baseWhere,
            status: 'pending',
          },
          include: {
            evaluationItem: true,
            evaluationScore: true,
            child: {select: {id: true, name: true, avatar: true}},
          },
          orderBy: {createdAt: 'desc'},
        }),

        // 承認済み（未開封）申請
        prisma.evaluationRequest.findMany({
          where: {
            ...baseWhere,
            status: 'approved',
            openedByChild: false,
          },
          include: {
            evaluationItem: true,
            evaluationScore: true,
          },
          orderBy: {createdAt: 'desc'},
        }),

        // 総申請数
        prisma.evaluationRequest.count({
          where: baseWhere,
        }),

        // 家族の子どもリスト（親の場合のみ）
        auth.type === 'parent'
          ? prisma.child.findMany({
              where: {familyId: Number(auth.saraFamilyId)},
              select: {id: true, name: true, avatar: true},
            })
          : [],
      ])

    // 統計を計算
    const stats = {
      today: {
        total: todayRequests.length,
        approved: todayRequests.filter(r => r.status === 'approved').length,
        pending: todayRequests.filter(r => r.status === 'pending').length,
        rejected: todayRequests.filter(r => r.status === 'rejected').length,
        requests: todayRequests,
      },
      week: {
        total: weekRequests.length,
        approved: weekRequests.filter(r => r.status === 'approved').length,
        totalScore: weekRequests.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.evaluationScore.score, 0),
      },
      month: {
        total: monthRequests.length,
        approved: monthRequests.filter(r => r.status === 'approved').length,
        totalScore: monthRequests.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.evaluationScore.score, 0),
      },
      pending: {
        count: pendingRequests.length,
        requests: pendingRequests,
      },
      unopened: {
        count: approvedRequests.length,
        requests: approvedRequests,
      },
      total: totalRequests,
      children: children,
    }

    return NextResponse.json({stats})
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    return NextResponse.json({error: '統計データの取得に失敗しました'}, {status: 500})
  } finally {
    await prisma.$disconnect()
  }
}
