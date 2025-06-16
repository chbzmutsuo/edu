'use client'

import {useState, useEffect} from 'react'
import {useParams, useRouter} from 'next/navigation'
import {toast} from 'react-toastify'
import {
  getExpenseById,
  updateExpense,
  analyzeMultipleReceipts,
  uploadAttachment,
  linkAttachmentsToExpense,
  generateInsightsDraft,
  generateInsights,
} from '../../../../actions/expense-actions'
import CameraUpload from '../../../../components/CameraUpload'
import {useAllOptions} from '../../../../hooks/useOptions'
import {Loader2, Save, ArrowLeft, Sparkles, Eye, X} from 'lucide-react'

interface ExpenseDetail {
  id: string
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

export default function ExpenseEditPage() {
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisStatus, setAnalysisStatus] = useState('')
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false)
  const [insightStatus, setInsightStatus] = useState('')
  const [expense, setExpense] = useState<ExpenseDetail | null>(null)
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
    date: '',
    amount: '',
    subject: '',
    location: '',
    counterpartyName: '',
    counterpartyIndustry: '',
    conversationPurpose: '',
    keywords: [] as string[],
    conversationSummary: '',
    learningDepth: '',
    businessInsightDetail: '',
    businessInsightSummary: '',
    techInsightDetail: '',
    techInsightSummary: '',
    autoTags: [] as string[],
    mfSubject: '',
    mfTaxCategory: '',
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
            date: new Date(data.date).toISOString().split('T')[0],
            amount: data.amount.toString(),
            subject: data.subject,
            location: data.location || '',
            counterpartyName: data.counterpartyName || '',
            counterpartyIndustry: data.counterpartyIndustry || '',
            conversationPurpose: data.conversationPurpose || '',
            keywords: data.keywords,
            conversationSummary: data.conversationSummary || '',
            learningDepth: data.learningDepth?.toString() || '',
            businessInsightDetail: data.businessInsightDetail || '',
            businessInsightSummary: data.businessInsightSummary || '',
            techInsightDetail: data.techInsightDetail || '',
            techInsightSummary: data.techInsightSummary || '',
            autoTags: data.autoTags,
            mfSubject: data.mfSubject || '',
            mfTaxCategory: data.mfTaxCategory || '',
            mfMemo: data.mfMemo || '',
          })
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

  // AIインサイト生成（下書き）
  const handleGenerateInsightsDraft = async () => {
    setIsGeneratingInsights(true)
    setInsightStatus('AIインサイトを生成中...')

    try {
      const expenseFormData = {
        date: formData.date,
        amount: parseFloat(formData.amount) || 0,
        subject: formData.subject,
        location: formData.location,
        counterpartyName: formData.counterpartyName,
        counterpartyIndustry: formData.counterpartyIndustry,
        conversationPurpose: formData.conversationPurpose,
        keywords: formData.keywords,
        conversationSummary: formData.conversationSummary,
        learningDepth: formData.learningDepth ? parseInt(formData.learningDepth) : undefined,
      }

      const result = await generateInsightsDraft(expenseFormData)

      if (result.success && result.data) {
        setFormData(prev => ({
          ...prev,
          businessInsightDetail: result.data!.businessInsightDetail,
          businessInsightSummary: result.data!.businessInsightSummary,
          techInsightDetail: result.data!.techInsightDetail,
          techInsightSummary: result.data!.techInsightSummary,
          autoTags: result.data!.autoTags,
          // 生成されたキーワードも追加
          keywords: [...prev.keywords, ...(result.data!.generatedKeywords || [])].filter((v, i, a) => a.indexOf(v) === i),
        }))
        toast.success('AIインサイトを生成しました！内容を確認してください。')
      } else {
        toast.error(result.error || 'AIインサイト生成に失敗しました')
      }
    } catch (error) {
      console.error('AIインサイト生成エラー:', error)
      toast.error('AIインサイト生成に失敗しました')
    } finally {
      setIsGeneratingInsights(false)
      setInsightStatus('')
    }
  }

  // AIインサイト再生成（完全版）
  const handleRegenerateInsights = async () => {
    setIsGeneratingInsights(true)
    setInsightStatus('AIインサイトを再生成中...')

    try {
      const expenseFormData = {
        date: formData.date,
        amount: parseFloat(formData.amount) || 0,
        subject: formData.subject,
        location: formData.location,
        counterpartyName: formData.counterpartyName,
        counterpartyIndustry: formData.counterpartyIndustry,
        conversationPurpose: formData.conversationPurpose,
        keywords: formData.keywords,
        conversationSummary: formData.conversationSummary,
        learningDepth: formData.learningDepth ? parseInt(formData.learningDepth) : undefined,
      }

      const result = await generateInsights(expenseFormData)

      setFormData(prev => ({
        ...prev,
        businessInsightDetail: result.businessInsightDetail,
        businessInsightSummary: result.businessInsightSummary,
        techInsightDetail: result.techInsightDetail,
        techInsightSummary: result.techInsightSummary,
        autoTags: result.autoTags,
        mfSubject: result.mfSubject,
        mfTaxCategory: result.mfTaxCategory,
        mfMemo: result.mfMemo,
      }))
      toast.success('AIインサイトを再生成しました！')
    } catch (error) {
      console.error('AIインサイト再生成エラー:', error)
      toast.error('AIインサイト再生成に失敗しました')
    } finally {
      setIsGeneratingInsights(false)
      setInsightStatus('')
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
      const updateData = {
        date: new Date(formData.date),
        amount: parseFloat(formData.amount),
        subject: formData.subject,
        location: formData.location || undefined,
        counterpartyName: formData.counterpartyName || undefined,
        counterpartyIndustry: formData.counterpartyIndustry || undefined,
        conversationPurpose: formData.conversationPurpose || undefined,
        keywords: formData.keywords,
        conversationSummary: formData.conversationSummary || undefined,
        learningDepth: formData.learningDepth ? parseInt(formData.learningDepth) : undefined,
        businessInsightDetail: formData.businessInsightDetail || undefined,
        businessInsightSummary: formData.businessInsightSummary || undefined,
        techInsightDetail: formData.techInsightDetail || undefined,
        techInsightSummary: formData.techInsightSummary || undefined,
        autoTags: formData.autoTags,
        mfSubject: formData.mfSubject || undefined,
        mfTaxCategory: formData.mfTaxCategory || undefined,
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
        router.push(`/keihi/expense/${expenseId}`)
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

  // 項目のハイライト判定
  const getFieldClass = (value: string | string[], required = false) => {
    const baseClass =
      'mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'

    if (required) {
      return value && (Array.isArray(value) ? value.length > 0 : value.trim() !== '')
        ? `${baseClass} border-green-300 bg-green-50`
        : `${baseClass} border-red-300 bg-red-50`
    }

    return value && (Array.isArray(value) ? value.length > 0 : value.trim() !== '')
      ? `${baseClass} border-blue-300 bg-blue-50`
      : `${baseClass} border-gray-300`
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

            {/* 基本情報 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    日付 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => handleInputChange('date', e.target.value)}
                    className={getFieldClass(formData.date, true)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    金額 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={e => handleInputChange('amount', e.target.value)}
                    className={getFieldClass(formData.amount, true)}
                    placeholder="例: 5000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    科目 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.subject}
                    onChange={e => handleInputChange('subject', e.target.value)}
                    className={getFieldClass(formData.subject, true)}
                    required
                  >
                    <option value="">選択してください</option>
                    {allOptions.subjects.map(subject => (
                      <option key={subject.value} value={subject.value}>
                        {subject.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">場所</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={e => handleInputChange('location', e.target.value)}
                    className={getFieldClass(formData.location)}
                    placeholder="例: 渋谷駅前カフェ"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">相手名</label>
                  <input
                    type="text"
                    value={formData.counterpartyName}
                    onChange={e => handleInputChange('counterpartyName', e.target.value)}
                    className={getFieldClass(formData.counterpartyName)}
                    placeholder="例: 田中太郎"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">相手の職種・業種</label>
                  <input
                    type="text"
                    value={formData.counterpartyIndustry}
                    onChange={e => handleInputChange('counterpartyIndustry', e.target.value)}
                    className={getFieldClass(formData.counterpartyIndustry)}
                    placeholder="例：飲食店経営、小学校教師、人事担当者、運送業"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">会話の目的</label>
                  <select
                    value={formData.conversationPurpose}
                    onChange={e => handleInputChange('conversationPurpose', e.target.value)}
                    className={getFieldClass(formData.conversationPurpose)}
                  >
                    <option value="">選択してください</option>
                    {allOptions.purposes.map(purpose => (
                      <option key={purpose.value} value={purpose.value}>
                        {purpose.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">学びの深さ・重要度</label>
                  <select
                    value={formData.learningDepth}
                    onChange={e => handleInputChange('learningDepth', e.target.value)}
                    className={getFieldClass(formData.learningDepth)}
                  >
                    <option value="">選択してください</option>
                    {[1, 2, 3, 4, 5].map(num => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* キーワード */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">キーワード</h2>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={e => setKeywordInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="キーワードを入力してEnterで追加"
                  />
                  <button
                    type="button"
                    onClick={addKeyword}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    追加
                  </button>
                </div>
                {formData.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {keyword}
                        <button
                          type="button"
                          onClick={() => removeKeyword(index)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* 会話内容の要約 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">会話内容の要約</h2>
              <textarea
                value={formData.conversationSummary}
                onChange={e => handleInputChange('conversationSummary', e.target.value)}
                className={getFieldClass(formData.conversationSummary)}
                rows={4}
                placeholder="会話の内容を1〜3文程度で要約してください"
              />
            </section>

            {/* AIインサイト */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">🤖 AIインサイト</h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleGenerateInsightsDraft}
                    disabled={isGeneratingInsights || !formData.subject || !formData.amount}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isGeneratingInsights && insightStatus.includes('生成中') && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    💡 インサイト生成
                  </button>
                  <button
                    type="button"
                    onClick={handleRegenerateInsights}
                    disabled={isGeneratingInsights || !formData.subject || !formData.amount}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isGeneratingInsights && insightStatus.includes('再生成中') && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    🔄 再生成
                  </button>
                </div>
              </div>

              {isGeneratingInsights && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="text-blue-800 font-medium">{insightStatus}</span>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {/* 営業インサイト */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-2">📈 営業インサイト</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">要約</label>
                      <textarea
                        value={formData.businessInsightSummary}
                        onChange={e => handleInputChange('businessInsightSummary', e.target.value)}
                        className={getFieldClass(formData.businessInsightSummary)}
                        rows={2}
                        placeholder="営業インサイトの要約"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">詳細</label>
                      <textarea
                        value={formData.businessInsightDetail}
                        onChange={e => handleInputChange('businessInsightDetail', e.target.value)}
                        className={getFieldClass(formData.businessInsightDetail)}
                        rows={4}
                        placeholder="営業インサイトの詳細"
                      />
                    </div>
                  </div>
                </div>

                {/* 技術インサイト */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-2">💻 技術インサイト</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">要約</label>
                      <textarea
                        value={formData.techInsightSummary}
                        onChange={e => handleInputChange('techInsightSummary', e.target.value)}
                        className={getFieldClass(formData.techInsightSummary)}
                        rows={2}
                        placeholder="技術インサイトの要約"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">詳細</label>
                      <textarea
                        value={formData.techInsightDetail}
                        onChange={e => handleInputChange('techInsightDetail', e.target.value)}
                        className={getFieldClass(formData.techInsightDetail)}
                        rows={4}
                        placeholder="技術インサイトの詳細"
                      />
                    </div>
                  </div>
                </div>

                {/* 自動タグ */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-2">🏷️ 自動生成タグ</h3>
                  {formData.autoTags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {formData.autoTags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                autoTags: prev.autoTags.filter((_, i) => i !== index),
                              }))
                            }}
                            className="ml-2 text-green-600 hover:text-green-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">AIインサイトを生成すると自動でタグが作成されます</p>
                  )}
                </div>
              </div>
            </section>

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
                          <button
                            type="button"
                            onClick={() => openPreviewModal(attachment.url, attachment.originalName)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            プレビュー
                          </button>
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
                        <button
                          type="button"
                          onClick={() => openPreviewModal(attachment.url, attachment.originalName)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          プレビュー
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* MoneyForward用設定 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">MoneyForward用設定</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">MF科目</label>
                  <input
                    type="text"
                    value={formData.mfSubject}
                    onChange={e => handleInputChange('mfSubject', e.target.value)}
                    className={getFieldClass(formData.mfSubject)}
                    placeholder="空欄の場合は基本科目を使用"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">税区分</label>
                  <select
                    value={formData.mfTaxCategory}
                    onChange={e => handleInputChange('mfTaxCategory', e.target.value)}
                    className={getFieldClass(formData.mfTaxCategory)}
                  >
                    <option value="">選択してください（デフォルト: 課仕 10%）</option>
                    <option value="課仕 10%">課仕 10%</option>
                    <option value="課仕 8%">課仕 8%</option>
                    <option value="非課税">非課税</option>
                    <option value="不課税">不課税</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">摘要</label>
                  <textarea
                    value={formData.mfMemo}
                    onChange={e => handleInputChange('mfMemo', e.target.value)}
                    className={getFieldClass(formData.mfMemo)}
                    rows={2}
                    placeholder="空欄の場合は会話要約または自動生成"
                  />
                </div>
              </div>
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

      {/* プレビューモーダル */}
      <PreviewModal
        isOpen={previewModal.isOpen}
        onClose={closePreviewModal}
        imageUrl={previewModal.imageUrl}
        fileName={previewModal.fileName}
      />
    </div>
  )
}
