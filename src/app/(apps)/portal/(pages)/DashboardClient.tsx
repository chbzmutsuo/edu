'use client'

import React, {useState} from 'react'
import {AlertTriangle, CheckCircle} from 'lucide-react'
import useModal from '@cm/components/utils/modal/useModal'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {updateDailyStaffAssignment} from './_actions/dashboard-actions'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {cn} from '@cm/shadcn/lib/utils'
import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
import AutoGridContainer from '@cm/components/utils/AutoGridContainer'

type ProductData = {
  id: number
  name: string
  color: string
  productionCapacity: number
  allowanceStock: number
  monthlyTarget: number
  monthStartStock: number
  monthlyProduction: number
  monthlyShipment: number
  currentStock: number
  remainingTarget: number
  targetAchievementRate: number
  expectedProduction: number
  excessExpected: number
}

export type DailyPlan = {
  productId: number
  productName: string
  productColor: string
  monthlyTarget: number
  dailyTarget: number
  dailyCapacity: number
  staffCount: number
  actualProduction: number
  cumulativeProduction: number
  remainingWorkingDays: number
  isRisky: boolean
}

type CalendarDay = {
  day: number | null
  date?: string
  dayOfWeek?: number
  isHoliday?: boolean
  isPast?: boolean
  isToday?: boolean
  plans?: DailyPlan[]
}

type DashboardClientProps = {
  products: ProductData[]
  calendar: {
    year: number
    month: number
    days: CalendarDay[]
  }
  workingDays: number[]
}

