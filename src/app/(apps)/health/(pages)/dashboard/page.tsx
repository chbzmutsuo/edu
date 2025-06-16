'use client'
import {useState, useEffect} from 'react'
import {HEALTH_CATEGORY_LABELS, HEALTH_CATEGORY_COLORS} from '../../(constants)/types'
import {doStandardPrisma} from '@lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import useGlobal from '@hooks/globalHooks/useGlobal'
import {formatDate} from '@class/Days/date-utils/formatters'
import {getMidnight} from '@class/Days/date-utils/calculations'
import {Days} from '@class/Days/Days'
import {HealthRecord, Medicine} from '@prisma/client'
import Link from 'next/link'

export default function HealthHomePage() {
  const {session} = useGlobal()
  const [todayStats, setTodayStats] = useState({
    totalRecords: 0,
    categories: {} as Record<string, number>,
  })
  const [recentRecords, setRecentRecords] = useState<
    (HealthRecord & {
      Medicine: Medicine
    })[]
  >([])
  const [isSeeding, setIsSeeding] = useState(false)

  useEffect(() => {
    if (session?.id) {
      fetchTodayStats()
      fetchRecentRecords()
    }
  }, [session])

  const fetchTodayStats = async () => {
    try {
      const today = new Date()
      // 今日の7:00から翌日の7:00までの範囲
      const baseDate = getMidnight(today)
      const startDate = Days.hour.add(baseDate, 7)
      const endDate = Days.hour.add(startDate, 24)

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
      })

      if (result.success) {
        const records = result.result
        const categoryCount = {}

        records.forEach(record => {
          categoryCount[record.category] = (categoryCount[record.category] || 0) + 1
        })

        setTodayStats({
          totalRecords: records.length,
          categories: categoryCount,
        })
      }
    } catch (error) {
      console.error('今日の統計取得エラー:', error)
    }
  }

  const fetchRecentRecords = async () => {
    try {
      const result = await doStandardPrisma('healthRecord', 'findMany', {
        where: {
          userId: session.id,
        },
        include: {
          Medicine: true,
        },
        orderBy: {
          recordDate: 'desc',
        },
        take: 5,
      })

      if (result.success) {
        setRecentRecords(result.result)
      }
    } catch (error) {
      console.error('最近の記録取得エラー:', error)
    }
  }

  const handleSeedData = async () => {
    if (!session?.id) return

    setIsSeeding(true)
    try {
      const response = await fetch('/health/api/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.id,
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert(`シーディング完了: ${result.count}件のレコードを作成しました`)
        // データを再取得
        await fetchTodayStats()
        await fetchRecentRecords()
      } else {
        alert(`シーディングエラー: ${result.error}`)
      }
    } catch (error) {
      console.error('シーディングエラー:', error)
      alert('シーディングに失敗しました')
    } finally {
      setIsSeeding(false)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">健康管理アプリ</h1>
          <p className="text-gray-600">ログインが必要です</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">健康管理アプリ</h1>
              <p className="text-gray-600 mt-1">ようこそ、{session.name || 'ユーザー'}さん</p>
            </div>
            <div className="flex gap-3">
              <Link href="/health/daily" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                📅 日別記録
              </Link>
              <Link
                href="/health/monthly"
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                📊 月別サマリー
              </Link>
              <button
                onClick={handleSeedData}
                disabled={isSeeding}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:bg-gray-400"
              >
                {isSeeding ? '🔄 実行中...' : '🌱 サンプルデータ作成'}
              </button>
            </div>
          </div>
        </div>

        {/* 今日の統計 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📈 今日の記録数 (7:00〜翌7:00)</h2>
            <div className="text-3xl font-bold text-blue-600">{todayStats.totalRecords}</div>
            <p className="text-gray-600 mt-1">件の記録があります</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📋 カテゴリ別記録数</h2>
            <div className="space-y-2">
              {Object.entries(HEALTH_CATEGORY_LABELS).map(([key, label]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-sm font-medium" style={{color: HEALTH_CATEGORY_COLORS[key]}}>
                    {label}
                  </span>
                  <span className="text-sm text-gray-600">{todayStats.categories[key] || 0}件</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">⚡ クイックアクション</h2>
            <div className="space-y-3">
              <Link
                href="/health/daily"
                className="block w-full px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 text-center font-medium"
              >
                📝 記録を追加
              </Link>
              <Link
                href="/health/daily"
                className="block w-full px-4 py-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100 text-center font-medium"
              >
                📖 今日の記録を見る
              </Link>
              <Link
                href="/health/monthly"
                className="block w-full px-4 py-2 bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 text-center font-medium"
              >
                📊 月別レポート
              </Link>
            </div>
          </div>
        </div>

        {/* 最近の記録 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🕒 最近の記録</h2>

          {recentRecords.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">日付</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">時刻</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">カテゴリ</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">詳細</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRecords.map((record, index) => (
                    <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-3 text-sm">{formatDate(new Date(record.recordDate), 'MM/DD')}</td>
                      <td className="py-2 px-3 text-sm">{record.recordTime}</td>
                      <td className="py-2 px-3">
                        <span
                          className="inline-block px-2 py-1 rounded-full text-xs font-medium text-white"
                          style={{backgroundColor: HEALTH_CATEGORY_COLORS[record.category]}}
                        >
                          {HEALTH_CATEGORY_LABELS[record.category]}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-sm text-gray-600">
                        {record.category === 'blood_sugar' && record.bloodSugarValue && `${record.bloodSugarValue}mg/dL`}
                        {record.category === 'medicine' && record.Medicine?.name}
                        {record.category === 'walking' && '歩行記録'}
                        {(record.category === 'urine' ||
                          record.category === 'stool' ||
                          record.category === 'meal' ||
                          record.category === 'snack') &&
                          '記録済み'}
                        {record.memo && ` (${record.memo.slice(0, 20)}${record.memo.length > 20 ? '...' : ''})`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">まだ記録がありません</div>
          )}

          <div className="mt-4 text-center">
            <Link href="/health/daily" className="text-blue-600 hover:text-blue-800 font-medium">
              すべての記録を見る →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
