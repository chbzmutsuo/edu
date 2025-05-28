import {NextRequest, NextResponse} from 'next/server'

// Cloud Run用ヘルスチェックエンドポイント
export async function GET(request: NextRequest) {
  try {
    // 基本的なヘルスチェック
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'KING OF TIME API Integration',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    }

    // 環境変数のチェック
    const hasKingOfTimeToken = !!process.env.KING_OF_TIME_ACCESS_TOKEN

    if (!hasKingOfTimeToken) {
      return NextResponse.json(
        {
          ...healthStatus,
          status: 'unhealthy',
          error: 'KING_OF_TIME_ACCESS_TOKEN not configured',
        },
        {status: 503}
      )
    }

    return NextResponse.json(healthStatus, {status: 200})
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {status: 503}
    )
  }
}

// POST: 詳細ヘルスチェック（KING OF TIME API接続テスト含む）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {includeApiTest = false} = body

    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'KING OF TIME API Integration',
      checks: {
        environment: process.env.NODE_ENV || 'development',
        kingOfTimeToken: !!process.env.KING_OF_TIME_ACCESS_TOKEN,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      },
    }

    // API接続テストが要求された場合
    if (includeApiTest && process.env.KING_OF_TIME_ACCESS_TOKEN) {
      try {
        const response = await fetch('https://api.kingtime.jp/v1.0/companies', {
          headers: {
            Authorization: `Bearer ${process.env.KING_OF_TIME_ACCESS_TOKEN}`,
            'Content-Type': 'application/json; charset=utf-8',
          },
          signal: AbortSignal.timeout(10000), // 10秒タイムアウト
        })

        healthStatus.checks = {
          ...healthStatus.checks,
          kingOfTimeApiConnection: response.ok,
          kingOfTimeApiStatus: response.status,
        } as any

        if (!response.ok) {
          return NextResponse.json(
            {
              ...healthStatus,
              status: 'unhealthy',
              error: `KING OF TIME API returned status ${response.status}`,
            },
            {status: 503}
          )
        }
      } catch (apiError) {
        return NextResponse.json(
          {
            ...healthStatus,
            status: 'unhealthy',
            error: `KING OF TIME API connection failed: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`,
          },
          {status: 503}
        )
      }
    }

    return NextResponse.json(healthStatus, {status: 200})
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {status: 503}
    )
  }
}
