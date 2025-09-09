type changeHistoryObject = ReservationType & {
  items: ReservationItemType[]
}

// 顧客電話番号管理
// export
type CustomerPhoneType = {
  id: number
  sbmCustomerId: number
  label: PhoneLabelType // '自宅' | '携帯' | '職場' | 'FAX' | 'その他'
  phoneNumber: string
  createdAt?: Date
  updatedAt?: Date
}

// export
type ProductType = Partial<{
  id: number
  name: string
  description?: string
  sbmProductId: number
  category: string
  isActive: boolean

  createdAt: Date
  updatedAt: Date
  SbmProductPriceHistory: ProductPriceHistoryType[]
}>

// export
type ProductPriceHistoryType = Partial<{
  id: number
  sbmProductId: number
  price: number
  cost: number
  effectiveDate: Date
  createdAt: Date
}>

// export
type ReservationType = Partial<{
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
  pickupLocation: PickupLocationType
  purpose: PurposeType
  paymentMethod: PaymentMethodType
  orderChannel: OrderChannelType
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
  items?: ReservationItemType[]
  tasks?: ReservationTaskType[]
  phones?: CustomerPhoneType[]

  changeHistory?: ReservationChangeHistoryType[]
}>

// export
type ReservationItemType = Partial<{
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

// export
type ReservationTaskType = Partial<{
  id: number
  sbmReservationId: number
  taskType: 'delivery' | 'recovery'
  isCompleted: boolean
  completedAt?: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
}>

// export
type ReservationChangeHistoryType = Partial<{
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
// export
type DeliveryGroupType = Partial<{
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
  optimizedRoute?: DeliveryRouteStopType[]
  routeUrl?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
  groupReservations?: DeliveryGroupReservationType[]
}>

// 配達ルートの停止地点
// export
type DeliveryRouteStopType = Partial<{
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
// export
type DeliveryGroupReservationType = Partial<{
  id: number
  sbmDeliveryGroupId: number
  sbmReservationId: number
  deliveryOrder?: number
  isCompleted: boolean
  completedAt?: Date
  notes?: string
  createdAt: Date
}>

// 列挙型
// export
type OrderChannelType = '電話' | 'FAX' | 'メール' | 'Web' | '営業' | 'その他'
// export
type PurposeType = '会議' | '研修' | '接待' | 'イベント' | '懇親会' | 'その他'
// export
type PaymentMethodType = '現金' | '銀行振込' | '請求書' | 'クレジットカード'
// export
type PickupLocationType = '配達' | '店舗受取'
// export
type PhoneLabelType = '自宅' | '携帯' | '職場' | 'FAX' | 'その他'

// フィルター・検索用型
// export
type ReservationFilterType = {
  startDate?: string
  endDate?: string
  keyword?: string
  productName?: string
  staffName?: string
  customerName?: string
  companyName?: string
  pickupLocation?: PickupLocationType
  orderChannel?: OrderChannelType
  purpose?: PurposeType
  paymentMethod?: PaymentMethodType
  deliveryCompleted?: boolean
  recoveryCompleted?: boolean
}

// ダッシュボード集計用型
// export
type DashboardStatsType = {
  totalSales: number
  totalCost: number
  profit: number
  orderCount: number
  avgOrderValue: number
  salesByPurpose: {purpose: PurposeType; count: number; amount: number}[]
  salesByProduct: {productName: string; count: number; amount: number}[]
}

// SBM アプリケーションの型定義

// 顧客関連の型
interface CustomerType {
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
  phones?: CustomerPhoneType[]
}

// export
type CustomerSearchResultType = {
  customer: CustomerType
  matchedPhones: CustomerPhoneType[]
}

// export
type DeliveryTeamType = {
  id: number
  name: string
  date: Date
  createdAt: Date
  updatedAt: Date
}

// export
type DeliveryAssignmentType = {
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
