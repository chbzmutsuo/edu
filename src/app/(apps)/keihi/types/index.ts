// 基本的な経費記録の型
export interface ExpenseRecord {
  id: string
  createdAt: Date
  updatedAt: Date
  date: Date
  amount: number
  subject: string
  location?: string | null
  counterpartyName?: string | null
  counterpartyIndustry?: string | null
  conversationPurpose?: string | null
  keywords: string[]
  conversationSummary?: string | null
  learningDepth?: number | null
  // 税務調査対応項目
  counterpartyContact?: string | null
  followUpPlan?: string | null
  businessOpportunity?: string | null
  competitorInfo?: string | null
  // AIインサイト
  businessInsightDetail?: string | null
  businessInsightSummary?: string | null
  techInsightDetail?: string | null
  techInsightSummary?: string | null
  autoTags: string[]
  // MoneyForward用
  mfSubject?: string | null
  mfSubAccount?: string | null
  mfTaxCategory?: string | null
  mfDepartment?: string | null
  mfMemo?: string | null
  // 添付ファイル
  KeihiAttachment: AttachmentRecord[]
}

// 添付ファイルの型
export interface AttachmentRecord {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
}

// フォームデータの型（actions/expense-actionsと統一）
export interface ExpenseFormData {
  date: string
  amount: number
  subject: string
  location?: string
  counterpartyName?: string
  counterpartyIndustry?: string
  conversationPurpose?: string
  purpose?: string
  memo?: string
  paymentMethod?: string
  keywords: string[]
  conversationSummary?: string
  learningDepth?: number
  counterpartyContact?: string
  followUpPlan?: string
  businessOpportunity?: string
  competitorInfo?: string
}

// AI下書きの型
export interface AIDraft {
  businessInsightDetail: string
  businessInsightSummary: string
  techInsightDetail: string
  techInsightSummary: string
  autoTags: string[]
  generatedKeywords: string[]
}

// 解析済み領収書の型
export interface AnalyzedReceipt {
  id?: string
  date: string
  amount: number
  subject: string
  counterpartyName: string
  keywords: string[]
  mfMemo?: string
  imageIndex: number
  imageData?: string
  recordCreated?: boolean
  imageUploaded?: boolean
  errors?: string[]
}

// 一括処理結果のサマリー型
export interface BulkProcessingSummary {
  totalImages: number
  recordsCreated: number
  imagesUploaded: number
  failedRecords: number
  failedImages: number
}

// 複数領収書解析結果の型
export interface MultiReceiptAnalysis {
  receipts: AnalyzedReceipt[]
  totalAmount: number
  suggestedMerge: boolean
  allKeywords: string[]
}

// プレビューモーダルの型
export interface PreviewModalState {
  isOpen: boolean
  imageUrl: string
  fileName: string
}

// API レスポンスの型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

// ページネーション情報の型
export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

// 一覧ページの状態管理用
export interface ExpenseListState {
  expenses: ExpenseRecord[]
  loading: boolean
  selectedIds: string[]
  pagination: PaginationInfo
}

// フィルター・ソート用
export interface ExpenseFilters {
  dateFrom?: string
  dateTo?: string
  subject?: string
  counterpartyName?: string
  amountMin?: number
  amountMax?: number
  keywords?: string[]
}

export interface ExpenseSort {
  field: keyof ExpenseRecord
  direction: 'asc' | 'desc'
}

// 進捗状況の型
export interface ProgressState {
  current: number
  total: number
  message?: string
}

// 処理状態の型
export interface ProcessingState {
  isLoading: boolean
  isAnalyzing: boolean
  isGenerating: boolean
  status: string
}
