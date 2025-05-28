import {useState, useCallback} from 'react'
import {toast} from 'react-toastify'
import {doStandardPrisma} from '@lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {UpsertMain} from '@components/DataLogic/TFs/MyForm/UpsertMain'
import useDataUpdated from 'src/cm/components/DataLogic/TFs/ClientConf/useDataUpdated'
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
  const {addUpdated} = useDataUpdated()

  // データを取得してレコードを変更
  const findTheDataAndChangeRecord = useCallback(
    async ({res}: {res: any}) => {
      const {result: refetchedDataWithInclude} = await doStandardPrisma(dataModelName as any, 'findUnique', {
        where: {id: res?.result?.id},
        include: additional?.include,
      } as never)

      mutateRecords({record: refetchedDataWithInclude})
    },
    [dataModelName, additional?.include, mutateRecords]
  )

  // クローズ処理
  const handleClosing = useCallback(
    async (res: requestResultType) => {
      const hasId = !!formData?.id

      if (editType?.type === 'modal' || !hasId) {
        setformData(null)
      }
    },
    [formData?.id, editType?.type, setformData]
  )

  // フォーム送信処理
  const handleOnSubmit = useCallback(
    async (latestFormData: any, extraFormState: any) => {
      try {
        // パスワード確認
        if (latestFormData.password) {
          if (!confirm('フォームの値にパスワードが含まれています。\nパスワードを変更しますか？')) {
            alert('データ更新を中止しました。')
            return
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
          toast.error('エラーが発生しました。(no response success)')
          setUploading(false)
          return res
        }

        // データを取得して、レコードを変更する
        await findTheDataAndChangeRecord({res})
        // モーダルを閉じるなどのクローズ処理を実行する
        await handleClosing(res)
        setformData(null)

        addUpdated()
        setUploading(false)
        return res
      } catch (error: any) {
        console.error(error.stack)
        setUploading(false)
        return {
          success: false,
          message: 'エラーが発生しました:' + error.message,
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
      addUpdated,
    ]
  )

  return {
    uploading,
    handleOnSubmit,
  }
}
