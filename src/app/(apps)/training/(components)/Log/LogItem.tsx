'use client'

import React from 'react'
import {WorkoutLogWithMaster} from '../../types/training'

interface LogItemProps {
  log: WorkoutLogWithMaster
  isPR: boolean
  onEdit: () => void
  onQuickAdd: () => void
  onDelete: () => void
}

export function LogItem({log, isPR, onEdit, onQuickAdd, onDelete}: LogItemProps) {
  return (
    <li className="p-3 bg-slate-50 rounded-lg flex items-center gap-2">
      <div className="flex-1">
        <p className="font-semibold text-slate-800 flex items-center gap-2">
          {log.ExerciseMaster.name}
          {isPR && <span className="text-xs font-bold text-white bg-yellow-500 px-2 py-0.5 rounded-full">PR</span>}
        </p>
        <p className="text-slate-600">
          {log.strength} {log.ExerciseMaster.unit} × {log.reps} 回
        </p>
      </div>

      <div className="flex items-center space-x-2">
        {/* クイック追加ボタン */}
        <button
          onClick={onQuickAdd}
          className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 text-lg font-bold transition-colors"
          title="同じ内容でセットを追加"
          aria-label="セット追加"
        >
          +
        </button>

        {/* 編集ボタン */}
        <button onClick={onEdit} className="text-sm text-blue-600 hover:underline transition-colors">
          編集
        </button>

        {/* 削除ボタン */}
        <button onClick={onDelete} className="text-sm text-red-600 hover:underline transition-colors">
          削除
        </button>
      </div>
    </li>
  )
}
