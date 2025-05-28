/**
 * サーバーレス環境用ユーティリティ
 * Cloud Run, Vercel, AWS Lambda等での最適化
 */

// KING OF TIME API設定
export const KING_OF_TIME_API_BASE_URL = 'https://api.kingtime.jp/v1.0'

// サーバーレス環境でのタイムアウト設定
export const SERVERLESS_TIMEOUT = 540000 // 9分（Cloud Runの最大タイムアウト）
export const API_REQUEST_TIMEOUT = 30000 // 30秒

// 環境変数からアクセストークンを取得
export const getAccessToken = () => {
  const token = process.env.KING_OF_TIME_ACCESS_TOKEN
  if (!token) {
    throw new Error('KING_OF_TIME_ACCESS_TOKEN environment variable is not set')
  }
  return token
}

// サーバーレス最適化されたKING OF TIME APIリクエスト
export const kingOfTimeRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAccessToken()

  // タイムアウト設定
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), API_REQUEST_TIMEOUT)

  try {
    const response = await fetch(`${KING_OF_TIME_API_BASE_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json; charset=utf-8',
        ...options.headers,
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`KING OF TIME API Error: ${response.status} - ${JSON.stringify(errorData)}`)
    }

    return response.json()
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout: KING OF TIME API did not respond within 30 seconds')
    }

    throw error
  }
}

// サーバーレス環境用の遅延関数（最適化版）
export const delay = (ms: number) => {
  // サーバーレス環境では長時間の遅延を避ける
  const maxDelay = 5000 // 最大5秒
  const actualDelay = Math.min(ms, maxDelay)
  return new Promise(resolve => setTimeout(resolve, actualDelay))
}

// バッチ処理用の分割関数
export const chunkArray = <T>(array: T[], chunkSize: number): T[][] => {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize))
  }
  return chunks
}

// 日付範囲を分割する関数（サーバーレス環境での処理時間制限対応）
export const splitDateRange = (startDate: string, endDate: string, maxDays: number = 7) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const ranges: {startDate: string; endDate: string}[] = []

  const current = new Date(start)

  while (current <= end) {
    const rangeEnd = new Date(current)
    rangeEnd.setDate(current.getDate() + maxDays - 1)

    if (rangeEnd > end) {
      rangeEnd.setTime(end.getTime())
    }

    ranges.push({
      startDate: current.toISOString().split('T')[0],
      endDate: rangeEnd.toISOString().split('T')[0],
    })

    current.setDate(rangeEnd.getDate() + 1)
  }

  return ranges
}

// サーバーレス環境用のログ関数
export const serverlessLog = (message: string, data?: any) => {
  const timestamp = new Date().toISOString()
  const logData = {
    timestamp,
    message,
    ...(data && {data}),
  }

  // 構造化ログとして出力（Cloud Loggingなどで解析しやすい）
  console.log(JSON.stringify(logData))
}

// エラーレスポンス生成関数
export const createErrorResponse = (error: unknown, statusCode: number = 500) => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

  serverlessLog('API Error', {error: errorMessage, statusCode})

  return {
    success: false,
    error: errorMessage,
    timestamp: new Date().toISOString(),
  }
}

// 成功レスポンス生成関数
export const createSuccessResponse = (data: any, message: string, metadata?: any) => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
    ...(metadata && {metadata}),
  }
}
