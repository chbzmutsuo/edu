'use client'

import React, {useEffect, useState} from 'react'

import {CalendarView} from './(components)/Calendar/CalendarView'
import {LogListView} from './(components)/Log/LogListView'
import {LogForm} from './(components)/Log/LogForm'
import {useCalendar} from './hooks/useCalendar'
import {useExerciseMasters} from './hooks/useExerciseMasters'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {WorkoutLogWithMaster, WorkoutLogInput} from './types/training'
import {getWorkoutLogByDate, createWorkoutLog, updateWorkoutLog, deleteWorkoutLog} from './server-actions/workout-log'
import {toUtc} from '@cm/class/Days/date-utils/calculations'

// 表示画面の種類
type ViewType = 'calendar' | 'logList' | 'logForm'

export default function TrainingPage() {
  const {session} = useGlobal()
  const userId = session?.id || 1 // 仮のユーザーID、実際は認証から取得

  // 現在の表示画面
  const [currentView, setCurrentView] = useState<ViewType>('calendar')

  // 選択された日付
  const [selectedDate, setSelectedDate] = useState('')

  // 編集中の記録
  const [editingLog, setEditingLog] = useState<WorkoutLogWithMaster | null>(null)

  // 記録データ
  const [logList, setlogList] = useState<WorkoutLogWithMaster[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    currentDate,
    workoutDates,
    workoutDateSet,
    isLoading: calendarLoading,
    currentMonthWorkoutCount,
    changeMonth,
    fetchWorkoutDates,
  } = useCalendar({userId})

  const {masters, fetchMasters} = useExerciseMasters({userId})

  // 初回ロード時に種目マスタを取得
  useEffect(() => {
    fetchMasters()
  }, [])

  // 選択された日付の記録を取得
  const fetchlogList = async (dateStr: string) => {
    if (!dateStr || !userId) return

    setIsLoading(true)
    setError(null)

    try {
      const date = new Date(dateStr + 'T00:00:00Z')
      const result = await getWorkoutLogByDate(userId, date)
      if (result.result) {
        setlogList(result.result)
      }
    } catch (err) {
      setError('記録の取得に失敗しました')
      console.error('記録取得エラー:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // 日付クリック時の処理
  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr)
    setCurrentView('logList')
    fetchlogList(dateStr)
  }

  // 記録追加時の処理
  const handleAddLog = () => {
    setCurrentView('logForm')
  }

  // 記録編集時の処理
  const handleEditLog = (log: WorkoutLogWithMaster) => {
    setEditingLog(log)
    setCurrentView('logForm')
  }

  // 記録保存時の処理
  const handleSaveLog = async (data: WorkoutLogInput & {date: Date}) => {
    try {
      if (editingLog) {
        await updateWorkoutLog(userId, editingLog.id, data)
      } else {
        await createWorkoutLog(userId, data)
      }
      setCurrentView('logList')
      setEditingLog(null)
      // 記録を再取得
      fetchlogList(selectedDate)
      // カレンダーの記録日付も更新
      fetchWorkoutDates()
    } catch (error) {
      console.error('記録の保存に失敗しました:', error)
    }
  }

  // 記録削除時の処理
  const handleDeleteLog = async (logId: number) => {
    try {
      await deleteWorkoutLog(userId, logId)
      // 記録を再取得
      fetchlogList(selectedDate)
      // カレンダーの記録日付も更新
      fetchWorkoutDates()
    } catch (error) {
      console.error('記録の削除に失敗しました:', error)
    }
  }

  // クイック追加時の処理
  const handleQuickAdd = async (log: WorkoutLogWithMaster) => {
    try {
      const newLogData: WorkoutLogInput & {date: Date} = {
        exerciseId: log.exerciseId,
        strength: log.strength,
        reps: log.reps,
        date: toUtc(selectedDate),
      }
      await createWorkoutLog(userId, newLogData)
      // 記録を再取得
      fetchlogList(selectedDate)
      // カレンダーの記録日付も更新
      fetchWorkoutDates()
    } catch (error) {
      console.error('クイック追加に失敗しました:', error)
    }
  }

  // カレンダーに戻る処理
  const handleBackToCalendar = () => {
    setCurrentView('calendar')
    setSelectedDate('')
    setEditingLog(null)
  }

  // 記録一覧に戻る処理
  const handleBackToLogList = () => {
    setCurrentView('logList')
    setEditingLog(null)
  }

  // ローディング表示
  if (calendarLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-600">読み込み中...</div>
      </div>
    )
  }

  // エラー表示
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">エラーが発生しました: {error}</div>
      </div>
    )
  }

  // 現在の表示画面に応じてコンポーネントを表示
  switch (currentView) {
    case 'calendar':
      return (
        <div className="container mx-auto max-w-4xl p-4">
          <CalendarView
            currentDate={currentDate}
            changeMonth={changeMonth}
            workoutDates={workoutDates}
            onDateClick={handleDateClick}
          />
        </div>
      )

    case 'logList':
      return (
        <div className="container mx-auto max-w-2xl p-4">
          <LogListView
            userId={userId}
            selectedDate={selectedDate}
            onAdd={handleAddLog}
            onEdit={handleEditLog}
            onQuickAdd={handleQuickAdd}
            onDelete={handleDeleteLog}
            onBack={handleBackToCalendar}
            prLogIds={new Set()}
          />
        </div>
      )

    case 'logForm':
      return (
        <div className="container mx-auto max-w-2xl p-4">
          <LogForm
            masters={masters}
            logList={logList}
            editingLog={editingLog}
            selectedDate={selectedDate}
            onSave={handleSaveLog}
            onCancel={handleBackToLogList}
          />
        </div>
      )

    default:
      return null
  }
}
