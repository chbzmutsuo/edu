'use client'

import React, {useMemo} from 'react'
import {WorkoutLogWithMaster} from '../../types/training'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import useSWR from 'swr'

import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

interface PerformanceChartProps {
  exerciseId: number
  unit: string
  userId: number
}

export function PerformanceChart({exerciseId, unit, userId}: PerformanceChartProps) {
  // 選択された種目の記録のみをフィルタリング
  const {data: exerciselogList = []} = useSWR(['getWorkoutLogByExercise', exerciseId].join('-'), async () => {
    const {result} = await doStandardPrisma('workoutLog', 'findMany', {
      where: {
        userId,
        exerciseId,
        date: {
          gte: new Date(new Date().setDate(new Date().getDate() - 90)),
        },
      },
    })

    console.log({result}) //logList
    return result
  })

  // パフォーマンス指標を計算
  const metrics = useMemo(() => {
    if (exerciselogList.length === 0) return null

    // 最高強度
    const maxStrength = Math.max(...exerciselogList.map(log => Number(log.strength)))

    // 最高回数
    const maxReps = Math.max(...exerciselogList.map(log => Number(log.reps)))

    // 最高ボリューム
    const maxVolume = Math.max(...exerciselogList.map(log => Number(log.strength) * Number(log.reps)))

    // 推定1RM（Epley式）
    const estimated1RM = Math.max(...exerciselogList.map(log => Number(log.strength) * (1 + Number(log.reps) / 30)))

    // 過去1ヶ月の平均
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    const recentlogList = exerciselogList.filter(log => new Date(log.date) >= oneMonthAgo)

    const monthlyAvg =
      recentlogList.length > 0
        ? {
            strength: recentlogList.reduce((sum, log) => sum + Number(log.strength), 0) / recentlogList.length,
            reps: recentlogList.reduce((sum, log) => sum + Number(log.reps), 0) / recentlogList.length,
          }
        : null

    exerciselogList
      // .filter(log => new Date(log.date) >= threeMonthsAgo)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // 記録ごとの強度推移データ
    // const recordData = threeMonthlogList.map(log => ({
    //   label: formatDate(new Date(log.date), 'MM/DD'),
    //   value: Number(log.strength),
    // }))

    return {
      maxStrength,
      maxReps,
      maxVolume,
      estimated1RM,
      monthlyAvg,
      exerciselogList,
    }
  }, [exerciselogList])

  if (!metrics) return null

  return (
    <div className="space-y-4">
      {/* パフォーマンス指標 (6種) */}
      <div className="p-4 bg-slate-50 rounded-lg">
        <h4 className="text-sm font-semibold text-center mb-3 text-slate-700">パフォーマンス指標</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-3 rounded border">
            <p className="text-xs text-slate-500 mb-1">過去の最高強度</p>
            <p className="font-bold text-lg text-blue-600">
              {metrics.maxStrength.toFixed(1)}
              {unit}
            </p>
          </div>
          <div className="bg-white p-3 rounded border">
            <p className="text-xs text-slate-500 mb-1">過去の最高回数</p>
            <p className="font-bold text-lg text-green-600">{metrics.maxReps}回</p>
          </div>
          <div className="bg-white p-3 rounded border">
            <p className="text-xs text-slate-500 mb-1">最高セットボリューム</p>
            <p className="font-bold text-lg text-purple-600">{metrics.maxVolume.toLocaleString()}</p>
          </div>
          <div className="bg-white p-3 rounded border">
            <p className="text-xs text-slate-500 mb-1">推定1RM (Epley式)</p>
            <p className="font-bold text-lg text-orange-600">
              {metrics.estimated1RM.toFixed(1)}
              {unit}
            </p>
          </div>
          <div className="bg-white p-3 rounded border">
            <p className="text-xs text-slate-500 mb-1">過去1ヶ月の平均強度</p>
            <p className="font-bold text-lg text-indigo-600">
              {metrics.monthlyAvg ? `${metrics.monthlyAvg.strength.toFixed(1)}${unit}` : '-'}
            </p>
          </div>
          <div className="bg-white p-3 rounded border">
            <p className="text-xs text-slate-500 mb-1">過去1ヶ月の平均回数</p>
            <p className="font-bold text-lg text-teal-600">
              {metrics.monthlyAvg ? `${metrics.monthlyAvg.reps.toFixed(1)}回` : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* 強度推移グラフ（記録ごと） */}
      {metrics.exerciselogList.length > 0 && (
        <div className="p-4 bg-slate-50 rounded-lg">
          <h4 className="text-sm font-semibold text-center mb-3 text-slate-700">過去3ヶ月の強度推移（記録ごと）</h4>
          <RecordStrengthChart exerciselogList={metrics.exerciselogList} />
        </div>
      )}
    </div>
  )
}

