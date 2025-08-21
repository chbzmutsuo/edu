'use client'

import React, {useState, useEffect, useRef, useMemo} from 'react'
import {ExerciseMaster, WorkoutLogWithMaster, WorkoutLogInput} from '../../types/training'
import {PerformanceChart} from './PerformanceChart'
import {toUtc} from '@cm/class/Days/date-utils/calculations'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'

interface LogFormProps {
  masters: ExerciseMaster[]
  logList: WorkoutLogWithMaster[]
  editingLog: WorkoutLogWithMaster | null
  selectedDate: string // 選択された日付を追加
  onSave: (data: WorkoutLogInput & {date: Date}) => void
  onCancel: () => void
}

export function LogForm({masters, logList, editingLog, selectedDate, onSave, onCancel}: LogFormProps) {
  const {session} = useGlobal()
  const userId = session?.id
  const [part, setPart] = useState('')
  const [exerciseId, setExerciseId] = useState('')
  const [strength, setStrength] = useState('')
  const [reps, setReps] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showResults, setShowResults] = useState(false)

  const searchWrapperRef = useRef<HTMLDivElement>(null)

  // 編集中の記録がある場合は初期値を設定
  useEffect(() => {
    if (editingLog) {
      setPart(editingLog.ExerciseMaster.part)
      setExerciseId(editingLog.exerciseId.toString())
      setStrength(editingLog.strength.toString())
      setReps(editingLog.reps.toString())
      setSearchTerm(editingLog.ExerciseMaster.name)
    } else {
      // 新規作成時はリセット
      setPart('')
      setExerciseId('')
      setStrength('')
      setReps('')
      setSearchTerm('')
    }
  }, [editingLog])

  // 選択された種目の単位を取得
  const selectedUnit = useMemo(() => {
    if (!exerciseId) return ''
    const master = masters.find(m => m.id === parseInt(exerciseId))
    return master?.unit || ''
  }, [exerciseId, masters])

  // 部位でフィルタリングされた種目
  const filteredMasters = useMemo(() => {
    let filtered = masters
    if (part) {
      filtered = filtered.filter(m => m.part === part)
    }
    if (searchTerm) {
      filtered = filtered.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()))
    }
    return filtered
  }, [masters, part, searchTerm])

  // 検索結果のクリック処理
  const handleExerciseSelect = (master: ExerciseMaster) => {
    setExerciseId(master.id.toString())
    setSearchTerm(master.name)
    setPart(master.part) // 部位も自動設定
    setShowResults(false)
  }

  // フォーム送信処理
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!exerciseId || !strength || !reps) {
      alert('すべての項目を入力してください')
      return
    }

    const logData: WorkoutLogInput & {date: Date} = {
      exerciseId: parseInt(exerciseId),
      strength: parseFloat(strength),
      reps: parseInt(reps),
      date: editingLog ? editingLog.date : toUtc(new Date(selectedDate + 'T00:00:00Z')),
    }

    onSave(logData)
  }

  // 検索結果の外側をクリックした時にドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // 種目が選択されていない場合のメッセージ
  if (masters.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="font-bold text-lg text-center mb-4">記録を追加</h2>
        <div className="text-center py-8">
          <p className="text-slate-500 mb-4">種目マスタが登録されていません。</p>
          <p className="text-slate-500 mb-6">まずは種目マスタで種目を登録してください。</p>
          <button
            onClick={onCancel}
            className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            戻る
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="font-bold text-lg text-center mb-4">
        {editingLog ? '記録を編集' : '記録を追加'} - {selectedDate}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 部位・種目選択 */}
        <div className="grid grid-cols-4 gap-4">
          <div>
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
              種目
            </label>
            <input
              type="text"
              id="exercise-search"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value)
                setExerciseId('')
                setShowResults(true)
              }}
              onFocus={() => {
                if (masters.length > 0) {
                  setShowResults(true)
                }
              }}
              onBlur={() => {
                // 少し遅延させてドロップダウンのクリックイベントを処理
                setTimeout(() => setShowResults(false), 150)
              }}
              placeholder="種目名を入力またはクリックして選択..."
              className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />

            {/* 検索結果ドロップダウン */}
            {showResults && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {filteredMasters.length > 0 ? (
                  filteredMasters.map(master => (
                    <button
                      key={master.id}
                      type="button"
                      onClick={() => handleExerciseSelect(master)}
                      className="w-full text-left px-3 py-2 hover:bg-slate-100 focus:bg-slate-100 focus:outline-none"
                    >
                      <div className="font-medium text-slate-800">{master.name}</div>
                      <div className="text-sm text-slate-500">
                        {master.part} - {master.unit}
                      </div>
                    </button>
                  ))
                ) : searchTerm ? (
                  <div className="p-3 text-center">
                    <p className="text-sm text-slate-500">該当する種目が見つかりません</p>
                  </div>
                ) : (
                  <div className="p-3 text-center">
                    <p className="text-sm text-slate-500">種目を入力するか、部位を選択してください</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* パフォーマンス指標表示 */}
        {exerciseId && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-200 pb-2">📊 過去のパフォーマンス指標</h3>
            <PerformanceChart
              {...{
                unit: selectedUnit,
                exerciseId: parseInt(exerciseId),
                userId,
                // logList,
              }}
            />
          </div>
        )}

        {/* 種目が選択されていない場合の注意メッセージ */}
        {!exerciseId && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              💡 種目を選択すると、過去のパフォーマンス指標と強度・回数を入力できるようになります
            </p>
          </div>
        )}

        {/* 強度・回数入力 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="strength" className="block text-sm font-medium text-slate-700">
              強度 {selectedUnit && `(${selectedUnit})`}
            </label>
            <input
              type="number"
              id="strength"
              value={strength}
              onChange={e => setStrength(e.target.value)}
              disabled={!exerciseId}
              step="0.5"
              min="0"
              required
              placeholder={!exerciseId ? '種目を選択してください' : ''}
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
              required
              placeholder={!exerciseId ? '種目を選択してください' : ''}
              className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100"
            />
          </div>
        </div>

        {/* 種目が選択されていない場合の注意メッセージ */}
        {!exerciseId && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">💡 種目を選択すると、強度と回数を入力できるようになります</p>
          </div>
        )}

        {/* ボタン */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="w-full bg-slate-200 text-slate-800 font-bold py-3 rounded-lg hover:bg-slate-300 transition-colors"
          >
            戻る
          </button>
          <button
            type="submit"
            disabled={!exerciseId || !strength || !reps}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editingLog ? '更新' : '保存'}
          </button>
        </div>

        {/* 保存ボタンが無効な場合の説明 */}
        {(!exerciseId || !strength || !reps) && (
          <div className="text-center">
            <p className="text-sm text-slate-500">
              {!exerciseId && '種目を選択してください'}
              {exerciseId && !strength && '強度を入力してください'}
              {exerciseId && strength && !reps && '回数を入力してください'}
            </p>
          </div>
        )}
      </form>
    </div>
  )
}
