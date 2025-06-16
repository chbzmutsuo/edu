'use client'

import {useState, useCallback, useMemo} from 'react'
import {useRouter} from 'next/navigation'
import {toast} from 'react-toastify'
import {createBulkExpensesBasic, generateInsightsForMultipleExpenses} from '../../../actions/expense-actions'
import {T_LINK} from '@components/styles/common-components/links'

interface AnalyzedReceipt {
  id: string
  date: string
  amount: number
  subject: string
  counterpartyName: string
  keywords: string[]
  imageIndex: number
  imageData: string
}

export default function BulkCreatePage() {
  const router = useRouter()

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false)
  const [analysisStatus, setAnalysisStatus] = useState('')
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [analyzedReceipts, setAnalyzedReceipts] = useState<AnalyzedReceipt[]>([])
  const [createdRecords, setCreatedRecords] = useState<AnalyzedReceipt[]>([])
  const [insightProgress, setInsightProgress] = useState({current: 0, total: 0})

  // 画像アップロード処理
  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    try {
      setIsAnalyzing(true)
      setAnalysisStatus(`${files.length}枚の画像を解析中...`)

      const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'))

      if (imageFiles.length === 0) {
        toast.error('画像ファイルが含まれていません')
        return
      }

      if (imageFiles.length !== files.length) {
        toast.warning(`${files.length - imageFiles.length}個の非画像ファイルをスキップしました`)
      }

      // Base64変換
      const base64Images: string[] = []
      for (const file of imageFiles) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = e => {
            const result = e.target?.result as string
            const base64Data = result.split(',')[1]
            resolve(base64Data)
          }
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
        base64Images.push(base64)
      }

      setUploadedImages(base64Images)
      toast.success(`${imageFiles.length}枚の画像をアップロードしました`)
    } catch (error) {
      console.error('画像アップロードエラー:', error)
      toast.error('画像のアップロードに失敗しました')
    } finally {
      setIsAnalyzing(false)
      setAnalysisStatus('')
    }
  }, [])

  // 一括解析実行
  const handleBulkAnalysis = useCallback(async () => {
    if (uploadedImages.length === 0) {
      toast.error('画像をアップロードしてください')
      return
    }

    try {
      setIsAnalyzing(true)
      setAnalysisStatus('画像を解析してレコードを作成中...')

      const result = await createBulkExpensesBasic(uploadedImages)

      if (result.success && result.data) {
        const receiptsWithImageData = result.data.map(record => ({
          ...record,
          imageData: uploadedImages[record.imageIndex],
        }))

        setAnalyzedReceipts(receiptsWithImageData)
        setCreatedRecords(receiptsWithImageData)
        toast.success(`${result.data.length}件のレコードを作成しました`)
      } else {
        toast.error(result.error || '解析に失敗しました')
      }
    } catch (error) {
      console.error('一括解析エラー:', error)
      toast.error('一括解析に失敗しました')
    } finally {
      setIsAnalyzing(false)
      setAnalysisStatus('')
    }
  }, [uploadedImages])

  // バックグラウンドインサイト生成
  const handleGenerateInsights = useCallback(async () => {
    if (createdRecords.length === 0) {
      toast.error('作成されたレコードがありません')
      return
    }

    try {
      setIsGeneratingInsights(true)
      setInsightProgress({current: 0, total: createdRecords.length})

      const expenseIds = createdRecords.map(record => record.id)

      // プログレス更新のため、個別に処理
      let processedCount = 0
      for (const expenseId of expenseIds) {
        setInsightProgress({current: processedCount, total: createdRecords.length})

        // 個別のインサイト生成は時間がかかるため、実際の処理は省略し、
        // バックグラウンドで実行されることをユーザーに通知
        await new Promise(resolve => setTimeout(resolve, 500)) // デモ用の待機
        processedCount++
      }

      // 実際のバックグラウンド処理を開始
      generateInsightsForMultipleExpenses(expenseIds).then(result => {
        if (result.success) {
          console.log(`${result.processedCount}件のインサイト生成が完了しました`)
        }
      })

      setInsightProgress({current: createdRecords.length, total: createdRecords.length})
      toast.success('インサイト生成をバックグラウンドで開始しました')

      // 一覧ページに遷移
      setTimeout(() => {
        router.push('/keihi')
      }, 2000)
    } catch (error) {
      console.error('インサイト生成エラー:', error)
      toast.error('インサイト生成の開始に失敗しました')
    } finally {
      setIsGeneratingInsights(false)
    }
  }, [createdRecords, router])

  // 画像プレビュー
  const getImagePreview = useCallback((base64Data: string) => {
    return `data:image/jpeg;base64,${base64Data}`
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-3 sm:px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">一括経費登録</h1>
              <T_LINK href="/keihi" className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                戻る
              </T_LINK>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• 複数枚の領収書画像を一括でアップロード・解析できます</p>
              <p>• 基本情報（日付、金額、科目、キーワード）のみでレコードを作成します</p>
              <p>• AIインサイトはバックグラウンドで生成されます</p>
            </div>
          </div>

          <div className="p-3 sm:p-6 space-y-6">
            {/* 画像アップロードセクション */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <div className="mb-4">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="mb-4">
                  <label htmlFor="bulk-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">複数の領収書画像をアップロード</span>
                    <span className="mt-1 block text-sm text-gray-500">PNG, JPG, JPEG形式に対応</span>
                  </label>
                  <input
                    id="bulk-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isAnalyzing || isCreating}
                  />
                </div>
                <button
                  onClick={() => document.getElementById('bulk-upload')?.click()}
                  disabled={isAnalyzing || isCreating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? '解析中...' : '画像を選択'}
                </button>
              </div>
            </div>

            {/* アップロード済み画像一覧 */}
            {uploadedImages.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">アップロード済み画像 ({uploadedImages.length}枚)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
                  {uploadedImages.map((imageData, index) => (
                    <div key={index} className="relative">
                      <img
                        src={getImagePreview(imageData)}
                        alt={`領収書 ${index + 1}`}
                        className="w-full h-24 object-cover rounded border"
                      />
                      <div className="absolute top-1 right-1 bg-blue-600 text-white text-xs px-1 rounded">{index + 1}</div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleBulkAnalysis}
                  disabled={isAnalyzing || isCreating || analyzedReceipts.length > 0}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isAnalyzing && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  {isAnalyzing ? '解析中...' : '一括解析・レコード作成'}
                </button>
              </div>
            )}

            {/* 処理状況表示 */}
            {(isAnalyzing || isCreating || isGeneratingInsights) && analysisStatus && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <p className="text-blue-800 font-medium">{analysisStatus}</p>
                </div>
              </div>
            )}

            {/* 解析結果一覧 */}
            {analyzedReceipts.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  解析結果・作成されたレコード ({analyzedReceipts.length}件)
                </h3>
                <div className="space-y-4 mb-6">
                  {analyzedReceipts.map((receipt, index) => (
                    <div key={receipt.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start gap-4">
                        <img
                          src={getImagePreview(receipt.imageData)}
                          alt={`領収書 ${index + 1}`}
                          className="w-16 h-16 object-cover rounded border flex-shrink-0"
                        />
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-500">日付</label>
                            <p className="text-sm text-gray-900">{receipt.date}</p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500">金額</label>
                            <p className="text-sm text-gray-900">¥{receipt.amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500">科目</label>
                            <p className="text-sm text-gray-900">{receipt.subject}</p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500">相手名</label>
                            <p className="text-sm text-gray-900">{receipt.counterpartyName}</p>
                          </div>
                        </div>
                      </div>
                      {receipt.keywords.length > 0 && (
                        <div className="mt-3">
                          <label className="block text-xs font-medium text-gray-500 mb-1">キーワード</label>
                          <div className="flex flex-wrap gap-1">
                            {receipt.keywords.map((keyword, keywordIndex) => (
                              <span key={keywordIndex} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* インサイト生成ボタン */}
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <button
                    onClick={handleGenerateInsights}
                    disabled={isGeneratingInsights}
                    className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isGeneratingInsights && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                    {isGeneratingInsights ? 'インサイト生成中...' : 'AIインサイト生成開始'}
                  </button>

                  {isGeneratingInsights && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>
                        進捗: {insightProgress.current}/{insightProgress.total}
                      </span>
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{width: `${(insightProgress.current / insightProgress.total) * 100}%`}}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    💡 AIインサイトはバックグラウンドで生成されます。生成完了後、各レコードの詳細ページで確認できます。
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
