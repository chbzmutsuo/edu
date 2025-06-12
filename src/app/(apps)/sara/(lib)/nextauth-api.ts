'use server'
import {revalidatePath} from 'next/cache'
import {prisma} from '../../../../lib/prisma'
import bcrypt from 'bcrypt'

// おうちスタンプラリーアプリ - サーバーアクション実装

// NextAuth版のサーバーアクション実装

export interface ActionResponse<T = any> {
  success: boolean
  message?: string
  error?: string
  data?: T
}

// 認証用サーバーアクション
export const authActions = {
  // 家族登録
  register: async (data: {
    familyName: string
    parent: {name: string; email: string; password: string}
    children: {name: string; avatar: string; password?: string}[]
  }): Promise<ActionResponse> => {
    try {
      // パスワードハッシュ化
      const hashedParentPassword = await bcrypt.hash(data.parent.password, 12)

      const result = await prisma.family.create({
        data: {
          name: data.familyName,
          Parent: {
            create: {
              name: data.parent.name,
              email: data.parent.email,
              password: hashedParentPassword,
            },
          },
          Child: {
            create: data.children.map(child => ({
              name: child.name,
              avatar: child.avatar,
              password: child.password ? bcrypt.hashSync(child.password, 12) : null,
            })),
          },
        },
        include: {
          Parent: true,
          Child: true,
        },
      })

      return {
        success: true,
        message: '家族登録が完了しました',
        data: result,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '家族登録に失敗しました',
      }
    }
  },

  // 子どもリスト取得
  getChildren: async (familyId: number): Promise<ActionResponse> => {
    try {
      const children = await prisma.child.findMany({
        where: {familyId},
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
      return {
        success: false,
        error: error.message || '子どもリストの取得に失敗しました',
      }
    }
  },

  // 子どもパスワード確認
  verifyChildPassword: async (childId: number, password?: string): Promise<ActionResponse> => {
    try {
      const child = await prisma.child.findUnique({
        where: {id: childId},
        select: {password: true},
      })

      if (!child) {
        return {
          success: false,
          error: '子どもが見つかりません',
        }
      }

      // パスワードが設定されていない場合
      if (!child.password) {
        return {success: true}
      }

      // パスワードが設定されている場合は検証
      if (!password) {
        return {
          success: false,
          error: 'パスワードが必要です',
        }
      }

      const isValid = await bcrypt.compare(password, child.password)
      if (!isValid) {
        return {
          success: false,
          error: 'パスワードが間違っています',
        }
      }

      return {success: true}
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'パスワード確認に失敗しました',
      }
    }
  },
}

// 評価項目用サーバーアクション
export const evaluationItemsActions = {
  // 一覧取得
  getAll: async ({session}): Promise<ActionResponse> => {
    try {
      if (!session?.saraFamilyId) {
        return {success: false, error: '認証が必要です'}
      }

      const activities = await prisma.activity.findMany({
        where: {
          familyId: Number(session.saraFamilyId),
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
      return {
        success: false,
        error: error.message || '評価項目の取得に失敗しました',
      }
    }
  },

  // 作成
  create: async (
    session,
    data: {
      title: string
      description?: string
      scores: {
        score: number
        title: string
        description?: string
        iconUrl?: string
        animationLevel?: string
      }[]
    }
  ): Promise<ActionResponse> => {
    try {
      if (!session?.saraFamilyId || session.type !== 'parent') {
        return {success: false, error: '親の認証が必要です'}
      }

      const result = await prisma.activity.create({
        data: {
          title: data.title,
          description: data.description,
          familyId: Number(session.saraFamilyId),
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
        message: '評価項目を作成しました',
        data: result,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '評価項目の作成に失敗しました',
      }
    }
  },

  // 更新
  update: async (
    session,
    data: {
      id: number
      title: string
      description?: string
      scores?: {
        id?: number
        score: number
        title: string
        description?: string
        iconUrl?: string
        animationLevel?: string
      }[]
      order?: number
    }
  ): Promise<ActionResponse> => {
    try {
      if (!session?.user?.saraFamilyId || session.user.type !== 'parent') {
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
        message: '評価項目を更新しました',
        data: result,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '評価項目の更新に失敗しました',
      }
    }
  },

  // 削除
  delete: async (session, id: number): Promise<ActionResponse> => {
    try {
      if (!session?.user?.saraFamilyId || session.user.type !== 'parent') {
        return {success: false, error: '親の認証が必要です'}
      }

      await prisma.activity.update({
        where: {id},
        data: {active: false},
      })

      revalidatePath('/sara/parent/evaluation-items')
      return {
        success: true,
        message: '評価項目を削除しました',
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '評価項目の削除に失敗しました',
      }
    }
  },
}

// 評価申請用サーバーアクション
export const evaluationRequestsActions = {
  // 一覧取得
  getAll: async (session, params?: {status?: string; childId?: number; date?: string}): Promise<ActionResponse> => {
    try {
      if (!session?.familyId) {
        return {success: false, error: '認証が必要です'}
      }

      const where: any = {}

      // 家族フィルター（必須）
      if (session.type === 'parent') {
        // 親の場合は家族全体の申請を取得
        where.Child = {
          familyId: Number(session.familyId),
        }
      } else {
        // 子どもの場合は自分の申請のみ
        where.childId = Number(session.id)
      }

      // その他のフィルター
      if (params?.status) {
        where.status = params.status
      }
      if (params?.childId) {
        where.childId = params.childId
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
          Child: {
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
          Parent: {
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
      return {
        success: false,
        error: error.message || '評価申請の取得に失敗しました',
      }
    }
  },

  // 申請作成（子ども用）
  create: async (session, data: {activityId: number; activityScoreId: number}): Promise<ActionResponse> => {
    try {
      if (!session?.id || session.type !== 'child') {
        return {success: false, error: '子どもの認証が必要です'}
      }

      // 今日の同じ活動の申請が既にあるかチェック
      const today = new Date()
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

      const existingRequest = await prisma.activityEvaluationRequest.findFirst({
        where: {
          childId: Number(session.id),
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
          childId: Number(session.id),
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
      return {
        success: false,
        error: error.message || '評価申請の作成に失敗しました',
      }
    }
  },

  // 承認・却下（親用）
  update: async (session, data: {id: number; status: 'approved' | 'rejected'; comment?: string}): Promise<ActionResponse> => {
    try {
      if (!session?.id || session.type !== 'parent') {
        return {success: false, error: '親の認証が必要です'}
      }

      const result = await prisma.activityEvaluationRequest.update({
        where: {id: data.id},
        data: {
          status: data.status,
          comment: data.comment,
          parentId: Number(session.id),
        },
        include: {
          Child: true,
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
      return {
        success: false,
        error: error.message || '評価申請の更新に失敗しました',
      }
    }
  },

  // 開封状態更新
  markAsOpened: async (session, id: number): Promise<ActionResponse> => {
    try {
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
      return {
        success: false,
        error: error.message || '開封状態の更新に失敗しました',
      }
    }
  },
}

// ダッシュボード用サーバーアクション
export const dashboardActions = {
  // 統計データ取得
  getStats: async (session, childId?: number): Promise<ActionResponse> => {
    try {
      if (!session?.familyId) {
        return {success: false, error: '認証が必要です'}
      }

      // 対象の子どもID（親の場合は指定可能、子どもの場合は自分のID）
      const targetChildId = session.user.type === 'child' ? Number(session.user.id) : childId

      // 今月の統計
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

      const where: any = {
        date: {
          gte: startOfMonth,
          lt: endOfMonth,
        },
        Child: {
          familyId: Number(session.familyId),
        },
      }

      if (targetChildId) {
        where.childId = targetChildId
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
      return {
        success: false,
        error: error.message || '統計データの取得に失敗しました',
      }
    }
  },
}

// クライアントサイドで使用するNextAuth関連は別ファイルで実装
