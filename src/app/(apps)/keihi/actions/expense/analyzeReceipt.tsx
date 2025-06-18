'use server'
import {MAJOR_ACCOUNTS} from '@app/(apps)/keihi/actions/expense/constants'
import OpenAI from 'openai'

// 複数画像の統合解析
export const analyzeMultipleReceipts = async (
  imageDataList: string[]
): Promise<{
  success: boolean
  data?: {
    receipts: Array<{
      date: string
      amount: number
      subject: string
      counterpartyName: string
      mfMemo: string
      keywords: string[]
      imageIndex: number
    }>
    totalAmount: number
    suggestedMerge: boolean
    allKeywords: string[]
  }
  error?: string
}> => {
  try {
    if (imageDataList.length === 0) {
      return {success: false, error: '画像が選択されていません'}
    }

    if (imageDataList.length === 1) {
      // 単一画像の場合は従来の解析を使用
      const result = await analyzeReceiptImage(imageDataList[0])
      if (result.success && result.data) {
        return {
          success: true,
          data: {
            receipts: [
              {
                ...result.data,
                imageIndex: 0,
              },
            ],
            totalAmount: result.data.amount,
            suggestedMerge: false,
            allKeywords: result.data.keywords || [],
          },
        }
      }
      return {success: false, error: result.error || '画像解析に失敗しました'}
    }

    // 複数画像の場合
    const results = await Promise.all(
      imageDataList.map(async (imageData, index) => {
        const result = await analyzeReceiptImage(imageData)
        if (result.success && result.data) {
          return {
            ...result.data,
            imageIndex: index,
          }
        }
        return null
      })
    )

    const validResults = results.filter(result => result !== null)

    if (validResults.length === 0) {
      return {success: false, error: 'すべての画像の解析に失敗しました'}
    }

    const totalAmount = validResults.reduce((sum, receipt) => sum + receipt.amount, 0)

    // 同一取引の可能性を判定（同じ日付・同じ店舗など）
    const suggestedMerge =
      validResults.length > 1 &&
      validResults.every(receipt => receipt.date === validResults[0].date) &&
      validResults.every(receipt => receipt.counterpartyName === validResults[0].counterpartyName)

    // 全てのキーワードを収集（重複除去）
    const allKeywords = [...new Set(validResults.flatMap(receipt => receipt.keywords || []))]

    return {
      success: true,
      data: {
        receipts: validResults,
        totalAmount,
        suggestedMerge,
        allKeywords,
      },
    }
  } catch (error) {
    console.error('複数画像解析エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '複数画像解析に失敗しました',
    }
  }
}

// 画像からOCR＋AI解析
export const analyzeReceiptImage = async (
  imageBase64: string
): Promise<{
  success: boolean
  data?: {
    date: string
    amount: number
    subject: string
    counterpartyName: string
    mfMemo: string
    keywords: string[]
  }
  error?: string
}> => {
  try {
    const prompt = `
この領収書画像から情報を抽出し、税務調査に耐えうるビジネス情報交換会の記録として整理してください。

【重要】この支出は個人事業主のビジネス開発・技術相談・情報交換のためのものです。
店舗の種類、立地、時間帯から、どのような相手とどのような目的で会ったかを推測してください：

1. 日付（YYYY-MM-DD形式）
2. 金額（数値のみ）
3. 支払先名（店舗名や会社名）
4. 適切な勘定科目（以下から選択）：
${MAJOR_ACCOUNTS.map(acc => `- ${acc.account}`).join('\n')}

5. 摘要（税務調査対応：「○○業界の方との技術相談」「新規事業の情報交換」など具体的に）
6. 関連キーワード（相手の業界・職種から想像される具体的なシステム開発ニーズ3-5個）
  以下のような多様なキーワードから、状況に応じて適切なものを選択してください。これらのキーワード以外にも、類推して生成してください。また、レシートの情報に固有なキーワードも生成してください:
  業種別キーワード例：
  - 飲食店：
    * 売上管理アプリ、メニューアプリ、仕入れ管理、在庫管理、予約システム、POS連携、顧客管理、スタッフシフト管理、レシピ管理、食材発注
    * デリバリー管理、テイクアウト注文、QR決済、ポイントカード、会計システム、売上分析、原価計算

  - 教育関係：
    * 学習管理システム、自動添削、スライド作成、教材管理、出席管理、成績管理、オンライン授業、宿題管理
    * 保護者連絡、進捗管理、テスト作成、採点自動化、学習分析、個別指導計画、カリキュラム管理

  - 人事担当：
    * 社員データベース、面接管理、AIスコアリング、採用管理、研修管理、評価システム、給与計算
    * 勤怠管理、福利厚生管理、人材育成、キャリアパス、組織図、採用広告、人材分析

  - 運送業：
    * 日報システム、配車計画、GPS追跡、配送管理、ドライバー管理、燃料管理、メンテナンス管理
    * ルート最適化、荷物追跡、請求書管理、顧客管理、事故報告、運転記録、コンプライアンス管理

  技術キーワード例：
  - フロントエンド：React、Vue、Angular、Next.js、TypeScript、Tailwind CSS、レスポンシブデザイン
  - バックエンド：Node.js、Python、Java、Go、GraphQL、REST API、マイクロサービス
  - インフラ：AWS、GCP、Azure、Docker、Kubernetes、CI/CD、モニタリング
  - データ：SQL、NoSQL、データ分析、機械学習、AI、ビッグデータ、ETL

以下の例に示すJSON形式で返してください：
{
 "date": "2024-01-01",
 "amount": 1000,
 "subject": "会議費",
 "counterpartyName": "○○レストラン",
 "mfMemo": "飲食店経営者との売上管理システム開発に関する技術相談",
 "keywords": []
}`

    const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY})

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {type: 'text', text: prompt},
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      response_format: {type: 'json_object'},
      max_tokens: 1000,
      temperature: 1.5, // より多様な応答を得るために温度を上げる
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('AI応答が空です')
    }

    // JSONを抽出（```json ``` で囲まれている場合があるため）
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('JSON形式の応答が見つかりません')
    }

    const parsedData = JSON.parse(jsonMatch[0])

    return {
      success: true,
      data: parsedData,
    }
  } catch (error) {
    console.error('画像解析エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '画像解析に失敗しました',
    }
  }
}
