'use client'

import {useState, useEffect} from 'react'
import useGlobal from '@hooks/globalHooks/useGlobal'
import {HOUR_SLOTS, HOUR_SLOT_LABELS, HealthJournal, HealthJournalEntry} from '../../(constants)/types'
import JournalTimelineEntry from './JournalTimelineEntry'
import {
  getOrCreateJournal,
  applyJournalTemplate,
  updateJournal,
  updateJournalEntry,
  getAllHealthRecordsForDate,
} from '../../(lib)/journalActions'
import PlaceHolder from '@components/utils/loader/PlaceHolder'
import {R_Stack} from '@components/styles/common-components/common-components'

import {getMidnight} from '@class/Days/date-utils/calculations'
import {formatDate} from '@class/Days/date-utils/formatters'

export default function JournalPage() {
  const global = useGlobal()
  const {toggleLoad, session, query, addQuery} = global

  const selectedDate = query.date ? query.date : formatDate(getMidnight())
  const setSelectedDate = value => addQuery({date: value})

  const [journal, setJournal] = useState<HealthJournal | null>(null)
  const [loading, setLoading] = useState(false)
  const [goalAndReflection, setGoalAndReflection] = useState('')
  const [originalGoalAndReflection, setOriginalGoalAndReflection] = useState('')
  const [goalHasChanges, setGoalHasChanges] = useState(false)
  const [healthRecords, setHealthRecords] = useState<any[]>([])

  // 指定時間帯の健康記録をフィルタリング
  const getHealthRecordsForHourSlot = (hourSlot: number) => {
    const startHour = hourSlot
    const endHour = hourSlot === 6 ? 7 : (hourSlot + 1) % 24
    const startTime = `${startHour.toString().padStart(2, '0')}:00`
    const endTime = `${endHour.toString().padStart(2, '0')}:00`

    return healthRecords.filter(record => {
      return record.recordTime >= startTime && record.recordTime < endTime
    })
  }

  // 日誌データを取得
  const fetchJournal = async () => {
    if (!session?.id) return

    setLoading(true)
    try {
      // 日誌データと健康記録を並行取得
      const [journalResult, healthRecordsResult] = await Promise.all([
        getOrCreateJournal(session.id, selectedDate),
        getAllHealthRecordsForDate(session.id, selectedDate),
      ])

      if (journalResult.success && journalResult.data) {
        setJournal(journalResult.data)
        const goalText = journalResult.data.goalAndReflection || ''
        setGoalAndReflection(goalText)
        setOriginalGoalAndReflection(goalText)
        setGoalHasChanges(false)
      } else {
        console.error('日誌の取得に失敗しました:', journalResult.error)
      }

      if (healthRecordsResult.success) {
        setHealthRecords(healthRecordsResult.data)
      } else {
        console.error('健康記録の取得に失敗しました:', healthRecordsResult.error)
        setHealthRecords([])
      }
    } catch (error) {
      console.error('データの取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  // テンプレートを適用
  const applyTemplate = async () => {
    if (!journal) return

    setLoading(true)
    try {
      const result = await applyJournalTemplate(journal.id)

      if (result.success) {
        // 日誌データを再取得してエントリを反映
        await fetchJournal()
      } else {
        console.error('テンプレートの適用に失敗しました:', result.error)
      }
    } catch (error) {
      console.error('テンプレートの適用に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  // 目標と振り返りの変更を検知
  const handleGoalAndReflectionChange = (value: string) => {
    setGoalAndReflection(value)
    setGoalHasChanges(value !== originalGoalAndReflection)
  }

  // 目標と振り返りを保存
  const saveGoalAndReflection = async () => {
    if (!journal || !goalHasChanges) return

    try {
      const result = await updateJournal(journal.id, goalAndReflection)

      if (result.success && result.data) {
        setJournal(result.data)
        setOriginalGoalAndReflection(goalAndReflection)
        setGoalHasChanges(false)
      } else {
        console.error('目標と振り返りの保存に失敗しました:', result.error)
      }
    } catch (error) {
      console.error('目標と振り返りの保存に失敗しました:', error)
    }
  }

  // エントリを更新
  const updateEntry = async (entryId: number, comment: string) => {
    if (!journal) return

    try {
      const result = await updateJournalEntry(entryId, comment)

      if (result.success && result.data) {
        // ローカル状態を更新
        const updatedEntries = journal.entries.map(entry => (entry.id === entryId ? result.data : entry))

        setJournal({
          ...journal,
          entries: updatedEntries,
        })
      } else {
        console.error('エントリの更新に失敗しました:', result.error)
      }
    } catch (error) {
      console.error('エントリの更新に失敗しました:', error)
    }
  }

  useEffect(() => {
    fetchJournal()
  }, [selectedDate, session?.id])

  if (!session?.id) {
    return <div className="p-4">ログインが必要です</div>
  }

  if (loading) {
    return (
      <div className="p-4">
        <PlaceHolder />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* ヘッダー */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">健康日誌</h1>
        <R_Stack className={` justify-between`}>
          {/* 日付選択 */}
          <div>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* テンプレート適用ボタン */}
          <div>
            {journal && !journal.templateApplied && (
              <button
                onClick={applyTemplate}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? '適用中...' : 'テンプレート反映'}
              </button>
            )}
          </div>
        </R_Stack>
      </div>

      {/* データがない場合 */}
      {journal && !journal.templateApplied ? (
        <>
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600 mb-4">この日の日誌はまだ作成されていません。</p>
            <p className="text-sm text-gray-500">「テンプレート反映」ボタンを押して、24時間分の入力枠を作成してください。</p>
          </div>
        </>
      ) : (
        <>
          {/* 目標と振り返り */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">目標と振り返り</h2>
            <textarea
              value={goalAndReflection}
              onChange={e => handleGoalAndReflectionChange(e.target.value)}
              placeholder="今日の目標や振り返りを記入してください..."
              className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
            {goalHasChanges && (
              <div className="flex justify-end mt-3">
                <button
                  onClick={saveGoalAndReflection}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                >
                  確定
                </button>
              </div>
            )}
          </div>

          {/* タイムライン */}
          {journal?.templateApplied && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">タイムライン</h2>

              {HOUR_SLOTS.map(hourSlot => {
                const entry = journal.entries.find(e => e.hourSlot === hourSlot)
                const hourHealthRecords = getHealthRecordsForHourSlot(hourSlot)
                return (
                  <JournalTimelineEntry
                    key={hourSlot}
                    hourSlot={hourSlot}
                    entry={entry}
                    journalDate={selectedDate}
                    userId={session.id}
                    healthRecords={hourHealthRecords}
                    onUpdateEntry={updateEntry}
                  />
                )
              })}
            </div>
          )}

          {/* データがない場合 */}
          {journal && !journal.templateApplied && (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-600 mb-4">この日の日誌はまだ作成されていません。</p>
              <p className="text-sm text-gray-500">「テンプレート反映」ボタンを押して、24時間分の入力枠を作成してください。</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
