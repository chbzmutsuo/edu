'use client'

import React, {useEffect, useState} from 'react'

import {CalendarView} from '../(components)/Calendar/CalendarView'
import {LogListView} from '../(components)/Log/LogListView'
import {LogForm} from '../(components)/Log/LogForm'
import {useCalendar} from '../hooks/useCalendar'
import {useWorkoutLog} from '../hooks/useWorkoutLog'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {WorkoutLogWithMaster, WorkoutLogInput} from '../types/training'

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

  const {
    currentDate,
    workoutDates,
    workoutDateSet,
    isLoading: calendarLoading,
    currentMonthWorkoutCount,
    changeMonth,
    fetchWorkoutDates,
  } = useCalendar({userId})

  const {
    logList,
    isLoading: logListLoading,
    error,
    fetchlogList,
    addLog,
    editLog,
    removeLog,
    quickAddSet,
    prLogIds,
    totalVolume,
  } = useWorkoutLog({userId, selectedDate})

  // 初回ロード時に記録日付を取得
  useEffect(() => {
    fetchWorkoutDates()
  }, [])

  // 日付クリック時の処理
  const onDateClick = (dateStr: string) => {
    setSelectedDate(dateStr)
    setCurrentView('logList')
    fetchlogList()
  }

  // 記録追加画面を表示
  const handleAddLog = () => {
    setEditingLog(null)
    setCurrentView('logForm')
  }

  // 記録編集画面を表示
  const handleEditLog = (log: WorkoutLogWithMaster) => {
    setEditingLog(log)
    setCurrentView('logForm')
  }

  // 記録保存処理
  const handleSaveLog = async (data: WorkoutLogInput & {date: Date}) => {
    try {
      if (editingLog) {
        await editLog(editingLog.id, data)
      } else {
        await addLog(data)
      }
      setCurrentView('logList')
      fetchlogList() // 一覧を再取得
    } catch (error) {
      console.error('記録の保存に失敗しました:', error)
    }
  }

  // 記録削除処理
  const handleDeleteLog = async (logId: number) => {
    if (confirm('この記録を削除しますか？')) {
      try {
        await removeLog(logId)
      } catch (error) {
        console.error('記録の削除に失敗しました:', error)
      }
    }
  }

  // クイック追加処理
  const handleQuickAdd = async (log: WorkoutLogWithMaster) => {
    try {
      await quickAddSet(log)
    } catch (error) {
      console.error('クイック追加に失敗しました:', error)
    }
  }

  // カレンダーに戻る
  const handleBackToCalendar = () => {
    setCurrentView('calendar')
    setSelectedDate('')
    setEditingLog(null)
  }

  // 記録一覧に戻る
  const handleBackToLogList = () => {
    setCurrentView('logList')
    setEditingLog(null)
  }

  if (calendarLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-600">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-lg p-4">
      {/* ヘッダー */}
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-slate-800">
          <span role="img" aria-label="dumbbell">
            💪
          </span>{' '}
          筋トレ記録
        </h1>
        {currentView === 'calendar' && <p className="text-slate-600 mt-2">今月の記録: {currentMonthWorkoutCount}日</p>}
        {currentView === 'logList' && selectedDate && (
          <p className="text-slate-600 mt-2">
            {selectedDate}の記録: {logList.length}セット
          </p>
        )}
      </header>

      {/* エラー表示 */}
      {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

      {/* メインコンテンツ */}
      {currentView === 'calendar' && (
        <CalendarView currentDate={currentDate} changeMonth={changeMonth} workoutDates={workoutDates} onDateClick={onDateClick} />
      )}

      {currentView === 'logList' && (
        <LogListView
          selectedDate={selectedDate}
          logList={logList}
          onAdd={handleAddLog}
          onEdit={handleEditLog}
          onQuickAdd={handleQuickAdd}
          onDelete={handleDeleteLog}
          onBack={handleBackToCalendar}
          prLogIds={prLogIds}
        />
      )}

      {currentView === 'logForm' && (
        <LogForm
          masters={[]} // TODO: 種目マスタを取得
          logList={logList}
          editingLog={editingLog}
          onSave={handleSaveLog}
          onCancel={handleBackToLogList}
        />
      )}

      {/* ローディング表示 */}
      {logListLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg">
            <div className="text-slate-600">記録を処理中...</div>
          </div>
        </div>
      )}
    </div>
  )
}
