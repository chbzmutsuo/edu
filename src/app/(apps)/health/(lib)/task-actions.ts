'use server'

import {basePath} from '@lib/methods/common'
import prisma from '@lib/prisma'
import {RecurringPattern} from '@prisma/client'

// 日本時間の日付文字列をUTC時刻（0時）に変換
function convertJSTDateToUTC(dateString: string): Date {
  // 日本時間の0時をUTCに変換（JST = UTC+9なので、-9時間）
  const jstDate = new Date(dateString + 'T00:00:00')
  const utcDate = new Date(jstDate.getTime() - 9 * 60 * 60 * 1000) // 9時間前
  return utcDate
}

// 型定義
export type Task = {
  id: number
  createdAt: Date
  updatedAt: Date
  title: string
  description?: string | null
  dueDate?: Date | null
  completed: boolean
  completedAt?: Date | null
  isRecurring: boolean
  RecurringPattern?: RecurringPattern | null
  recurringEndDate?: Date | null
  recurringWeekdays: number[]
  recurringDayOfMonth?: number | null
  recurringMonths: number[]
  userId?: number | null
  TaskAttachment?: TaskAttachment[]
  RecurringTask?: RecurringTask | null
  recurringTaskId?: number | null
}

export type TaskAttachment = {
  id: number
  createdAt: Date
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  taskId: number
}

export type RecurringTask = {
  id: number
  createdAt: Date
  updatedAt: Date
  title: string
  description?: string | null
  pattern: RecurringPattern
  startDate: Date
  endDate: Date | null // nullも許可（Prismaから取得する際はnullの可能性）
  weekdays: number[]
  dayOfMonth?: number | null
  months: number[]
  interval: number
  nextGenerationDate?: Date | null
  isActive: boolean
  userId?: number | null
}

// タスクフィルタータイプ
export type TaskFilter = 'all' | 'individual' | 'recurring' | 'completed' | 'pending'

// タスク取得
export async function getTasks(params: {
  userId: number
  filter?: TaskFilter
  sortBy?: 'dueDate' | 'createdAt' | 'title'
  sortOrder?: 'asc' | 'desc'
}) {
  try {
    const {userId, filter = 'all', sortBy = 'dueDate', sortOrder = 'asc'} = params

    const where: any = {userId}

    // フィルター適用
    switch (filter) {
      case 'individual': {
        where.recurringTaskId = null
        break
      }
      case 'recurring': {
        where.recurringTaskId = {not: null}
        break
      }
      case 'completed': {
        where.completed = true
        break
      }
      case 'pending': {
        where.completed = false
        break
      }
      case 'all':
      default:
        // フィルターなし
        break
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        TaskAttachment: true,
        RecurringTask: true,
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
    })

    return {success: true, data: tasks}
  } catch (error) {
    console.error('タスク取得エラー:', error)
    return {success: false, error: 'タスクの取得に失敗しました'}
  }
}

// 個別タスク作成
export async function createTask(data: {title: string; description?: string; dueDate?: Date; userId: number}) {
  try {
    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        userId: data.userId,
        isRecurring: false,
        recurringWeekdays: [],
        recurringMonths: [],
      },
      include: {
        TaskAttachment: true,
        RecurringTask: true,
      },
    })

    return {success: true, data: task}
  } catch (error) {
    console.error('タスク作成エラー:', error)
    return {success: false, error: 'タスクの作成に失敗しました'}
  }
}

// 定期タスク作成（一括生成付き）
export async function createRecurringTask(data: {
  title: string
  description?: string
  pattern: RecurringPattern
  startDate: Date | string
  endDate: Date | string
  weekdays?: number[]
  dayOfMonth?: number
  months?: number[]
  interval?: number
  userId: number
}) {
  try {
    // 日付を適切に変換
    const startDateUTC = typeof data.startDate === 'string' ? convertJSTDateToUTC(data.startDate) : data.startDate
    const endDateUTC = typeof data.endDate === 'string' ? convertJSTDateToUTC(data.endDate) : data.endDate

    // トランザクション内で定期タスクとTaskを一括作成
    const result = await prisma.$transaction(async tx => {
      // 定期タスクを作成
      const recurringTask = await tx.recurringTask.create({
        data: {
          title: data.title,
          description: data.description,
          pattern: data.pattern,
          startDate: startDateUTC,
          endDate: endDateUTC,
          weekdays: data.weekdays || [],
          dayOfMonth: data.dayOfMonth,
          months: data.months || [],
          interval: data.interval || 1,
          userId: data.userId,
          isActive: true,
        },
      })

      // 開始日から終了日までの期間でタスクを一括生成
      const tasks = generateTaskInstances({
        recurringTask,
        startDate: startDateUTC,
        endDate: endDateUTC,
      })

      // 生成したタスクをデータベースに一括保存
      const createdTasks = await Promise.all(
        tasks.map(taskData =>
          tx.task.create({
            data: {
              ...taskData,
              recurringTaskId: recurringTask.id,
              userId: data.userId,
              isRecurring: true,
              recurringWeekdays: data.weekdays || [],
              recurringMonths: data.months || [],
            },
          })
        )
      )

      return {recurringTask, tasks: createdTasks}
    })

    return {success: true, data: result}
  } catch (error) {
    console.error('定期タスク作成エラー:', error)
    return {success: false, error: '定期タスクの作成に失敗しました'}
  }
}

