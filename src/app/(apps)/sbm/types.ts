// SBM アプリケーションの型定義

// 顧客関連の型
export interface Customer {
  id: number
  companyName: string
  contactName: string
  postalCode: string
  prefecture: string
  city: string
  street: string
  building: string
  email: string
  availablePoints: number
  notes: string
  createdAt?: Date
  updatedAt?: Date
  phones?: CustomerPhone[]
}

export interface CustomerPhone {
  id: number
  sbmCustomerId: number
  label: string
  phoneNumber: string
  createdAt?: Date
  updatedAt?: Date
}

export interface CustomerSearchResult {
  customer: Customer
  matchedPhones: CustomerPhone[]
}

// 商品関連の型
export interface Product {
  id: number
  name: string
  description: string
  currentPrice: number
  currentCost: number
  category: string
  isActive: boolean
  priceHistory?: ProductPriceHistory[]
  createdAt?: Date
  updatedAt?: Date
}

export interface ProductPriceHistory {
  id: number
  productId: string
  price: number
  cost: number
  effectiveDate: Date
}

// 予約関連の型
export interface Reservation {
  id: number
  sbmCustomerId: number
  customerName: string
  contactName: string
  phoneNumber?: string
  postalCode?: string
  prefecture?: string
  city?: string
  street?: string
  building?: string
  deliveryDate: Date
  pickupLocation: '配達' | '店舗受取'
  purpose: '会議' | '研修' | '接待' | 'イベント' | '懇親会' | 'その他'
  paymentMethod: '現金' | '銀行振込' | '請求書' | 'クレジットカード'
  orderChannel: '電話' | 'FAX' | 'メール' | 'Web' | '営業' | 'その他'
  totalAmount: number
  pointsUsed: number
  finalAmount: number
  orderStaff: string
  userId?: number
  notes: string
  deliveryCompleted: boolean
  recoveryCompleted: boolean
  phones?: CustomerPhone[]
  items?: ReservationItem[]
  tasks?: ReservationTask[]
  changeHistory?: ReservationChangeHistory[]
  createdAt?: Date
  updatedAt?: Date
}

export interface ReservationItem {
  id: string
  sbmReservationId: number
  sbmProductId: number
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface ReservationTask {
  id: number
  sbmReservationId: number
  taskType: 'delivery' | 'recovery'
  isCompleted: boolean
  completedAt?: Date
  notes: string
  createdAt: Date
  updatedAt: Date
}

export interface ReservationChangeHistory {
  id: string
  sbmReservationId: number
  changedBy: string
  changeType: 'create' | 'update' | 'delete'
  changedAt: Date
  changedFields?: Record<string, any>
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
}

// 検索フィルター
export interface ReservationFilter {
  startDate?: string
  endDate?: string
  keyword?: string
  customerName?: string
  staffName?: string
  productName?: string
  pickupLocation?: string
  purpose?: string
  paymentMethod?: string
  orderChannel?: string
  deliveryCompleted?: boolean
  recoveryCompleted?: boolean
}

// ダッシュボード統計
export interface DashboardStats {
  totalSales: number
  totalCost: number
  profit: number
  orderCount: number
  avgOrderValue: number
  salesByPurpose: {purpose: string; count: number; amount: number}[]
  salesByProduct: {productName: string; count: number; amount: number}[]
}

// ユーザー
export interface User {
  id: number
  username: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'staff'
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

// 配達チーム関連
export interface DeliveryTeam {
  id: number
  name: string
  date: Date
  createdAt?: Date
  updatedAt?: Date
}

export interface DeliveryGroup {
  id: number
  name: string
  deliveryDate: Date
  userId: number
  userName: string
  status: string
  totalReservations: number
  completedReservations: number
  estimatedDuration?: number
  actualDuration?: number
  routeUrl?: string
  notes?: string
  createdAt?: Date
  updatedAt?: Date
  optimizedRoute?: DeliveryRouteStop[]
  groupReservations?: DeliveryGroupReservation[]
}

export interface DeliveryRouteStop {
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
  createdAt: Date
  updatedAt: Date
}

export interface DeliveryGroupReservation {
  id: number
  sbmDeliveryGroupId: number
  sbmReservationId: number
  deliveryOrder?: number
  isCompleted: boolean
  completedAt?: Date
  notes?: string
  createdAt: Date
}

// 配達チーム割り当て
export interface DeliveryAssignment {
  id: number
  sbmDeliveryTeamId: number
  sbmReservationId: number
  assignedBy: string
  userId?: number
  deliveryDate: Date
  estimatedDuration?: number
  actualDuration?: number
  route?: any
  status: string
  createdAt: Date
  updatedAt: Date
}
