'use client'

import {formatDate} from '@cm/class/Days/date-utils/formatters'
import React from 'react'

interface CalendarDayProps {
  day: number | null
  currentMonth: number
  hasWorkout: boolean
  onDateClick: (dateStr: string) => void
  currentDate: Date
}

export function CalendarDay({day, currentMonth, hasWorkout, onDateClick, currentDate}: CalendarDayProps) {
  // 日付が存在しない場合（前月・次月の空セル）
  if (day === null) {
    return <div className="w-8 h-8" />
  }

  // クリック可能な日付セル
  const handleClick = () => {
    const dateStr = formatDate(new Date(currentDate.getFullYear(), currentMonth, day))
    onDateClick(dateStr)
  }

  return (
    <div className="flex items-center justify-center">
      <button
        onClick={handleClick}
        className={`
          w-8 h-8 rounded-full mx-auto flex items-center justify-center
          transition-all duration-200 cursor-pointer
          ${
            hasWorkout
              ? 'bg-blue-500 text-white font-bold shadow-md hover:bg-blue-600'
              : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900'
          }
        `}
        aria-label={`${currentDate.getFullYear()}年${currentMonth + 1}月${day}日`}
      >
        {day}
      </button>
    </div>
  )
}
