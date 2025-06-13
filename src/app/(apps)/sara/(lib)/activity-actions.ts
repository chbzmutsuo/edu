'use server'

import {revalidatePath} from 'next/cache'
import {prisma} from '../../../../lib/prisma'
// TODO: 正しいauthOptionsのパスに修正してください
// import {authOptions} from '../../../../api/auth/[...nextauth]/constants/authOptions.tsx'
import {ActivityCreateData, ActivityUpdateData, ActionResponse} from './types'
import {initServerComopnent} from 'src/non-common/serverSideFunction'

// 習慣一覧取得
export async function activity__getAll(): Promise<ActionResponse> {
  try {
    const {session} = await initServerComopnent({query: {}})
    if (!session?.familyId) {
      return {success: false, error: 'ログインが必要です'}
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
export async function activity__create(data: ActivityCreateData): Promise<ActionResponse> {
  try {
    const {session} = await initServerComopnent({query: {}})
    if (!session?.familyId || session.type !== 'parent') {
      return {success: false, error: '権限がありません'}
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
            animationLevel: score.animationLevel.toString() || 'light',
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

// 習慣更新
export async function activity__update(data: ActivityUpdateData): Promise<ActionResponse> {
  try {
    const {session} = await initServerComopnent({query: {}})
    if (!session?.familyId || session.type !== 'parent') {
      return {success: false, error: '権限がありません'}
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
              animationLevel: score?.animationLevel?.toString() || 'light',
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
export async function activity__delete(activityId: number): Promise<ActionResponse> {
  try {
    const {session} = await initServerComopnent({query: {}})
    if (!session?.familyId || session.type !== 'parent') {
      return {success: false, error: '権限がありません'}
    }

    await prisma.activity.update({
      where: {id: activityId},
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
