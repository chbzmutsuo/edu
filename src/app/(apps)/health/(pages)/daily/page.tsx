'use client'

import {useState, useEffect} from 'react'
import HealthRecordForm from '../HealthRecordForm'
import DailyRecords from '../DailyRecords'
import DailyChart from '../../(components)/DailyChart/DailyChart'
import {HealthRecordFormData} from '../../(constants)/types'
import {doStandardPrisma} from '@lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {getMidnight} from '@class/Days/date-utils/calculations'
import {Days} from '@class/Days/Days'
import {toastByResult} from '@lib/ui/notifications'
import useGlobal from '@hooks/globalHooks/useGlobal'
import {formatDate} from '@class/Days/date-utils/formatters'
import useModal from '@components/utils/modal/useModal'
import Link from 'next/link'

// useGlobalの型定義（実際の実装に合わせて調整してください）
interface User {
  id: number
  name: string
}

export default function HealthPage() {
  const {session, query, addQuery} = useGlobal()

  // const [selectedDate, setSelectedDate] = useState(formatDate(new Date()))

  const selectedDate = query.date ? query.date : formatDate(getMidnight())

  const setSelectedDate = value => addQuery({date: value})

  const {open: showForm, setopen: setShowForm, Modal} = useModal()
  const [editingRecord, setEditingRecord] = useState<any>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [records, setRecords] = useState<any[]>([])

  // // URLパラメータから日付を取得
  // useEffect(() => {
  //   const dateParam = query.date
  //   if (dateParam) {
  //     setSelectedDate(dateParam)
  //   }
  // }, [query])

  // 日別レコードを取得（6:00〜翌6:00）
  const fetchDailyRecords = async () => {
    if (!session?.id) return

    try {
      // 指定日の00:00（日本時間）をUTC（15:00）で取得
      const startDate = getMidnight(new Date(selectedDate))
      // 翌日の00:00（日本時間）をUTC（15:00）で取得
      const endDate = Days.day.add(startDate, 1)

      const result = await doStandardPrisma('healthRecord', 'findMany', {
        where: {
          userId: session.id,
          recordDate: {
            gte: startDate,
            lt: endDate,
          },
        },
        include: {
          Medicine: true,
        },
        orderBy: {
          recordTime: 'asc',
        },
      })

      if (result.success) {
        setRecords(result.result)
      }
    } catch (error) {
      console.error('レコード取得エラー:', error)
    }
  }

  useEffect(() => {
    fetchDailyRecords()
  }, [session, selectedDate, refreshTrigger])

  const handleFormSubmit = async (data: HealthRecordFormData) => {
    const {recordDate, recordTime, ...rest} = data

    const recordDateISO = getMidnight(new Date(recordDate))

    const payload = {
      userId: session.id,
      recordDate: recordDateISO,
      recordTime,
      ...rest,
    }

    try {
      const result = await doStandardPrisma('healthRecord', 'upsert', {
        where: {
          id: editingRecord?.id || 0,
        },
        create: payload,
        update: payload,
      })

      toastByResult(result)

      // フォームを閉じて、一覧を更新
      setShowForm(false)
      setEditingRecord(null)
      setRefreshTrigger(prev => prev + 1)
    } catch (error) {
      console.error('送信エラー:', error)
      alert('エラーが発生しました')
    }
  }

  const handleBulkFormSubmit = async (dataArray: HealthRecordFormData[]) => {
    try {
      const results: any[] = []

      for (const data of dataArray) {
        const {recordDate, recordTime, ...rest} = data
        const recordDateISO = getMidnight(new Date(recordDate))

        const payload = {
          userId: session.id,
          recordDate: recordDateISO,
          recordTime,
          ...rest,
        }

        const result = await doStandardPrisma('healthRecord', 'create', {
          data: payload,
        })

        results.push(result)
      }

      // すべて成功した場合
      if (results.every((r: any) => r.success)) {
        alert(`${dataArray.length}件の記録を登録しました`)
        setShowForm(false)
        setRefreshTrigger(prev => prev + 1)
      } else {
        const successCount = results.filter((r: any) => r.success).length
        alert(`${successCount}/${dataArray.length}件の記録を登録しました（一部失敗）`)
        setRefreshTrigger(prev => prev + 1)
      }
    } catch (error) {
      console.error('一括送信エラー:', error)
      alert('エラーが発生しました')
    }
  }

  const handleEdit = (record: any) => {
    setEditingRecord(record)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('この記録を削除しますか？')) {
      return
    }

    try {
      const result = await doStandardPrisma('healthRecord', 'delete', {
        where: {id},
      })

      if (result.success) {
        alert('記録を削除しました')
        setRefreshTrigger(prev => prev + 1)
      } else {
        alert('削除に失敗しました')
      }
    } catch (error) {
      console.error('削除エラー:', error)
      alert('エラーが発生しました')
    }
  }

  const handleNewRecord = () => {
    setEditingRecord(null)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingRecord(null)
  }

  if (!session) {
    return <div className="p-4 text-center">ログインが必要です</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-[1200px] mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">健康記録 - {formatDate(selectedDate)} 6:00〜翌6:00</h1>
            <div className="flex gap-2">
              <Link href="/health" className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                ホーム
              </Link>
              <Link href="/health/monthly" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                月別画面
              </Link>
            </div>
          </div>

          {/* 日付選択 */}
          <div className="flex gap-4 items-center">
            <label className="text-sm font-medium text-gray-700">表示日:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button onClick={handleNewRecord} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              新規登録
            </button>
          </div>
        </div>

        {/* フォーム */}
        <Modal>
          <HealthRecordForm
            onSubmit={handleFormSubmit}
            onBulkSubmit={handleBulkFormSubmit}
            initialData={
              editingRecord
                ? {
                    category: editingRecord.category,
                    recordDate: formatDate(new Date(editingRecord.recordDate || selectedDate), 'YYYY-MM-DD'),
                    recordTime: editingRecord.recordTime,
                    bloodSugarValue: editingRecord.bloodSugarValue,
                    medicineId: editingRecord.medicineId,
                    medicineUnit: editingRecord.medicineUnit,
                    walkingShortDistance: editingRecord.walkingShortDistance,
                    walkingMediumDistance: editingRecord.walkingMediumDistance,
                    walkingLongDistance: editingRecord.walkingLongDistance,
                    walkingExercise: editingRecord.walkingExercise,
                    memo: editingRecord.memo,
                  }
                : {recordDate: selectedDate}
            }
            isEditing={!!editingRecord}
          />
        </Modal>

        {/* グラフ表示 */}
        <DailyChart records={records} selectedDate={selectedDate} />

        {/* 日別記録一覧 */}
        <DailyRecords
          userId={session.id}
          date={selectedDate}
          records={records}
          onEdit={handleEdit}
          onDelete={handleDelete}
          refreshTrigger={refreshTrigger}
        />
      </div>
    </div>
  )
}
