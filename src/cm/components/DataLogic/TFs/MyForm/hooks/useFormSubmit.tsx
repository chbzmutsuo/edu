import {useState, useCallback} from 'react'
import {toast} from 'react-toastify'
import {doStandardPrisma} from '@lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {UpsertMain} from '@components/DataLogic/TFs/MyForm/helpers/UpsertMain'

import {requestResultType} from '@cm/types/types'
import {PrismaModelNames} from '@cm/types/prisma-types'

type UseFormSubmitProps = {
  prismaDataExtractionQuery: any
  myForm: any
  dataModelName: PrismaModelNames
  additional: any
  formData: any
  columns: any[]
  mutateRecords: (params: {record: any}) => void
  setformData: (data: any) => void
  editType: any
}

// エラータイプの定義
type FormErrorType = 'VALIDATION_ERROR' | 'NETWORK_ERROR' | 'PERMISSION_ERROR' | 'SERVER_ERROR' | 'UNKNOWN_ERROR'

// エラー詳細情報の型
interface FormErrorDetails {
  type: FormErrorType
  message: string
  originalError?: any
  field?: string
  code?: string
}

export const useFormSubmit = ({
  prismaDataExtractionQuery,
  myForm,
  dataModelName,
  additional,
  formData,
  columns,
  mutateRecords,
  setformData,
  editType,
}: UseFormSubmitProps) => {
  const [uploading, setUploading] = useState(false)
  const [lastError, setLastError] = useState<FormErrorDetails | null>(null)

  // エラー分類関数
  const classifyError = useCallback((error: any): FormErrorDetails => {
    if (!error) {
      return {
        type: 'UNKNOWN_ERROR',
        message: '不明なエラーが発生しました',
      }
    }

    // ネットワークエラー
    if (error.name === 'NetworkError' || error.message?.includes('fetch')) {
      return {
        type: 'NETWORK_ERROR',
        message: 'ネットワークエラーが発生しました。インターネット接続を確認してください。',
        originalError: error,
      }
    }

    // バリデーションエラー
    if (error.message?.includes('validation') || error.message?.includes('required')) {
      return {
        type: 'VALIDATION_ERROR',
        message: '入力データに問題があります。必須項目を確認してください。',
        originalError: error,
      }
    }

    // 権限エラー
    if (error.message?.includes('permission') || error.message?.includes('unauthorized')) {
      return {
        type: 'PERMISSION_ERROR',
        message: 'この操作を実行する権限がありません。管理者にお問い合わせください。',
        originalError: error,
      }
    }

    // サーバーエラー
    if (error.message?.includes('server') || error.status >= 500) {
      return {
        type: 'SERVER_ERROR',
        message: 'サーバーエラーが発生しました。しばらく時間をおいてから再度お試しください。',
        originalError: error,
      }
    }

    return {
      type: 'UNKNOWN_ERROR',
      message: error.message || 'エラーが発生しました',
      originalError: error,
    }
  }, [])

  // エラー表示関数
  const showErrorToast = useCallback((errorDetails: FormErrorDetails) => {
    const toastId = `form-error-${Date.now()}`

    // toast.error(errorDetails.message, {
    //   toastId,
    //   autoClose: errorDetails.type === 'NETWORK_ERROR' ? 8000 : 5000,
    //   closeOnClick: true,
    //   draggable: true,
    // })

    // 開発環境では詳細ログを出力
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Form Submit Error')
      console.error('Error Type:', errorDetails.type)
      console.error('Message:', errorDetails.message)
      console.error('Original Error:', errorDetails.originalError)
      console.groupEnd()
    }
  }, [])

  // データを取得してレコードを変更
  const findTheDataAndChangeRecord = useCallback(
    async ({res}: {res: any}) => {
      try {
        const {result: refetchedDataWithInclude} = await doStandardPrisma(dataModelName as any, 'findUnique', {
          where: {id: res?.result?.id},
          include: additional?.include,
        } as never)

        mutateRecords({record: refetchedDataWithInclude})
      } catch (error) {
        const errorDetails = classifyError(error)
        setLastError(errorDetails)
        showErrorToast(errorDetails)
        throw error
      }
    },
    [dataModelName, additional?.include, mutateRecords, classifyError, showErrorToast]
  )

  // クローズ処理
  const handleClosing = useCallback(
    async (res: requestResultType) => {
      try {
        const hasId = !!formData?.id

        if (editType?.type === 'modal' || !hasId) {
          setformData(null)
        }
      } catch (error) {
        const errorDetails = classifyError(error)
        setLastError(errorDetails)
        console.error('Error in handleClosing:', errorDetails)
      }
    },
    [formData?.id, editType?.type, setformData, classifyError]
  )

  // フォーム送信処理
  const handleOnSubmit = useCallback(
    async (latestFormData: any, extraFormState: any) => {
      // エラー状態をリセット
      setLastError(null)

      try {
        // パスワード確認
        if (latestFormData.password) {
          if (!confirm('フォームの値にパスワードが含まれています。\nパスワードを変更しますか？')) {
            toast.info('データ更新を中止しました。')
            return {
              success: false,
              message: 'ユーザーによってキャンセルされました',
              result: null,
            }
          }
        }

        setUploading(true)

        const res = await UpsertMain({
          prismaDataExtractionQuery,
          latestFormData,
          upsertController: myForm?.create,
          extraFormState,
          dataModelName,
          additional,
          formData: formData ?? {},
          columns,
        })

        if (res?.success !== true) {
          const errorDetails: FormErrorDetails = {
            type: 'SERVER_ERROR',
            message: res?.message || 'データの保存に失敗しました',
            originalError: res,
          }
          setLastError(errorDetails)
          showErrorToast(errorDetails)
          setUploading(false)
          return res
        }

        // データを取得して、レコードを変更する
        await findTheDataAndChangeRecord({res})
        // モーダルを閉じるなどのクローズ処理を実行する
        await handleClosing(res)
        setformData(null)

        setUploading(false)

        // // 成功メッセージ
        // toast.success(formData?.id ? 'データを更新しました' : 'データを作成しました', {
        //   autoClose: 3000,
        // })

        return res
      } catch (error: any) {
        const errorDetails = classifyError(error)
        setLastError(errorDetails)
        showErrorToast(errorDetails)

        console.error('Form submit error:', error.stack)
        setUploading(false)

        return {
          success: false,
          message: errorDetails.message,
          error: error,
          result: null,
        }
      }
    },
    [
      prismaDataExtractionQuery,
      myForm?.create,
      dataModelName,
      additional,
      formData,
      columns,
      findTheDataAndChangeRecord,
      handleClosing,
      setformData,
      classifyError,
      showErrorToast,
    ]
  )

  // エラー再試行関数
  const retryLastOperation = useCallback(async () => {
    if (lastError && !uploading) {
      setLastError(null)
    }
  }, [lastError, uploading])

  return {
    uploading,
    handleOnSubmit,
    lastError,
    retryLastOperation,
  }
}
