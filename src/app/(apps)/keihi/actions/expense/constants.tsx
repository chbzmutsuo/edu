// 主要な勘定科目マスタ（AIプロンプト用）
export const MAJOR_ACCOUNTS = [
  {account: '旅費交通費', taxCategory: '課仕 10%'},
  {account: '接待交際費', taxCategory: '課仕 10%'},
  {account: '通信費', taxCategory: '課仕 10%'},
  {account: '消耗品費', taxCategory: '課仕 10%'},
  {account: '広告宣伝費', taxCategory: '課仕 10%'},
  {account: '会議費', taxCategory: '課仕 10%'},
  {account: '新聞図書費', taxCategory: '課仕 10%'},
  {account: '支払手数料', taxCategory: '課仕 10%'},
  {account: '地代家賃', taxCategory: '課仕 10%'},
  {account: '水道光熱費', taxCategory: '課仕 10%'},
  {account: '修繕費', taxCategory: '課仕 10%'},
  {account: '租税公課', taxCategory: '対象外'},
]

export type MajorAccountValue = (typeof MAJOR_ACCOUNTS)[number]['account']

// MoneyForward税区分の選択肢
export const TAX_CATEGORIES = [
  {value: '', label: '選択してください'},
  {value: '課仕 10%', label: '課仕 10%（標準税率）'},
  {value: '課仕 8%', label: '課仕 8%（軽減税率）'},
  {value: '課対仕入', label: '課対仕入'},
  {value: '非課税仕入', label: '非課税仕入'},
  {value: '不課税仕入', label: '不課税仕入'},
  {value: '対象外', label: '対象外'},
] as const

export type TaxCategoryValue = (typeof TAX_CATEGORIES)[number]['value']

export const KEIHI_STATUS = [
  {value: '', label: '未設定'},
  {value: '私的利用', label: '私的利用'},
  {value: '一次チェック済', label: '一次チェック済'},
  {value: 'MF連携済み', label: 'MF連携済み'},
] as const

export type StatusValue = (typeof STATUS)[number]['value']
