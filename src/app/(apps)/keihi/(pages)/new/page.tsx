'use client'

import {useState, useCallback} from 'react'
import {useRouter} from 'next/navigation'
import {toast} from 'react-toastify'
import {fetchCreateExpenseApi} from '@app/(apps)/keihi/api/expense/createExpense'

import {useExpenseForm} from '@app/(apps)/keihi/hooks/useExpenseForm'
import {useImageUpload} from '@app/(apps)/keihi/hooks/useImageUpload'
import {usePreviewModal} from '@app/(apps)/keihi/hooks/usePreviewModal'
import {ImageUploadSection} from '@app/(apps)/keihi/(pages)/new/components/ImageUploadSection'
import BasicInfoForm from '@app/(apps)/keihi/components/BasicInfoForm'
import AIDraftSection from '@app/(apps)/keihi/components/AIDraftSection'
import FormActions from '@app/(apps)/keihi/components/FormActions'
import {PreviewModal} from '@app/(apps)/keihi/components/ui/PreviewModal'
import {ProcessingStatus} from '@app/(apps)/keihi/components/ui/ProcessingStatus'
import {T_LINK} from '@components/styles/common-components/links'
import {generateInsightsDraft} from '@app/(apps)/keihi/actions/expense/insights'
import {analyzeReceiptImage} from '@app/(apps)/keihi/actions/expense/analyzeReceipt'
import {ExpenseFormData} from '@app/(apps)/keihi/types'

