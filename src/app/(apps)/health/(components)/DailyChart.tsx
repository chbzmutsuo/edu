'use client'

import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem,
  Plugin,
} from 'chart.js'
import {Line} from 'react-chartjs-2'
import {HEALTH_CATEGORY_COLORS, HEALTH_CATEGORY_LABELS} from '../(constants)/types'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

// 血糖値帯域定義
const BLOOD_SUGAR_ZONES = [
  {min: 0, max: 70, label: '危険', color: 'rgba(239, 68, 68, 0.25)'}, // 赤系
  {min: 70, max: 100, label: '要注意', color: 'rgba(251, 146, 60, 0.25)'}, // 橙系
  {min: 100, max: 150, label: '安定', color: 'rgba(34, 197, 94, 0.25)'}, // 緑系
  {min: 150, max: 250, label: '要観察', color: 'rgba(250, 204, 21, 0.25)'}, // 黄系
  {min: 250, max: 400, label: '要注意', color: 'rgba(251, 146, 60, 0.25)'}, // 橙系
  {min: 400, max: 500, label: '危険', color: 'rgba(239, 68, 68, 0.25)'}, // 赤系
]

interface DailyChartProps {
  records: any[]
  selectedDate: string
}

// 背景帯域描画プラグイン
const backgroundZonesPlugin: Plugin<'line'> = {
  id: 'backgroundZones',
  beforeDraw: chart => {
    const {ctx, chartArea, scales} = chart
    const yScale = scales.y

    if (!yScale || !chartArea) return

    BLOOD_SUGAR_ZONES.forEach(zone => {
      // グラフの範囲（0-500）に収まるように調整
      const adjustedMax = Math.min(zone.max, 500)
      const adjustedMin = Math.max(zone.min, 0)

      const yTop = yScale.getPixelForValue(adjustedMax)
      const yBottom = yScale.getPixelForValue(adjustedMin)

      // グラフエリア内に収まるように境界チェック
      const clippedYTop = Math.max(yTop, chartArea.top)
      const clippedYBottom = Math.min(yBottom, chartArea.bottom)

      ctx.fillStyle = zone.color
      ctx.fillRect(chartArea.left, clippedYTop, chartArea.width, clippedYBottom - clippedYTop)
    })
  },
}

