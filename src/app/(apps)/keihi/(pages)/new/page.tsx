'use client'

import {useState, useCallback, useMemo, useEffect, useRef} from 'react'
import {useRouter} from 'next/navigation'
import {toast} from 'react-toastify'
import {
  createExpense,
  createExpenseWithDraft,
  analyzeMultipleReceipts,
  generateInsightsDraft,
  type ExpenseFormData,
} from '../../actions/expense-actions'
import CameraUpload from '../../components/CameraUpload'
import BasicInfoForm from '../../components/BasicInfoForm'
import KeywordManager from '../../components/KeywordManager'
import ConversationSummary from '../../components/ConversationSummary'
import AIDraftSection from '../../components/AIDraftSection'
import FormActions from '../../components/FormActions'
import MultiReceiptDisplay from '../../components/MultiReceiptDisplay'
import {useAllOptions} from '../../hooks/useOptions'
import {T_LINK} from '@components/styles/common-components/links'
import {Eye, X} from 'lucide-react'

// AI下書きの型定義
interface AIDraft {
  businessInsightDetail: string
  businessInsightSummary: string
  techInsightDetail: string
  techInsightSummary: string
  autoTags: string[]
  generatedKeywords: string[]
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

export default function NewExpensePage() {
  const router = useRouter()

  // 状態の安定化のためのref
  const isAnalyzingRef = useRef(false)
  const uploadedImagesRef = useRef<string[]>([])

  const [isLoading, setIsLoading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisStatus, setAnalysisStatus] = useState('')
  const [aiDraft, setAiDraft] = useState<AIDraft | null>(null)
  const [showDraft, setShowDraft] = useState(false)
  const [additionalInstruction, setAdditionalInstruction] = useState('')
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [capturedImageFiles, setCapturedImageFiles] = useState<File[]>([]) // 撮影した画像ファイル
  const [multiReceiptData, setMultiReceiptData] = useState<any>(null)
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean
    imageUrl: string
    fileName: string
  }>({
    isOpen: false,
    imageUrl: '',
    fileName: '',
  })

  // マスタデータを取得（メモ化）
  const {allOptions, isLoading: isOptionsLoading, error: optionsError} = useAllOptions()

  const [formData, setFormData] = useState<ExpenseFormData>({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    subject: '',
    location: '',
    counterpartyName: '',
    counterpartyIndustry: '',
    conversationPurpose: '',
    keywords: [],
    conversationSummary: '',
    learningDepth: 3,
    // 税務調査対応項目
    counterpartyContact: '',
    followUpPlan: '',
    businessOpportunity: '',
    competitorInfo: '',
  })

  // 状態の同期
  useEffect(() => {
    isAnalyzingRef.current = isAnalyzing
  }, [isAnalyzing])

  useEffect(() => {
    uploadedImagesRef.current = uploadedImages
  }, [uploadedImages])

  // 複数画像の統合解析（useCallbackでメモ化）
  const analyzeMultipleImages = useCallback(async (imageList: string[]) => {
    if (imageList.length === 0) return

    // 既に解析中の場合はスキップ
    if (isAnalyzingRef.current) {
      console.log('解析中のため、新しい解析をスキップします')
      return
    }

    setIsAnalyzing(true)
    setAnalysisStatus(`${imageList.length}枚の領収書を解析中...`)

    try {
      const result = await analyzeMultipleReceipts(imageList)

      if (result.success && result.data) {
        setMultiReceiptData(result.data)

        if (result.data.suggestedMerge) {
          setAnalysisStatus('同一取引の可能性があります。金額を合計しますか？')
          // 合計金額でフォームを更新
          setFormData(prev => ({
            ...prev,
            date: result.data!.receipts[0].date,
            amount: result.data!.totalAmount,
            subject: result.data!.receipts[0].subject,
            counterpartyName: result.data!.receipts[0].counterpartyName,
            conversationSummary: `複数レシート合計 (${result.data!.receipts.length}枚): ${result.data!.receipts.map(r => `¥${r.amount.toLocaleString()}`).join(' + ')}`,
            keywords: [...(prev.keywords || []), ...result.data!.allKeywords.filter(k => !prev.keywords?.includes(k))],
          }))
          toast.success(
            `${result.data.receipts.length}枚の領収書を統合しました（合計: ¥${result.data.totalAmount.toLocaleString()}）`
          )
        } else {
          // 最新の領収書データでフォームを更新
          const latestReceipt = result.data.receipts[result.data.receipts.length - 1]
          setFormData(prev => ({
            ...prev,
            date: latestReceipt.date,
            amount: latestReceipt.amount,
            subject: latestReceipt.subject,
            counterpartyName: latestReceipt.counterpartyName,
            conversationSummary: latestReceipt.mfMemo,
            keywords: [...(prev.keywords || []), ...(latestReceipt.keywords || []).filter(k => !prev.keywords?.includes(k))],
          }))
          toast.success(`最新の領収書を解析しました（${imageList.length}枚目）`)
        }
      } else {
        toast.error(result.error || '画像解析に失敗しました')
      }
    } catch (error) {
      console.error('画像解析エラー:', error)
      toast.error('画像解析に失敗しました')
    } finally {
      setIsAnalyzing(false)
      setAnalysisStatus('')
    }
  }, []) // 依存配列を空にして安定化

