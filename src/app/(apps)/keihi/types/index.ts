import {ConversationPurposeValue} from '../(constants)/conversation-purposes'

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
  // counterpartyIndustry was removed
  conversationPurpose: string[] // 配列形式に変更
  keywords: string[]
  conversationSummary?: string | null
  summary?: string | null // 摘要を追加
  // learningDepth was removed

  // AIインサイト（統合版）
  insight?: string | null // 統合されたインサイト
  autoTags: string[]

  // MoneyForward用
  mfSubject?: string | null
  mfSubAccount?: string | null
  mfTaxCategory?: string | null
  mfDepartment?: string | null
  mfMemo?: string | null
  // 添付ファイル
  KeihiAttachment: AttachmentRecord[]
  status?: string | null
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

// フォームデータの型（新仕様対応）
export interface ExpenseFormData {
  // 基本情報
  date: string
  amount: number
  subject: string
  location?: string
  counterpartyName?: string
  conversationPurpose: string[]
  keywords: string[]

  // 会話記録
  conversationSummary?: string
  summary?: string

  // 税務調査対応項目
  counterpartyContact?: string
  followUpPlan?: string
  businessOpportunity?: string
  competitorInfo?: string

  // AI生成情報
  insight?: string
  autoTags?: string[]
  status?: string

  // MoneyForward用情報
  mfSubject?: string
  mfSubAccount?: string
  mfTaxCategory?: string
  mfDepartment?: string
  mfMemo?: string
}

// AI下書きの型（新仕様対応）
export interface AIDraft {
  summary: string // 摘要
  insight: string // 統合されたインサイト
  autoTags: string[]
  generatedKeywords: string[]
}

// 画像解析結果の型（新仕様対応）
export interface ImageAnalysisResult {
  date: string
  location: string
  amount: number
  subject: string
  suggestedCounterparties: string[]
  suggestedPurposes: ConversationPurposeValue[]
  generatedKeywords: string[]
}

// 解析済み領収書の型
export interface AnalyzedReceipt {
  id?: string
  date: string
  amount: number
  subject: string
  location: string
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

// 相手名の入力形式
export interface CounterpartyInput {
  name: string
  role?: string // 教師、エンジニアなど
}

// キーワード生成用の入力データ
export interface KeywordGenerationInput {
  counterpartyName?: string
  conversationPurpose: string[]
  location?: string
  subject: string
}
