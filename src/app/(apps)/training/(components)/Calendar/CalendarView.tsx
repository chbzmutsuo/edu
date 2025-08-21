'use client'

import React, { useMemo} from 'react'
import {CalendarDay} from './CalendarDay'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

interface CalendarViewProps {
  currentDate: Date
  changeMonth: (offset: number) => void // 月移動処理関数
  workoutDates: Date[]
  onDateClick: (dateStr: string) => void
}

export function CalendarView({currentDate, changeMonth, workoutDates, onDateClick}: CalendarViewProps) {
  // 月移動処理

  // カレンダー表示用の日付配列を生成
  const calendarDays = useMemo(() => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    const startDay = startOfMonth.getDay()
    const daysInMonth = endOfMonth.getDate()

    const days = [
      ...Array(startDay).fill(null), // 前月の日付（空）
      ...Array.from({length: daysInMonth}, (_, i) => i + 1), // 今月の日付
    ]

    return days
  }, [currentDate])

  // 記録がある日付のSet（高速検索用）
  const workoutDateSet = useMemo(() => {
    return new Set(workoutDates.map(date => formatDate(date)))
  }, [workoutDates])

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      {/* 月移動ヘッダー */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => changeMonth(-1)}
          className="p-2 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="前月"
        >
          &lt;
        </button>
        <h2 className="font-bold text-lg text-slate-800">
          {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
        </h2>
        <button
          onClick={() => changeMonth(1)}
          className="p-2 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="次月"
        >
          &gt;
        </button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
        {['日', '月', '火', '水', '木', '金', '土'].map(day => (
          <div key={day} className="font-semibold text-slate-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* カレンダーグリッド */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => (
          <CalendarDay
            key={`${currentDate.getFullYear()}-${currentDate.getMonth()}-${index}`}
            day={day}
            currentMonth={currentDate.getMonth()}
            hasWorkout={
              day ? workoutDateSet.has(formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))) : false
            }
            onDateClick={onDateClick}
            currentDate={currentDate}
          />
        ))}
      </div>
    </div>
  )
}
