import {
  PrismaClient,
  SbmCustomer,
  SbmProduct,
  SbmProductPriceHistory,
  SbmUser,
  SbmReservation,
  SbmReservationItem,
  SbmReservationTask,
  SbmDeliveryTeam,
  SbmDeliveryAssignment,
  SbmReservationChangeHistory,
} from '@prisma/client'

// 基本型定義
export type Customer = SbmCustomer
export type Product = SbmProduct
export type ProductPriceHistory = SbmProductPriceHistory

export type User = SbmUser

export type Reservation = SbmReservation & {
  items: SbmReservationItem[]
  tasks: SbmReservationTask[]
  changeHistory: SbmReservationChangeHistory[]
}
export type ReservationItem = SbmReservationItem
export type ReservationTasks = SbmReservationTask

export type ReservationChangeHistory = {
  id: string
  reservationId: string
  changedBy: string
  changeType: 'created' | 'updated' | 'deleted'
  changeDetails: string
  createdAt: Date
}

export type DeliveryTeam = SbmDeliveryTeam

export type DeliveryAssignment = SbmDeliveryAssignment

// 列挙型
export type OrderChannel = '電話' | 'Web' | '店頭' | 'その他'
export type Purpose = '会議' | 'お祝い事' | '法事' | 'イベント' | '個人' | 'その他'
export type PaymentMethod = '現金' | '請求書' | 'クレジットカード' | 'その他'
export type PickupLocation = '配達' | '店舗'

// フィルター・検索用型
export type ReservationFilter = {
  startDate?: string
  endDate?: string
  keyword?: string
  productName?: string
  staffName?: string
  customerName?: string
  companyName?: string
  pickupLocation?: PickupLocation
  orderChannel?: OrderChannel
}

// RFM分析用型
export type RFMCustomer = Customer & {
  recency: number
  frequency: number
  monetary: number
  rScore: number
  fScore: number
  mScore: number
  rank: 'VIP' | '優良' | '安定' | '一般' | '離反懸念'
  lastOrderDate: Date
}

// ダッシュボード集計用型
export type DashboardStats = {
  totalSales: number
  totalCost: number
  profit: number
  orderCount: number
  avgOrderValue: number
  salesByPurpose: {purpose: Purpose; count: number; amount: number}[]
  salesByProduct: {productName: string; count: number; amount: number}[]
}