  // カメラ・画像アップロード＋AI解析（useCallbackでメモ化）
  const handleImageCapture = useCallback(
    async (files: File[]) => {
      if (!files || files.length === 0) {
        toast.error('画像ファイルを選択してください')
        return
      }

      try {
        // 画像ファイルのみをフィルタリング
        const imageFiles = files.filter(file => file.type.startsWith('image/'))

        if (imageFiles.length === 0) {
          toast.error('画像ファイルが含まれていません')
          return
        }

        if (imageFiles.length !== files.length) {
          toast.warning(`${files.length - imageFiles.length}個の非画像ファイルをスキップしました`)
        }

        // Base64変換（AI解析用）
        const base64Images: string[] = []

        for (const file of imageFiles) {
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
        }

        // 撮影した画像ファイルを保存（レコード作成時にアップロード）
        setCapturedImageFiles(prev => [...prev, ...imageFiles])

        // 画像リストに追加（AI解析用）
        setUploadedImages(prev => {
          const newImages = [...prev, ...base64Images]
          // 複数画像の統合解析を実行（非同期で実行し、状態更新後に実行）
          setTimeout(() => {
            analyzeMultipleImages(newImages)
          }, 100)
          return newImages
        })

        toast.success(`${imageFiles.length}枚の画像を追加しました`)
      } catch (error) {
        console.error('画像処理エラー:', error)
        toast.error('画像の処理に失敗しました')
      }
    },
    [analyzeMultipleImages]
  )

  // プレビューモーダルの開閉
  const openPreviewModal = useCallback((imageUrl: string, fileName: string) => {
    setPreviewModal({
      isOpen: true,
      imageUrl,
      fileName,
    })
  }, [])

  const closePreviewModal = useCallback(() => {
    setPreviewModal({
      isOpen: false,
      imageUrl: '',
      fileName: '',
    })
  }, [])

  // 項目のハイライト判定（useCallbackでメモ化）
  const getFieldClass = useCallback((value: string | number | string[], required = false) => {
    const baseClass =
      'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'

    if (required) {
      const hasValue = Array.isArray(value) ? value.length > 0 : value !== '' && value !== 0 && value !== undefined
      return hasValue ? `${baseClass} border-green-300 bg-green-50` : `${baseClass} border-red-300 bg-red-50`
    }

    const hasValue = Array.isArray(value) ? value.length > 0 : value !== '' && value !== 0 && value !== undefined
    return hasValue ? `${baseClass} border-blue-300 bg-blue-50` : `${baseClass} border-gray-300`
  }, [])

  // AI下書き生成（useCallbackでメモ化）
  const generateDraft = useCallback(async () => {
    if (!formData.date || !formData.amount || !formData.subject) {
      toast.error('基本情報（日付、金額、科目）を入力してから下書きを生成してください')
      return
    }

    setIsAnalyzing(true)
    setAnalysisStatus('AIがインサイトの下書きを生成中...')

    try {
      const result = await generateInsightsDraft(formData, additionalInstruction)

      if (result.success && result.data) {
        setAiDraft(result.data)
        setShowDraft(true)
        toast.success('AI下書きを生成しました！内容を確認・編集してください。')
      } else {
        toast.error(result.error || '下書き生成に失敗しました')
      }
    } catch (error) {
      console.error('下書き生成エラー:', error)
      toast.error('下書き生成に失敗しました')
    } finally {
      setIsAnalyzing(false)
      setAnalysisStatus('')
    }
  }, [formData, additionalInstruction])

  // 下書きを再生成（useCallbackでメモ化）
  const regenerateDraft = useCallback(async () => {
    await generateDraft()
  }, [generateDraft])

