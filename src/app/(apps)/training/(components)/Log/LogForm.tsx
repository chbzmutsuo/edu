'use client'

import React, {useState, useMemo, useEffect, useRef} from 'react'
import {ExerciseMaster, WorkoutLogWithMaster, WorkoutLogInput} from '../../types/training'
import {PerformanceChart} from './PerformanceChart'

interface LogFormProps {
  masters: ExerciseMaster[]
  logList: WorkoutLogWithMaster[]
  editingLog: WorkoutLogWithMaster | null
  onSave: (data: WorkoutLogInput & {date: Date}) => void
  onCancel: () => void
}

export function LogForm({masters, logList, editingLog, onSave, onCancel}: LogFormProps) {
  const [part, setPart] = useState('')
  const [exerciseId, setExerciseId] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [strength, setStrength] = useState('')
  const [reps, setReps] = useState('')
  const [showResults, setShowResults] = useState(false)
  const searchWrapperRef = useRef<HTMLDivElement>(null)

  // 編集時は初期値を設定
  useEffect(() => {
    if (editingLog) {
      const exercise = editingLog.ExerciseMaster
      setPart(exercise.part)
      setExerciseId(exercise.id.toString())
      setSearchTerm(exercise.name)
      setStrength(editingLog.strength.toString())
      setReps(editingLog.reps.toString())
    }
  }, [editingLog])

  // 種目検索結果をフィルタリング
  const filteredExercises = useMemo(() => {
    let results = masters
    if (part) results = results.filter(m => m.part === part)
    if (searchTerm) results = results.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()))
    return results
  }, [part, searchTerm, masters])

  // 外部クリックで検索結果を閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 種目選択処理
  const handleSelectExercise = (exercise: ExerciseMaster) => {
    setExerciseId(exercise.id.toString())
    setSearchTerm(exercise.name)
    setPart(exercise.part)
    setShowResults(false)
  }

  // フォーム送信処理
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!exerciseId || strength === '' || reps === '') {
      alert('すべての項目を入力してください。')
      return
    }

    const logData: WorkoutLogInput & {date: Date} = {
      exerciseId: parseInt(exerciseId),
      strength: parseFloat(strength),
      reps: parseInt(reps),
      date: editingLog ? new Date(editingLog.date) : new Date(),
    }

    onSave(logData)
  }

  // 選択された種目の単位を取得
  const selectedUnit = masters.find(m => m.id === parseInt(exerciseId))?.unit || 'kg'

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="font-bold text-lg text-center mb-4">{editingLog ? '記録を編集' : '記録を追加'}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 部位・種目選択 */}
        <div className="grid grid-cols-5 gap-2">
          <div className="col-span-2">
            <label htmlFor="part" className="block text-sm font-medium text-slate-700">
              部位
            </label>
            <select
              id="part"
              value={part}
              onChange={e => setPart(e.target.value)}
              className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">すべて</option>
              {[...new Set(masters.map(m => m.part))].map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="relative col-span-3" ref={searchWrapperRef}>
            <label htmlFor="exercise-search" className="block text-sm font-medium text-slate-700">
              種目検索
            </label>
            <input
              id="exercise-search"
              type="text"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value)
                setExerciseId('')
                setShowResults(true)
              }}
              onFocus={() => setShowResults(true)}
              placeholder="例: ベンチプレス"
              autoComplete="off"
              className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />

            {/* 検索結果ドロップダウン */}
            {showResults && (
              <ul className="absolute z-10 w-full bg-white border border-slate-300 rounded-md mt-1 max-h-48 overflow-y-auto shadow-lg">
                {filteredExercises.length > 0 ? (
                  filteredExercises.map(ex => (
                    <li
                      key={ex.id}
                      onClick={() => handleSelectExercise(ex)}
                      className="px-4 py-2 hover:bg-slate-100 cursor-pointer"
                    >
                      {ex.name} <span className="text-xs text-slate-400">({ex.part})</span>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-2 text-slate-500">見つかりません</li>
                )}
              </ul>
            )}
          </div>
        </div>

        {/* パフォーマンス指標表示 */}
        {exerciseId && <PerformanceChart exerciseId={parseInt(exerciseId)} logList={logList} unit={selectedUnit} />}

        {/* 強度・回数入力 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="strength" className="block text-sm font-medium text-slate-700">
              強度 ({selectedUnit})
            </label>
            <input
              type="number"
              id="strength"
              value={strength}
              onChange={e => setStrength(e.target.value)}
              disabled={!exerciseId}
              step="0.5"
              min="0"
              className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100"
            />
          </div>

          <div>
            <label htmlFor="reps" className="block text-sm font-medium text-slate-700">
              回数
            </label>
            <input
              type="number"
              id="reps"
              value={reps}
              onChange={e => setReps(e.target.value)}
              disabled={!exerciseId}
              min="1"
              className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100"
            />
          </div>
        </div>

        {/* ボタン */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="w-full bg-slate-200 text-slate-800 font-bold py-3 rounded-lg hover:bg-slate-300 transition-colors"
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            保存
          </button>
        </div>
      </form>
    </div>
  )
}