// タスクインスタンス生成ロジック
function generateTaskInstances(params: {recurringTask: any; startDate: Date; endDate: Date}): Array<{
  title: string
  description?: string | null
  dueDate: Date
}> {
  const {recurringTask, startDate, endDate} = params
  const tasks: Array<{title: string; description?: string | null; dueDate: Date}> = []

  // 開始日から終了日まで1日ずつチェック
  const end = new Date(endDate)
  let currentDate = new Date(startDate)

  while (currentDate <= end) {
    if (shouldGenerateTaskForDate(currentDate, recurringTask)) {
      tasks.push({
        title: recurringTask.title,
        description: recurringTask.description,
        dueDate: new Date(currentDate),
      })
    }

    // 翌日へ進む（新しいDateオブジェクトを作成）
    currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000)
  }

  return tasks
}

// 指定日にタスクを生成すべきかチェック
function shouldGenerateTaskForDate(date: Date, recurringTask: any): boolean {
  const {pattern, weekdays, dayOfMonth, months, interval = 1, startDate} = recurringTask

  switch (pattern) {
    case 'DAILY': {
      // interval日ごと
      const dayDiff = Math.floor((date.getTime() - new Date(startDate).getTime()) / (24 * 60 * 60 * 1000))
      return dayDiff >= 0 && dayDiff % interval === 0
    }

    case 'WEEKDAYS': {
      const weekday = date.getDay()
      return weekday >= 1 && weekday <= 5 // 月曜〜金曜
    }

    case 'WEEKENDS': {
      const weekend = date.getDay()
      return weekend === 0 || weekend === 6 // 日曜、土曜
    }

    case 'WEEKLY': {
      const currentWeekday = date.getDay()
      return weekdays.includes(currentWeekday)
    }

    case 'BIWEEKLY': {
      // 開始日からの週数が偶数の週のみ
      const startWeek = Math.floor(new Date(startDate).getTime() / (7 * 24 * 60 * 60 * 1000))
      const currentWeek = Math.floor(date.getTime() / (7 * 24 * 60 * 60 * 1000))
      const weekDiff = currentWeek - startWeek
      return weekDiff >= 0 && weekDiff % 2 === 0 && weekdays.includes(date.getDay())
    }

    case 'MONTHLY': {
      return date.getDate() === dayOfMonth
    }

    case 'YEARLY': {
      return date.getDate() === dayOfMonth && months.includes(date.getMonth() + 1)
    }

    case 'QUARTERLY': {
      const quarterMonths = [1, 4, 7, 10] // 1月、4月、7月、10月
      return date.getDate() === dayOfMonth && quarterMonths.includes(date.getMonth() + 1)
    }

    default:
      return false
  }
}

// 次の日付を取得
function getNextDate(currentDate: Date, recurringTask: RecurringTask): Date {
  const {pattern, interval} = recurringTask
  const nextDate = new Date(currentDate)

  switch (pattern) {
    case 'DAILY':
    case 'WEEKDAYS':
    case 'WEEKENDS':
      nextDate.setDate(nextDate.getDate() + (interval || 1))
      break

    case 'WEEKLY':
      nextDate.setDate(nextDate.getDate() + 7 * (interval || 1))
      break

    case 'BIWEEKLY':
      nextDate.setDate(nextDate.getDate() + 14 * (interval || 1))
      break

    case 'MONTHLY':
    case 'QUARTERLY':
      nextDate.setMonth(nextDate.getMonth() + (interval || 1))
      break

    case 'YEARLY':
      nextDate.setFullYear(nextDate.getFullYear() + (interval || 1))
      break

    default:
      nextDate.setDate(nextDate.getDate() + 1)
  }

  return nextDate
}

// タスク更新
export async function updateTask(id: number, data: {title?: string; description?: string; dueDate?: Date}) {
  try {
    const task = await prisma.task.update({
      where: {id},
      data: {
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
      },
      include: {
        TaskAttachment: true,
        RecurringTask: true,
      },
    })

    return {success: true, data: task}
  } catch (error) {
    console.error('タスク更新エラー:', error)
    return {success: false, error: 'タスクの更新に失敗しました'}
  }
}

// タスク削除
export async function deleteTask(id: number) {
  try {
    await prisma.task.delete({
      where: {id},
    })

    return {success: true}
  } catch (error) {
    console.error('タスク削除エラー:', error)
    return {success: false, error: 'タスクの削除に失敗しました'}
  }
}

// タスク完了状態切り替え
export async function toggleTaskComplete(id: number) {
  try {
    const task = await prisma.task.findUnique({
      where: {id},
    })

    if (!task) {
      return {success: false, error: 'タスクが見つかりません'}
    }

    const updatedTask = await prisma.task.update({
      where: {id},
      data: {
        completed: !task.completed,
        completedAt: !task.completed ? new Date() : null,
      },
      include: {
        TaskAttachment: true,
        RecurringTask: true,
      },
    })

    return {success: true, data: updatedTask}
  } catch (error) {
    console.error('タスク完了状態切り替えエラー:', error)
    return {success: false, error: 'タスクの更新に失敗しました'}
  }
}
