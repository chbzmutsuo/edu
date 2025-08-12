'use client'

import {useState, useEffect} from 'react'
import {useParams, useRouter} from 'next/navigation'
import {toast} from 'react-toastify'
import {getExpenseById, updateExpense, uploadAttachment, linkAttachmentsToExpense} from '../../../../actions/expense-actions'
import CameraUpload from '../../../../components/CameraUpload'
import {useAllOptions} from '../../../../hooks/useOptions'
import {Eye, X} from 'lucide-react'
import ContentPlayer from '@cm/components/utils/ContentPlayer'
import {analyzeMultipleReceipts} from '@app/(apps)/keihi/actions/expense/analyzeReceipt'
import {generateInsightsDraft} from '@app/(apps)/keihi/actions/expense/insights'
import {ExpenseBasicInfoForm} from '@app/(apps)/keihi/components/ExpenseBasicInfoForm'
import {ExpenseAIDraftSection} from '@app/(apps)/keihi/components/ExpenseAIDraftSection'

// 共通のフィールドクラス生成関数
const getFieldClass = (value: string | number | string[], required = false) => {
  const baseClass = 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
  if (required) {
    const hasValue = Array.isArray(value) ? value.length > 0 : value !== '' && value !== 0 && value !== undefined
    return hasValue ? `${baseClass} border-green-300 bg-green-50` : `${baseClass} border-red-300 bg-red-50`
  }
  const hasValue = Array.isArray(value) ? value.length > 0 : value !== '' && value !== 0 && value !== undefined
  return hasValue ? `${baseClass} border-blue-300 bg-blue-50` : `${baseClass} border-gray-300`
}

interface ExpenseDetail {
  id: string
  date: Date
  amount: number
  subject: string
  location?: string
  counterpartyName?: string
  counterpartyIndustry?: string
  conversationPurpose: string[] // string[]に修正
  keywords: string[]
  conversationSummary?: string
  learningDepth?: number
  autoTags: string[]
  mfSubject?: string
  mfSubAccount?: string
  mfTaxCategory?: string
  mfDepartment?: string
  mfMemo?: string
  summary?: string
  insight?: string
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
          <ContentPlayer src={imageUrl} showOnlyMain styles={{main: {maxWidth: '90vw', maxHeight: '80vh'}}} />
        </div>
      </div>
    </div>
  )
}

