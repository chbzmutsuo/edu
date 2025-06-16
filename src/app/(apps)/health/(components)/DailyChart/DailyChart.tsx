'use client'

import React from 'react'
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
  BarChart,
  Bar,
  Cell,
} from 'recharts'
import {
  HEALTH_CATEGORIES,
  HEALTH_CATEGORY_CHART_HEIGHT_VALUE,
  HEALTH_CATEGORY_COLORS,
  HealthCategory,
} from '../../(constants)/types'
import {DAILY_CHART_HEIGHT, DAILY_CHART_MARGIN} from '@app/(apps)/health/(components)/DailyChart/constants'
import {C_Stack, R_Stack} from '@components/styles/common-components/common-components'

// 血糖値帯域定義
const BLOOD_SUGAR_ZONES = [
  {min: 0, max: 70, label: '危険', color: 'rgba(239, 68, 68, 0.4)'}, // 赤系
  {min: 70, max: 100, label: '要注意', color: 'rgba(251, 146, 60, 0.4)'}, // 橙系
  {min: 100, max: 150, label: '安定', color: 'rgba(34, 197, 94, 0.4)'}, // 緑系
  {min: 150, max: 250, label: '要観察', color: 'rgba(250, 204, 21, 0.4)'}, // 黄系
  {min: 250, max: 400, label: '要注意', color: 'rgba(251, 146, 60, 0.4)'}, // 橙系
  {min: 400, max: 500, label: '危険', color: 'rgba(239, 68, 68, 0.4)'}, // 赤系
]

interface DailyChartProps {
  records: any[]
  selectedDate: string
}

