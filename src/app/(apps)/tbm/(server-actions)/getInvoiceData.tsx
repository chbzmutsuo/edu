'use server'

import prisma from 'src/lib/prisma'
import {TBM_CODE} from '@app/(apps)/tbm/(class)/TBM_CODE'
import {DriveScheduleCl, DriveScheduleData} from '@app/(apps)/tbm/(class)/DriveScheduleCl'

export type InvoiceData = {
  companyInfo: {
    name: string
    address: string
    tel: string
    fax: string
    bankInfo: string
  }
  customerInfo: {
    name: string
    address?: string
  }
  invoiceDetails: {
    yearMonth: Date
    totalAmount: number
    taxAmount: number
    grandTotal: number
    summaryByCategory: CategorySummary[]
    detailsByCategory: CategoryDetail[]
  }
}

export type CategorySummary = {
  category: string
  categoryCode: string
  totalTrips: number
  totalAmount: number
}

export type CategoryDetail = {
  category: string
  categoryCode: string
  routeName: string
  trips: number
  unitPrice: number
  amount: number
  tollFee: number
  specialAddition?: number
}

export const getInvoiceData = async ({
  whereQuery,
  tbmBaseId,
  customerId,
}: {
  whereQuery
  tbmBaseId: number
  customerId?: number
}) => {
  // 営業所情報取得
  const tbmBase = await prisma.tbmBase.findFirst({
    where: {id: tbmBaseId},
  })

  // 顧客情報取得
  const customer = customerId
    ? await prisma.tbmCustomer.findFirst({
        where: {id: customerId},
      })
    : null

  // 運行スケジュールデータ取得（承認済みのみ）
  const driveScheduleList = await DriveScheduleCl.getDriveScheduleList({
    whereQuery,
    tbmBaseId,
  })

  // 顧客でフィルタリング（指定がある場合）
  const filteredSchedules = customerId
    ? driveScheduleList.filter(schedule => schedule.TbmRouteGroup.Mid_TbmRouteGroup_TbmCustomer?.TbmCustomer?.id === customerId)
    : driveScheduleList

  // 便区分ごとにグループ化
  const schedulesByCategory = filteredSchedules.reduce(
    (acc, schedule) => {
      const categoryCode = schedule.TbmRouteGroup.seikyuKbn || '01'
      if (!acc[categoryCode]) {
        acc[categoryCode] = []
      }
      acc[categoryCode].push(schedule)
      return acc
    },
    {} as Record<string, DriveScheduleData[]>
  )

  // 便区分ごとの集計
  const summaryByCategory: CategorySummary[] = Object.entries(schedulesByCategory).map(props => {
    const [categoryCode, schedules] = props
    const category = TBM_CODE.ROUTE.KBN[categoryCode]?.label || '不明'
    const totalTrips = schedules.length

    // 各スケジュールの料金計算
    const totalAmount = schedules.reduce((sum, schedule) => {
      const routeGroupConfig = schedule.TbmRouteGroup.TbmMonthlyConfigForRouteGroup[0]
      const routeGroupFee = schedule.TbmRouteGroup.TbmRouteGroupFee[0]

      // 基本料金（運賃）
      const baseFee = routeGroupFee?.driverFee || 0
      // 通行料
      const tollFee = (schedule.O_postalHighwayFee || 0) + (schedule.Q_generalHighwayFee || 0)

      return sum + baseFee + tollFee
    }, 0)

    return {
      category,
      categoryCode,
      totalTrips,
      totalAmount,
    }
  })

  // 便区分ごとの詳細明細
  const detailsByCategory: CategoryDetail[] = Object.entries(schedulesByCategory).flatMap(
    (props: [string, DriveScheduleData[]]) => {
      const [categoryCode, schedules] = props
      const category = TBM_CODE.ROUTE.KBN[categoryCode]?.label || '不明'

      // 路線名ごとにグループ化
      const schedulesByRoute = schedules.reduce(
        (acc, schedule) => {
          const routeName = schedule.TbmRouteGroup.routeName || schedule.TbmRouteGroup.name
          if (!acc[routeName]) {
            acc[routeName] = []
          }
          acc[routeName].push(schedule)
          return acc
        },
        {} as Record<string, DriveScheduleData[]>
      )

      return Object.entries(schedulesByRoute).map((props: [string, DriveScheduleData[]]) => {
        const [routeName, routeSchedules] = props
        const trips = routeSchedules.length

        // 月次設定から基本料金を取得
        const monthlyConfig = routeSchedules[0]?.TbmRouteGroup.TbmMonthlyConfigForRouteGroup[0]
        const routeGroupFee = routeSchedules[0]?.TbmRouteGroup.TbmRouteGroupFee[0]

        // 基本運賃（ドライバー料金または設定値）
        const unitPrice = routeGroupFee?.driverFee || monthlyConfig?.generalFee || 0
        const amount = unitPrice * trips

        // 通行料の合計（郵便高速 + 一般高速）
        const tollFee = routeSchedules.reduce(
          (sum, schedule) => sum + (schedule.O_postalHighwayFee || 0) + (schedule.Q_generalHighwayFee || 0),
          0
        )

        return {
          category,
          categoryCode,
          routeName,
          trips,
          unitPrice,
          amount,
          tollFee,
        }
      })
    }
  )

  // 合計金額計算
  const totalAmount = summaryByCategory.reduce((sum, item) => sum + item.totalAmount, 0)
  const taxAmount = Math.floor(totalAmount * 0.1) // 10%消費税
  const grandTotal = totalAmount + taxAmount

  const invoiceData: InvoiceData = {
    companyInfo: {
      name: tbmBase?.name || '日本郵便輸送株式会社',
      address: '九州支社 御中',
      tel: '0943-72-2361',
      fax: '0943-72-4160',
      bankInfo: '振込銀行 福岡銀行 田主丸支店\n（普通）９００８３\n登録番号 T2290020049699',
    },
    customerInfo: {
      name: customer?.name || '顧客名未設定',
      address: customer?.address,
    },
    invoiceDetails: {
      yearMonth: whereQuery.gte,
      totalAmount,
      taxAmount,
      grandTotal,
      summaryByCategory,
      detailsByCategory,
    },
  }

  return invoiceData
}