const NewExpensePage = () => {
  const router = useRouter()

  // カスタムフック
  const {
    formData,
    updateFormData,
    updateMultipleFields,
    addKeyword,
    removeKeyword,
    isFormValid,
    aiDraft,
    setAiDraft,
    showDraft,
    setShowDraft,
  } = useExpenseForm()

  const {uploadedImages, capturedImageFiles, isProcessing: isImageProcessing, processFiles, clearImages} = useImageUpload()

  const {modalState, openModal, closeModal} = usePreviewModal()

  // 状態管理
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [analysisStatus, setAnalysisStatus] = useState('')
  const [additionalInstruction, setAdditionalInstruction] = useState('')

  // 画像アップロード処理
  const handleImageCapture = useCallback(
    async (files: File[]) => {
      try {
        const result = await processFiles(files)
        if (result && result.base64Images.length > 0) {
          // 最初の画像を自動解析
          await handleImageAnalysis(result.base64Images[0])
        }
      } catch (error) {
        console.error('画像処理エラー:', error)
      }
    },
    [processFiles]
  )

  // 画像解析処理
  const handleImageAnalysis = useCallback(
    async (imageBase64: string) => {
      setIsAnalyzing(true)
      setAnalysisStatus('画像を解析中...')

      try {
        const result = await analyzeReceiptImage(imageBase64)

        if (result.success && result.data) {
          // フォームに解析結果を反映
          updateMultipleFields({
            date: result.data.date,
            amount: result.data.amount,
            subject: result.data.subject,
            counterpartyName: result.data.counterpartyName,
            keywords: result.data.keywords,
          })

          toast.success('画像解析が完了しました')
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
    },
    [updateMultipleFields]
  )

  // AIインサイト生成
  const handleGenerateInsights = useCallback(async () => {
    if (!isFormValid()) {
      toast.error('必須項目（日付、金額、科目）を入力してください')
      return
    }

    setIsGenerating(true)

    try {
      const result = await generateInsightsDraft(formData, additionalInstruction || undefined)

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
      setIsGenerating(false)
    }
  }, [formData, additionalInstruction, isFormValid, setAiDraft, setShowDraft])

  // フォーム送信
  const handleSubmit = useCallback(async () => {
    if (!isFormValid()) {
      toast.error('必須項目（日付、金額、科目）を入力してください')
      return
    }

    if (!aiDraft) {
      toast.error('AIインサイトを生成してください')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await fetchCreateExpenseApi(formData, capturedImageFiles, true, aiDraft)

      if (result.success) {
        toast.success('経費記録を作成しました')
        router.push('/keihi')
      } else {
        toast.error(result.error || '経費記録の作成に失敗しました')
      }
    } catch (error) {
      console.error('経費記録作成エラー:', error)
      toast.error('経費記録の作成に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, aiDraft, capturedImageFiles, isFormValid, router])

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-2 sm:px-4">
        <div className="bg-white rounded-lg shadow-md">
          {/* ヘッダー */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">新規経費記録</h1>
              <T_LINK href="/keihi" className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                戻る
              </T_LINK>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* 処理状況表示 */}
            <ProcessingStatus isVisible={isAnalyzing} message={analysisStatus} variant="info" />
            <ProcessingStatus isVisible={isGenerating} message="AIインサイトを生成中..." variant="info" />
            <ProcessingStatus isVisible={isSubmitting} message="経費記録を作成中..." variant="info" />

            {/* 画像アップロードセクション */}
            <ImageUploadSection
              {...{
                uploadedImages,
                analysisStatus,
                onImageCapture: handleImageCapture,
                onPreviewImage: openModal,
                isAnalyzing: isAnalyzing || isImageProcessing,
              }}
            />

            {/* 基本情報フォーム */}
            <BasicInfoForm
              formData={formData}
              setFormData={newData => {
                if (typeof newData === 'function') {
                  const updated = newData(formData)
                  Object.keys(updated).forEach(key => {
                    updateFormData(key as keyof ExpenseFormData, updated[key as keyof ExpenseFormData])
                  })
                } else {
                  Object.keys(newData).forEach(key => {
                    updateFormData(key as keyof ExpenseFormData, newData[key as keyof ExpenseFormData])
                  })
                }
              }}
              allOptions={{
                subjects: [
                  {value: '旅費交通費', label: '旅費交通費'},
                  {value: '接待交際費', label: '接待交際費'},
                  {value: '通信費', label: '通信費'},
                  {value: '消耗品費', label: '消耗品費'},
                  {value: '広告宣伝費', label: '広告宣伝費'},
                  {value: '会議費', label: '会議費'},
                  {value: '新聞図書費', label: '新聞図書費'},
                  {value: '支払手数料', label: '支払手数料'},
                ],
                purposes: [
                  {value: 'ビジネス相談', label: 'ビジネス相談'},
                  {value: '技術相談', label: '技術相談'},
                  {value: '情報交換', label: '情報交換'},
                  {value: '営業活動', label: '営業活動'},
                  {value: '研修・学習', label: '研修・学習'},
                ],
              }}
              getFieldClass={(value, required = false) => {
                const baseClass =
                  'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                if (required) {
                  const hasValue = Array.isArray(value) ? value.length > 0 : value !== '' && value !== 0 && value !== undefined
                  return hasValue ? `${baseClass} border-green-300 bg-green-50` : `${baseClass} border-red-300 bg-red-50`
                }
                const hasValue = Array.isArray(value) ? value.length > 0 : value !== '' && value !== 0 && value !== undefined
                return hasValue ? `${baseClass} border-blue-300 bg-blue-50` : `${baseClass} border-gray-300`
              }}
            />

            {/* AIインサイトセクション */}
            <AIDraftSection
              {...{
                formData,
                aiDraft,
                setAiDraft,
                showDraft,
                setShowDraft,
                isAnalyzing: isGenerating,
                additionalInstruction,
                setAdditionalInstruction,
                onGenerateDraft: handleGenerateInsights,
                onRegenerateDraft: handleGenerateInsights,
                setFormData: newData => {
                  if (typeof newData === 'function') {
                    const updated = newData(formData)
                    Object.keys(updated).forEach(key => {
                      updateFormData(key as keyof ExpenseFormData, updated[key as keyof ExpenseFormData])
                    })
                  } else {
                    Object.keys(newData).forEach(key => {
                      updateFormData(key as keyof ExpenseFormData, newData[key as keyof ExpenseFormData])
                    })
                  }
                },
              }}
            />

            {/* フォームアクション */}
            <FormActions
              {...{
                isLoading: isSubmitting,
                isAnalyzing: isGenerating,
                aiDraft,
                showDraft,
                onSubmit: handleSubmit,
              }}
            />
          </div>
        </div>
      </div>

      {/* プレビューモーダル */}
      <PreviewModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        imageUrl={modalState.imageUrl}
        fileName={modalState.fileName}
      />
    </div>
  )
}

export default NewExpensePage
