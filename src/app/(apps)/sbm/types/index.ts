import {SbmCustomer} from '@prisma/client'

// 基本エンティティ型定義（Prismaスキーマに準拠）
export type Customer = Partial<{
  id: number
  companyName: string
  contactName?: string
  phoneNumber: string
  postalCode?: string
  prefecture?: string
  city?: string
  street?: string
  building?: string
  email?: string
  availablePoints: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}>

export type Product = Partial<{
  id: number
  name: string
  description?: string
  currentPrice: number
  currentCost: number
  category: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  priceHistory?: ProductPriceHistory[]
}>

export type ProductPriceHistory = Partial<{
  id: number
  productId: string
  price: number
  cost: number
  effectiveDate: Date
  createdAt: Date
}>

export type User = Partial<{
  id: number
  username: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'staff'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}>

export type Reservation = Partial<{
  id: number
  sbmCustomerId: number
  customerName: string
  contactName?: string
  phoneNumber: string
  postalCode?: string
  prefecture?: string
  city?: string
  street?: string
  building?: string
  deliveryDate: Date
  pickupLocation: PickupLocation
  purpose: Purpose
  paymentMethod: PaymentMethod
  orderChannel: OrderChannel
  totalAmount: number
  pointsUsed: number
  finalAmount: number
  orderStaff: string
  userId?: number
  notes?: string
  deliveryCompleted: boolean
  recoveryCompleted: boolean
  createdAt: Date
  updatedAt: Date
  items?: ReservationItem[]
  tasks?: ReservationTask[]
  changeHistory?: ReservationChangeHistory[]
}>

export type ReservationItem = Partial<{
  id: string
  sbmReservationId: number
  sbmProductId: number
  productName: string
  quantity: number
  unitPrice: number
  unitCost: number
  totalPrice: number
  createdAt: Date
}>

export type ReservationTask = Partial<{
  id: number
  sbmReservationId: number
  taskType: 'delivery' | 'recovery'
  isCompleted: boolean
  completedAt?: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
}>

export type ReservationChangeHistory = Partial<{
  id: string
  sbmReservationId: number
  changedBy: string
  changeType: 'create' | 'update' | 'delete'
  changedFields?: Record<string, any>
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
  changedAt: Date
}>

// 配達グループ（日付ベース、ユーザー1人に紐付け）
export type DeliveryGroup = Partial<{
  id: number
  name: string
  deliveryDate: Date
  userId: number
  userName: string
  status: 'planning' | 'route_generated' | 'in_progress' | 'completed'
  totalReservations: number
  completedReservations: number
  estimatedDuration?: number
  actualDuration?: number
  optimizedRoute?: DeliveryRouteStop[]
  routeUrl?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}>

// 配達ルートの停止地点
export type DeliveryRouteStop = Partial<{
  id: string
  sbmDeliveryGroupId: number
  sbmReservationId: number
  customerName: string
  address: string
  lat?: number
  lng?: number
  estimatedArrival?: Date
  actualArrival?: Date
  deliveryOrder: number
  deliveryCompleted: boolean
  recoveryCompleted: boolean
  estimatedDuration: number
  notes?: string
}>

// 配達グループと予約の紐付け
export type DeliveryGroupReservation = Partial<{
  id: number
  sbmDeliveryGroupId: number
  sbmReservationId: number
  deliveryOrder?: number
  isCompleted: boolean
  completedAt?: Date
  notes?: string
  createdAt: Date
}>

export type RFMAnalysis = Partial<{
  id: number
  sbmCustomerId: number
  analysisDate: Date
  recency: number
  frequency: number
  monetary: number
  rScore: number
  fScore: number
  mScore: number
  totalScore: number
  rank: string
  createdAt: Date
  SbmCustomer: SbmCustomer
}>

// 列挙型
export type OrderChannel = '電話' | 'FAX' | 'メール' | 'Web' | '営業' | 'その他'
export type Purpose = '会議' | '研修' | '接待' | 'イベント' | '懇親会' | 'その他'
export type PaymentMethod = '現金' | '銀行振込' | '請求書' | 'クレジットカード'
export type PickupLocation = '配達' | '店舗受取'

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
  purpose?: Purpose
  paymentMethod?: PaymentMethod
  deliveryCompleted?: boolean
  recoveryCompleted?: boolean
}

// RFM分析用型
export type RFMCustomer = {
  customerId: number
  customerName: string
  recency: number
  frequency: number
  monetary: number
  rScore: number
  fScore: number
  mScore: number
  totalScore: number
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
