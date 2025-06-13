'use server'

import {revalidatePath} from 'next/cache'
import {prisma} from '../../../../lib/prisma'
// TODO: 正しいauthOptionsのパスに修正してください
// import {authOptions} from '../../../../api/auth/[...nextauth]/constants/authOptions'
import bcrypt from 'bcrypt'
import {initServerComopnent} from 'src/non-common/serverSideFunction'

// おうちスタンプラリーアプリ - Server Actions

export interface ActionResponse<T = any> {
  success: boolean
  message?: string
  error?: string
  data?: T
}

// 認証関連 Server Actions

// 家族登録
export async function auth__register(data: {
  familyName: string
  parent: {name: string; email: string; password: string}
  children: {name: string; avatar: string; password?: string}[]
}): Promise<ActionResponse> {
  try {
    // パスワードハッシュ化
    const hashedParentPassword = await bcrypt.hash(data.parent.password, 12)

    const result = await prisma.$transaction(async tx => {
      // 1. 家族を作成
      const family = await tx.family.create({
        data: {
          name: data.familyName,
        },
      })

      // 2. 親ユーザーを作成
      const parentUser = await tx.user.create({
        data: {
          name: data.parent.name,
          email: data.parent.email,
          password: hashedParentPassword,
          type: 'parent',
          familyId: family.id,
        },
      })

      // 3. 子どもユーザーを作成
      const children = await Promise.all(
        data.children.map(async child => {
          const hashedChildPassword = child.password ? await bcrypt.hash(child.password, 12) : null

          return tx.user.create({
            data: {
              name: child.name,
              password: hashedChildPassword,
              type: 'child',
              familyId: family.id,
              avatar: child.avatar,
            },
          })
        })
      )

      return {family, parent: parentUser, children}
    })

    revalidatePath('/sara/parent/dashboard')

    return {
      success: true,
      message: '家族登録が完了しました',
      data: result,
    }
  } catch (error: any) {
    console.error('Registration error:', error)
    return {
      success: false,
      error: error.message || '家族登録に失敗しました',
    }
  }
}

// 子どもリスト取得
export async function auth__getChildren(familyId: number): Promise<ActionResponse> {
  try {
    const children = await prisma.user.findMany({
      where: {
        familyId,
        type: 'child',
      },
      select: {
        id: true,
        name: true,
        avatar: true,
      },
    })

    return {
      success: true,
      data: children,
    }
  } catch (error: any) {
    console.error('Get children error:', error)
    return {
      success: false,
      error: error.message || '子どもリストの取得に失敗しました',
    }
  }
}

// 習慣管理関連 Server Actions

// 習慣一覧取得
export async function activity__getAll(): Promise<ActionResponse> {
  try {
    const {session} = await initServerComopnent({query: {}})
    if (!session?.familyId) {
      return {success: false, error: '認証が必要です'}
    }

    const activities = await prisma.activity.findMany({
      where: {
        familyId: Number(session.familyId),
        active: true,
      },
      include: {
        ActivityScore: {
          orderBy: {score: 'asc'},
        },
      },
      orderBy: {order: 'asc'},
    })

    return {
      success: true,
      data: activities,
    }
  } catch (error: any) {
    console.error('Get activities error:', error)
    return {
      success: false,
      error: error.message || '習慣一覧の取得に失敗しました',
    }
  }
}

// 習慣作成
export async function activity__create(data: {
  title: string
  description?: string
  scores: {
    score: number
    title: string
    description?: string
    iconUrl?: string
    animationLevel?: string
  }[]
}): Promise<ActionResponse> {
  try {
    const {session} = await initServerComopnent({query: {}})
    if (!session?.familyId || session.type !== 'parent') {
      return {success: false, error: '親の認証が必要です'}
    }

    const result = await prisma.activity.create({
      data: {
        title: data.title,
        description: data.description,
        familyId: Number(session.familyId),
        ActivityScore: {
          create: data.scores.map(score => ({
            score: score.score,
            title: score.title,
            description: score.description,
            iconUrl: score.iconUrl,
            animationLevel: score.animationLevel || 'light',
          })),
        },
      },
      include: {
        ActivityScore: true,
      },
    })

    revalidatePath('/sara/parent/evaluation-items')
    return {
      success: true,
      message: '習慣を作成しました',
      data: result,
    }
  } catch (error: any) {
    console.error('Create activity error:', error)
    return {
      success: false,
      error: error.message || '習慣の作成に失敗しました',
    }
  }
}

