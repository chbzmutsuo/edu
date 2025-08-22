import {useState, useMemo, useEffect} from 'react'
import {useSearchParams} from 'next/navigation'

import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {getTodayString} from '@app/(apps)/training/(lib)/date-utils'
import {getMonthRange} from '@app/(apps)/training/(lib)/date-utils'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {toJst} from '@cm/class/Days/date-utils/calculations'
import {getWorkoutDatesForMonth} from '@app/(apps)/training/server-actions/workout-log'

interface UseCalendarProps {
  userId: number
}

export function useCalendar({userId}: UseCalendarProps) {
  const {query, router, addQuery} = useGlobal()

  let {year, month} = query
  year = year ? Number(year) : new Date().getFullYear()
  month = month ? Number(month) : new Date().getMonth() + 1

  if (isNaN(year) || isNaN(month)) {
    throw new Error('Invalid year or month')
  }

  const searchParams = useSearchParams()

  // 現在表示中の月（URLパラメータから取得）
  const currentDate = useMemo(() => {
    if (year && month) {
      return new Date(parseInt(year), parseInt(month) - 1, 1)
    }

    // デフォルトは現在の月
    const now = new Date()
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0))
  }, [searchParams])

  // 選択された日付
  const [selectedDate, setSelectedDate] = useState(getTodayString())

  // 記録がある日付一覧
  const [workoutDates, setWorkoutDates] = useState<Date[]>([])

  // 部位別記録データ（日付別）
  const [workoutDataByDate, setWorkoutDataByDate] = useState<Record<string, {part: string; count: number}[]>>({})

  // ローディング状態
  const [isLoading, setIsLoading] = useState(false)

  // 記録がある日付の取得
  const fetchWorkoutDates = async () => {
    if (!userId) return

    setIsLoading(true)
    try {
      const dates = await getWorkoutDatesForMonth(userId)
      setWorkoutDates(dates)

      // 部位別記録データも取得
      await fetchWorkoutDataByDate(dates)
    } catch (error) {
      console.error('記録日付の取得に失敗しました:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 部位別記録データの取得
  const fetchWorkoutDataByDate = async (dates: Date[]) => {
    if (!userId) return

    try {
      const dataByDate: Record<string, {part: string; count: number}[]> = {}

      for (const date of dates) {
        const logList = await getWorkoutLogByDate(userId, toJst(date))

        if (logList.result && logList.result.length > 0) {
          // 部位別に集計
          const partCounts: Record<string, number> = {}
          logList.result.forEach(log => {
            const part = log.ExerciseMaster.part
            partCounts[part] = (partCounts[part] || 0) + 1
          })

          // 配列形式に変換
          const partArray = Object.entries(partCounts).map(([part, count]) => ({
            part,
            count,
          }))

          dataByDate[formatDate(date)] = partArray
        }
      }

      setWorkoutDataByDate(dataByDate)
    } catch (error) {
      console.error('部位別記録データの取得に失敗しました:', error)
    }
  }

  // 月移動処理（URLパラメータを更新）
  const changeMonth = (offset: number) => {
    const newQuery = {
      year,
      month: month + offset,
    }
    addQuery(newQuery)
  }

  // 日付選択処理
  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr)
  }

  // 記録がある日付のSet（高速検索用）
  const workoutDateSet = useMemo(() => {
    return new Set(workoutDates.map(date => formatDate(date)))
  }, [workoutDates])

  // 現在の月の記録日数を計算
  const currentMonthWorkoutCount = useMemo(() => {
    const {startOfMonth, endOfMonth} = getMonthRange(currentDate)
    return workoutDates.filter(date => date >= startOfMonth && date <= endOfMonth).length
  }, [currentDate, workoutDates])

  // 初回ロード時に記録日付を取得
  useEffect(() => {
    fetchWorkoutDates()
  }, [userId])

  return {
    // 状態
    currentDate,
    selectedDate,
    workoutDates,
    workoutDateSet,
    workoutDataByDate,
    isLoading,
    currentMonthWorkoutCount,

    // アクション
    setSelectedDate,
    changeMonth,
    handleDateClick,
    fetchWorkoutDates,
  }
}
