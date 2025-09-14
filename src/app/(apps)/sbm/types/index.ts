export type ProductType = {
  id: number
  name: string
  description: string | null
  category: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  currentPrice?: number
  currentCost?: number
}

export type ProductPriceHistoryType = {
  id: number
  price: number
  cost: number
  effectiveDate: Date
  createdAt: Date
  sbmProductId: number
}

export type CustomerType = {
  id: number
  companyName: string
  contactName: string | null
  postalCode: string | null
  prefecture: string | null
  city: string | null
  street: string | null
  building: string | null
  email: string | null
  availablePoints: number
  notes: string | null
  createdAt: Date
  updatedAt: Date
  phones: CustomerPhoneType[]
}

export type CustomerPhoneType = {
  id: number
  sbmCustomerId: number
  label: string
  phoneNumber: string
  createdAt: Date
  updatedAt: Date
}

export type ReservationType = {
  id: number
  sbmCustomerId: number
  customerName: string
  contactName: string | null
  phoneNumber: string
  postalCode: string | null
  prefecture: string | null
  city: string | null
  street: string | null
  building: string | null
  deliveryDate: Date
  pickupLocation: string
  purpose: string
  paymentMethod: string
  orderChannel: string
  totalAmount: number
  pointsUsed: number
  finalAmount: number
  orderStaff: string
  userId: number | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
  deliveryCompleted: boolean
  recoveryCompleted: boolean
  items: ReservationItemType[]
  isCanceled: boolean
  canceledAt: Date | null
  cancelReason: string | null
}

export type ReservationItemType = {
  id: string
  sbmReservationId: number
  sbmProductId: number
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  createdAt: Date
}

export type ReservationChangeHistoryType = {
  id: string
  sbmReservationId: number
  changeType: string
  changedFields: any | null
  oldValues: any | null
  newValues: any | null
  changedAt: Date
  userId: number | null
}

export type DeliveryTeamType = {
  id: number
  name: string
  date: Date
  createdAt: Date
  updatedAt: Date
}

export type DeliveryAssignmentType = {
  id: number
  sbmDeliveryTeamId: number
  sbmReservationId: number
  assignedBy: string
  userId: number | null
  deliveryDate: Date
  estimatedDuration: number | null
  actualDuration: number | null
  route: any | null
  status: string
  createdAt: Date
  updatedAt: Date
  reservation?: ReservationType
}

export type DeliveryGroupType = {
  id: number
  name: string
  deliveryDate: Date
  userId: number
  userName: string
  status: string
  totalReservations: number
  completedReservations: number
  estimatedDuration: number | null
  actualDuration: number | null
  routeUrl: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

export type DeliveryRouteStopType = {
  id: string
  sbmDeliveryGroupId: number
  sbmReservationId: number
  customerName: string
  address: string
  lat: number | null
  lng: number | null
  estimatedArrival: Date | null
  actualArrival: Date | null
  deliveryOrder: number
  deliveryCompleted: boolean
  recoveryCompleted: boolean
  estimatedDuration: number
  notes: string | null
  createdAt: Date
  updatedAt: Date
  reservation?: ReservationType
}

export type DeliveryGroupReservationType = {
  id: number
  sbmDeliveryGroupId: number
  sbmReservationId: number
  deliveryOrder: number | null
  isCompleted: boolean
  completedAt: Date | null
  notes: string | null
  createdAt: Date
  reservation?: ReservationType
}

// 材料マスター型定義
export type IngredientType = {
  id: number
  name: string
  description: string | null
  unit: string
  createdAt: Date
  updatedAt: Date
}

// 商品材料関連型定義
export type ProductIngredientType = {
  id: number
  sbmProductId: number
  sbmIngredientId: number
  quantity: number
  createdAt: Date
  updatedAt: Date
  ingredient: IngredientType | null
}

// 材料使用量計算結果型定義
export type IngredientUsageType = {
  id: number
  name: string
  unit: string
  totalQuantity: number
}