  // フォーム送信（useCallbackでメモ化）
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!formData.date || !formData.amount || !formData.subject) {
        toast.error('日付、金額、科目は必須です')
        return
      }

      setIsLoading(true)

      try {
        let result

        if (aiDraft && showDraft) {
          // 下書きがある場合は、編集済みの下書きを使用して直接作成
          setAnalysisStatus('下書きを使用して記録を保存中...')

          // 下書きデータと撮影した画像ファイルを使用してcreateExpenseWithDraftを呼び出す
          result = await createExpenseWithDraft(formData, aiDraft, capturedImageFiles)
        } else {
          // 下書きがない場合は通常のAI生成フロー
          setAnalysisStatus('AIがインサイトを生成中...')
          result = await createExpense(formData, capturedImageFiles)
        }

        if (result.success && result.data) {
          toast.success('経費記録を作成しました！')
          router.push('/keihi')
        } else {
          toast.error(result.error || '作成に失敗しました')
        }
      } catch (error) {
        console.error('送信エラー:', error)
        toast.error('送信に失敗しました')
      } finally {
        setIsLoading(false)
        setAnalysisStatus('')
      }
    },
    [formData, aiDraft, showDraft, capturedImageFiles, router]
  )

  // メモ化されたCameraUploadのprops
  const cameraUploadProps = useMemo(
    () => ({
      onImageCapture: handleImageCapture,
      isAnalyzing,
      analysisStatus,
    }),
    [handleImageCapture, isAnalyzing, analysisStatus]
  )

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-2 sm:px-4">
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-3 sm:px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">新規経費記録</h1>
              <T_LINK href="/keihi" className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 sm:hidden">
                戻る
              </T_LINK>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                • <span className="text-red-500">赤色</span>：必須項目（未入力）
              </p>
              <p>
                • <span className="text-green-600">緑色</span>：必須項目（入力済み）
              </p>
              <p>
                • <span className="text-blue-600">青色</span>：任意項目（入力済み）
              </p>
            </div>
          </div>

          <div className="p-3 sm:p-6">
            {/* カメラ・画像アップロード */}
            <div className="mb-6">
              <CameraUpload {...cameraUploadProps} />
              <MultiReceiptDisplay multiReceiptData={multiReceiptData} />

              {/* アップロード済み画像のプレビュー */}
              {uploadedImages.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-3">📷 アップロード済み画像 ({uploadedImages.length}枚)</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {uploadedImages.map((imageBase64, index) => {
                      const imageUrl = `data:image/jpeg;base64,${imageBase64}`
                      const fileName = `領収書${index + 1}.jpg`
                      return (
                        <div key={index} className="relative group">
                          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                            <img src={imageUrl} alt={fileName} className="w-full h-full object-cover" />
                          </div>
                          <button
                            type="button"
                            onClick={() => openPreviewModal(imageUrl, fileName)}
                            className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center"
                          >
                            <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                          <div className="absolute bottom-1 left-1 right-1 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded text-center">
                            {index + 1}枚目
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* AI処理中の全体表示 */}
            {(isLoading || isAnalyzing) && analysisStatus && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <p className="text-blue-800 font-medium">{analysisStatus}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 基本情報 */}
              <BasicInfoForm
                formData={formData}
                setFormData={setFormData}
                allOptions={allOptions}
                getFieldClass={getFieldClass}
              />

              {/* キーワード */}
              <KeywordManager formData={formData} setFormData={setFormData} />

              {/* 会話内容の要約 */}
              <ConversationSummary formData={formData} setFormData={setFormData} getFieldClass={getFieldClass} />

              {/* AI下書き生成セクション */}
              <AIDraftSection
                formData={formData}
                setFormData={setFormData}
                aiDraft={aiDraft}
                setAiDraft={setAiDraft}
                showDraft={showDraft}
                setShowDraft={setShowDraft}
                isAnalyzing={isAnalyzing}
                additionalInstruction={additionalInstruction}
                setAdditionalInstruction={setAdditionalInstruction}
                onGenerateDraft={generateDraft}
                onRegenerateDraft={regenerateDraft}
              />

              {/* 送信ボタン */}
              <FormActions
                isLoading={isLoading}
                isAnalyzing={isAnalyzing}
                aiDraft={aiDraft}
                showDraft={showDraft}
                onSubmit={handleSubmit}
              />
            </form>
          </div>
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