export default function DailyChart({records, selectedDate}: DailyChartProps) {
  // 時刻でソートされた全記録
  const sortedRecords = records.sort((a, b) => a.recordTime.localeCompare(b.recordTime))

  // データラベル描画プラグイン（記録データに基づく）
  const dataLabelsPlugin: Plugin<'line'> = {
    id: 'dataLabels',
    afterDatasetsDraw: (chart, args, options) => {
      const {ctx, chartArea, scales} = chart
      const xScale = scales.x
      const yScale = scales.y

      if (!xScale || !yScale || !chartArea) return

      ctx.save()
      ctx.font = '11px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // 記録データを時刻でグループ化
      const recordsByTime = new Map<string, any[]>()
      sortedRecords.forEach(record => {
        const time = record.recordTime
        if (!recordsByTime.has(time)) {
          recordsByTime.set(time, [])
        }
        recordsByTime.get(time)!.push(record)
      })

      // 各記録にラベルを表示
      recordsByTime.forEach((recordsAtTime, time) => {
        const timeIndex = timeLabels.indexOf(time)
        if (timeIndex === -1) return

        const x = xScale.getPixelForValue(timeIndex)
        if (x < chartArea.left || x > chartArea.right) return

        recordsAtTime.forEach((record, recordIndex) => {
          let y: number
          let labelText: string
          let color: string

          switch (record.category) {
            case 'blood_sugar':
              y = yScale.getPixelForValue(record.bloodSugarValue)
              labelText = `${record.bloodSugarValue}`
              color = HEALTH_CATEGORY_COLORS.blood_sugar
              break
            case 'urine':
              y = yScale.getPixelForValue(460)
              labelText = time
              color = HEALTH_CATEGORY_COLORS.urine
              break
            case 'stool':
              y = yScale.getPixelForValue(440)
              labelText = time
              color = HEALTH_CATEGORY_COLORS.stool
              break
            case 'meal':
              y = yScale.getPixelForValue(420)
              labelText = time
              color = HEALTH_CATEGORY_COLORS.meal
              break
            case 'medicine': {
              y = yScale.getPixelForValue(400)
              const medicineName = record.Medicine?.name || '薬'
              const unit = record.medicineUnit ? ` (${record.medicineUnit}単位)` : ''
              labelText = `${medicineName}${unit}`
              color = HEALTH_CATEGORY_COLORS.medicine
              break
            }
            case 'walking':
              y = yScale.getPixelForValue(380)
              labelText = time
              color = HEALTH_CATEGORY_COLORS.walking
              break
            default:
              return
          }

          // Y座標をレコードごとにずらす（同じ時刻に複数記録がある場合）
          y += recordIndex * 15

          if (y < chartArea.top || y > chartArea.bottom) return

          // 背景を描画
          const textWidth = ctx.measureText(labelText).width
          const padding = 3
          ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
          ctx.strokeStyle = color
          ctx.lineWidth = 1

          const rectX = x - textWidth / 2 - padding
          const rectY = y - 7
          const rectWidth = textWidth + padding * 2
          const rectHeight = 14

          ctx.fillRect(rectX, rectY, rectWidth, rectHeight)
          ctx.strokeRect(rectX, rectY, rectWidth, rectHeight)

          // テキストを描画
          ctx.fillStyle = color
          ctx.fillText(labelText, x, y)
        })
      })

      ctx.restore()
    },
  }

  // 6:00〜翌6:00の5分単位の時間軸を生成
  const generateTimeLabels = () => {
    const timeLabels: string[] = []

    // 6:00から開始して翌日6:00まで（24時間 + 6時間 = 30時間）
    for (let hour = 6; hour < 30; hour++) {
      for (let minute = 0; minute < 60; minute += 10) {
        const actualHour = hour >= 24 ? hour - 24 : hour
        const timeStr = `${actualHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        timeLabels.push(timeStr)
      }
    }
    // 最後に翌日6:00を追加
    timeLabels.push('06:00')

    return timeLabels
  }

  const timeLabels = generateTimeLabels()

  // 血糖値データの抽出
  const bloodSugarRecords = sortedRecords.filter(
    record => record.category === 'blood_sugar' && record.bloodSugarValue !== null && record.bloodSugarValue !== undefined
  )

  // 血糖値データ（線グラフ）
  const bloodSugarData = timeLabels.map((current, i) => {
    const prev = timeLabels[i - 1]
    const record = bloodSugarRecords.find(r => {
      const prevDateTime = prev ? new Date(`${selectedDate} ${prev}`) : null
      const currentDateTime = current ? new Date(`${selectedDate} ${current}`) : null
      const theTime = new Date(`${selectedDate} ${r.recordTime}`)

      if (r.category !== 'blood_sugar') return false

      if (!prevDateTime && currentDateTime) {
        return theTime.getTime() < currentDateTime.getTime()
      } else if (!currentDateTime && prevDateTime) {
        return theTime.getTime() >= prevDateTime.getTime()
      } else if (prevDateTime && currentDateTime) {
        return theTime.getTime() >= prevDateTime.getTime() && theTime.getTime() < currentDateTime.getTime()
      }

      return false
    })

    return record ? record.bloodSugarValue : null
  })

  // 各カテゴリの点データを作成
  const createCategoryData = (category: string, yPosition: number) => {
    const categoryRecords = sortedRecords.filter(record => record.category === category)

    return timeLabels.map((current, i) => {
      const prev = timeLabels[i - 1]
      const record = categoryRecords.find(r => {
        const prevDateTime = prev ? new Date(`${selectedDate} ${prev}`) : null
        const currentDateTime = current ? new Date(`${selectedDate} ${current}`) : null
        const theTime = new Date(`${selectedDate} ${r.recordTime}`)

        if (!prevDateTime && currentDateTime) {
          return theTime.getTime() < currentDateTime.getTime()
        } else if (!currentDateTime && prevDateTime) {
          return theTime.getTime() >= prevDateTime.getTime()
        } else if (prevDateTime && currentDateTime) {
          return theTime.getTime() >= prevDateTime.getTime() && theTime.getTime() < currentDateTime.getTime()
        }

        return false
      })

      return record ? yPosition : null
    })
  }

  // 歩行データの表示値を取得
  const getWalkingDisplayValue = (record: any) => {
    const values: string[] = []
    if (record.walkingShortDistance) values.push(`短:${record.walkingShortDistance}`)
    if (record.walkingMediumDistance) values.push(`中:${record.walkingMediumDistance}`)
    if (record.walkingLongDistance) values.push(`長:${record.walkingLongDistance}`)
    if (record.walkingExercise) values.push(`運:${record.walkingExercise}`)
    return values.join(' ')
  }

  // 薬の名前を取得
  const getMedicineName = (record: any) => {
    return record.Medicine?.name || '薬'
  }

  // 各レコードのラベル表示用データを生成
  const generateLabelData = () => {
    return sortedRecords.map(record => {
      let label = ''
      const time = record.recordTime

      switch (record.category) {
        case 'blood_sugar':
          label = `血糖値 ${record.bloodSugarValue}`
          break
        case 'medicine': {
          const medicineName = getMedicineName(record)
          const unit = record.medicineUnit ? ` (${record.medicineUnit}単位)` : ''
          label = `${medicineName} ${time}${unit}`
          break
        }
        case 'urine':
          label = `尿: ${time}`
          break
        case 'stool':
          label = `便: ${time}`
          break
        case 'meal':
          label = `食事: ${time}`
          break
        case 'walking':
          label = `歩行: ${time}`
          break
        default:
          label = `${HEALTH_CATEGORY_LABELS[record.category as keyof typeof HEALTH_CATEGORY_LABELS]}: ${time}`
      }

      return {
        ...record,
        displayLabel: label,
      }
    })
  }

  const labeledRecords = generateLabelData()

  // 統合グラフのデータ
  const chartData = {
    labels: timeLabels,
    datasets: [
      // 血糖値（メインライン）
      {
        label: '血糖値 (mg/dL)',
        data: bloodSugarData,
        borderColor: HEALTH_CATEGORY_COLORS.blood_sugar,
        backgroundColor: HEALTH_CATEGORY_COLORS.blood_sugar + '20',
        tension: 0.1,
        pointBackgroundColor: HEALTH_CATEGORY_COLORS.blood_sugar,
        pointBorderColor: HEALTH_CATEGORY_COLORS.blood_sugar,
        pointRadius: 2,
        pointHoverRadius: 4,
        fill: false,
        showLine: true,
        spanGaps: true, // データがない部分も線でつなぐ
        type: 'line' as const,
      },
      // 尿（点）
      {
        label: '尿',
        data: createCategoryData('urine', 460),
        borderColor: HEALTH_CATEGORY_COLORS.urine,
        backgroundColor: HEALTH_CATEGORY_COLORS.urine,
        pointBackgroundColor: HEALTH_CATEGORY_COLORS.urine,
        pointBorderColor: HEALTH_CATEGORY_COLORS.urine,
        pointRadius: 2,
        pointHoverRadius: 4,
        showLine: false,
        type: 'line' as const,
      },
      // 便（点）
      {
        label: '便',
        data: createCategoryData('stool', 440),
        borderColor: HEALTH_CATEGORY_COLORS.stool,
        backgroundColor: HEALTH_CATEGORY_COLORS.stool,
        pointBackgroundColor: HEALTH_CATEGORY_COLORS.stool,
        pointBorderColor: HEALTH_CATEGORY_COLORS.stool,
        pointRadius: 2,
        pointHoverRadius: 4,
        showLine: false,
        type: 'line' as const,
      },
      // 食事（点）
      {
        label: '食事',
        data: createCategoryData('meal', 420),
        borderColor: HEALTH_CATEGORY_COLORS.meal,
        backgroundColor: HEALTH_CATEGORY_COLORS.meal,
        pointBackgroundColor: HEALTH_CATEGORY_COLORS.meal,
        pointBorderColor: HEALTH_CATEGORY_COLORS.meal,
        pointRadius: 2,
        pointHoverRadius: 4,
        showLine: false,
        type: 'line' as const,
      },
      // 薬（点）
      {
        label: '薬',
        data: createCategoryData('medicine', 400),
        borderColor: HEALTH_CATEGORY_COLORS.medicine,
        backgroundColor: HEALTH_CATEGORY_COLORS.medicine,
        pointBackgroundColor: HEALTH_CATEGORY_COLORS.medicine,
        pointBorderColor: HEALTH_CATEGORY_COLORS.medicine,
        pointRadius: 2,
        pointHoverRadius: 4,
        showLine: false,
        type: 'line' as const,
      },
      // 歩行（点）
      {
        label: '歩行',
        data: createCategoryData('walking', 380),
        borderColor: HEALTH_CATEGORY_COLORS.walking,
        backgroundColor: HEALTH_CATEGORY_COLORS.walking,
        pointBackgroundColor: HEALTH_CATEGORY_COLORS.walking,
        pointBorderColor: HEALTH_CATEGORY_COLORS.walking,
        pointRadius: 2,
        pointHoverRadius: 4,
        showLine: false,
        type: 'line' as const,
      },
    ],
  }

  // グラフオプション
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      title: {
        display: true,
        text: `健康記録グラフ - ${selectedDate}`,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<'line'>) {
            const datasetLabel = context.dataset.label
            const time = timeLabels[context.dataIndex]

            if (datasetLabel === '血糖値 (mg/dL)') {
              return `${datasetLabel}: ${context.parsed.y} mg/dL`
            }

            // 該当時刻の記録を検索
            const record = sortedRecords.find(
              r =>
                r.recordTime === time &&
                HEALTH_CATEGORY_LABELS[r.category as keyof typeof HEALTH_CATEGORY_LABELS] === datasetLabel
            )

            if (!record) return ``

            if (record.category === 'medicine') {
              const medicineName = getMedicineName(record)
              const unit = record.medicineUnit ? ` ${record.medicineUnit}単位` : ''
              return `${datasetLabel}: ${medicineName}${unit}`
            }

            if (record.category === 'walking') {
              const walkingInfo = getWalkingDisplayValue(record)
              return `${datasetLabel}: ${walkingInfo}`
            }

            if (record.memo) {
              return `${datasetLabel}: ${record.memo}`
            }

            return `${datasetLabel}: 記録あり`
          },
          title: function (context: TooltipItem<'line'>[]) {
            return `時刻: ${context[0].label}`
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        min: 0,
        max: 500,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: function (value: any) {
            // 血糖値の範囲のみ数値を表示
            if (value >= 0 && value <= 500 && value % 50 === 0) {
              return value + ' mg/dL'
            }
            // その他の項目のラベル表示
            if (value === 460) return '尿'
            if (value === 440) return '便'
            if (value === 420) return '食事'
            if (value === 400) return '薬'
            if (value === 380) return '歩行'
            return ''
          },
        },
      },
      x: {
        title: {
          display: true,
          text: '時刻',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          maxTicksLimit: 25, // 表示するラベル数を制限
          callback: function (value: any, index: number) {
            const label = timeLabels[index]
            // 30分刻みのみ表示（00, 30分）
            if (label && (label.endsWith(':00') || label.endsWith(':30'))) {
              return label
            }
            return ''
          },
        },
      },
    },
    elements: {
      line: {
        tension: 0.1,
      },
    },
  }

  // 統計情報の計算
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
      medicine: sortedRecords.filter(r => r.category === 'medicine').length,
      walking: sortedRecords.filter(r => r.category === 'walking').length,
    },
  }

  return (
    <div className="space-y-6">
      {/* 統合グラフ */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* グラフエリア */}
          <div className="flex-1" style={{height: '500px'}}>
            <Line data={chartData} options={chartOptions} plugins={[backgroundZonesPlugin, dataLabelsPlugin]} />
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

        {/* データラベル表示 */}
        <div className="mt-4 space-y-2">
          <h4 className="font-bold text-gray-800">記録データ</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
            {labeledRecords.map((record, index) => (
              <div
                key={index}
                className="flex items-center p-2 rounded text-sm border"
                style={{
                  borderColor: HEALTH_CATEGORY_COLORS[record.category as keyof typeof HEALTH_CATEGORY_COLORS],
                  backgroundColor: HEALTH_CATEGORY_COLORS[record.category as keyof typeof HEALTH_CATEGORY_COLORS] + '10',
                }}
              >
                <div
                  className="w-2 h-2 rounded-full mr-2"
                  style={{backgroundColor: HEALTH_CATEGORY_COLORS[record.category as keyof typeof HEALTH_CATEGORY_COLORS]}}
                />
                <span className="font-medium">{record.displayLabel}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 統計情報 */}
        <div className="mt-6 space-y-4">
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
                <div className="text-sm text-gray-600">薬</div>
                <div className="text-lg font-bold" style={{color: HEALTH_CATEGORY_COLORS.medicine}}>
                  {stats.categories.medicine}回
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">歩行</div>
                <div className="text-lg font-bold" style={{color: HEALTH_CATEGORY_COLORS.walking}}>
                  {stats.categories.walking}回
                </div>
              </div>
            </div>
          </div>
        </div>
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
