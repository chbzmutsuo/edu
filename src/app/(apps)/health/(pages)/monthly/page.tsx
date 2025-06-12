'use client'

import {useState, useEffect} from 'react'
import {DailySummary, HEALTH_CATEGORY_COLORS} from '../../(constants)/types'
import MonthlyChart from '../../(components)/MonthlyChart'
import {doStandardPrisma} from '@lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {getMidnight} from '@class/Days/date-utils/calculations'
import {Days} from '@class/Days/Days'
import useGlobal from '@hooks/globalHooks/useGlobal'
import Link from 'next/link'

// useGlobalの型定義（実際の実装に合わせて調整してください）
interface User {
  id: number
  name: string
}

export default function MonthlyPage() {
  const {session} = useGlobal()
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [summaryData, setSummaryData] = useState<DailySummary[]>([])
  const [loading, setLoading] = useState(false)

  const fetchSummary = async () => {
    if (!session) return

    try {
      setLoading(true)

      // 指定月の開始日と終了日を計算
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0) // 次の月の0日 = 当月の最終日

      // 健康記録を取得
      const result = await doStandardPrisma('healthRecord', 'findMany', {
        where: {
          userId: session.id,
          recordDate: {
            gte: getMidnight(startDate),
            lt: getMidnight(Days.day.add(endDate, 1)), // 翌日の開始時刻まで
          },
        },
        include: {
          Medicine: true,
        },
        orderBy: {
          recordDate: 'asc',
        },
      })

      if (result.success) {
        console.log('取得した健康記録:', result.result.length, '件')
        console.log('サンプル記録:', result.result.slice(0, 3))

        // 日別サマリーを生成
        const summary = generateMonthlySummary(result.result, startDate, endDate)
        console.log('生成されたサマリー:', summary.slice(0, 5))
        setSummaryData(summary)
      } else {
        console.error('記録取得エラー:', result.error)
      }
    } catch (error) {
      console.error('サマリー取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  // 月別サマリー生成ロジック（6:00〜翌6:00基準）
  const generateMonthlySummary = (records: any[], startDate: Date, endDate: Date): DailySummary[] => {
    const summary: DailySummary[] = []

    // 月内の全ての日を生成（日別判定は6:00〜翌6:00）
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]

      // その日の6:00から翌日6:00までのレコードを抽出
      const dayStart = new Date(dateStr + ' 06:00:00')
      const dayEnd = new Date(dayStart)
      dayEnd.setDate(dayEnd.getDate() + 1)

      const dayRecords = records.filter(record => {
        const recordDate = new Date(record.recordDate)
        return recordDate >= dayStart && recordDate < dayEnd
      })

      // 血糖値の統計計算
      const bloodSugarRecords = dayRecords.filter(
        record =>
          record.category === 'blood_sugar' &&
          record.bloodSugarValue !== null &&
          record.bloodSugarValue !== undefined &&
          !isNaN(record.bloodSugarValue)
      )

      const bloodSugarValues = bloodSugarRecords.map(record => Number(record.bloodSugarValue))

      const bloodSugar = {
        max: bloodSugarValues.length > 0 ? Math.max(...bloodSugarValues) : null,
        min: bloodSugarValues.length > 0 ? Math.min(...bloodSugarValues) : null,
        avg:
          bloodSugarValues.length > 0 ? Math.round(bloodSugarValues.reduce((a, b) => a + b, 0) / bloodSugarValues.length) : null,
      }

      // 歩行ポイントの計算（歩行カテゴリのレコードを対象）
      const walkingRecords = dayRecords.filter(record => record.category === 'walking')

      // 各歩行タイプの合計値を計算
      const shortDistanceTotal = walkingRecords.reduce((sum, record) => sum + (Number(record.walkingShortDistance) || 0), 0)
      const mediumDistanceTotal = walkingRecords.reduce((sum, record) => sum + (Number(record.walkingMediumDistance) || 0), 0)
      const longDistanceTotal = walkingRecords.reduce((sum, record) => sum + (Number(record.walkingLongDistance) || 0), 0)
      const exerciseTotal = walkingRecords.reduce((sum, record) => sum + (Number(record.walkingExercise) || 0), 0)

      // ポイント計算（係数を掛ける）
      const walkingPoints = {
        shortDistance: shortDistanceTotal * 0.5,
        mediumDistance: mediumDistanceTotal * 1.0,
        longDistance: longDistanceTotal * 1.5,
        exercise: exerciseTotal * 0.5,
        total: 0,
      }

      // 総ポイント計算
      walkingPoints.total =
        walkingPoints.shortDistance + walkingPoints.mediumDistance + walkingPoints.longDistance + walkingPoints.exercise

      summary.push({
        date: dateStr,
        bloodSugar,
        walkingPoints,
      })

      // 次の日に進む
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return summary
  }

  useEffect(() => {
    fetchSummary()
  }, [session, year, month])

  const getDayOfWeek = (dateStr: string) => {
    const date = new Date(dateStr)
    const days = ['日', '月', '火', '水', '木', '金', '土']
    return days[date.getDay()]
  }

  const getDay = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.getDate()
  }

  const formatValue = (value: number | null) => {
    return value !== null && value !== undefined ? value.toString() : ''
  }

  const formatDecimal = (value: number) => {
    if (value === null || value === undefined || value === 0) return ''
    return value.toFixed(1)
  }

  if (!session) {
    return <div className="p-4 text-center">ログインが必要です</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">月別サマリー</h1>
            <div className="flex gap-2">
              <Link href="/health" className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                ホーム
              </Link>
              <Link href="/health/daily" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                日別画面
              </Link>
            </div>
          </div>

          {/* 年月選択 */}
          <div className="flex gap-4 items-center">
            <label className="text-sm font-medium text-gray-700">年月:</label>
            <select
              value={year}
              onChange={e => setYear(parseInt(e.target.value))}
              className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Array.from({length: 10}, (_, i) => new Date().getFullYear() - 5 + i).map(y => (
                <option key={y} value={y}>
                  {y}年
                </option>
              ))}
            </select>
            <select
              value={month}
              onChange={e => setMonth(parseInt(e.target.value))}
              className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>
                  {m}月
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* グラフ表示 */}
        <MonthlyChart summaryData={summaryData} year={year} month={month} />

        {/* 月別サマリーテーブル */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {year}年{month}月
          </h2>

          {loading ? (
            <div className="text-center py-8">読み込み中...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-2 py-2">日付</th>
                    <th className="border border-gray-300 px-2 py-2"></th>
                    <th className="border border-gray-300 px-2 py-2">日別ページリンク</th>
                    <th className="border border-gray-300 px-2 py-2" style={{color: HEALTH_CATEGORY_COLORS.blood_sugar}}>
                      最高
                    </th>
                    <th className="border border-gray-300 px-2 py-2" style={{color: HEALTH_CATEGORY_COLORS.blood_sugar}}>
                      平均
                    </th>
                    <th className="border border-gray-300 px-2 py-2" style={{color: HEALTH_CATEGORY_COLORS.blood_sugar}}>
                      最低
                    </th>
                    <th className="border border-gray-300 px-2 py-2" style={{color: HEALTH_CATEGORY_COLORS.walking}}>
                      短距離P
                    </th>
                    <th className="border border-gray-300 px-2 py-2" style={{color: HEALTH_CATEGORY_COLORS.walking}}>
                      中距離P
                    </th>
                    <th className="border border-gray-300 px-2 py-2" style={{color: HEALTH_CATEGORY_COLORS.walking}}>
                      長距離P
                    </th>
                    <th className="border border-gray-300 px-2 py-2" style={{color: HEALTH_CATEGORY_COLORS.walking}}>
                      運動P
                    </th>
                    <th className="border border-gray-300 px-2 py-2" style={{color: HEALTH_CATEGORY_COLORS.walking}}>
                      P合計
                    </th>
                  </tr>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-2 py-1 text-xs">月：</th>
                    <th className="border border-gray-300 px-2 py-1 text-xs">
                      {year}年{month}月
                    </th>
                    <th className="border border-gray-300 px-2 py-1 text-xs"></th>
                    <th className="border border-gray-300 px-2 py-1 text-xs" style={{color: HEALTH_CATEGORY_COLORS.blood_sugar}}>
                      血糖値
                    </th>
                    <th className="border border-gray-300 px-2 py-1 text-xs"></th>
                    <th className="border border-gray-300 px-2 py-1 text-xs"></th>
                    <th className="border border-gray-300 px-2 py-1 text-xs" style={{color: HEALTH_CATEGORY_COLORS.walking}}>
                      歩行
                    </th>
                    <th className="border border-gray-300 px-2 py-1 text-xs"></th>
                    <th className="border border-gray-300 px-2 py-1 text-xs"></th>
                    <th className="border border-gray-300 px-2 py-1 text-xs"></th>
                    <th className="border border-gray-300 px-2 py-1 text-xs"></th>
                  </tr>
                </thead>
                <tbody>
                  {summaryData.map(day => (
                    <tr key={day.date} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-2 py-2 text-center">{getDay(day.date)}</td>
                      <td className="border border-gray-300 px-2 py-2 text-center">{getDayOfWeek(day.date)}</td>
                      <td className="border border-gray-300 px-2 py-2 text-center">
                        <Link href={`/health/daily?date=${day.date}`} className="text-blue-600 hover:text-blue-800 underline">
                          リンク
                        </Link>
                      </td>
                      <td
                        className="border border-gray-300 px-2 py-2 text-center"
                        style={{color: HEALTH_CATEGORY_COLORS.blood_sugar}}
                      >
                        {formatValue(day.bloodSugar.max)}
                      </td>
                      <td
                        className="border border-gray-300 px-2 py-2 text-center"
                        style={{color: HEALTH_CATEGORY_COLORS.blood_sugar}}
                      >
                        {formatValue(day.bloodSugar.avg)}
                      </td>
                      <td
                        className="border border-gray-300 px-2 py-2 text-center"
                        style={{color: HEALTH_CATEGORY_COLORS.blood_sugar}}
                      >
                        {formatValue(day.bloodSugar.min)}
                      </td>
                      <td
                        className="border border-gray-300 px-2 py-2 text-center"
                        style={{color: HEALTH_CATEGORY_COLORS.walking}}
                      >
                        {formatDecimal(day.walkingPoints.shortDistance)}
                      </td>
                      <td
                        className="border border-gray-300 px-2 py-2 text-center"
                        style={{color: HEALTH_CATEGORY_COLORS.walking}}
                      >
                        {formatDecimal(day.walkingPoints.mediumDistance)}
                      </td>
                      <td
                        className="border border-gray-300 px-2 py-2 text-center"
                        style={{color: HEALTH_CATEGORY_COLORS.walking}}
                      >
                        {formatDecimal(day.walkingPoints.longDistance)}
                      </td>
                      <td
                        className="border border-gray-300 px-2 py-2 text-center"
                        style={{color: HEALTH_CATEGORY_COLORS.walking}}
                      >
                        {formatDecimal(day.walkingPoints.exercise)}
                      </td>
                      <td
                        className="border border-gray-300 px-2 py-2 text-center"
                        style={{color: HEALTH_CATEGORY_COLORS.walking, fontWeight: 'bold'}}
                      >
                        {formatDecimal(day.walkingPoints.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 font-bold">
                    <td className="border border-gray-300 px-2 py-2 text-center" colSpan={3}>
                      月計
                    </td>
                    <td
                      className="border border-gray-300 px-2 py-2 text-center"
                      style={{color: HEALTH_CATEGORY_COLORS.blood_sugar}}
                    >
                      {summaryData.length > 0
                        ? Math.max(...summaryData.map(d => d.bloodSugar.max).filter(v => v !== null)) || ''
                        : ''}
                    </td>
                    <td
                      className="border border-gray-300 px-2 py-2 text-center"
                      style={{color: HEALTH_CATEGORY_COLORS.blood_sugar}}
                    >
                      {(() => {
                        const validAvgs = summaryData.filter(d => d.bloodSugar.avg !== null)
                        if (validAvgs.length === 0) return ''
                        return Math.round(validAvgs.reduce((sum, d) => sum + (d.bloodSugar.avg || 0), 0) / validAvgs.length)
                      })()}
                    </td>
                    <td
                      className="border border-gray-300 px-2 py-2 text-center"
                      style={{color: HEALTH_CATEGORY_COLORS.blood_sugar}}
                    >
                      {summaryData.length > 0
                        ? Math.min(...summaryData.map(d => d.bloodSugar.min).filter(v => v !== null)) || ''
                        : ''}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center" style={{color: HEALTH_CATEGORY_COLORS.walking}}>
                      {formatDecimal(summaryData.reduce((sum, d) => sum + d.walkingPoints.shortDistance, 0))}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center" style={{color: HEALTH_CATEGORY_COLORS.walking}}>
                      {formatDecimal(summaryData.reduce((sum, d) => sum + d.walkingPoints.mediumDistance, 0))}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center" style={{color: HEALTH_CATEGORY_COLORS.walking}}>
                      {formatDecimal(summaryData.reduce((sum, d) => sum + d.walkingPoints.longDistance, 0))}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center" style={{color: HEALTH_CATEGORY_COLORS.walking}}>
                      {formatDecimal(summaryData.reduce((sum, d) => sum + d.walkingPoints.exercise, 0))}
                    </td>
                    <td
                      className="border border-gray-300 px-2 py-2 text-center"
                      style={{color: HEALTH_CATEGORY_COLORS.walking, fontWeight: 'bold'}}
                    >
                      {formatDecimal(summaryData.reduce((sum, d) => sum + d.walkingPoints.total, 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
