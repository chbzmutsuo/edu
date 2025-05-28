import {NextRequest, NextResponse} from 'next/server'
import {
  kingOfTimeRequest,
  delay,
  chunkArray,
  splitDateRange,
  serverlessLog,
  createErrorResponse,
  createSuccessResponse,
  SERVERLESS_TIMEOUT,
} from '../lib/serverless-utils'

// データ統合用の型定義
interface IntegratedWorkRecord {
  所属コード: string
  所属名: string
  所属グループコード: string
  所属グループ名: string
  従業員コード: string
  名前: string
  日時: string // 曜日なし
  所定時間: number // 分単位
  所定外時間: number // 分単位
  残業時間: number // 分単位
}

// サーバーレス環境での処理制限
const MAX_EMPLOYEES_PER_BATCH = 50 // 一度に処理する従業員数
const MAX_DAYS_PER_REQUEST = 7 // 一度に処理する日数

// POST: サーバーレス最適化版統合データ取得
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await request.json()
    const {startDate, endDate, employeeCodes = [], departmentCode, batchMode = false} = body

    if (!startDate || !endDate) {
      return NextResponse.json(createErrorResponse('startDate and endDate are required', 400), {status: 400})
    }

    serverlessLog('統合データ取得開始', {startDate, endDate, employeeCodes, departmentCode, batchMode})

    // 日付範囲をチェック（サーバーレス環境での制限）
    const daysDiff = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))

    if (!batchMode && daysDiff > MAX_DAYS_PER_REQUEST) {
      return NextResponse.json(
        createErrorResponse(
          `Date range too large. Maximum ${MAX_DAYS_PER_REQUEST} days allowed in single request. Use batchMode=true for larger ranges.`,
          400
        ),
        {status: 400}
      )
    }

    // 1. 基本データ取得（並列実行で高速化）
    serverlessLog('基本データ取得開始')

    const [employeesData, departmentsData, employeeGroupsData] = await Promise.all([
      kingOfTimeRequest(
        `/employees?additionalFields=departmentCode,departmentName,employeeGroupCode,employeeGroupName${departmentCode ? `&departmentCode=${departmentCode}` : ''}`
      ),
      kingOfTimeRequest('/departments'),
      kingOfTimeRequest('/employee-groups'),
    ])

    // データをマップ化（高速検索用）
    const departmentMap = new Map()
    const employeeGroupMap = new Map()

    if (Array.isArray(departmentsData)) {
      departmentsData.forEach((dept: any) => {
        departmentMap.set(dept.departmentCode, dept)
      })
    }

    if (Array.isArray(employeeGroupsData)) {
      employeeGroupsData.forEach((group: any) => {
        employeeGroupMap.set(group.employeeGroupCode, group)
      })
    }

    // 対象従業員をフィルタリング
    let targetEmployees = Array.isArray(employeesData) ? employeesData : []
    if (employeeCodes.length > 0) {
      targetEmployees = targetEmployees.filter((emp: any) => employeeCodes.includes(emp.employeeCode))
    }

    serverlessLog('基本データ取得完了', {
      従業員数: targetEmployees.length,
      所属数: departmentMap.size,
      従業員グループ数: employeeGroupMap.size,
    })

    // バッチモードの場合は日付範囲を分割
    const dateRanges = batchMode ? splitDateRange(startDate, endDate, MAX_DAYS_PER_REQUEST) : [{startDate, endDate}]

    const integratedResults: IntegratedWorkRecord[] = []

    // 日付範囲ごとに処理
    for (const range of dateRanges) {
      const rangeStartTime = Date.now()

      // タイムアウトチェック
      if (Date.now() - startTime > SERVERLESS_TIMEOUT - 60000) {
        // 1分のバッファ
        serverlessLog('タイムアウト警告', {処理済み件数: integratedResults.length})
        break
      }

      serverlessLog('日付範囲処理開始', range)

      const start = new Date(range.startDate)
      const end = new Date(range.endDate)

      // 日付ごとに勤怠データを取得
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0]

        try {
          // 従業員を分割して処理（メモリ効率化）
          const employeeChunks = chunkArray(targetEmployees, MAX_EMPLOYEES_PER_BATCH)

          for (const chunk of employeeChunks) {
            const workRecordsParams = new URLSearchParams()
            workRecordsParams.append('additionalFields', 'scheduledWorkTime,actualWorkTime,overtimeWorkTime,nonScheduledWorkTime')
            if (departmentCode) workRecordsParams.append('departmentCode', departmentCode)

            const workRecordsData = await kingOfTimeRequest(`/daily-work-records/${dateStr}?${workRecordsParams.toString()}`)

            // データ統合処理
            if (Array.isArray(workRecordsData)) {
              for (const workRecord of workRecordsData) {
                const employee = chunk.find((emp: any) => emp.employeeCode === workRecord.employeeCode)

                if (employee) {
                  const department = departmentMap.get(employee.departmentCode) || {}
                  const employeeGroup = employeeGroupMap.get(employee.employeeGroupCode) || {}

                  const integratedRecord: IntegratedWorkRecord = {
                    所属コード: employee.departmentCode || '',
                    所属名: department.departmentName || '',
                    所属グループコード: employee.employeeGroupCode || '',
                    所属グループ名: employeeGroup.employeeGroupName || '',
                    従業員コード: employee.employeeCode || '',
                    名前: `${employee.lastName || ''} ${employee.firstName || ''}`.trim(),
                    日時: dateStr,
                    所定時間: parseInt(workRecord.scheduledWorkTime || '0'),
                    所定外時間: parseInt(workRecord.nonScheduledWorkTime || '0'),
                    残業時間: parseInt(workRecord.overtimeWorkTime || '0'),
                  }

                  integratedResults.push(integratedRecord)
                }
              }
            }

            // レート制限対応（短縮版）
            await delay(500) // 0.5秒間隔
          }
        } catch (error) {
          serverlessLog('日付別データ取得エラー', {
            date: dateStr,
            error: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      }

      const rangeElapsed = Date.now() - rangeStartTime
      serverlessLog('日付範囲処理完了', {
        range,
        処理時間: `${rangeElapsed}ms`,
        累計件数: integratedResults.length,
      })
    }

    const totalElapsed = Date.now() - startTime
    serverlessLog('統合データ取得完了', {
      総件数: integratedResults.length,
      総処理時間: `${totalElapsed}ms`,
      処理した日付範囲数: dateRanges.length,
    })

    return NextResponse.json(
      createSuccessResponse(integratedResults, 'Integrated work records retrieved successfully (serverless optimized)', {
        totalRecords: integratedResults.length,
        dateRange: {startDate, endDate},
        processedRanges: dateRanges.length,
        processingTime: `${totalElapsed}ms`,
        summary: {
          targetEmployees: targetEmployees.length,
          departments: departmentMap.size,
          employeeGroups: employeeGroupMap.size,
        },
      })
    )
  } catch (error) {
    const totalElapsed = Date.now() - startTime
    serverlessLog('統合データ取得エラー', {
      error: error instanceof Error ? error.message : 'Unknown error',
      処理時間: `${totalElapsed}ms`,
    })

    return NextResponse.json(createErrorResponse(error, 500), {status: 500})
  }
}

// GET: サーバーレス版API仕様説明
export async function GET(request: NextRequest) {
  return NextResponse.json(
    createSuccessResponse(
      {
        version: 'serverless-optimized',
        description: 'KING OF TIME統合データAPI（サーバーレス最適化版）',
        features: ['タイムアウト対応（9分制限）', 'バッチ処理モード', '並列データ取得', 'メモリ効率化', '構造化ログ出力'],
        usage: {
          method: 'POST',
          endpoint: '/api/kingOfTime/integrated-data-serverless',
          body: {
            startDate: 'YYYY-MM-DD (required)',
            endDate: 'YYYY-MM-DD (required)',
            employeeCodes: ['従業員コード配列 (optional)'],
            departmentCode: '所属コード (optional)',
            batchMode: 'boolean - 大量データ処理時はtrue (optional)',
          },
        },
        limits: {
          maxDaysPerRequest: MAX_DAYS_PER_REQUEST,
          maxEmployeesPerBatch: MAX_EMPLOYEES_PER_BATCH,
          timeoutSeconds: SERVERLESS_TIMEOUT / 1000,
        },
      },
      'KING OF TIME Integrated Data API (Serverless)'
    )
  )
}
