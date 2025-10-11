'use server'

import prisma from 'src/lib/prisma'

// 過去3年間の同月平均受注数から月間生産目標を算出
export const calculateMonthlyTarget = async (productId: number, year: number, month: number) => {
  try {
    // 過去3年間の同月受注データを取得
    const pastOrders = await prisma.order.findMany({
      where: {
        productId,
        orderAt: {
          gte: new Date(year - 3, month - 1, 1),
          lt: new Date(year, month - 1, 1),
        },
      },
    })

    // 年度ごとにグループ化
    const yearlyOrders: Record<number, number> = {}
    pastOrders.forEach(order => {
      const orderYear = new Date(order.orderAt).getFullYear()
      const orderMonth = new Date(order.orderAt).getMonth() + 1

      if (orderMonth === month) {
        if (!yearlyOrders[orderYear]) yearlyOrders[orderYear] = 0
        yearlyOrders[orderYear] += order.quantity
      }
    })

    // 平均を計算
    const years = Object.keys(yearlyOrders)
    const totalQuantity = Object.values(yearlyOrders).reduce((sum: number, qty) => sum + (qty as number), 0)
    const average = years.length > 0 ? Math.ceil(totalQuantity / years.length) : 0

    // 製品の余裕在庫を取得
    const product = await prisma.product.findUnique({
      where: {id: productId},
    })

    // 月間目標 = 過去平均 + 余裕在庫
    const monthlyTarget = average + (product?.allowanceStock || 0)

    return {
      success: true,
      data: {
        average,
        monthlyTarget,
        yearsCount: years.length,
        yearlyData: yearlyOrders,
      },
    }
  } catch (error) {
    console.error('月間目標の計算に失敗しました:', error)
    return {success: false, error: '月間目標の計算に失敗しました'}
  }
}

// 月初在庫を計算
export const getMonthStartStock = async (productId: number, year: number, month: number) => {
  try {
    const monthStart = new Date(year, month - 1, 1)

    // 月初以前の生産総数
    const productions = await prisma.production.findMany({
      where: {
        productId,
        productionAt: {
          lt: monthStart,
        },
      },
    })
    const totalProduction = productions.reduce((sum, p) => sum + p.quantity, 0)

    // 月初以前の出荷総数
    const shipments = await prisma.shipment.findMany({
      where: {
        productId,
        shipmentAt: {
          lt: monthStart,
        },
      },
    })
    const totalShipment = shipments.reduce((sum, s) => sum + s.quantity, 0)

    const monthStartStock = totalProduction - totalShipment

    return {success: true, data: monthStartStock}
  } catch (error) {
    console.error('月初在庫の計算に失敗しました:', error)
    return {success: false, error: '月初在庫の計算に失敗しました', data: 0}
  }
}

// 今月の生産総数を取得
export const getMonthlyProduction = async (productId: number, year: number, month: number) => {
  try {
    const monthStart = new Date(year, month - 1, 1)
    const monthEnd = new Date(year, month, 0, 23, 59, 59)

    const productions = await prisma.production.findMany({
      where: {
        productId,
        productionAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    })

    const total = productions.reduce((sum, p) => sum + p.quantity, 0)

    return {success: true, data: total}
  } catch (error) {
    console.error('今月の生産総数の取得に失敗しました:', error)
    return {success: false, error: '今月の生産総数の取得に失敗しました', data: 0}
  }
}

// 今月の出荷総数を取得
export const getMonthlyShipment = async (productId: number, year: number, month: number) => {
  try {
    const monthStart = new Date(year, month - 1, 1)
    const monthEnd = new Date(year, month, 0, 23, 59, 59)

    const shipments = await prisma.shipment.findMany({
      where: {
        productId,
        shipmentAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    })

    const total = shipments.reduce((sum, s) => sum + s.quantity, 0)

    return {success: true, data: total}
  } catch (error) {
    console.error('今月の出荷総数の取得に失敗しました:', error)
    return {success: false, error: '今月の出荷総数の取得に失敗しました', data: 0}
  }
}

// 稼働日を計算（休日・土日を除外）
export const getWorkingDays = async (year: number, month: number, startDay = 1) => {
  try {
    const daysInMonth = new Date(year, month, 0).getDate()

    // 会社休日を取得
    const holidays = await prisma.companyHoliday.findMany({
      where: {
        holidayAt: {
          gte: new Date(year, month - 1, 1),
          lte: new Date(year, month, 0),
        },
      },
    })

    const holidayDates = holidays.map(h => new Date(h.holidayAt).getDate())

    // 稼働日をカウント
    const workingDays: number[] = []
    for (let day = startDay; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day)
      const dayOfWeek = date.getDay()

      // 土日と会社休日を除外
      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidayDates.includes(day)) {
        workingDays.push(day)
      }
    }

    return {success: true, data: workingDays}
  } catch (error) {
    console.error('稼働日の計算に失敗しました:', error)
    return {success: false, error: '稼働日の計算に失敗しました', data: []}
  }
}