export type score = {
  id?: number
  score: number
  title: string
  description?: string
  iconUrl?: string
  animationLevel: string
}
// 習慣更新
export async function activity__update(data: {
  id: number
  title: string
  description?: string
  scores?: score[]
  order?: number
}): Promise<ActionResponse> {
  try {
    const {session} = await initServerComopnent({query: {}})
    if (!session?.familyId || session.type !== 'parent') {
      return {success: false, error: '親の認証が必要です'}
    }

    const result = await prisma.activity.update({
      where: {id: data.id},
      data: {
        title: data.title,
        description: data.description,
        order: data.order,
        ...(data.scores && {
          ActivityScore: {
            deleteMany: {},
            create: data.scores.map(score => ({
              score: score.score,
              title: score.title,
              description: score.description,
              iconUrl: score.iconUrl,
              animationLevel: score.animationLevel || 'light',
            })),
          },
        }),
      },
      include: {
        ActivityScore: true,
      },
    })

    revalidatePath('/sara/parent/evaluation-items')
    return {
      success: true,
      message: '習慣を更新しました',
      data: result,
    }
  } catch (error: any) {
    console.error('Update activity error:', error)
    return {
      success: false,
      error: error.message || '習慣の更新に失敗しました',
    }
  }
}

// 習慣削除
export async function activity__delete(id: number): Promise<ActionResponse> {
  try {
    const {session} = await initServerComopnent({query: {}})
    if (!session?.familyId || session.type !== 'parent') {
      return {success: false, error: '親の認証が必要です'}
    }

    await prisma.activity.update({
      where: {id},
      data: {active: false},
    })

    revalidatePath('/sara/parent/evaluation-items')
    return {
      success: true,
      message: '習慣を削除しました',
    }
  } catch (error: any) {
    console.error('Delete activity error:', error)
    return {
      success: false,
      error: error.message || '習慣の削除に失敗しました',
    }
  }
}

// 評価申請関連 Server Actions

// 評価申請一覧取得
export async function request__getAll(params?: {status?: string; childId?: number; date?: string}): Promise<ActionResponse> {
  try {
    const {session} = await initServerComopnent({query: {}})
    if (!session?.familyId) {
      return {success: false, error: '認証が必要です'}
    }

    const where: any = {}

    // 家族フィルター（必須）
    if (session.type === 'parent') {
      // 親の場合は家族全体の申請を取得
      where.RequestedBy = {
        familyId: Number(session.familyId),
      }
    } else {
      // 子どもの場合は自分の申請のみ
      where.requestedById = Number(session.id)
    }

    // その他のフィルター
    if (params?.status) {
      where.status = params.status
    }
    if (params?.childId) {
      where.requestedById = params.childId
    }
    if (params?.date) {
      const date = new Date(params.date)
      where.date = {
        gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
      }
    }

    const requests = await prisma.activityEvaluationRequest.findMany({
      where,
      include: {
        RequestedBy: {
          select: {id: true, name: true, avatar: true},
        },
        Activity: {
          select: {id: true, title: true, description: true},
        },
        ActivityScore: {
          select: {
            id: true,
            score: true,
            title: true,
            description: true,
            iconUrl: true,
            animationLevel: true,
          },
        },
        ApprovedBy: {
          select: {id: true, name: true},
        },
      },
      orderBy: {createdAt: 'desc'},
    })

    return {
      success: true,
      data: requests,
    }
  } catch (error: any) {
    console.error('Get requests error:', error)
    return {
      success: false,
      error: error.message || '評価申請の取得に失敗しました',
    }
  }
}

