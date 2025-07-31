import {OrderChannel, Purpose, PaymentMethod, PickupLocation} from '../types'

// 選択肢定数
export const ORDER_CHANNEL_OPTIONS: OrderChannel[] = ['電話', 'Web', '店頭', 'その他']

export const PURPOSE_OPTIONS: Purpose[] = ['会議', 'お祝い事', '法事', 'イベント', '個人', 'その他']

export const PAYMENT_METHOD_OPTIONS: PaymentMethod[] = ['現金', '請求書', 'クレジットカード', 'その他']

export const PICKUP_LOCATION_OPTIONS: PickupLocation[] = ['配達', '店舗']

// デフォルト値
export const DEFAULT_RESERVATION_STATE = {
  customerId: '',
  customerName: '',
  contactName: '',
  phoneNumber: '',
  postalCode: '',
  prefecture: '',
  city: '',
  street: '',
  deliveryDate: new Date(),
  orderChannel: '電話' as OrderChannel,
  purpose: '会議' as Purpose,
  paymentMethod: '現金' as PaymentMethod,
  pickupLocation: '配達' as PickupLocation,
  pointUsage: 0,
  orderStaff: '',
  notes: '',
  items: [],
  totalAmount: 0,
  totalCost: 0,
  tasks: {
    delivered: false,
    collected: false,
    bagProvided: false,
  },
}

// RFMスコア計算基準
export const RFM_SCORE_CRITERIA = {
  RECENCY: {
    EXCELLENT: 30, // 30日以内
    GOOD: 60, // 60日以内
    AVERAGE: 90, // 90日以内
    POOR: 180, // 180日以内
  },
  FREQUENCY: {
    EXCELLENT: 10, // 10回以上
    GOOD: 5, // 5回以上
    AVERAGE: 3, // 3回以上
    POOR: 2, // 2回以上
  },
  MONETARY: {
    EXCELLENT: 100000, // 10万円以上
    GOOD: 50000, // 5万円以上
    AVERAGE: 20000, // 2万円以上
    POOR: 5000, // 5千円以上
  },
}

// 印刷設定
export const PRINT_SETTINGS = {
  INVOICES_PER_PAGE: 2, // A4用紙に2伝票
  PAGE_BREAK_CLASS: 'page-break-after',
}

// バリデーション設定
export const VALIDATION = {
  PHONE_NUMBER_REGEX: /^\d{10,11}$/,
  POSTAL_CODE_REGEX: /^\d{7}$/,
  MIN_ORDER_AMOUNT: 500, // 最小注文金額
}

// UI設定
export const UI_SETTINGS = {
  ITEMS_PER_PAGE: 20,
  SEARCH_DEBOUNCE_MS: 300,
  MODAL_SIZES: {
    SM: 'max-w-sm',
    MD: 'max-w-md',
    LG: 'max-w-lg',
    XL: 'max-w-xl',
    XXL: 'max-w-2xl',
    XXXL: 'max-w-4xl',
  },
}

// 日付設定
export const DATE_SETTINGS = {
  DEFAULT_TIME: '12:00',
  BUSINESS_HOURS_START: '09:00',
  BUSINESS_HOURS_END: '18:00',
}