// 日別人員配置を取得
export const getDailyStaffAssignments = async (year: number, month: number) => {
  try {
    const monthStart = new Date(year, month - 1, 1)
    const monthEnd = new Date(year, month, 0, 23, 59, 59)

    const assignments = await prisma.dailyStaffAssignment.findMany({
      where: {
        assignmentAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      include: {
        Product: true,
      },
    })

    return {success: true, data: assignments}
  } catch (error) {
    console.error('日別人員配置の取得に失敗しました:', error)
    return {success: false, error: '日別人員配置の取得に失敗しました', data: []}
  }
}

// 日別人員配置を更新（upsert）
export const updateDailyStaffAssignment = async (date: Date, productId: number, staffCount: number) => {
  try {
    const assignment = await prisma.dailyStaffAssignment.upsert({
      where: {
        assignment_product_unique: {
          assignmentAt: date,
          productId,
        },
      },
      update: {
        staffCount,
      },
      create: {
        assignmentAt: date,
        productId,
        staffCount,
      },
    })

    return {success: true, data: assignment}
  } catch (error) {
    console.error('日別人員配置の更新に失敗しました:', error)
    return {success: false, error: '日別人員配置の更新に失敗しました'}
  }
}

// ダッシュボード用の統合データを取得
export const getDashboardData = async (year: number, month: number) => {
  try {
    // 全製品を取得
    const products = await prisma.product.findMany({
      orderBy: {sortOrder: 'asc'},
    })

    // 製品ごとのデータを並列取得
    const productData = await Promise.all(
      products.map(async product => {
        const [monthlyTargetResult, monthStartStockResult, monthlyProductionResult, monthlyShipmentResult] = await Promise.all([
          calculateMonthlyTarget(product.id, year, month),
          getMonthStartStock(product.id, year, month),
          getMonthlyProduction(product.id, year, month),
          getMonthlyShipment(product.id, year, month),
        ])

        const monthlyTarget = monthlyTargetResult.data?.monthlyTarget || 0
        const monthStartStock = monthStartStockResult.data || 0
        const monthlyProduction = monthlyProductionResult.data || 0
        const monthlyShipment = monthlyShipmentResult.data || 0
        const currentStock = monthStartStock + monthlyProduction - monthlyShipment
        const remainingTarget = Math.max(0, monthlyTarget - monthlyProduction)

        return {
          ...product,
          monthlyTarget,
          monthStartStock,
          monthlyProduction,
          monthlyShipment,
          currentStock,
          remainingTarget,
          targetAchievementRate: monthlyTarget > 0 ? Math.round((monthlyProduction / monthlyTarget) * 100) : 0,
        }
      })
    )

    // 稼働日と人員配置を取得
    const [workingDaysResult, staffAssignmentsResult] = await Promise.all([
      getWorkingDays(year, month),
      getDailyStaffAssignments(year, month),
    ])

    // カレンダーデータを生成
    const calendarData = await generateCalendarData(year, month, products, staffAssignmentsResult.data || [])

    return {
      success: true,
      data: {
        products: productData,
        workingDays: workingDaysResult.data || [],
        staffAssignments: staffAssignmentsResult.data || [],
        calendar: calendarData,
      },
    }
  } catch (error) {
    console.error('ダッシュボードデータの取得に失敗しました:', error)
    return {success: false, error: 'ダッシュボードデータの取得に失敗しました'}
  }
}

// カレンダーデータを生成
const generateCalendarData = async (year: number, month: number, products: any[], staffAssignments: any[]) => {
  try {
    const today = new Date()
    const currentDate = today.getDate()
    const currentMonth = today.getMonth() + 1
    const currentYear = today.getFullYear()
    const isCurrentMonth = year === currentYear && month === currentMonth

    const daysInMonth = new Date(year, month, 0).getDate()
    const firstDayOfWeek = new Date(year, month - 1, 1).getDay()

    // 会社休日を取得
    const holidays = await prisma.companyHoliday.findMany({
      where: {
        holidayAt: {
          gte: new Date(year, month - 1, 1),
          lte: new Date(year, month, 0),
        },
      },
    })
    const holidayDates = holidays.map(h => new Date(h.holidayAt).getDate())

    // 月の全日付データを生成
    const calendarDays: {
      day: number | null
      date: string
      dayOfWeek: number
      isHoliday: boolean
      isPast: boolean
      isToday: boolean
      plans: DailyPlan[]
    }[] = []

    // 空白セル
    for (let i = 0; i < firstDayOfWeek; i++) {
      calendarDays.push({day: null})
    }

    // 日付セル
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day)
      const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const dayOfWeek = date.getDay()
      const isHoliday = dayOfWeek === 0 || dayOfWeek === 6 || holidayDates.includes(day)
      const isPast = isCurrentMonth && day < currentDate
      const isToday = isCurrentMonth && day === currentDate

      // 残り稼働日を計算
      const workingDaysResult = await getWorkingDays(year, month, day)
      const remainingWorkingDays = workingDaysResult.data?.length || 0

      // 製品ごとの日別計画を生成
      const dailyPlans = await Promise.all(
        products.map(async product => {
          // 昨日までの生産実績
          const productionsUpToYesterday = await prisma.production.findMany({
            where: {
              productId: product.id,
              productionAt: {
                gte: new Date(year, month - 1, 1),
                lt: date,
              },
            },
          })
          const cumulativeProduction = productionsUpToYesterday.reduce((sum, p) => sum + p.quantity, 0)

          // 月間目標
          const monthlyTargetResult = await calculateMonthlyTarget(product.id, year, month)
          const monthlyTarget = monthlyTargetResult.data?.monthlyTarget || 0

          // 今日の生産目標
          const remainingTarget = Math.max(0, monthlyTarget - cumulativeProduction)
          const dailyTarget = !isHoliday && remainingWorkingDays > 0 ? Math.ceil(remainingTarget / remainingWorkingDays) : 0

          // 人員配置
          const assignment = staffAssignments.find(a => new Date(a.assignmentAt).getDate() === day && a.productId === product.id)
          const staffCount = assignment?.staffCount || 3

          // 今日の生産能力
          const dailyCapacity = staffCount * product.productionCapacity * 8

          // 実績
          const actualProductions = await prisma.production.findMany({
            where: {
              productId: product.id,
              productionAt: date,
            },
          })
          const actualProduction = actualProductions.reduce((sum, p) => sum + p.quantity, 0)

          // 危険度判定
          const isRisky = !isHoliday && dailyTarget > dailyCapacity

          return {
            productId: product.id,
            productName: product.name,
            productColor: product.color,
            monthlyTarget,
            dailyTarget,
            dailyCapacity,
            staffCount,
            actualProduction,
            cumulativeProduction,
            remainingWorkingDays,
            isRisky,
          }
        })
      )

      calendarDays.push({
        day,
        date: dateString,
        dayOfWeek,
        isHoliday,
        isPast,
        isToday,
        plans: dailyPlans,
      })
    }

    return {
      year,
      month,
      days: calendarDays,
    }
  } catch (error) {
    console.error('カレンダーデータの生成に失敗しました:', error)
    return {year, month, days: []}
  }
}
