import {NextRequest, NextResponse} from 'next/server'

// KING OF TIME API設定
const KING_OF_TIME_API_BASE_URL = 'https://api.kingtime.jp/v1.0'

// 環境変数からアクセストークンを取得
const getAccessToken = () => {
  const token = process.env.KING_OF_TIME_ACCESS_TOKEN
  if (!token) {
    throw new Error('KING_OF_TIME_ACCESS_TOKEN environment variable is not set')
  }
  return token
}

// KING OF TIME APIへのリクエストヘルパー
const kingOfTimeRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAccessToken()

  const url = `${KING_OF_TIME_API_BASE_URL}${endpoint}`
  console.log(url) //logs
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json; charset=utf-8',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(`KING OF TIME API Error: ${response.status} - ${JSON.stringify(errorData)}`)
  }

  return response.json()
}

// GET: API接続テスト
export async function GET(request: NextRequest) {
  try {
    // 企業情報を取得してAPI接続をテスト
    const companyData = await kingOfTimeRequest(`/tokens/${process.env.KING_OF_TIME_ACCESS_TOKEN}/available`)

    return NextResponse.json({
      success: true,
      message: 'KING OF TIME API connection successful',
      data: companyData,
    })
  } catch (error) {
    console.error('KING OF TIME API Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      {status: 500}
    )
  }
}

// POST: 設定テスト用
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    return NextResponse.json({
      success: true,
      message: 'KING OF TIME API endpoint ready',
      receivedData: body,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      {status: 500}
    )
  }
}