export default function DailyChart({records, selectedDate}: DailyChartProps) {
  // 時刻でソートされた全記録
  const sortedRecords = records.sort((a, b) => a.recordTime.localeCompare(b.recordTime))

  // 7:00〜翌7:00の時間軸を30分刻みで生成
  const generateTimeLabels = () => {
    const timeLabels: string[] = []
    for (let hour = 7; hour < 31; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const actualHour = hour >= 24 ? hour - 24 : hour
        const timeStr = `${actualHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        timeLabels.push(timeStr)
      }
    }
    // 最後に翌日7:00を追加
    timeLabels.push('07:00')
    return timeLabels
  }

  const timeLabels = generateTimeLabels()

  // Rechartsのデータ形式に変換
  const chartData = timeLabels.map(time => {
    const dataPoint: any = {
      time,
      bloodSugar: null,
      urine: null,
      stool: null,
      meal: null,
      snack: null,
      medicine: null,
    }

    // 該当時刻の記録を検索
    const recordsAtTime = sortedRecords.filter(record => {
      const recordTime = record.recordTime
      const currentIndex = timeLabels.indexOf(time)
      const prevTime = timeLabels[currentIndex - 1] || timeLabels[timeLabels.length - 1]
      return recordTime > prevTime && recordTime <= time
    })

    recordsAtTime.forEach(record => {
      switch (record.category) {
        case 'blood_sugar':
          dataPoint.bloodSugar = record.bloodSugarValue
          dataPoint.bloodSugarRecord = record
          break
        case 'urine':
          dataPoint.urine = HEALTH_CATEGORY_CHART_HEIGHT_VALUE[HEALTH_CATEGORIES.URINE]
          dataPoint.urineRecord = record
          break
        case 'stool':
          dataPoint.stool = HEALTH_CATEGORY_CHART_HEIGHT_VALUE[HEALTH_CATEGORIES.STOOL]
          dataPoint.stoolRecord = record
          break
        case 'meal':
          dataPoint.meal = HEALTH_CATEGORY_CHART_HEIGHT_VALUE[HEALTH_CATEGORIES.MEAL]
          dataPoint.mealRecord = record
          break
        case 'snack':
          dataPoint.snack = HEALTH_CATEGORY_CHART_HEIGHT_VALUE[HEALTH_CATEGORIES.SNACK]
          dataPoint.snackRecord = record
          break
        case 'medicine':
          dataPoint.medicine = HEALTH_CATEGORY_CHART_HEIGHT_VALUE[HEALTH_CATEGORIES.MEDICINE]
          dataPoint.medicineRecord = record
          break
      }
    })

    return dataPoint
  })

  // 歩行データの棒グラフ用データ
  const walkingRecords = sortedRecords.filter(record => record.category === 'walking')
  const walkingData = [
    {
      name: '短距離',
      value: walkingRecords.reduce((sum, record) => sum + (record.walkingShortDistance || 0), 0),
      color: '#3b82f6',
    },
    {
      name: '中距離',
      value: walkingRecords.reduce((sum, record) => sum + (record.walkingMediumDistance || 0), 0),
      color: '#10b981',
    },
    {
      name: '長距離',
      value: walkingRecords.reduce((sum, record) => sum + (record.walkingLongDistance || 0), 0),
      color: '#f59e0b',
    },
    {
      name: '運動',
      value: walkingRecords.reduce((sum, record) => sum + (record.walkingExercise || 0), 0),
      color: '#ef4444',
    },
  ]

  // カスタムツールチップ
  const CustomTooltip = ({active, payload, label}: any) => {
    if (active && payload && payload.length) {
      const {name: dataLabel, dataKey} = payload[0]

      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          {payload.map((entry: any, index: number) => {
            const record = entry.payload[`${entry.dataKey}Record`]
            let displayText = ''

            switch (entry.dataKey) {
              case 'bloodSugar':
                displayText = `血糖値: ${entry.value} mg/dL`
                break
              case 'medicine': {
                const medicineName = record?.Medicine?.name || '薬'
                const unit = record?.medicineUnit ? ` (${record.medicineUnit}単位)` : ''
                displayText = `薬: ${medicineName}${unit}`
                break
              }
              default: {
                displayText = `${dataLabel}: ${label}`
              }
            }

            return (
              <p key={index} style={{color: entry.color ?? 'black'}}>
                {displayText}
              </p>
            )
          })}
        </div>
      )
    }
    return null
  }

  // 統計情報の計算
  const bloodSugarRecords = sortedRecords.filter(
    record => record.category === 'blood_sugar' && record.bloodSugarValue !== null && record.bloodSugarValue !== undefined
  )

  const stats = {
    bloodSugar:
      bloodSugarRecords.length > 0
        ? {
            max: Math.max(...bloodSugarRecords.map(r => r.bloodSugarValue)),
            min: Math.min(...bloodSugarRecords.map(r => r.bloodSugarValue)),
            avg: Math.round(bloodSugarRecords.reduce((sum, r) => sum + r.bloodSugarValue, 0) / bloodSugarRecords.length),
            count: bloodSugarRecords.length,
          }
        : null,
    categories: {
      urine: sortedRecords.filter(r => r.category === 'urine').length,
      stool: sortedRecords.filter(r => r.category === 'stool').length,
      meal: sortedRecords.filter(r => r.category === 'meal').length,
      snack: sortedRecords.filter(r => r.category === 'snack').length,
      medicine: sortedRecords.filter(r => r.category === 'medicine').length,
    },
  }

  return (
    <div className="space-y-6">
      {/* 統合グラフ */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* グラフエリア */}
          <div className="flex-1 relative" style={{height: DAILY_CHART_HEIGHT}}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                // isAnimationActive={false}
                className="flex-1 relative"
                {...{margin: DAILY_CHART_MARGIN}}
              >
                {/* 背景帯域 */}
                {BLOOD_SUGAR_ZONES.map((zone, index) => (
                  <ReferenceArea key={index} y1={zone.min} y2={zone.max} fill={zone.color} fillOpacity={0.6} />
                ))}

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="time" tick={{fontSize: 12}} interval={1} />

                <YAxis
                  domain={[0, 500]}
                  tick={{fontSize: 12}}
                  tickFormatter={value => {
                    const getValue = (category: HealthCategory) => {
                      return HEALTH_CATEGORY_CHART_HEIGHT_VALUE[category]
                    }
                    if (value === getValue(HEALTH_CATEGORIES.URINE)) return '尿'
                    if (value === getValue(HEALTH_CATEGORIES.STOOL)) return '便'
                    if (value === getValue(HEALTH_CATEGORIES.MEAL)) return '食事'
                    if (value === getValue(HEALTH_CATEGORIES.SNACK)) return '間食'
                    if (value === getValue(HEALTH_CATEGORIES.MEDICINE)) return '薬'
                    if (value % 50 === 0) return `${value} mg/dL`
                    return ''
                  }}
                />
                {/* <Tooltip content={<CustomTooltip />} /> */}
                <Legend
                  formatter={(value, entry) => {
                    const color = HEALTH_CATEGORY_COLORS[entry.dataKey as HealthCategory]
                    return <span style={{color}}>{value}</span>
                  }}
                />

                {/* 血糖値線グラフ */}
                <Line
                  isAnimationActive={false}
                  type="monotone"
                  dataKey="bloodSugar"
                  stroke={HEALTH_CATEGORY_COLORS.blood_sugar}
                  strokeWidth={2}
                  connectNulls={true}
                  dot={({cx, cy, payload, index}) => {
                    if (!payload.bloodSugar) return <g key={index} />
                    return (
                      <g key={index}>
                        <circle
                          cx={cx}
                          cy={cy}
                          r={4}
                          fill={HEALTH_CATEGORY_COLORS.blood_sugar}
                          stroke={HEALTH_CATEGORY_COLORS.blood_sugar}
                          strokeWidth={1}
                        />
                        <text x={cx} y={cy - 10} textAnchor="middle" fill={HEALTH_CATEGORY_COLORS.blood_sugar} fontSize={10}>
                          {payload.bloodSugar}
                        </text>
                      </g>
                    )
                  }}
                  name="血糖値 (mg/dL)"
                />

                {/* 各カテゴリの線グラフ（点のみ表示） */}
                <Line
                  isAnimationActive={false}
                  type="monotone"
                  dataKey="urine"
                  strokeWidth={0}
                  dot={({cx, cy, payload, index}) => {
                    if (!payload.urine || !payload.urineRecord) return <g key={index} />
                    const record = payload.urineRecord
                    const displayText = record.recordTime
                    const color = HEALTH_CATEGORY_COLORS.urine

                    const isOddIndex = index % 2 === 1
                    const yOffset = isOddIndex ? 30 : -5

                    return (
                      <g key={index}>
                        <circle cx={cx} cy={cy} r={5} fill={color} stroke={color} strokeWidth={1} />
                        <rect
                          x={cx - displayText.length * 3 - 3}
                          y={cy - 20 + yOffset}
                          width={displayText.length * 6 + 6}
                          height={16}
                          fill="rgba(255, 255, 255, 0.95)"
                          stroke={color}
                          strokeWidth={1}
                          rx={2}
                        />
                        <text
                          x={cx}
                          y={cy - 12 + yOffset}
                          textAnchor="middle"
                          fontSize="11"
                          fill={color}
                          fontWeight="bold"
                          dominantBaseline="middle"
                        >
                          {displayText}
                        </text>
                      </g>
                    )
                  }}
                  name="尿"
                  connectNulls={false}
                />
                <Line
                  isAnimationActive={false}
                  type="monotone"
                  dataKey="stool"
                  strokeWidth={0}
                  dot={({cx, cy, payload, index}) => {
                    if (!payload.stool || !payload.stoolRecord) return <g key={index} />
                    const record = payload.stoolRecord
                    const displayText = record.recordTime
                    const color = HEALTH_CATEGORY_COLORS.stool

                    const isOddIndex = index % 2 === 1
                    const yOffset = isOddIndex ? 35 : 0

                    return (
                      <g key={index}>
                        <circle cx={cx} cy={cy} r={5} fill={color} stroke={color} strokeWidth={1} />
                        <rect
                          x={cx - displayText.length * 3 - 3}
                          y={cy - 20 + yOffset}
                          width={displayText.length * 6 + 6}
                          height={16}
                          fill="rgba(255, 255, 255, 0.95)"
                          stroke={color}
                          strokeWidth={1}
                          rx={2}
                        />
                        <text
                          x={cx}
                          y={cy - 12 + yOffset}
                          textAnchor="middle"
                          fontSize="11"
                          fill={color}
                          fontWeight="bold"
                          dominantBaseline="middle"
                        >
                          {displayText}
                        </text>
                      </g>
                    )
                  }}
                  name="便"
                  connectNulls={false}
                />
                <Line
                  isAnimationActive={false}
                  type="monotone"
                  dataKey="meal"
                  strokeWidth={0}
                  dot={({cx, cy, payload, index}) => {
                    if (!payload.meal || !payload.mealRecord) return <g key={index} />
                    const record = payload.mealRecord
                    const displayText = record.recordTime
                    const color = HEALTH_CATEGORY_COLORS.meal

                    const isOddIndex = index % 2 === 1
                    const yOffset = isOddIndex ? 40 : 5

                    return (
                      <g key={index}>
                        <circle cx={cx} cy={cy} r={5} fill={color} stroke={color} strokeWidth={1} />
                        <rect
                          x={cx - displayText.length * 3 - 3}
                          y={cy - 20 + yOffset}
                          width={displayText.length * 6 + 6}
                          height={16}
                          fill="rgba(255, 255, 255, 0.95)"
                          stroke={color}
                          strokeWidth={1}
                          rx={2}
                        />
                        <text
                          x={cx}
                          y={cy - 12 + yOffset}
                          textAnchor="middle"
                          fontSize="11"
                          fill={color}
                          fontWeight="bold"
                          dominantBaseline="middle"
                        >
                          {displayText}
                        </text>
                      </g>
                    )
                  }}
                  name="食事"
                  connectNulls={false}
                />
                <Line
                  isAnimationActive={false}
                  type="monotone"
                  dataKey="snack"
                  strokeWidth={0}
                  dot={({cx, cy, payload, index}) => {
                    if (!payload.snack || !payload.snackRecord) return <g key={index} />
                    const record = payload.snackRecord
                    const displayText = record.recordTime
                    const color = HEALTH_CATEGORY_COLORS.snack

                    const isOddIndex = index % 2 === 1
                    const yOffset = isOddIndex ? 40 : 5

                    return (
                      <g key={index}>
                        <circle cx={cx} cy={cy} r={5} fill={color} stroke={color} strokeWidth={1} />
                        <rect
                          x={cx - displayText.length * 3 - 3}
                          y={cy - 20 + yOffset}
                          width={displayText.length * 6 + 6}
                          height={16}
                          fill="rgba(255, 255, 255, 0.95)"
                          stroke={color}
                          strokeWidth={1}
                          rx={2}
                        />
                        <text
                          x={cx}
                          y={cy - 12 + yOffset}
                          textAnchor="middle"
                          fontSize="11"
                          fill={color}
                          fontWeight="bold"
                          dominantBaseline="middle"
                        >
                          {displayText}
                        </text>
                      </g>
                    )
                  }}
                  name="間食"
                  connectNulls={false}
                />
                <Line
                  isAnimationActive={false}
                  type="monotone"
                  dataKey="medicine"
                  strokeWidth={0}
                  dot={({cx, cy, payload, index}) => {
                    if (!payload.medicine || !payload.medicineRecord) return <g key={index} />
                    const record = payload.medicineRecord
                    const medicineName = record.Medicine?.name || '薬'
                    const unit = record.medicineUnit ? ` (${record.medicineUnit}単位)` : ''
                    const displayText = `${medicineName}${unit}`
                    const color = HEALTH_CATEGORY_COLORS.medicine

                    const isOddIndex = index % 2 === 1
                    const yOffset = isOddIndex ? 30 : -5
                    return (
                      <g key={index}>
                        <circle cx={cx} cy={cy} r={5} fill={color} stroke={color} strokeWidth={1} />
                        <rect
                          x={cx - displayText.length * 5 - 3}
                          y={cy - 20 + yOffset}
                          width={displayText.length * 10 + 6}
                          height={16}
                          fill="rgba(255, 255, 255, 0.95)"
                          stroke={color}
                          strokeWidth={1}
                          rx={2}
                        />
                        <text
                          x={cx}
                          y={cy - 12 + yOffset}
                          textAnchor="middle"
                          fontSize="11"
                          fill={color}
                          fontWeight="bold"
                          dominantBaseline="middle"
                        >
                          {displayText}
                        </text>
                      </g>
                    )
                  }}
                  name="薬"
                  connectNulls={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* 血糖値帯域凡例 */}
          <div className="lg:w-32 bg-gray-50 p-3 rounded-lg">
            <h4 className="text-sm font-bold text-gray-800 mb-2">血糖値帯域</h4>
            <div className="flex lg:flex-col lg:space-y-1 space-x-2 lg:space-x-0 overflow-x-auto lg:overflow-x-visible">
              {BLOOD_SUGAR_ZONES.map((zone, index) => (
                <div key={index} className="flex items-center text-xs flex-shrink-0">
                  <div className="w-3 h-3 rounded mr-2" style={{backgroundColor: zone.color.replace('0.25', '0.8')}} />
                  <div className="whitespace-nowrap">
                    <div className="font-medium">{zone.label}</div>
                    <div className="text-gray-600">
                      {zone.min}-{zone.max}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 統計情報 */}
        <R_Stack className="mt-6 gap-0">
          <section className={`w-1/2 p-2`}>
            <C_Stack>
              {/* 血糖値統計 */}
              {stats.bloodSugar && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-bold text-gray-800 mb-2">血糖値統計</h4>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-sm text-gray-600">最高値</div>
                      <div className="text-lg font-bold" style={{color: HEALTH_CATEGORY_COLORS.blood_sugar}}>
                        {stats.bloodSugar.max} mg/dL
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">平均値</div>
                      <div className="text-lg font-bold" style={{color: HEALTH_CATEGORY_COLORS.blood_sugar}}>
                        {stats.bloodSugar.avg} mg/dL
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">最低値</div>
                      <div className="text-lg font-bold" style={{color: HEALTH_CATEGORY_COLORS.blood_sugar}}>
                        {stats.bloodSugar.min} mg/dL
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">測定回数</div>
                      <div className="text-lg font-bold" style={{color: HEALTH_CATEGORY_COLORS.blood_sugar}}>
                        {stats.bloodSugar.count}回
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 記録回数統計 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-bold text-gray-800 mb-2">記録回数</h4>
                <div className="grid grid-cols-5 gap-4 text-center">
                  <div>
                    <div className="text-sm text-gray-600">尿</div>
                    <div className="text-lg font-bold" style={{color: HEALTH_CATEGORY_COLORS.urine}}>
                      {stats.categories.urine}回
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">便</div>
                    <div className="text-lg font-bold" style={{color: HEALTH_CATEGORY_COLORS.stool}}>
                      {stats.categories.stool}回
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">食事</div>
                    <div className="text-lg font-bold" style={{color: HEALTH_CATEGORY_COLORS.meal}}>
                      {stats.categories.meal}回
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">間食</div>
                    <div className="text-lg font-bold" style={{color: HEALTH_CATEGORY_COLORS.snack}}>
                      {stats.categories.snack}回
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">薬</div>
                    <div className="text-lg font-bold" style={{color: HEALTH_CATEGORY_COLORS.medicine}}>
                      {stats.categories.medicine}回
                    </div>
                  </div>
                </div>
              </div>
            </C_Stack>
          </section>

          <section className={`w-1/2 p-2`}>
            {/* 歩行データ棒グラフ */}
            <div>
              {walkingData.some(item => item.value > 0) && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">歩行データ</h3>
                  <div style={{height: 100}}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={walkingData} margin={{top: 20, right: 30, left: 20, bottom: 5}}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Bar dataKey="value" name="歩数/分">
                          {walkingData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 grid grid-cols-4 gap-4 text-center">
                    {walkingData.map((item, index) => (
                      <div key={index}>
                        <div className="text-sm text-gray-600">{item.name}</div>
                        <div className="text-lg font-bold" style={{color: item.color}}>
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        </R_Stack>
      </div>

      {/* データがない場合のメッセージ */}
      {sortedRecords.length === 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">健康記録グラフ</h3>
          <div className="text-center py-8 text-gray-500">この日の記録がありません</div>
        </div>
      )}
    </div>
  )
}