// 評価申請作成（子ども用）
export async function request__create(data: {activityId: number; activityScoreId: number}): Promise<ActionResponse> {
  try {
    const {session} = await initServerComopnent({query: {}})
    if (!session?.id || session.type !== 'child') {
      return {success: false, error: '子どもの認証が必要です'}
    }

    // 今日の同じ活動の申請が既にあるかチェック
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    const existingRequest = await prisma.activityEvaluationRequest.findFirst({
      where: {
        requestedById: Number(session.id),
        activityId: data.activityId,
        date: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    })

    if (existingRequest) {
      return {
        success: false,
        error: '今日はすでにこの活動の申請をしています',
      }
    }

    const result = await prisma.activityEvaluationRequest.create({
      data: {
        requestedById: Number(session.id),
        activityId: data.activityId,
        activityScoreId: data.activityScoreId,
        date: new Date(),
      },
      include: {
        Activity: true,
        ActivityScore: true,
      },
    })

    revalidatePath('/sara/child/dashboard')
    revalidatePath('/sara/parent/dashboard')

    return {
      success: true,
      message: '評価申請を送信しました',
      data: result,
    }
  } catch (error: any) {
    console.error('Create request error:', error)
    return {
      success: false,
      error: error.message || '評価申請の作成に失敗しました',
    }
  }
}

// 評価申請承認・却下（親用）
export async function request__approve(data: {
  id: number
  status: 'approved' | 'rejected'
  comment?: string
}): Promise<ActionResponse> {
  try {
    const {session} = await initServerComopnent({query: {}})
    if (!session?.id || session.type !== 'parent') {
      return {success: false, error: '親の認証が必要です'}
    }

    const result = await prisma.activityEvaluationRequest.update({
      where: {id: data.id},
      data: {
        status: data.status,
        comment: data.comment,
        approvedById: Number(session.id),
      },
      include: {
        RequestedBy: true,
        Activity: true,
        ActivityScore: true,
      },
    })

    revalidatePath('/sara/child/dashboard')
    revalidatePath('/sara/parent/dashboard')

    return {
      success: true,
      message: data.status === 'approved' ? '申請を承認しました' : '申請を却下しました',
      data: result,
    }
  } catch (error: any) {
    console.error('Approve request error:', error)
    return {
      success: false,
      error: error.message || '評価申請の更新に失敗しました',
    }
  }
}

// 開封状態更新
export async function request__markAsOpened(id: number): Promise<ActionResponse> {
  try {
    const {session} = await initServerComopnent({query: {}})
    if (!session?.id || session.type !== 'child') {
      return {success: false, error: '子どもの認証が必要です'}
    }

    await prisma.activityEvaluationRequest.update({
      where: {id},
      data: {openedByChild: true},
    })

    revalidatePath('/sara/child/dashboard')

    return {
      success: true,
      message: '開封状態を更新しました',
    }
  } catch (error: any) {
    console.error('Mark as opened error:', error)
    return {
      success: false,
      error: error.message || '開封状態の更新に失敗しました',
    }
  }
}

// ダッシュボード関連 Server Actions

// 統計データ取得
export async function dashboard__getStats(childId?: number): Promise<ActionResponse> {
  try {
    const {session} = await initServerComopnent({query: {}})
    if (!session?.familyId) {
      return {success: false, error: '認証が必要です'}
    }

    // 対象の子どもID（親の場合は指定可能、子どもの場合は自分のID）
    const targetChildId = session.type === 'child' ? Number(session.id) : childId

    // 今月の統計
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    const where: any = {
      date: {
        gte: startOfMonth,
        lt: endOfMonth,
      },
      RequestedBy: {
        familyId: Number(session.familyId),
      },
    }

    if (targetChildId) {
      where.requestedById = targetChildId
    }

    // 承認済み申請数
    const approvedCount = await prisma.activityEvaluationRequest.count({
      where: {...where, status: 'approved'},
    })

    // 申請待ち数
    const pendingCount = await prisma.activityEvaluationRequest.count({
      where: {...where, status: 'pending'},
    })

    // 総申請数
    const totalCount = await prisma.activityEvaluationRequest.count({
      where,
    })

    // スコア別統計
    const scoreStats = await prisma.activityEvaluationRequest.groupBy({
      by: ['activityScoreId'],
      where: {...where, status: 'approved'},
      _count: true,
    })

    return {
      success: true,
      data: {
        approved: approvedCount,
        pending: pendingCount,
        total: totalCount,
        scoreStats,
      },
    }
  } catch (error: any) {
    console.error('Get dashboard stats error:', error)
    return {
      success: false,
      error: error.message || '統計データの取得に失敗しました',
    }
  }
}

// クライアントサイドで使用するNextAuth関連は別ファイルで実装