const DashboardClient = ({products, calendar, workingDays}: DashboardClientProps) => {
  const {toggleLoad} = useGlobal()
  const DayModalReturn = useModal<{day: CalendarDay}>()
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null)

  const handleDayClick = (day: CalendarDay) => {
    if (day.day) {
      setSelectedDay(day)
      DayModalReturn.handleOpen({day})
    }
  }

  const handleStaffCountChange = async (productId: number, staffCount: number) => {
    if (!selectedDay?.date) return

    await toggleLoad(async () => {
      const result = await updateDailyStaffAssignment(new Date(selectedDay.date!), productId, staffCount)

      if (result.success) {
        // ページをリロードして最新データを取得
        window.location.reload()
      } else {
        alert(result.error || '人員配置の更新に失敗しました')
      }
    })
  }

  const dayLabels = ['日', '月', '火', '水', '木', '金', '土']

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">生産管理ダッシュボード</h1>
          <p className="text-sm text-gray-600 mt-1">
            {calendar.year}年 {calendar.month}月 / 稼働日: {workingDays.length}日
          </p>
        </div>
      </div>

      {/* 製品別テーブル */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden w-fit">
        <div className="px-4 py-3 bg-gray-50 border-b">
          <h2 className="text-lg font-semibold text-gray-900">製品別在庫状況</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">製品名（カラー）</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">月間目標</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">月初在庫</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">今月生産済</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">残り必要数</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">達成率</th>

                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">総作成見込数</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">超過見込数</th>

                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">今月出荷</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">現在在庫</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">
                    {product.name}（{product.color}）
                  </td>
                  <td className="px-4 py-3 text-right">{product.monthlyTarget.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">{product.monthStartStock.toLocaleString()}</td>

                  <td className="px-4 py-3 text-right font-semibold text-blue-600">
                    {product.monthlyProduction.toLocaleString()}
                  </td>

                  <td className="px-4 py-3 text-right font-semibold text-orange-600">
                    {product.remainingTarget.toLocaleString()}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        product.targetAchievementRate >= 100
                          ? 'bg-green-100 text-green-800'
                          : product.targetAchievementRate >= 80
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.targetAchievementRate}%
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right font-semibold text-green-600">
                    {product.expectedProduction.toLocaleString()}
                  </td>

                  <td className="px-4 py-3 text-right font-semibold text-green-600">{product.excessExpected.toLocaleString()}</td>

                  <td className="px-4 py-3 text-right">{product.monthlyShipment.toLocaleString()}</td>

                  <td className="px-4 py-3 text-right font-semibold">{product.currentStock.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 月間生産スケジュール */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b">
          <h2 className="text-lg font-semibold text-gray-900">月間生産スケジュール</h2>
          <p className="text-xs text-gray-600 mt-1">
            {calendar.year}年{calendar.month}月
          </p>
        </div>

        {/* カレンダー */}
        <div className="p-4">
          <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200">
            {/* 曜日ヘッダー */}
            {dayLabels.map((label, index) => (
              <div
                key={label}
                className={`bg-gray-50 p-2 text-center text-xs font-semibold ${
                  index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-700'
                }`}
              >
                {label}
              </div>
            ))}

            {/* 日付セル */}
            {calendar.days.map((day, index) => {
              if (!day.day) {
                return <div key={`empty-${index}`} className="bg-white min-h-[120px] min-w-[180px]" />
              }

              const isHoliday = day.isHoliday
              const isPast = day.isPast
              const isToday = day.isToday

              const dayClassName = cn(
                `bg-white min-h-[120px] min-w-[180px] p-2 cursor-pointer hover:bg-gray-50 transition-colors border-l border-t`,
                isHoliday ? 'bg-gray-100' : '',
                isToday ? 'ring-2 ring-blue-500' : ''
              )

              return (
                <div key={day.day} className={dayClassName} onClick={() => handleDayClick(day)}>
                  {/* 日付 */}
                  <div
                    className={`text-sm font-medium mb-1 ${day.isToday ? 'text-blue-600' : day.isHoliday ? 'text-red-500' : ''}`}
                  >
                    {day.day}
                  </div>

                  {/* 製品別生産計画 */}
                  {day.plans && (
                    <div className="space-y-1">
                      {day.plans.map(plan => {
                        const isRisky = plan.isRisky
                        const dailyTarget = plan.dailyTarget

                        let itemBgClassName = ''
                        let itemTextClassName = ''
                        if (isPast) {
                          itemBgClassName = 'bg-gray-50  opacity-80'
                          itemTextClassName = 'text-gray-700  '
                        } else {
                          if (isRisky) {
                            itemBgClassName = 'bg-red-50 '
                            itemTextClassName = 'text-red-700 font-bold'
                          } else {
                            itemBgClassName = 'bg-green-50 '
                            itemTextClassName = 'text-green-700 font-bold'
                          }
                        }

                        const diff = plan.dailyCapacity - dailyTarget

                        return (
                          <C_Stack key={plan.productId} className={cn(`text-xs p-1 rounded 0.5 `, itemBgClassName)}>
                            <R_Stack className=" gap-1 justify-between w-full">
                              <R_Stack className={` gap-0.5`}>
                                {!!dailyTarget && !isPast && (
                                  <div>
                                    {isRisky && <AlertTriangle className={cn('w-3 h-3', itemTextClassName)} strokeWidth={4} />}
                                    {!isRisky && <CheckCircle className={cn('w-3 h-3', itemTextClassName)} strokeWidth={3} />}
                                  </div>
                                )}

                                <span className="font-medium truncate">
                                  {plan.productName}({plan.productColor})
                                </span>
                              </R_Stack>

                              {!!plan.actualProduction && (
                                <div
                                  className={` ml-auto px-2 py-1 rounded-full bg-blue-100 border-blue-500 border text-blue-600`}
                                >
                                  <div className={plan.actualProduction ? 'font-bold ' : 'opacity-50'}>
                                    <C_Stack className={`gap-0.5 leading-2`}>
                                      {/* <span className={`text-[8px] text-gray-600`}>実績</span> */}
                                      <span>済{plan.actualProduction}</span>
                                    </C_Stack>
                                  </div>
                                </div>
                              )}
                            </R_Stack>

                            <R_Stack className=" gap-0.5">
                              {!isPast && (
                                <R_Stack className={`gap-0.5`}>
                                  <R_Stack className={cn('gap-2   items-baseline-last')}>
                                    <C_Stack className={`gap-0.5 leading-2`}>
                                      <span className={`text-[8px] text-gray-600`}>見込</span>
                                      <span>{plan.dailyCapacity}</span>
                                    </C_Stack>
                                    <span>/</span>
                                    <C_Stack className={`gap-0.5 leading-2`}>
                                      <span className={`text-[8px] text-gray-600`}>目標</span>
                                      <span>{plan.dailyTarget}</span>
                                    </C_Stack>

                                    <span className={itemTextClassName}>({diff > 0 ? `+${diff}` : diff})</span>
                                  </R_Stack>
                                </R_Stack>
                              )}
                            </R_Stack>
                          </C_Stack>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 日別モーダル */}
      <DayModalReturn.Modal title={selectedDay?.date ? `${formatDate(new Date(selectedDay.date))} の生産計画` : '生産計画'}>
        {selectedDay?.plans && (
          <AutoGridContainer {...{maxCols: {xl: 2, xl2: 3}, className: 'gap-8'}}>
            {selectedDay.plans.map(plan => (
              <div key={plan.productId} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">
                    {plan.productName}（{plan.productColor}）
                  </h3>
                  {plan.isRisky ? (
                    <span className="flex items-center gap-1 text-red-600 text-sm font-semibold">
                      <AlertTriangle className="w-4 h-4" />
                      危険
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                      <CheckCircle className="w-4 h-4" />
                      安全
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">月間生産目標</p>
                    <p className="text-lg font-semibold">{plan.monthlyTarget.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">昨日までの実績</p>
                    <p className="text-lg font-semibold">{plan.cumulativeProduction.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">今日の生産目標</p>
                    <p className="text-lg font-semibold text-orange-600">{plan.dailyTarget.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">今日の生産能力</p>
                    <p className={`text-lg font-semibold ${plan.isRisky ? 'text-red-600' : 'text-green-600'}`}>
                      {plan.dailyCapacity.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">残りの稼働日</p>
                    <p className="text-lg font-semibold">{plan.remainingWorkingDays}日</p>
                  </div>
                  <div>
                    <p className="text-gray-600">本日の実績</p>
                    <p className="text-lg font-semibold text-blue-600">{plan.actualProduction.toLocaleString()}</p>
                  </div>
                </div>

                {/* 人員配置設定 */}
                <div className="mt-4 pt-4 border-t">
                  <label className="block text-sm font-medium text-gray-700 mb-2">割り当て人員数</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="20"
                      defaultValue={plan.staffCount}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-md"
                      onBlur={e => {
                        const newCount = parseInt(e.target.value)
                        if (newCount !== plan.staffCount && !isNaN(newCount)) {
                          handleStaffCountChange(plan.productId, newCount)
                        }
                      }}
                    />
                    <span className="text-sm text-gray-600">人</span>
                    <span className="text-xs text-gray-500 ml-4">
                      （能力: {plan.staffCount} × {(plan.dailyCapacity / plan.staffCount / 8).toFixed(1)} 枚/人・時 × 8時間 ={' '}
                      {plan.dailyCapacity.toLocaleString()}）
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </AutoGridContainer>
        )}
      </DayModalReturn.Modal>
    </div>
  )
}

export default DashboardClient
