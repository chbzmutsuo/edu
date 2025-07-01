'use client'

import {useState, useEffect} from 'react'
import {useParams, useRouter} from 'next/navigation'
import {toast} from 'react-toastify'
import {getExpenseById, deleteExpense} from '../../../actions/expense-actions'
import {T_LINK} from '@components/styles/common-components/links'
import {X} from 'lucide-react'
import Redirector from '@components/utils/Redirector'
import {HREF} from '@lib/methods/urls'
import useGlobal from '@hooks/globalHooks/useGlobal'

interface ExpenseDetail {
  id: string
  createdAt: Date
  updatedAt: Date
  date: Date
  amount: number
  subject: string
  location?: string
  counterpartyName?: string
  counterpartyIndustry?: string
  conversationPurpose?: string
  keywords: string[]
  conversationSummary?: string
  learningDepth?: number
  // 税務調査対応項目
  counterpartyContact?: string
  followUpPlan?: string
  businessOpportunity?: string
  competitorInfo?: string
  businessInsightDetail?: string
  businessInsightSummary?: string
  techInsightDetail?: string
  techInsightSummary?: string
  autoTags: string[]
  mfSubject?: string
  mfSubAccount?: string
  mfTaxCategory?: string
  mfDepartment?: string
  mfMemo?: string
  KeihiAttachment: Array<{
    id: string
    filename: string
    originalName: string
    mimeType: string
    size: number
    url: string
  }>
}

interface PreviewModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  fileName: string
}

const PreviewModal = ({isOpen, onClose, imageUrl, fileName}: PreviewModalProps) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{fileName}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 max-h-[calc(90vh-80px)] overflow-auto">
          <img src={imageUrl} alt={fileName} className="max-w-full max-h-full object-contain mx-auto" />
        </div>
      </div>
    </div>
  )
}

export default function ExpenseDetailPage() {
  const {pathname, query} = useGlobal()
  const params = useParams()
  const router = useRouter()
  const [expense, setExpense] = useState<ExpenseDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean
    imageUrl: string
    fileName: string
  }>({
    isOpen: false,
    imageUrl: '',
    fileName: '',
  })

  const expenseId = params?.id as string

  useEffect(() => {
    const fetchExpense = async () => {
      setIsLoading(true)
      try {
        const result = await getExpenseById(expenseId)
        if (result.success) {
          setExpense(result.data as ExpenseDetail)
        } else {
          toast.error(result.error || '記録の取得に失敗しました')
          router.push('/keihi')
        }
      } catch (error) {
        console.error('詳細取得エラー:', error)
        toast.error('記録の取得に失敗しました')
        router.push('/keihi')
      } finally {
        setIsLoading(false)
      }
    }

    if (expenseId) {
      fetchExpense()
    }
  }, [expenseId, router])

  // 削除処理
  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteExpense(expenseId)
      if (result.success) {
        toast.success('記録を削除しました')
        router.push('/keihi')
      } else {
        toast.error(result.error || '削除に失敗しました')
      }
    } catch (error) {
      console.error('削除エラー:', error)
      toast.error('削除に失敗しました')
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  // 金額フォーマット
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ja-JP').format(amount)
  }

  // 日付フォーマット
  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleDateString('ja-JP')
  }

  // ファイルサイズフォーマット
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const openPreviewModal = (imageUrl: string, fileName: string) => {
    setPreviewModal({
      isOpen: true,
      imageUrl,
      fileName,
    })
  }

  const closePreviewModal = () => {
    setPreviewModal({
      isOpen: false,
      imageUrl: '',
      fileName: '',
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!expense) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">記録が見つかりません</p>
          <T_LINK href="/keihi" className="text-blue-600 hover:text-blue-800 underline　w-fit">
            一覧に戻る
          </T_LINK>
        </div>
      </div>
    )
  }

  return <Redirector redirectPath={HREF(`${pathname}/edit`, {}, query)} />
}
