import {basePath} from '@lib/methods/common'

// 一括登録用の基本レコード作成
export const fetchAnalyzeReceiptImage = async (imageDataList: string[]): Promise<createBulkExpensesBasicReturn> => {
  const apiPath = `${basePath}/keihi/api/analyzeReceiptImage`
  const result = await fetch(apiPath, {
    method: 'POST',
    body: JSON.stringify({imageDataList}),
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then(res => res.json())

  return result
}

export type createBulkExpensesBasicReturn = {
  success: boolean
  data?: Array<{
    id: string
    date: string
    amount: number
    subject: string
    counterpartyName: string
    keywords: string[]
    imageIndex: number
    recordCreated: boolean
    imageUploaded: boolean
    errors: string[]
  }>
  summary?: {
    totalImages: number
    recordsCreated: number
    imagesUploaded: number
    failedRecords: number
    failedImages: number
  }
  error?: string
}
