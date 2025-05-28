/**
 * KING OF TIME API テストスクリプト
 *
 * 使用方法:
 * 1. .envファイルにKING_OF_TIME_ACCESS_TOKENを設定
 * 2. npm run dev でサーバーを起動
 * 3. node scripts/test-king-of-time-api.js を実行
 */

const BASE_URL = 'http://localhost:3000/api/kingOfTime'

// APIテスト関数
async function testAPI(endpoint: string, method = 'GET', body: any = null) {
  try {
    console.log(`\n🔍 Testing: ${method} ${endpoint}`)

    const options: any = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options)
    const data = await response.json()

    if (response.ok) {
      console.log('✅ Success:', data.message)
      if (data.count !== undefined) {
        console.log(`📊 Records: ${data.count}`)
      }
      return data
    } else {
      console.log('❌ Error:', data.error)
      return null
    }
  } catch (error) {
    console.log('💥 Network Error:', error.message)
    return null
  }
}

// メインテスト関数
async function runTests() {
  console.log('🚀 KING OF TIME API テスト開始\n')

  // 1. 基本接続テスト
  console.log('=== 基本接続テスト ===')
  await testAPI('')

  // 2. 従業員データ取得テスト
  console.log('\n=== 従業員データ取得テスト ===')
  const employeesData = await testAPI('/employees')

  // 3. 所属データ取得テスト
  console.log('\n=== 所属データ取得テスト ===')
  await testAPI('/departments')

  // 4. 従業員グループデータ取得テスト
  console.log('\n=== 従業員グループデータ取得テスト ===')
  await testAPI('/employee-groups')

  // 5. 日別勤怠データ取得テスト（今日の日付）
  console.log('\n=== 日別勤怠データ取得テスト ===')
  const today = new Date().toISOString().split('T')[0]
  await testAPI(`/daily-work-records?date=${today}`)

  // 6. 統合データAPIテスト（過去1週間）
  console.log('\n=== 統合データAPI取得テスト ===')
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - 7)

  const testBody = {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    // employeeCodes: ['EMP001'], // 特定従業員のみテストする場合
  }

  await testAPI('/integrated-data', 'POST', testBody)

  console.log('\n🎉 テスト完了')
}

// 統合データAPIの詳細テスト
async function testIntegratedAPI() {
  console.log('\n🔬 統合データAPI 詳細テスト')

  // API仕様確認
  const spec = await testAPI('/integrated-data')
  if (spec) {
    console.log('\n📋 API仕様:')
    console.log('- エンドポイント:', spec.usage.endpoint)
    console.log('- メソッド:', spec.usage.method)
    console.log('- レスポンスフィールド:', spec.responseFields.join(', '))
  }

  // 実際のデータ取得テスト（過去3日間）
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - 3)

  const testData = await testAPI('/integrated-data', 'POST', {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  })

  if (testData && testData.data && testData.data.length > 0) {
    console.log('\n📊 サンプルデータ:')
    console.log(JSON.stringify(testData.data[0], null, 2))
  }
}

// エラーハンドリングテスト
async function testErrorHandling() {
  console.log('\n🚨 エラーハンドリングテスト')

  // 不正な日付形式
  await testAPI('/integrated-data', 'POST', {
    startDate: 'invalid-date',
    endDate: '2024-01-01',
  })

  // 必須パラメータ不足
  await testAPI('/integrated-data', 'POST', {
    startDate: '2024-01-01',
    // endDate missing
  })
}

// 実行
if (require.main === module) {
  runTests()
    .then(() => testIntegratedAPI())
    .then(() => testErrorHandling())
    .catch(console.error)
}

module.exports = {
  testAPI,
  runTests,
  testIntegratedAPI,
  testErrorHandling,
}
