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
import {useAllOptions} from '../../hooks/useOptions'
import {T_LINK} from '@components/styles/common-components/links'

export default function NewExpensePage() {
  const router = useRouter()

  // 状態の安定化のためのref
  const isAnalyzingRef = useRef(false)
  const uploadedImagesRef = useRef<string[]>([])

  const [isLoading, setIsLoading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisStatus, setAnalysisStatus] = useState('')
  const [aiDraft, setAiDraft] = useState<{
    businessInsightDetail: string
    businessInsightSummary: string
    techInsightDetail: string
    techInsightSummary: string
    autoTags: string[]
    generatedKeywords: string[]
  } | null>(null)
  const [showDraft, setShowDraft] = useState(false)
  const [additionalInstruction, setAdditionalInstruction] = useState('')
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [capturedImageFiles, setCapturedImageFiles] = useState<File[]>([]) // 撮影した画像ファイル
  const [multiReceiptData, setMultiReceiptData] = useState<any>(null)

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

  const [keywordInput, setKeywordInput] = useState('')

  // ファイルサイズをフォーマット
  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }, [])

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

  // キーワード追加（useCallbackでメモ化）
  const addKeyword = useCallback(() => {
    if (keywordInput.trim() && !formData.keywords?.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...(prev.keywords || []), keywordInput.trim()],
      }))
      setKeywordInput('')
    }
  }, [keywordInput, formData.keywords])

  // キーワード削除（useCallbackでメモ化）
  const removeKeyword = useCallback((keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords?.filter(k => k !== keyword) || [],
    }))
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
    [formData, aiDraft, showDraft, router]
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

  // モバイル検出
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768
  }, [])

  // 追加のrefを定義（モバイル対策）
  const formDataRef = useRef(formData)
  const multiReceiptDataRef = useRef(multiReceiptData)
  const aiDraftRef = useRef(aiDraft)
  const showDraftRef = useRef(showDraft)
  const additionalInstructionRef = useRef(additionalInstruction)

  // refの同期（常に最新の状態をrefに保持）
  useEffect(() => {
    formDataRef.current = formData
    uploadedImagesRef.current = uploadedImages
    multiReceiptDataRef.current = multiReceiptData
    aiDraftRef.current = aiDraft
    showDraftRef.current = showDraft
    additionalInstructionRef.current = additionalInstruction
  }, [formData, uploadedImages, multiReceiptData, aiDraft, showDraft, additionalInstruction])

  // モバイル専用：スクロール時の状態保護
  useEffect(() => {
    if (!isMobile) return

    // モバイル専用：タッチイベントでも状態保護
    const handleTouchStart = () => {
      // タッチ開始時に現在の状態をrefに確実に保存
      formDataRef.current = formData
      uploadedImagesRef.current = uploadedImages
      multiReceiptDataRef.current = multiReceiptData
      aiDraftRef.current = aiDraft
      showDraftRef.current = showDraft
      additionalInstructionRef.current = additionalInstruction
      console.log('タッチ時状態保護:', {
        formData: formDataRef.current,
        uploadedImages: uploadedImagesRef.current.length,
        aiDraft: !!aiDraftRef.current,
      })
    }

    const handleScroll = () => {
      // スクロール時に状態をrefに確実に保存
      formDataRef.current = formData
      uploadedImagesRef.current = uploadedImages
      multiReceiptDataRef.current = multiReceiptData
      aiDraftRef.current = aiDraft
      showDraftRef.current = showDraft
      additionalInstructionRef.current = additionalInstruction
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // ページが非表示になる時に状態をrefに保存
        formDataRef.current = formData
        uploadedImagesRef.current = uploadedImages
        multiReceiptDataRef.current = multiReceiptData
        aiDraftRef.current = aiDraft
        showDraftRef.current = showDraft
        additionalInstructionRef.current = additionalInstruction
        console.log('ページ非表示時状態保護')
      }
    }

    window.addEventListener('scroll', handleScroll, {passive: true})
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('touchstart', handleTouchStart, {passive: true})

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('touchstart', handleTouchStart)
    }
  }, [formData, uploadedImages, multiReceiptData, aiDraft, showDraft, additionalInstruction, isMobile])

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

              {/* 複数領収書の解析結果表示 */}
              {multiReceiptData && multiReceiptData.receipts.length > 1 && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h4 className="font-medium text-amber-800 mb-2">📋 複数領収書解析結果</h4>
                  <div className="space-y-2">
                    {multiReceiptData.receipts.map((receipt: any, index: number) => (
                      <div key={index} className="text-sm text-amber-700 bg-white p-2 rounded border">
                        {index + 1}枚目: {receipt.counterpartyName} - ¥{receipt.amount.toLocaleString()} ({receipt.date})
                      </div>
                    ))}
                    <div className="text-sm font-medium text-amber-800 pt-2 border-t">
                      合計金額: ¥{multiReceiptData.totalAmount.toLocaleString()}
                      {multiReceiptData.suggestedMerge && ' (同一取引として統合済み)'}
                    </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    日付 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData(prev => ({...prev, date: e.target.value}))}
                    className={getFieldClass(formData.date, true)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    金額 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={e => setFormData(prev => ({...prev, amount: parseInt(e.target.value) || 0}))}
                    className={getFieldClass(formData.amount, true)}
                    placeholder="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    科目 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.subject}
                    onChange={e => setFormData(prev => ({...prev, subject: e.target.value}))}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">場所</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={e => setFormData(prev => ({...prev, location: e.target.value}))}
                    className={getFieldClass(formData.location || '')}
                    placeholder="会場や店舗名など"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">相手名</label>
                  <input
                    type="text"
                    value={formData.counterpartyName}
                    onChange={e => setFormData(prev => ({...prev, counterpartyName: e.target.value}))}
                    className={getFieldClass(formData.counterpartyName || '')}
                    placeholder="個人名または法人名"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">相手の職種・業種</label>
                  <input
                    type="text"
                    value={formData.counterpartyIndustry}
                    onChange={e => setFormData(prev => ({...prev, counterpartyIndustry: e.target.value}))}
                    className={getFieldClass(formData.counterpartyIndustry || '')}
                    placeholder="例：飲食店経営、小学校教師、人事担当者、運送業"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">会話の目的</label>
                  <select
                    value={formData.conversationPurpose}
                    onChange={e => setFormData(prev => ({...prev, conversationPurpose: e.target.value}))}
                    className={getFieldClass(formData.conversationPurpose || '')}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">学びの深さ・重要度</label>
                  <select
                    value={formData.learningDepth}
                    onChange={e => setFormData(prev => ({...prev, learningDepth: parseInt(e.target.value)}))}
                    className={getFieldClass(formData.learningDepth || 0)}
                  >
                    <option value={1}>1 - 低い</option>
                    <option value={2}>2</option>
                    <option value={3}>3 - 普通</option>
                    <option value={4}>4</option>
                    <option value={5}>5 - 高い</option>
                  </select>
                </div>
              </div>

              {/* キーワード */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">キーワード</label>
                <div className="flex flex-col sm:flex-row gap-2 mb-2">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={e => setKeywordInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="キーワードを入力してEnter"
                  />
                  <button
                    type="button"
                    onClick={addKeyword}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 sm:w-auto w-full"
                  >
                    追加
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.keywords?.map(keyword => (
                    <span
                      key={keyword}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeKeyword(keyword)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* 会話内容の要約 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">会話内容の要約</label>
                <textarea
                  value={formData.conversationSummary}
                  onChange={e => setFormData(prev => ({...prev, conversationSummary: e.target.value}))}
                  rows={4}
                  className={getFieldClass(formData.conversationSummary || '')}
                  placeholder="1〜3文程度の自然文要約"
                />
              </div>

              {/* 税務調査対応項目 */}
              <div className="border-t border-gray-200 pt-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">相手の連絡先</label>
                    <input
                      type="text"
                      value={formData.counterpartyContact}
                      onChange={e => setFormData(prev => ({...prev, counterpartyContact: e.target.value}))}
                      className={getFieldClass(formData.counterpartyContact || '')}
                      placeholder="例：田中様（○○会社）090-1234-5678"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">フォローアップ予定</label>
                    <textarea
                      value={formData.followUpPlan}
                      onChange={e => setFormData(prev => ({...prev, followUpPlan: e.target.value}))}
                      rows={2}
                      className={getFieldClass(formData.followUpPlan || '')}
                      placeholder="例：来月中旬に提案書を作成して再度打ち合わせ予定"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ビジネス機会の評価</label>
                    <textarea
                      value={formData.businessOpportunity}
                      onChange={e => setFormData(prev => ({...prev, businessOpportunity: e.target.value}))}
                      rows={2}
                      className={getFieldClass(formData.businessOpportunity || '')}
                      placeholder="例：月額10万円程度の開発案件に発展する可能性あり"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">競合・市場情報</label>
                    <textarea
                      value={formData.competitorInfo}
                      onChange={e => setFormData(prev => ({...prev, competitorInfo: e.target.value}))}
                      rows={2}
                      className={getFieldClass(formData.competitorInfo || '')}
                      placeholder="例：現在は○○社のシステムを使用中だが、カスタマイズ性に課題"
                    />
                  </div>
                </div>
              </div>

              {/* 撮影済み画像（レコード作成時に保存） */}
              {capturedImageFiles.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">📎 撮影済み画像</label>
                  <div className="space-y-2">
                    {capturedImageFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🖼️</span>
                          <div>
                            <p className="font-medium text-gray-900">{file.name}</p>
                            <p className="text-sm text-gray-600">
                              {file.type} • {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const reader = new FileReader()
                            reader.onload = e => {
                              const newWindow = window.open()
                              if (newWindow) {
                                newWindow.document.write(`
                                  <html>
                                    <head><title>${file.name}</title></head>
                                    <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f0f0f0;">
                                      <img src="${e.target?.result}" style="max-width:100%;max-height:100%;object-fit:contain;" alt="${file.name}" />
                                    </body>
                                  </html>
                                `)
                              }
                            }
                            reader.readAsDataURL(file)
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          プレビュー
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI下書き生成セクション */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">AIインサイト下書き</h2>
                  <button
                    type="button"
                    onClick={generateDraft}
                    disabled={isAnalyzing || isLoading}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isAnalyzing && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                    {isAnalyzing ? '生成中...' : '下書き生成'}
                  </button>
                </div>

                {/* 追加指示入力 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">AIへの追加指示（任意）</label>
                  <textarea
                    value={additionalInstruction}
                    onChange={e => setAdditionalInstruction(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="例：技術的な内容を重視して、営業面は簡潔に"
                  />
                </div>

                {/* 下書き表示 */}
                {showDraft && aiDraft && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-purple-900">生成された下書き</h3>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={regenerateDraft}
                          disabled={isAnalyzing}
                          className="text-sm px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
                        >
                          再生成
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowDraft(false)}
                          className="text-sm px-3 py-1 border border-purple-300 text-purple-700 rounded hover:bg-purple-100"
                        >
                          閉じる
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* 営業インサイト */}
                      <div>
                        <label className="block text-sm font-medium text-purple-800 mb-1">営業・ビジネスインサイト</label>
                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs text-purple-700">要約</label>
                            <textarea
                              value={aiDraft.businessInsightSummary}
                              onChange={e =>
                                setAiDraft(prev => (prev ? {...prev, businessInsightSummary: e.target.value} : null))
                              }
                              rows={1}
                              className="w-full px-2 py-1 text-sm border border-purple-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-purple-700">詳細</label>
                            <textarea
                              value={aiDraft.businessInsightDetail}
                              onChange={e => setAiDraft(prev => (prev ? {...prev, businessInsightDetail: e.target.value} : null))}
                              rows={3}
                              className="w-full px-2 py-1 text-sm border border-purple-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 技術インサイト */}
                      <div>
                        <label className="block text-sm font-medium text-purple-800 mb-1">技術・開発インサイト</label>
                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs text-purple-700">要約</label>
                            <textarea
                              value={aiDraft.techInsightSummary}
                              onChange={e => setAiDraft(prev => (prev ? {...prev, techInsightSummary: e.target.value} : null))}
                              rows={1}
                              className="w-full px-2 py-1 text-sm border border-purple-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-purple-700">詳細</label>
                            <textarea
                              value={aiDraft.techInsightDetail}
                              onChange={e => setAiDraft(prev => (prev ? {...prev, techInsightDetail: e.target.value} : null))}
                              rows={3}
                              className="w-full px-2 py-1 text-sm border border-purple-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 生成されたキーワード */}
                      {aiDraft.generatedKeywords && aiDraft.generatedKeywords.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-purple-800 mb-1">
                            生成されたキーワード
                            <span className="text-xs text-purple-600 ml-2">（個人開発アイデア生成に使用）</span>
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {aiDraft.generatedKeywords.map((keyword, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 text-xs bg-green-100 text-green-800 border border-green-300 rounded-full"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                          <div className="mt-2">
                            <button
                              type="button"
                              onClick={() => {
                                // 生成されたキーワードをフォームのキーワードに追加
                                const currentKeywords = formData.keywords || []
                                const newKeywords = [...new Set([...currentKeywords, ...aiDraft.generatedKeywords])]
                                setFormData(prev => ({...prev, keywords: newKeywords}))
                                toast.success('生成されたキーワードをフォームに追加しました')
                              }}
                              className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              キーワードをフォームに追加
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 自動タグ */}
                      <div>
                        <label className="block text-sm font-medium text-purple-800 mb-1">自動生成タグ</label>
                        <div className="flex flex-wrap gap-2">
                          {aiDraft.autoTags.map((tag, index) => (
                            <div key={index} className="flex items-center gap-1">
                              <input
                                type="text"
                                value={tag}
                                onChange={e => {
                                  const newTags = [...aiDraft.autoTags]
                                  newTags[index] = e.target.value
                                  setAiDraft(prev => (prev ? {...prev, autoTags: newTags} : null))
                                }}
                                className="px-2 py-1 text-xs border border-purple-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newTags = aiDraft.autoTags.filter((_, i) => i !== index)
                                  setAiDraft(prev => (prev ? {...prev, autoTags: newTags} : null))
                                }}
                                className="text-purple-600 hover:text-purple-800 text-xs"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              const newTags = [...aiDraft.autoTags, '新しいタグ']
                              setAiDraft(prev => (prev ? {...prev, autoTags: newTags} : null))
                            }}
                            className="px-2 py-1 text-xs border border-dashed border-purple-400 text-purple-600 rounded hover:bg-purple-100"
                          >
                            + タグ追加
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 送信ボタン */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 order-2 sm:order-1"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={isLoading || isAnalyzing}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 order-1 sm:order-2"
                >
                  {(isLoading || isAnalyzing) && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  {isLoading ? '作成中...' : isAnalyzing ? '解析中...' : aiDraft && showDraft ? '下書きで作成' : '作成'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
