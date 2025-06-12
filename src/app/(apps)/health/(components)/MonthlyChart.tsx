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
} from 'chart.js'
import {Line} from 'react-chartjs-2'
import {DailySummary, HEALTH_CATEGORY_COLORS} from '../(constants)/types'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

interface MonthlyChartProps {
  summaryData: DailySummary[]
  year: number
  month: number
}

export default function MonthlyChart({summaryData, year, month}: MonthlyChartProps) {
  // 日付ラベル（1日〜月末）
  const dayLabels = summaryData.map(day => new Date(day.date).getDate())

  // 血糖値データの抽出（null値も含む）
  const bloodSugarMaxData = summaryData.map(day => day.bloodSugar.max)
  const bloodSugarAvgData = summaryData.map(day => day.bloodSugar.avg)
  const bloodSugarMinData = summaryData.map(day => day.bloodSugar.min)

  // 各カテゴリの記録有無を固定Y位置にマッピング
  const createCategoryPresence = (yPosition: number, condition: (day: DailySummary) => boolean) => {
    return summaryData.map(day => (condition(day) ? yPosition : null))
  }

  // 統合グラフのデータ
  const chartData = {
    labels: dayLabels,
    datasets: [
      // 血糖値（最高値）
      {
        label: '血糖値最高',
        data: bloodSugarMaxData,
        borderColor: HEALTH_CATEGORY_COLORS.blood_sugar,
        backgroundColor: HEALTH_CATEGORY_COLORS.blood_sugar + '20',
        tension: 0.1,
        pointRadius: 3,
        pointHoverRadius: 5,
        fill: false,
        showLine: true,
        type: 'line' as const,
      },
      // 血糖値（平均値）
      {
        label: '血糖値平均',
        data: bloodSugarAvgData,
        borderColor: HEALTH_CATEGORY_COLORS.blood_sugar + 'AA',
        backgroundColor: HEALTH_CATEGORY_COLORS.blood_sugar + '10',
        tension: 0.1,
        pointRadius: 2,
        pointHoverRadius: 4,
        borderDash: [5, 5],
        fill: false,
        showLine: true,
        type: 'line' as const,
      },
      // 血糖値（最低値）
      {
        label: '血糖値最低',
        data: bloodSugarMinData,
        borderColor: HEALTH_CATEGORY_COLORS.blood_sugar + '77',
        backgroundColor: HEALTH_CATEGORY_COLORS.blood_sugar + '05',
        tension: 0.1,
        pointRadius: 2,
        pointHoverRadius: 4,
        borderDash: [2, 2],
        fill: false,
        showLine: true,
        type: 'line' as const,
      },
      // 尿の記録
      {
        label: '尿記録',
        data: createCategoryPresence(
          350,
          day => summaryData.findIndex(d => d.date === day.date) !== -1 // 仮の条件、実際の記録データが必要
        ),
        borderColor: HEALTH_CATEGORY_COLORS.urine,
        backgroundColor: HEALTH_CATEGORY_COLORS.urine,
        pointRadius: 4,
        pointHoverRadius: 6,
        showLine: false,
        type: 'line' as const,
      },
      // 便の記録
      {
        label: '便記録',
        data: createCategoryPresence(
          340,
          day => summaryData.findIndex(d => d.date === day.date) !== -1 // 仮の条件
        ),
        borderColor: HEALTH_CATEGORY_COLORS.stool,
        backgroundColor: HEALTH_CATEGORY_COLORS.stool,
        pointRadius: 4,
        pointHoverRadius: 6,
        showLine: false,
        type: 'line' as const,
      },
      // 食事の記録
      {
        label: '食事記録',
        data: createCategoryPresence(
          330,
          day => summaryData.findIndex(d => d.date === day.date) !== -1 // 仮の条件
        ),
        borderColor: HEALTH_CATEGORY_COLORS.meal,
        backgroundColor: HEALTH_CATEGORY_COLORS.meal,
        pointRadius: 4,
        pointHoverRadius: 6,
        showLine: false,
        type: 'line' as const,
      },
      // 薬の記録
      {
        label: '薬記録',
        data: createCategoryPresence(
          320,
          day => summaryData.findIndex(d => d.date === day.date) !== -1 // 仮の条件
        ),
        borderColor: HEALTH_CATEGORY_COLORS.medicine,
        backgroundColor: HEALTH_CATEGORY_COLORS.medicine,
        pointRadius: 4,
        pointHoverRadius: 6,
        showLine: false,
        type: 'line' as const,
      },
      // 歩行の記録（ポイント合計に基づく）
      {
        label: '歩行記録',
        data: createCategoryPresence(310, day => day.walkingPoints.total > 0),
        borderColor: HEALTH_CATEGORY_COLORS.walking,
        backgroundColor: HEALTH_CATEGORY_COLORS.walking,
        pointRadius: 4,
        pointHoverRadius: 6,
        showLine: false,
        type: 'line' as const,
      },
    ],
  }

  // 月間統計データ
  const validBloodSugarDays = summaryData.filter(day => day.bloodSugar.avg !== null)
  const monthlyStats = {
    bloodSugar: {
      max: validBloodSugarDays.length > 0 ? Math.max(...validBloodSugarDays.map(d => d.bloodSugar.max!)) : 0,
      min: validBloodSugarDays.length > 0 ? Math.min(...validBloodSugarDays.map(d => d.bloodSugar.min!)) : 0,
      avg:
        validBloodSugarDays.length > 0
          ? Math.round(validBloodSugarDays.reduce((sum, d) => sum + d.bloodSugar.avg!, 0) / validBloodSugarDays.length)
          : 0,
      days: validBloodSugarDays.length,
    },
    walking: {
      totalPoints: summaryData.reduce((sum, d) => sum + d.walkingPoints.total, 0),
      avgDaily: summaryData.length > 0 ? summaryData.reduce((sum, d) => sum + d.walkingPoints.total, 0) / summaryData.length : 0,
      activeDays: summaryData.filter(d => d.walkingPoints.total > 0).length,
    },
    recordDays: {
      bloodSugar: validBloodSugarDays.length,
      walking: summaryData.filter(d => d.walkingPoints.total > 0).length,
      // 他のカテゴリも実際のデータに基づいて計算
    },
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
        text: `健康記録推移 - ${year}年${month}月`,
        font: {
          size: 18,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<'line'>) {
            const datasetLabel = context.dataset.label
            const day = dayLabels[context.dataIndex]
            const dayData = summaryData[context.dataIndex]

            if (datasetLabel?.includes('血糖値')) {
              const value = context.parsed.y
              if (value === null) return `${datasetLabel}: データなし`
              return `${datasetLabel}: ${value} mg/dL`
            }

            if (datasetLabel === '歩行記録' && dayData.walkingPoints.total > 0) {
              return `歩行: ${dayData.walkingPoints.total.toFixed(1)}P (短:${dayData.walkingPoints.shortDistance.toFixed(1)} 中:${dayData.walkingPoints.mediumDistance.toFixed(1)} 長:${dayData.walkingPoints.longDistance.toFixed(1)} 運:${dayData.walkingPoints.exercise.toFixed(1)})`
            }

            return `${datasetLabel}: 記録あり`
          },
          title: function (context: TooltipItem<'line'>[]) {
            return `${month}月${context[0].label}日`
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 50,
        max: 400,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: function (value: any) {
            // 血糖値の範囲のみ数値を表示
            if (value >= 50 && value <= 300) {
              return value + ' mg/dL'
            }
            // その他の項目のラベル表示
            if (value === 350) return '尿'
            if (value === 340) return '便'
            if (value === 330) return '食事'
            if (value === 320) return '薬'
            if (value === 310) return '歩行'
            return ''
          },
        },
      },
      x: {
        title: {
          display: true,
          text: '日',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  }

  return (
    <div className="space-y-6">
      {/* 月間統計サマリー */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">📊 月間統計サマリー</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <div className="text-sm text-gray-600 mb-1">血糖値最高</div>
            <div className="text-2xl font-bold" style={{color: HEALTH_CATEGORY_COLORS.blood_sugar}}>
              {monthlyStats.bloodSugar.max || '-'}
            </div>
            <div className="text-xs text-gray-500">mg/dL</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <div className="text-sm text-gray-600 mb-1">血糖値平均</div>
            <div className="text-2xl font-bold" style={{color: HEALTH_CATEGORY_COLORS.blood_sugar}}>
              {monthlyStats.bloodSugar.avg || '-'}
            </div>
            <div className="text-xs text-gray-500">mg/dL</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <div className="text-sm text-gray-600 mb-1">測定日数</div>
            <div className="text-2xl font-bold" style={{color: HEALTH_CATEGORY_COLORS.blood_sugar}}>
              {monthlyStats.bloodSugar.days}
            </div>
            <div className="text-xs text-gray-500">日</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <div className="text-sm text-gray-600 mb-1">月間歩行P</div>
            <div className="text-2xl font-bold" style={{color: HEALTH_CATEGORY_COLORS.walking}}>
              {monthlyStats.walking.totalPoints.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500">ポイント</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <div className="text-sm text-gray-600 mb-1">歩行日数</div>
            <div className="text-2xl font-bold" style={{color: HEALTH_CATEGORY_COLORS.walking}}>
              {monthlyStats.walking.activeDays}
            </div>
            <div className="text-xs text-gray-500">日</div>
          </div>
        </div>
      </div>

      {/* 統合グラフ */}
      {summaryData.length > 0 ? (
        <div className="bg-white rounded-lg shadow p-6">
          <div style={{height: '500px'}}>
            <Line data={chartData} options={chartOptions} />
          </div>

          {/* 月間傾向の説明 */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-bold text-gray-800 mb-2">📈 月間傾向</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                • <strong>実線</strong>: 血糖値最高値の推移
              </p>
              <p>
                • <strong>破線</strong>: 血糖値平均値の推移
              </p>
              <p>
                • <strong>点線</strong>: 血糖値最低値の推移
              </p>
              <p>
                • <strong>点</strong>: 各カテゴリの記録日（グラフ右側のY軸ラベル参照）
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">健康記録推移グラフ</h3>
          <div className="text-center py-8 text-gray-500">この月の記録がありません</div>
        </div>
      )}
    </div>
  )
}
