// 基本エンティティ型定義（Prismaスキーマに準拠）
export type Customer = Partial<{
  id: number
  companyName: string
  contactName?: string
  phoneNumber: string
  deliveryAddress: string
  postalCode?: string
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
  deliveryAddress: string
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

export type DeliveryTeam = Partial<{
  id: number
  name: string
  driverName: string
  vehicleInfo?: string
  capacity: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}>

export type DeliveryAssignment = Partial<{
  id: number
  sbmDeliveryTeamId: number
  sbmReservationId: number
  assignedBy: string
  userId?: number
  deliveryDate: Date
  estimatedDuration?: number
  actualDuration?: number
  route?: Record<string, any>
  status: string
  createdAt: Date
  updatedAt: Date
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
