'use client'

import React, {useMemo} from 'react'
import {WorkoutLogWithMaster} from '../../types/training'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

interface PerformanceChartProps {
  exerciseId: number
  logList: WorkoutLogWithMaster[]
  unit: string
}

export function PerformanceChart({exerciseId, logList, unit}: PerformanceChartProps) {
  // 選択された種目の記録のみをフィルタリング
  const exerciselogList = useMemo(() => {
    return logList.filter(log => log.exercise_id === exerciseId)
  }, [logList, exerciseId])

  // パフォーマンス指標を計算
  const metrics = useMemo(() => {
    if (exerciselogList.length === 0) return null

    // 最高強度
    const maxStrength = Math.max(...exerciselogList.map(log => log.strength))

    // 最高回数
    const maxReps = Math.max(...exerciselogList.map(log => log.reps))

    // 最高ボリューム
    const maxVolume = Math.max(...exerciselogList.map(log => log.strength * log.reps))

    // 推定1RM（Epley式）
    const estimated1RM = Math.max(...exerciselogList.map(log => log.strength * (1 + log.reps / 30)))

    // 過去1ヶ月の平均
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    const recentlogList = exerciselogList.filter(log => new Date(log.date) >= oneMonthAgo)

    const monthlyAvg =
      recentlogList.length > 0
        ? {
            strength: recentlogList.reduce((sum, log) => sum + log.strength, 0) / recentlogList.length,
            reps: recentlogList.reduce((sum, log) => sum + log.reps, 0) / recentlogList.length,
          }
        : null

    // 過去3ヶ月の週間推移
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
    const threeMonthlogList = exerciselogList.filter(log => new Date(log.date) >= threeMonthsAgo)

    const weeklyProgress = threeMonthlogList.reduce(
      (acc, log) => {
        const weekId = getWeekId(new Date(log.date))
        if (!acc[weekId] || log.strength > acc[weekId]) {
          acc[weekId] = log.strength
        }
        return acc
      },
      {} as Record<string, number>
    )

    const weeklyData = Object.entries(weeklyProgress)
      .map(([week, maxStrength]) => ({
        label: formatDate(new Date(week), 'MM/DD'),
        value: maxStrength,
      }))
      .sort((a, b) => new Date(a.label) - new Date(b.label))

    return {
      maxStrength,
      maxReps,
      maxVolume,
      estimated1RM,
      monthlyAvg,
      weeklyData,
    }
  }, [exerciselogList])

  if (!metrics) return null

  return (
    <div className="p-3 bg-slate-100 rounded-lg space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-center mb-2 text-slate-700">過去のパフォーマンス</h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white p-2 rounded">
            <p className="text-xs text-slate-500">最高強度</p>
            <p className="font-bold">
              {metrics.maxStrength}
              {unit}
            </p>
          </div>
          <div className="bg-white p-2 rounded">
            <p className="text-xs text-slate-500">最高回数</p>
            <p className="font-bold">{metrics.maxReps}回</p>
          </div>
          <div className="bg-white p-2 rounded">
            <p className="text-xs text-slate-500">最高Volume</p>
            <p className="font-bold">{metrics.maxVolume.toLocaleString()}</p>
          </div>
          <div className="bg-white p-2 rounded">
            <p className="text-xs text-slate-500">月間平均強度</p>
            <p className="font-bold">{metrics.monthlyAvg ? `${metrics.monthlyAvg.strength.toFixed(1)}${unit}` : '-'}</p>
          </div>
          <div className="bg-white p-2 rounded">
            <p className="text-xs text-slate-500">月間平均回数</p>
            <p className="font-bold">{metrics.monthlyAvg ? `${metrics.monthlyAvg.reps.toFixed(1)}回` : '-'}</p>
          </div>
          <div className="bg-white p-2 rounded">
            <p className="text-xs text-slate-500">推定1RM</p>
            <p className="font-bold">
              {metrics.estimated1RM.toFixed(1)}
              {unit}
            </p>
          </div>
        </div>
      </div>

      {/* 週間推移グラフ */}
      {metrics.weeklyData.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-center mb-2 text-slate-700">過去3ヶ月の強度推移 (週ごと)</h3>
          <WeeklyStrengthChart data={metrics.weeklyData} />
        </div>
      )}
    </div>
  )
}

// 週の開始日を取得するヘルパー関数
function getWeekId(date: Date): string {
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  const weekStart = new Date(date)
  weekStart.setDate(diff)
  return formatDate(weekStart)
}

// 週間強度推移の棒グラフ
function WeeklyStrengthChart({data}: {data: Array<{label: string; value: number}>}) {
  if (data.length === 0) return null

  const maxValue = Math.max(...data.map(d => d.value))
  const height = 150
  const margin = {top: 20, right: 0, bottom: 20, left: 25}

  return (
    <div className="w-full h-[150px] bg-white p-2 rounded">
      <svg width="100%" height="100%" viewBox={`0 0 300 ${height}`}>
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Y軸 */}
          <line x1="0" y1="0" x2="0" y2={height - margin.top - margin.bottom} stroke="#cbd5e1" />
          <text x="-5" y="0" dy="0.32em" textAnchor="end" fontSize="10" fill="#64748b">
            {maxValue}
          </text>
          <text x="-5" y={height - margin.top - margin.bottom} dy="0.32em" textAnchor="end" fontSize="10" fill="#64748b">
            0
          </text>

          {/* X軸 */}
          <line
            x1="0"
            y1={height - margin.top - margin.bottom}
            x2={250}
            y2={height - margin.top - margin.bottom}
            stroke="#cbd5e1"
          />

          {/* 棒グラフ */}
          {data.map((d, i) => {
            const barWidth = 250 / data.length
            const barHeight = (d.value / maxValue) * (height - margin.top - margin.bottom)

            return (
              <g key={i} transform={`translate(${i * barWidth}, 0)`}>
                <rect
                  x={barWidth * 0.1}
                  y={height - margin.top - margin.bottom - barHeight}
                  width={barWidth * 0.8}
                  height={barHeight}
                  fill="#3b82f6"
                />
                <text
                  x={barWidth / 2}
                  y={height - margin.top - margin.bottom - barHeight - 5}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#475569"
                >
                  {d.value}
                </text>
                <text
                  x={barWidth / 2}
                  y={height - margin.top - margin.bottom + 15}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#64748b"
                >
                  {d.label}
                </text>
              </g>
            )
          })}
        </g>
      </svg>
    </div>
  )
}
