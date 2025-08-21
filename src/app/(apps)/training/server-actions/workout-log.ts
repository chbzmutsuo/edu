'use server'

import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {WorkoutLogInput} from '../types/training'
import {toUtc} from '@cm/class/Days/date-utils/calculations'

// 指定日のワークアウトログ取得（ユーザー別）
export async function getWorkoutLogByDate(userId: number, date: Date) {
  const startOfDay = toUtc(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0))
  const endOfDay = toUtc(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999))

  return await doStandardPrisma('workoutLog', 'findMany', {
    where: {
      userId,
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      ExerciseMaster: true,
    },
    orderBy: {createdAt: 'asc'},
  })
}

// ワークアウトログ作成
export async function createWorkoutLog(userId: number, data: WorkoutLogInput & {date: Date}) {
  return await doStandardPrisma('workoutLog', 'create', {
    data: {
      ...data,
      userId,
    },
    include: {
      ExerciseMaster: true,
    },
  })
}

// ワークアウトログ更新
export async function updateWorkoutLog(userId: number, id: number, data: WorkoutLogInput) {
  return await doStandardPrisma('workoutLog', 'update', {
    where: {id, userId}, // ユーザーIDも条件に含める
    data,
    include: {
      ExerciseMaster: true,
    },
  })
}

// ワークアウトログ削除
export async function deleteWorkoutLog(userId: number, id: number) {
  return await doStandardPrisma('workoutLog', 'delete', {
    where: {id, userId}, // ユーザーIDも条件に含める
  })
}

// 記録がある日付一覧取得（ユーザー別）
export async function getWorkoutDates(userId: number) {
  const result = await doStandardPrisma('workoutLog', 'findMany', {
    where: {userId},
    select: {
      date: true,
    },
    distinct: ['date'],
    orderBy: {date: 'desc'},
  })
  return result.result?.map(d => d.date) || []
}

// 種目別の過去記録取得（パフォーマンス指標計算用）
export async function getWorkoutLogByExercise(userId: number, exerciseId: number, months: number = 3) {
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - months)
  startDate.setUTCHours(0, 0, 0, 0)

  return await doStandardPrisma('workoutLog', 'findMany', {
    where: {
      userId,
      exerciseId,
      date: {
        gte: startDate,
      },
    },
    orderBy: {date: 'asc'},
  })
}