export default function ExpenseEditPage() {
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisStatus, setAnalysisStatus] = useState('')
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false)

  const [expense, setExpense] = useState<ExpenseDetail | null>(null)
  const [aiDraft, setAiDraft] = useState<any>(null)

  const [showDraft, setShowDraft] = useState(false)
  const [additionalInstruction, setAdditionalInstruction] = useState('')
  const [attachments, setAttachments] = useState<
    Array<{
      id: string
      filename: string
      originalName: string
      mimeType: string
      size: number
      url: string
    }>
  >([])
  const [newAttachments, setNewAttachments] = useState<
    Array<{
      id: string
      filename: string
      originalName: string
      mimeType: string
      size: number
      url: string
    }>
  >([]) // 新しく追加された添付ファイル

  // マスタデータを取得
  const {allOptions, isLoading: isOptionsLoading, error: optionsError} = useAllOptions()

  // フォーム状態
  const [formData, setFormData] = useState({
    // 基本情報
    date: '',
    amount: '',
    subject: '',
    location: '',
    counterpartyName: '',
    conversationPurpose: [] as string[],
    keywords: [] as string[],

    // 会話記録
    conversationSummary: '',
    summary: '',

    // 税務調査対応項目
    counterpartyContact: '',
    followUpPlan: '',
    businessOpportunity: '',
    competitorInfo: '',

    // AI生成情報
    insight: '',
    autoTags: [] as string[],
    status: '',

    // MoneyForward用情報
    mfSubject: '',
    mfSubAccount: '',
    mfTaxCategory: '',
    mfDepartment: '',
    mfMemo: '',
  })

  const [keywordInput, setKeywordInput] = useState('')

  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean
    imageUrl: string
    fileName: string
  }>({
    isOpen: false,
    imageUrl: '',
    fileName: '',
  })

  // ファイルサイズをフォーマット
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const expenseId = params?.id as string

  useEffect(() => {
    const fetchExpense = async () => {
      setIsLoading(true)
      try {
        const result = await getExpenseById(expenseId)
        if (result.success) {
          const data = result.data as ExpenseDetail
          setExpense(data)

          // 既存の添付ファイルを設定
          setAttachments(data.KeihiAttachment || [])

          // フォームデータを設定
          setFormData({
            // 基本情報
            date: new Date(data.date).toISOString().split('T')[0],
            amount: data.amount.toString(),
            subject: data.subject,
            location: data.location || '',
            counterpartyName: data.counterpartyName || '',
            conversationPurpose: data.conversationPurpose || [],
            keywords: data.keywords,

            // 会話記録
            conversationSummary: data.conversationSummary || '',
            summary: data.summary || '',

            // 税務調査対応項目
            counterpartyContact: data.counterpartyContact || '',
            followUpPlan: data.followUpPlan || '',
            businessOpportunity: data.businessOpportunity || '',
            competitorInfo: data.competitorInfo || '',

            // AI生成情報
            insight: data.insight || '',
            autoTags: data.autoTags || [],
            status: data.status || '',

            // MoneyForward用情報
            mfSubject: data.mfSubject || '',
            mfSubAccount: data.mfSubAccount || '',
            mfTaxCategory: data.mfTaxCategory || '',
            mfDepartment: data.mfDepartment || '',
            mfMemo: data.mfMemo || '',
          })

          // AIドラフトデータを設定（既存のインサイトがある場合）
          if (data.insight) {
            setAiDraft({
              summary: data.summary || '',
              insight: data.insight,
              autoTags: data.autoTags || [],
              generatedKeywords: [],
            })
            setShowDraft(true)
          }
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

  // フォーム更新
  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  // キーワード追加
  const addKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()],
      }))
      setKeywordInput('')
    }
  }

  // キーワード削除
  const removeKeyword = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index),
    }))
  }

  // AIインサイト生成
  const handleGenerateInsights = async () => {
    setIsGeneratingInsights(true)

    try {
      const expenseFormData = {
        date: formData.date,
        amount: parseFloat(formData.amount) || 0,
        subject: formData.subject,
        location: formData.location,
        counterpartyName: formData.counterpartyName,
        conversationPurpose: formData.conversationPurpose,
        keywords: formData.keywords,
        conversationSummary: formData.conversationSummary,
      }

      const result = await generateInsightsDraft(expenseFormData, additionalInstruction || undefined)

      if (result.success && result.data) {
        setAiDraft(result.data)
        setShowDraft(true)
        toast.success('AIインサイトを生成しました')
      } else {
        toast.error(result.error || 'AIインサイト生成に失敗しました')
      }
    } catch (error) {
      console.error('AIインサイト生成エラー:', error)
      toast.error('AIインサイト生成に失敗しました')
    } finally {
      setIsGeneratingInsights(false)
    }
  }

  // カメラ・画像アップロード＋AI解析
  const handleImageCapture = async (files: File[]) => {
    // 画像ファイルのみをフィルタリング
    const imageFiles = files.filter(file => file.type.startsWith('image/'))

    if (imageFiles.length === 0) {
      toast.error('画像ファイルを選択してください')
      return
    }

    setIsAnalyzing(true)
    setAnalysisStatus('画像を解析・保存中...')

    try {
      const base64Images: string[] = []
      const uploadedAttachments: Array<{
        id: string
        filename: string
        originalName: string
        mimeType: string
        size: number
        url: string
      }> = []

      for (const file of imageFiles) {
        // Base64変換（AI解析用）
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = e => {
            const result = e.target?.result as string
            const base64Data = result.split(',')[1] // data:image/jpeg;base64, を除去
            resolve(base64Data)
          }
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
        base64Images.push(base64)

        // ファイルアップロード（添付ファイルとして保存）
        const formData = new FormData()
        formData.append('file', file)

        const uploadResult = await uploadAttachment(formData)
        if (uploadResult.success && uploadResult.data) {
          uploadedAttachments.push(uploadResult.data)
        } else {
          console.warn('ファイルアップロード失敗:', uploadResult.error)
        }
      }

      // 新しい添付ファイルリストに追加
      if (uploadedAttachments.length > 0) {
        setNewAttachments(prev => [...prev, ...uploadedAttachments])
        toast.success(`${uploadedAttachments.length}枚の画像を保存しました`)
      }

      // AI解析実行
      if (base64Images.length > 0) {
        const result = await analyzeMultipleReceipts(base64Images)

        if (result.success && result.data && result.data.receipts.length > 0) {
          const receipt = result.data.receipts[0]
          setFormData(prev => ({
            ...prev,
            date: receipt.date,
            amount: receipt.amount.toString(),
            subject: receipt.subject,
            counterpartyName: receipt.counterpartyName,
            conversationSummary: receipt.mfMemo,
          }))
          toast.success('領収書を解析しました！内容を確認してください。')
        } else {
          toast.error(result.error || '画像解析に失敗しました')
        }
      }
    } catch (error) {
      console.error('画像処理エラー:', error)
      toast.error('画像の処理に失敗しました')
    } finally {
      setIsAnalyzing(false)
      setAnalysisStatus('')
    }
  }

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.date || !formData.amount || !formData.subject) {
      toast.error('必須項目を入力してください')
      return
    }

    setIsSaving(true)
    try {
      // AIドラフトの内容をフォームデータに反映
      const updateData = {
        // 基本情報
        date: new Date(formData.date),
        amount: parseFloat(formData.amount),
        subject: formData.subject,
        location: formData.location || undefined,
        counterpartyName: formData.counterpartyName || undefined,
        conversationPurpose: formData.conversationPurpose || undefined,
        keywords: aiDraft?.generatedKeywords
          ? [...new Set([...formData.keywords, ...aiDraft.generatedKeywords])]
          : formData.keywords,

        // 会話記録
        conversationSummary: formData.conversationSummary || undefined,
        summary: formData.summary || undefined,

        // 税務調査対応項目
        counterpartyContact: formData.counterpartyContact || undefined,
        followUpPlan: formData.followUpPlan || undefined,
        businessOpportunity: formData.businessOpportunity || undefined,
        competitorInfo: formData.competitorInfo || undefined,

        // AI生成情報
        insight: aiDraft?.insight || formData.insight || undefined,
        autoTags: aiDraft?.autoTags || formData.autoTags,
        status: formData.status || undefined,

        // MoneyForward用情報
        mfSubject: formData.mfSubject || undefined,
        mfSubAccount: formData.mfSubAccount || undefined,
        mfTaxCategory: formData.mfTaxCategory || undefined,
        mfDepartment: formData.mfDepartment || undefined,
        mfMemo: formData.mfMemo || undefined,
      }

      const result = await updateExpense(expenseId, updateData)

      if (result.success) {
        // 新しく追加された添付ファイルがある場合は関連付け
        if (newAttachments.length > 0) {
          const attachmentIds = newAttachments.map(att => att.id)
          const linkResult = await linkAttachmentsToExpense(expenseId, attachmentIds)
          if (!linkResult.success) {
            console.warn('添付ファイルの関連付けに失敗:', linkResult.error)
            toast.warning('記録は更新されましたが、添付ファイルの関連付けに失敗しました')
          }
        }

        toast.success('記録を更新しました')
        router.push(`/keihi/expense/${expenseId}/edit`)
      } else {
        toast.error(result.error || '更新に失敗しました')
      }
    } catch (error) {
      console.error('更新エラー:', error)
      toast.error('更新に失敗しました')
    } finally {
      setIsSaving(false)
    }
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
          <button onClick={() => router.push('/keihi')} className="text-blue-600 hover:text-blue-800 underline">
            一覧に戻る
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md">
          {/* ヘッダー */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">経費記録編集</h1>
              <button
                onClick={() => router.push(`/keihi/expense/${expenseId}`)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                キャンセル
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* カメラ・画像アップロード */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">📸 追加領収書の読み取り</h2>
              <CameraUpload onImageCapture={handleImageCapture} isAnalyzing={isAnalyzing} analysisStatus={analysisStatus} />
              <p className="text-sm text-gray-600 mt-2">追加の領収書を撮影すると、フォームの内容を自動更新します</p>
            </section>

            {/* 基本情報フォーム */}
            <ExpenseBasicInfoForm
              formData={{
                date: formData.date,
                amount: parseInt(formData.amount) || 0,
                subject: formData.subject,
                location: formData.location,
                counterpartyName: formData.counterpartyName,
                counterpartyIndustry: formData.counterpartyIndustry,
                conversationPurpose: formData.conversationPurpose,
                keywords: formData.keywords,
                conversationSummary: formData.conversationSummary,
                learningDepth: formData.learningDepth ? parseInt(formData.learningDepth) : 3,
                status: expense.status || '',
              }}
              setFormData={newData => {
                if (typeof newData === 'function') {
                  // 関数形式の場合は現在の値を渡して更新
                  const currentExpenseFormData = {
                    date: formData.date,
                    amount: parseInt(formData.amount) || 0,
                    subject: formData.subject,
                    location: formData.location,
                    counterpartyName: formData.counterpartyName,
                    counterpartyIndustry: formData.counterpartyIndustry,
                    conversationPurpose: formData.conversationPurpose,
                    keywords: formData.keywords,
                    conversationSummary: formData.conversationSummary,
                    learningDepth: formData.learningDepth ? parseInt(formData.learningDepth) : 3,
                  }
                  const updated = newData(currentExpenseFormData)
                  setFormData(prev => ({
                    ...prev,
                    date: updated.date,
                    amount: updated.amount.toString(),
                    subject: updated.subject,
                    location: updated.location || '',
                    counterpartyName: updated.counterpartyName || '',
                    counterpartyIndustry: updated.counterpartyIndustry || '',
                    conversationPurpose: updated.conversationPurpose,
                    keywords: updated.keywords,
                    conversationSummary: updated.conversationSummary || '',
                    learningDepth: updated.learningDepth?.toString() || '3',
                  }))
                } else {
                  // オブジェクト形式の場合は直接更新
                  setFormData(prev => ({
                    ...prev,
                    date: newData.date,
                    amount: newData.amount.toString(),
                    subject: newData.subject,
                    location: newData.location || '',
                    counterpartyName: newData.counterpartyName || '',
                    counterpartyIndustry: newData.counterpartyIndustry || '',
                    conversationPurpose: newData.conversationPurpose,
                    keywords: newData.keywords,
                    conversationSummary: newData.conversationSummary || '',
                    learningDepth: newData.learningDepth?.toString() || '3',
                  }))
                }
              }}
              allOptions={allOptions}
              getFieldClass={getFieldClass}
            />

            {/* AIインサイトセクション */}
            <ExpenseAIDraftSection
              formData={{
                date: formData.date,
                amount: parseInt(formData.amount) || 0,
                subject: formData.subject,
                location: formData.location,
                counterpartyName: formData.counterpartyName,
                counterpartyIndustry: formData.counterpartyIndustry,
                conversationPurpose: formData.conversationPurpose,
                keywords: formData.keywords,
                conversationSummary: formData.conversationSummary,
                learningDepth: formData.learningDepth ? parseInt(formData.learningDepth) : 3,
              }}
              aiDraft={aiDraft}
              setAiDraft={setAiDraft}
              showDraft={showDraft}
              setShowDraft={setShowDraft}
              isAnalyzing={isGeneratingInsights}
              additionalInstruction={additionalInstruction}
              setAdditionalInstruction={setAdditionalInstruction}
              onGenerateDraft={handleGenerateInsights}
              onRegenerateDraft={handleGenerateInsights}
              setFormData={newData => {
                if (typeof newData === 'function') {
                  const currentExpenseFormData = {
                    date: formData.date,
                    amount: parseInt(formData.amount) || 0,
                    subject: formData.subject,
                    location: formData.location,
                    counterpartyName: formData.counterpartyName,
                    counterpartyIndustry: formData.counterpartyIndustry,
                    conversationPurpose: formData.conversationPurpose,
                    keywords: formData.keywords,
                    conversationSummary: formData.conversationSummary,
                    learningDepth: formData.learningDepth ? parseInt(formData.learningDepth) : 3,
                  }
                  const updated = newData(currentExpenseFormData)
                  setFormData(prev => ({
                    ...prev,
                    date: updated.date,
                    amount: updated.amount.toString(),
                    subject: updated.subject,
                    location: updated.location || '',
                    counterpartyName: updated.counterpartyName || '',
                    counterpartyIndustry: updated.counterpartyIndustry || '',
                    conversationPurpose: updated.conversationPurpose,
                    keywords: updated.keywords,
                    conversationSummary: updated.conversationSummary || '',
                    learningDepth: updated.learningDepth?.toString() || '3',
                  }))
                } else {
                  setFormData(prev => ({
                    ...prev,
                    date: newData.date,
                    amount: newData.amount.toString(),
                    subject: newData.subject,
                    location: newData.location || '',
                    counterpartyName: newData.counterpartyName || '',
                    counterpartyIndustry: newData.counterpartyIndustry || '',
                    conversationPurpose: newData.conversationPurpose,
                    keywords: newData.keywords,
                    conversationSummary: newData.conversationSummary || '',
                    learningDepth: newData.learningDepth?.toString() || '3',
                  }))
                }
              }}
            />

            {/* 添付ファイル */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">📎 撮影済み画像</h2>

              {/* 既存の添付ファイル */}
              {attachments.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">既存の画像</h3>
                  <div className="space-y-2">
                    {attachments.map(attachment => (
                      <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🖼️</span>
                          <div>
                            <p className="font-medium text-gray-900">{attachment.originalName}</p>
                            <p className="text-sm text-gray-600">
                              {attachment.mimeType} • {formatFileSize(attachment.size)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <ContentPlayer
                            src={attachment.url}
                            styles={{
                              thumbnail: {width: 300, height: 300},
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 新しく撮影した画像 */}
              {newAttachments.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">新しく撮影した画像</h3>
                  <div className="space-y-2">
                    {newAttachments.map(attachment => (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🖼️</span>
                          <div>
                            <p className="font-medium text-gray-900">{attachment.originalName}</p>
                            <p className="text-sm text-gray-600">
                              {attachment.mimeType} • {formatFileSize(attachment.size)}
                            </p>
                          </div>
                        </div>
                        <ContentPlayer
                          src={attachment.url}
                          styles={{
                            thumbnail: {width: 300, height: 300},
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* 送信ボタン */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push(`/keihi/expense/${expenseId}`)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                disabled={isSaving}
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                {isSaving ? '更新中...' : '更新'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