// 記録ごとの強度推移の棒グラフ
function RecordStrengthChart({exerciselogList}: {exerciselogList: WorkoutLogWithMaster[]}) {
  if (exerciselogList.length === 0) return null

  const maxValue = Math.max(...exerciselogList.map(d => Number(d.strength)))
  const height = 150
  const margin = {top: 20, right: 0, bottom: 20, left: 25}

  // 棒が多すぎる場合は間引き表示
  const maxBars = 20
  let displayData = exerciselogList
  if (exerciselogList.length > maxBars) {
    // 等間隔でmaxBars個だけ表示
    const step = Math.ceil(exerciselogList.length / maxBars)
    displayData = exerciselogList.filter((_, i) => i % step === 0)
    // 最後のデータが含まれていなければ追加
    if (displayData[displayData.length - 1] !== exerciselogList[exerciselogList.length - 1]) {
      displayData.push(exerciselogList[exerciselogList.length - 1])
    }
  }

  return (
    <div className="w-full h-[150px] bg-white p-2 rounded">
      <svg width="100%" height="100%" viewBox={`0 0 300 ${height}`}>
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Y軸（強度/回数の最大値に合わせる） */}
          <line x1="0" y1="0" x2="0" y2={height - margin.top - margin.bottom} stroke="#cbd5e1" />
          <text x="-5" y="0" dy="0.32em" textAnchor="end" fontSize="10" fill="#64748b">
            {Math.max(...displayData.map(d => Number(d.strength)), ...displayData.map(d => Number(d.reps)))}
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

          {/* 棒グラフ（強度: 青, 回数: 緑） */}
          {displayData.map((d, i) => {
            const strengthValue = Number(d.strength)
            const repsValue = Number(d.reps)
            const maxBarValue = Math.max(...displayData.map(d => Number(d.strength)), ...displayData.map(d => Number(d.reps)))
            const barWidth = 250 / displayData.length
            const strengthBarHeight = (strengthValue / maxBarValue) * (height - margin.top - margin.bottom)
            const repsBarHeight = (repsValue / maxBarValue) * (height - margin.top - margin.bottom)

            return (
              <g key={i} transform={`translate(${i * barWidth}, 0)`}>
                {/* 強度（青） */}
                <rect
                  x={barWidth * 0.1}
                  y={height - margin.top - margin.bottom - strengthBarHeight}
                  width={barWidth * 0.35}
                  height={strengthBarHeight}
                  fill="#3b82f6"
                />
                {/* 回数（緑） */}
                <rect
                  x={barWidth * 0.55}
                  y={height - margin.top - margin.bottom - repsBarHeight}
                  width={barWidth * 0.35}
                  height={repsBarHeight}
                  fill="#22c55e"
                />
                {/* 強度数値 */}
                <text
                  x={barWidth * 0.275}
                  y={height - margin.top - margin.bottom - strengthBarHeight - 5}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#2563eb"
                >
                  {strengthValue}
                </text>
                {/* 回数数値 */}
                <text
                  x={barWidth * 0.725}
                  y={height - margin.top - margin.bottom - repsBarHeight - 5}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#16a34a"
                >
                  {repsValue}
                </text>
                {/* 日付ラベル */}
                <text
                  x={barWidth / 2}
                  y={height - margin.top - margin.bottom + 15}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#64748b"
                >
                  {formatDate(d.date, 'MM/DD(ddd)')}
                </text>
              </g>
            )
          })}
          {/* 凡例 */}
          <g>
            <rect x={180} y={-15} width={12} height={12} fill="#3b82f6" />
            <text x={195} y={-5} fontSize="10" fill="#475569">
              強度
            </text>
            <rect x={230} y={-15} width={12} height={12} fill="#22c55e" />
            <text x={245} y={-5} fontSize="10" fill="#475569">
              回数
            </text>
          </g>
        </g>
      </svg>
    </div>
  )
}
