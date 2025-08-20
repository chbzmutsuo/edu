'use client'

import React, {useMemo} from 'react'
import {WorkoutLogWithMaster} from '../../types/training'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {LogItem} from './LogItem'

interface LogListViewProps {
  selectedDate: string
  logList: WorkoutLogWithMaster[]
  onAdd: () => void
  onEdit: (log: WorkoutLogWithMaster) => void
  onQuickAdd: (log: WorkoutLogWithMaster) => void
  onDelete: (logId: number) => void
  onBack: () => void
  prLogIds: Set<number>
}

export function LogListView({selectedDate, logList, onAdd, onEdit, onQuickAdd, onDelete, onBack, prLogIds}: LogListViewProps) {
  // 記録を部位別にグループ化
  const {groupedlogList, sortedParts, totalVolume} = useMemo(() => {
    if (!logList || logList.length === 0) {
      return {groupedlogList: {}, sortedParts: [], totalVolume: 0}
    }

    const grouped = logList.reduce(
      (acc, log) => {
        const part = log.ExerciseMaster?.part || 'その他'
        if (!acc[part]) acc[part] = []
        acc[part].push(log)
        return acc
      },
      {} as Record<string, WorkoutLogWithMaster[]>
    )

    // 部位の表示順序を定義
    const partOrder = ['胸', '背中', '肩', '腕', '足', '有酸素', 'その他']
    const sorted = Object.keys(grouped).sort((a, b) => partOrder.indexOf(a) - partOrder.indexOf(b))

    // 総ボリュームを計算
    const volume = logList.reduce((sum, log) => sum + log.strength * log.reps, 0)

    return {groupedlogList: grouped, sortedParts: sorted, totalVolume: volume}
  }, [logList])

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-2">
        <button onClick={onBack} className="text-blue-600 hover:underline text-sm">
          &lt; カレンダーへ
        </button>
        <h2 className="font-bold text-lg text-slate-800">{formatDate(new Date(selectedDate), 'MM/DD')}の記録</h2>
        <div className="w-20"></div>
      </div>

      {/* 総ボリューム表示 */}
      <div className="text-center mb-4 p-2 bg-slate-100 rounded-md">
        <p className="text-sm text-slate-600">
          本日の総ボリューム: <span className="font-bold text-lg text-slate-800">{totalVolume.toLocaleString()}</span> kg
        </p>
      </div>

      {/* 記録一覧 */}
      {logList.length === 0 ? (
        <p className="text-slate-500 text-center py-8">この日の記録はありません。</p>
      ) : (
        <div className="space-y-4">
          {sortedParts.map(part => (
            <div key={part}>
              <h3 className="font-bold text-md text-slate-700 border-b-2 border-slate-200 pb-1 mb-2">{part}</h3>
              <ul className="space-y-2">
                {groupedlogList[part].map(log => (
                  <LogItem
                    key={log.id}
                    log={log}
                    isPR={prLogIds.has(log.id)}
                    onEdit={() => onEdit(log)}
                    onQuickAdd={() => onQuickAdd(log)}
                    onDelete={() => onDelete(log.id)}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* 新規記録追加ボタン */}
      <button
        onClick={onAdd}
        className="mt-6 w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors"
      >
        新しい種目を記録する
      </button>
    </div>
  )
}
