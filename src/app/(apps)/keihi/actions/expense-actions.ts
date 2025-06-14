'use server'

import {PrismaClient} from '@prisma/client'
import {revalidatePath} from 'next/cache'
import OpenAI from 'openai'
import {FileHandler} from 'src/cm/class/FileHandler'
import {S3_API_FormData} from '@pages/api/S3'

const prisma = new PrismaClient()
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// 主要な勘定科目マスタ（AIプロンプト用）
const MAJOR_ACCOUNTS = [
  {account: '旅費交通費', taxCategory: '課仕 10%'},
  {account: '接待交際費', taxCategory: '課仕 10%'},
  {account: '通信費', taxCategory: '課仕 10%'},
  {account: '消耗品費', taxCategory: '課仕 10%'},
  {account: '広告宣伝費', taxCategory: '課仕 10%'},
  {account: '会議費', taxCategory: '課仕 10%'},
  {account: '新聞図書費', taxCategory: '課仕 10%'},
  {account: '支払手数料', taxCategory: '課仕 10%'},
  {account: '地代家賃', taxCategory: '課仕 10%'},
  {account: '水道光熱費', taxCategory: '課仕 10%'},
  {account: '修繕費', taxCategory: '課仕 10%'},
  {account: '租税公課', taxCategory: '対象外'},
]

export interface ExpenseFormData {
  date: string
  amount: number
  subject: string
  location?: string
  counterpartyName?: string
  counterpartyIndustry?: string
  conversationPurpose?: string
  purpose?: string // 目的
  memo?: string // 内容・メモ
  paymentMethod?: string // 支払い方法
  keywords?: string[]
  conversationSummary?: string
  learningDepth?: number
  // 税務調査対応項目
  counterpartyContact?: string // 相手の連絡先
  followUpPlan?: string // フォローアップ予定
  businessOpportunity?: string // ビジネス機会の評価
  competitorInfo?: string // 競合情報
}

export interface AIAnalysisResult {
  businessInsightDetail: string
  businessInsightSummary: string
  techInsightDetail: string
  techInsightSummary: string
  autoTags: string[]
  mfSubject: string
  mfTaxCategory: string
  mfMemo: string
}

// 複数画像の統合解析
export async function analyzeMultipleReceipts(imageDataList: string[]): Promise<{
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
}> {
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
export async function analyzeReceiptImage(imageBase64: string): Promise<{
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
}> {
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
   例：
   - 飲食店なら：「売上管理アプリ」「メニューアプリ」「仕入れ管理」
   - 教育関係なら：「学習管理システム」「自動添削」「スライド作成ツール」
   - 人事担当なら：「社員データベース」「面接管理」「AIスコアリング」
   - 運送業なら：「日報システム」「配車計画ツール」「GPS追跡」

以下のJSON形式で返してください：
{
  "date": "2024-01-01",
  "amount": 1000,
  "subject": "会議費",
  "counterpartyName": "○○レストラン",
  "mfMemo": "飲食店経営者との売上管理システム開発に関する技術相談",
  "keywords": ["売上管理アプリ", "POSシステム連携", "在庫管理", "顧客管理", "配送システム"]
}
`

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
      max_tokens: 1000,
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

// 個人開発関連キーワードの生成
function generatePersonalDevKeywords(formData: ExpenseFormData): string[] {
  const baseKeywords = [
    'Next.js',
    'React',
    'TypeScript',
    'Prisma',
    'Tailwind CSS',
    'API開発',
    'データベース設計',
    'UI/UX',
    'レスポンシブデザイン',
    '認証システム',
    'ファイルアップロード',
    'リアルタイム通信',
    'PWA',
    'モバイルアプリ',
    'Webアプリ',
    'SaaS',
    'MVP',
    'ユーザビリティ',
    'パフォーマンス最適化',
    'SEO対策',
    'CI/CD',
    'Docker',
    'Vercel',
    'AWS',
    'Firebase',
    'GraphQL',
    'REST API',
    'WebSocket',
    'マイクロサービス',
    'テスト駆動開発',
    'アジャイル開発',
    'スクラム',
    'デザインシステム',
    'コンポーネント設計',
    '状態管理',
    'フォーム処理',
    'バリデーション',
    'エラーハンドリング',
    'ログ管理',
    '監視',
    'セキュリティ',
    'GDPR対応',
    'アクセシビリティ',
    'インターナショナライゼーション',
    'マーケティング自動化',
    'CRM',
    'ERP',
    'BI',
    '機械学習',
    'AI',
    'チャットボット',
    '自然言語処理',
    'ブロックチェーン',
    'IoT',
    'AR/VR',
    'ゲーミフィケーション',
  ]

  // 業種や目的に基づいてキーワードを選択
  const industryKeywords: {[key: string]: string[]} = {
    'IT・ソフトウェア': ['API開発', 'マイクロサービス', 'CI/CD', 'テスト駆動開発'],
    コンサルティング: ['BI', 'データ分析', 'CRM', 'マーケティング自動化'],
    製造業: ['IoT', '監視', 'ERP', 'データベース設計'],
    '小売・EC': ['PWA', 'モバイルアプリ', 'ユーザビリティ', 'SEO対策'],
    金融: ['セキュリティ', 'ブロックチェーン', '認証システム', 'GDPR対応'],
    教育: ['ゲーミフィケーション', 'UI/UX', 'アクセシビリティ', 'PWA'],
    '医療・ヘルスケア': ['セキュリティ', 'GDPR対応', 'データベース設計', 'モバイルアプリ'],
    'メディア・広告': ['SEO対策', 'マーケティング自動化', 'レスポンシブデザイン', 'パフォーマンス最適化'],
  }

  const purposeKeywords: {[key: string]: string[]} = {
    新規開拓: ['CRM', 'マーケティング自動化', 'BI', 'データ分析'],
    既存顧客フォロー: ['チャットボット', 'CRM', 'ユーザビリティ', 'フォーム処理'],
    情報収集: ['API開発', 'データベース設計', 'ログ管理', 'BI'],
    技術相談: ['MVP', 'プロトタイピング', 'アジャイル開発', 'テスト駆動開発'],
    商談: ['デモアプリ', 'UI/UX', 'ユーザビリティ', 'レスポンシブデザイン'],
  }

  let relevantKeywords = [...baseKeywords]

  // 業種に基づくキーワード追加
  if (formData.counterpartyIndustry && industryKeywords[formData.counterpartyIndustry]) {
    relevantKeywords = [...relevantKeywords, ...industryKeywords[formData.counterpartyIndustry]]
  }

  // 目的に基づくキーワード追加
  if (formData.conversationPurpose && purposeKeywords[formData.conversationPurpose]) {
    relevantKeywords = [...relevantKeywords, ...purposeKeywords[formData.conversationPurpose]]
  }

  // 既存のキーワードも含める
  if (formData.keywords && formData.keywords.length > 0) {
    relevantKeywords = [...relevantKeywords, ...formData.keywords]
  }

  // 重複を除去してランダムに3-6個選択
  const uniqueKeywords = [...new Set(relevantKeywords)]
  const shuffled = uniqueKeywords.sort(() => 0.5 - Math.random())
  const count = Math.floor(Math.random() * 4) + 3 // 3-6個

  return shuffled.slice(0, count)
}

// AI下書き生成（プレビュー用）
export async function generateInsightsDraft(
  formData: ExpenseFormData,
  additionalInstruction?: string
): Promise<{
  success: boolean
  data?: {
    businessInsightDetail: string
    businessInsightSummary: string
    techInsightDetail: string
    techInsightSummary: string
    autoTags: string[]
    generatedKeywords: string[]
  }
  error?: string
}> {
  try {
    // 個人開発関連キーワードを生成
    const generatedKeywords = generatePersonalDevKeywords(formData)

    // 既存のキーワードと生成されたキーワードを結合
    const allKeywords = [...(formData.keywords || []), ...generatedKeywords]
    const uniqueKeywords = [...new Set(allKeywords)]

    const additionalPrompt = additionalInstruction
      ? `\n\n**追加指示：**\n${additionalInstruction}\n上記の追加指示も考慮してインサイトを生成してください。`
      : ''

    const prompt = `
あなたは以下の経費記録の当事者です。その場にいて、実際に会話をし、経験した人として、主観的にどのような話をし、どのようなインサイトを得たのかを想像して個人記録・日記のようにまとめてください。
特に、「具体的にどのような個人開発に繋げられるか」また、簡単にアプリの構想を書いてください。

【記録内容】
- 日付: ${formData.date}
- 金額: ${formData.amount}円
- 科目: ${formData.subject}
- 場所: ${formData.location || '不明'}
- 相手: ${formData.counterpartyName || '不明'}
- 業種: ${formData.counterpartyIndustry || '不明'}
- 目的: ${formData.conversationPurpose || '不明'}
- 入力済みキーワード: ${formData.keywords?.join(', ') || 'なし'}
- 生成されたキーワード: ${generatedKeywords.join(', ')}
- 全キーワード: ${uniqueKeywords.join(', ')}
- 会話要約: ${formData.conversationSummary || 'なし'}

**重要な指針：**
1. 上記のキーワード（特に生成されたキーワード）を参考にして、具体的な個人開発アイデアを考案してください
2. 相手の業種や課題から、どのような技術で解決できるかを具体的に提案してください
3. 実際に作れそうなアプリやツールの構想を含めてください
4. 技術的な実装方法も簡潔に触れてください

**技術インサイトの詳細について：**
- 最初に技術的な気づきや学びを記述（50-80文字程度）
- その後、改行して「【要件定義】」として5-10行程度の箇条書きを追加
- 箇条書きは「・」で始める
- 具体的な機能要件、技術要件、UI/UX要件などを含める
- 実装可能性を考慮した現実的な要件にする

**文体の指針：**
- 事実を端的にまとめつつ、固くなりすぎない個人レポートとして
- 〇〇さんから〇〇という課題があった。それを〇〇の方法で解決できるというアイデア、アプリ・ツールの構想も添えて。
- 〇〇を見て、〇〇に行かせそうなどでも可能。
- 「Next.jsで〇〇を作れそう」「Prismaで〇〇のデータ管理」など、具体的な技術名を使用
${additionalPrompt}

以下のJSON形式で返してください：
{
  "businessInsightDetail": "営業・ビジネス面で得た気づきや学びを個人記録調で、具体的な個人開発アイデアを含めて（150-200文字）",
  "businessInsightSummary": "営業インサイトを一言で（30-50文字）",
  "techInsightDetail": "技術・開発面で得た気づきや学びを個人記録調で（50-80文字）、その後改行して【要件定義】として5-10行程度の箇条書きを追加（合計200-300文字）",
  "techInsightSummary": "技術インサイトを一言で（30-50文字）",
  "autoTags": ["その場で感じた印象や話題、技術要素から3-5個のタグ"]
}
`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{role: 'user', content: prompt}],
      max_tokens: 1500,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('AI応答が空です')
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('JSON形式の応答が見つかりません')
    }

    const parsedData = JSON.parse(jsonMatch[0])
    return {
      success: true,
      data: {
        ...parsedData,
        generatedKeywords,
      },
    }
  } catch (error) {
    console.error('下書き生成エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '下書き生成に失敗しました',
    }
  }
}

// AIインサイト生成
export async function generateInsights(formData: ExpenseFormData): Promise<AIAnalysisResult> {
  try {
    const prompt = `
【税務調査対応】以下の経費記録について、実際にビジネス情報交換会を行った当事者として、具体的で説得力のある記録を作成してください。

【記録内容】
- 日付: ${formData.date}
- 金額: ${formData.amount}円
- 科目: ${formData.subject}
- 場所: ${formData.location || '不明'}
- 相手: ${formData.counterpartyName || '不明'}
- 業種: ${formData.counterpartyIndustry || '不明'}
- 目的: ${formData.conversationPurpose || '不明'}
- キーワード: ${formData.keywords?.join(', ') || 'なし'}
- 会話要約: ${formData.conversationSummary || 'なし'}

**税務調査対応の記録作成指針：**
- 相手の具体的な業務課題とそれに対するシステム開発提案を詳細に記録
- 「どのような技術的な解決策を提案したか」を具体的に記述
- 「相手からどのような業界の課題を聞いたか」を詳細に記録
- 今後のビジネス展開の可能性について言及
- 実際の開発案件につながる可能性を示唆

**技術インサイトの詳細について：**
- 最初に技術的な気づきや学びを記述（50-80文字程度）
- その後、改行して「【要件定義】」として5-10行程度の箇条書きを追加
- 箇条書きは「・」で始める
- 具体的な機能要件、技術要件、UI/UX要件などを含める
- 実装可能性を考慮した現実的な要件にする
- 税務調査で説明できる具体性を持たせる

**記録の信憑性を高めるポイント：**
- 相手の業界特有の課題を具体的に記述
- 提案した技術ソリューションの実装方法に言及
- 競合他社の状況や市場動向についての情報交換内容
- 今後のフォローアップ予定や次回打ち合わせの可能性
- 相手の反応や関心度を具体的に記録

**文体の指針：**
- ビジネス記録として適切な敬語・丁寧語を使用
- 「〜について詳しく伺った」「〜を提案させていただいた」など
- 具体的な数値や期間を含める（可能な範囲で）
- 相手の発言を引用形式で含める

以下のJSON形式で返してください：
{
  "businessInsightDetail": "営業・ビジネス面で得た気づきや学びを個人記録調で（150-200文字）",
  "businessInsightSummary": "営業インサイトを一言で（30-50文字）",
  "techInsightDetail": "技術・開発面で得た気づきや学びを個人記録調で（50-80文字）、その後改行して【要件定義】として5-10行程度の箇条書きを追加",
  "techInsightSummary": "技術インサイトを一言で（30-50文字）",
  "autoTags": ["その場で感じた印象や話題から3-5個のタグ"],
  "mfSubject": "${MAJOR_ACCOUNTS.find(acc => acc.account === formData.subject)?.account || formData.subject}",
  "mfTaxCategory": "${MAJOR_ACCOUNTS.find(acc => acc.account === formData.subject)?.taxCategory || '課仕 10%'}",
  "mfMemo": "MoneyForward用の簡潔な摘要（30文字以内）"
}
`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{role: 'user', content: prompt}],
      max_tokens: 1500,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('AI応答が空です')
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('JSON形式の応答が見つかりません')
    }

    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error('インサイト生成エラー:', error)
    // フォールバック
    return {
      businessInsightDetail: '自動生成に失敗しました',
      businessInsightSummary: '生成失敗',
      techInsightDetail: '自動生成に失敗しました',
      techInsightSummary: '生成失敗',
      autoTags: ['未分類'],
      mfSubject: formData.subject,
      mfTaxCategory: '課仕 10%',
      mfMemo: `${formData.subject} ${formData.amount}円`,
    }
  }
}

// 下書きを使用した経費記録作成
export async function createExpenseWithDraft(
  formData: ExpenseFormData,
  draft: {
    businessInsightDetail: string
    businessInsightSummary: string
    techInsightDetail: string
    techInsightSummary: string
    autoTags: string[]
    generatedKeywords?: string[]
  },
  imageFiles?: File[]
): Promise<{
  success: boolean
  data?: {id: string}
  error?: string
}> {
  try {
    // MF用の情報を生成
    const mfSubject = MAJOR_ACCOUNTS.find(acc => acc.account === formData.subject)?.account || formData.subject
    const mfTaxCategory = MAJOR_ACCOUNTS.find(acc => acc.account === formData.subject)?.taxCategory || '課仕 10%'
    const mfMemo = formData.conversationSummary || `${formData.subject} ${formData.amount}円`

    const expense = await prisma.keihiExpense.create({
      data: {
        date: new Date(formData.date),
        amount: formData.amount,
        subject: formData.subject,
        location: formData.location,
        counterpartyName: formData.counterpartyName,
        counterpartyIndustry: formData.counterpartyIndustry,
        conversationPurpose: formData.conversationPurpose,
        keywords: formData.keywords || [],
        conversationSummary: formData.conversationSummary,
        learningDepth: formData.learningDepth,
        // 税務調査対応項目
        counterpartyContact: formData.counterpartyContact,
        followUpPlan: formData.followUpPlan,
        businessOpportunity: formData.businessOpportunity,
        competitorInfo: formData.competitorInfo,
        businessInsightDetail: draft.businessInsightDetail,
        businessInsightSummary: draft.businessInsightSummary,
        techInsightDetail: draft.techInsightDetail,
        techInsightSummary: draft.techInsightSummary,
        autoTags: draft.autoTags,
        mfSubject,
        mfTaxCategory,
        mfMemo,
      },
    })

    // 画像ファイルがある場合はS3にアップロードして添付ファイルを作成
    if (imageFiles && imageFiles.length > 0) {
      try {
        for (const file of imageFiles) {
          // ファイル検証
          const validation = FileHandler.validateFile(file)

          if (!validation.isValid) {
            console.warn(`ファイル検証失敗: ${file.name} - ${validation.errors.join(', ')}`)
            continue
          }

          // S3にアップロード
          const s3Result = await FileHandler.sendFileToS3({
            file,
            formDataObj: {
              backetKey: 'keihi',
            },
          })

          if (!s3Result.success) {
            console.warn(`S3アップロード失敗: ${file.name} - ${s3Result.error}`)
            continue
          }

          // 添付ファイルレコードを作成
          await prisma.keihiAttachment.create({
            data: {
              filename: `${Date.now()}-${Math.random().toString(36).substring(2)}-${file.name}`,
              originalName: file.name,
              mimeType: file.type,
              size: file.size,
              url: s3Result.result.url,
              keihiExpenseId: expense.id,
            },
          })
        }
      } catch (error) {
        console.error('画像アップロードエラー:', error)
        // 画像アップロードに失敗してもレコード作成は成功とする
      }
    }

    revalidatePath('/keihi')
    return {success: true, data: {id: expense.id}}
  } catch (error) {
    console.error('経費記録作成エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '作成に失敗しました',
    }
  }
}

// 経費記録作成
export async function createExpense(
  formData: ExpenseFormData,
  imageFiles?: File[]
): Promise<{
  success: boolean
  data?: {id: string}
  error?: string
}> {
  try {
    // AIインサイト生成
    const insights = await generateInsights(formData)

    const expense = await prisma.keihiExpense.create({
      data: {
        date: new Date(formData.date),
        amount: formData.amount,
        subject: formData.subject,
        location: formData.location,
        counterpartyName: formData.counterpartyName,
        counterpartyIndustry: formData.counterpartyIndustry,
        conversationPurpose: formData.conversationPurpose,
        keywords: formData.keywords || [],
        conversationSummary: formData.conversationSummary,
        learningDepth: formData.learningDepth,
        // 税務調査対応項目
        counterpartyContact: formData.counterpartyContact,
        followUpPlan: formData.followUpPlan,
        businessOpportunity: formData.businessOpportunity,
        competitorInfo: formData.competitorInfo,
        businessInsightDetail: insights.businessInsightDetail,
        businessInsightSummary: insights.businessInsightSummary,
        techInsightDetail: insights.techInsightDetail,
        techInsightSummary: insights.techInsightSummary,
        autoTags: insights.autoTags,
        mfSubject: insights.mfSubject,
        mfTaxCategory: insights.mfTaxCategory,
        mfMemo: insights.mfMemo,
      },
    })

    // 画像ファイルがある場合はS3にアップロードして添付ファイルを作成
    if (imageFiles && imageFiles.length > 0) {
      try {
        for (const file of imageFiles) {
          // ファイル検証
          const validation = FileHandler.validateFile(file)

          if (!validation.isValid) {
            console.warn(`ファイル検証失敗: ${file.name} - ${validation.errors.join(', ')}`)
            continue
          }

          // S3にアップロード
          const s3Result = await FileHandler.sendFileToS3({
            file,
            formDataObj: {
              backetKey: 'keihi',
            },
          })

          if (!s3Result.success) {
            console.warn(`S3アップロード失敗: ${file.name} - ${s3Result.error}`)
            continue
          }

          // 添付ファイルレコードを作成
          await prisma.keihiAttachment.create({
            data: {
              filename: `${Date.now()}-${Math.random().toString(36).substring(2)}-${file.name}`,
              originalName: file.name,
              mimeType: file.type,
              size: file.size,
              url: s3Result.message || '', // S3のURLを保存
              keihiExpenseId: expense.id,
            },
          })
        }
      } catch (error) {
        console.error('画像アップロードエラー:', error)
        // 画像アップロードに失敗してもレコード作成は成功とする
      }
    }

    revalidatePath('/keihi')
    return {success: true, data: {id: expense.id}}
  } catch (error) {
    console.error('経費記録作成エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '作成に失敗しました',
    }
  }
}

// 経費記録一覧取得
export async function getExpenses(page = 1, limit = 20) {
  try {
    const expenses = await prisma.keihiExpense.findMany({
      include: {
        KeihiAttachment: true,
      },
      orderBy: {
        date: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    })

    const total = await prisma.keihiExpense.count()

    return {
      success: true,
      data: expenses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  } catch (error) {
    console.error('経費記録取得エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '取得に失敗しました',
    }
  }
}

// 経費記録詳細取得
export async function getExpenseById(id: string) {
  try {
    const expense = await prisma.keihiExpense.findUnique({
      where: {id},
      include: {
        KeihiAttachment: true,
      },
    })

    if (!expense) {
      return {success: false, error: '記録が見つかりません'}
    }

    return {success: true, data: expense}
  } catch (error) {
    console.error('経費記録詳細取得エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '取得に失敗しました',
    }
  }
}

// 経費記録更新
export async function updateExpense(
  id: string,
  data: {
    date?: Date
    amount?: number
    subject?: string
    location?: string
    counterpartyName?: string
    counterpartyIndustry?: string
    conversationPurpose?: string
    keywords?: string[]
    conversationSummary?: string
    learningDepth?: number
    // インサイト関連
    businessInsightDetail?: string
    businessInsightSummary?: string
    techInsightDetail?: string
    techInsightSummary?: string
    autoTags?: string[]
    // 税務調査対応項目
    counterpartyContact?: string
    followUpPlan?: string
    businessOpportunity?: string
    competitorInfo?: string
    mfSubject?: string
    mfTaxCategory?: string
    mfMemo?: string
  }
) {
  try {
    const expense = await prisma.keihiExpense.update({
      where: {id},
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        KeihiAttachment: true,
      },
    })

    revalidatePath('/keihi')
    revalidatePath(`/keihi/expense/${id}`)
    return {success: true, data: expense}
  } catch (error) {
    console.error('記録更新エラー:', error)
    return {success: false, error: '記録の更新に失敗しました'}
  }
}

// 経費記録削除
export async function deleteExpense(id: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    // 関連する添付ファイルも削除
    await prisma.keihiAttachment.deleteMany({
      where: {keihiExpenseId: id},
    })

    // 経費記録を削除
    await prisma.keihiExpense.delete({
      where: {id},
    })

    revalidatePath('/keihi')
    return {success: true}
  } catch (error) {
    console.error('経費記録削除エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '削除に失敗しました',
    }
  }
}

// 複数の経費記録を一括削除
export async function deleteMultipleExpenses(ids: string[]): Promise<{
  success: boolean
  deletedCount?: number
  error?: string
}> {
  try {
    // 関連する添付ファイルも削除
    await prisma.keihiAttachment.deleteMany({
      where: {keihiExpenseId: {in: ids}},
    })

    // 経費記録を一括削除
    const result = await prisma.keihiExpense.deleteMany({
      where: {id: {in: ids}},
    })

    revalidatePath('/keihi')
    return {
      success: true,
      deletedCount: result.count,
    }
  } catch (error) {
    console.error('経費記録一括削除エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '一括削除に失敗しました',
    }
  }
}

// ファイルアップロード（S3使用）
export async function uploadAttachment(formData: FormData): Promise<{
  success: boolean
  data?: {
    id: string
    filename: string
    originalName: string
    mimeType: string
    size: number
    url: string
  }
  error?: string
}> {
  try {
    const file = formData.get('file') as File
    if (!file) {
      return {success: false, error: 'ファイルが選択されていません'}
    }

    // FileHandlerを使用してファイル検証
    const validation = FileHandler.validateFile(file)
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', '),
      }
    }

    // ファイル名を生成（タイムスタンプ + ランダム文字列）
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const extension = file.name.split('.').pop() || ''
    const filename = `keihi/${timestamp}_${randomString}.${extension}`

    // S3アップロード用のフォームデータ
    const s3FormData: S3_API_FormData = {
      backetKey: 'keihi', // フォルダ名
    }

    // S3にアップロード
    const uploadResult = await FileHandler.sendFileToS3({
      file,
      formDataObj: s3FormData,
      validateFile: false, // 既に検証済み
    })

    if (!uploadResult.success) {
      return {
        success: false,
        error: uploadResult.error || 'S3アップロードに失敗しました',
      }
    }

    // S3のURLを取得（アップロード結果から）
    const s3Url = uploadResult.result?.url || `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/keihi/${filename}`

    // データベースに保存（expenseIdは後で関連付け）
    const attachment = await prisma.keihiAttachment.create({
      data: {
        filename: filename.split('/').pop() || filename, // ファイル名のみ
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: s3Url,
        // keihiExpenseIdは省略（nullableなので後で関連付け）
      },
    })

    return {
      success: true,
      data: {
        id: attachment.id,
        filename: attachment.filename,
        originalName: attachment.originalName,
        mimeType: attachment.mimeType,
        size: attachment.size,
        url: attachment.url,
      },
    }
  } catch (error) {
    console.error('ファイルアップロードエラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'ファイルのアップロードに失敗しました',
    }
  }
}

// 添付ファイルを経費記録に関連付け
export async function linkAttachmentsToExpense(
  expenseId: string,
  attachmentIds: string[]
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    await prisma.keihiAttachment.updateMany({
      where: {
        id: {in: attachmentIds},
        keihiExpenseId: null, // 未関連付けのもののみ
      },
      data: {
        keihiExpenseId: expenseId,
      },
    })

    return {success: true}
  } catch (error) {
    console.error('添付ファイル関連付けエラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '添付ファイルの関連付けに失敗しました',
    }
  }
}

// 未関連付けの添付ファイルを削除（クリーンアップ用）
export async function cleanupUnlinkedAttachments(): Promise<{
  success: boolean
  deletedCount?: number
  error?: string
}> {
  try {
    // 1時間以上前に作成された未関連付けファイルを削除
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

    const unlinkedAttachments = await prisma.keihiAttachment.findMany({
      where: {
        keihiExpenseId: null,
        createdAt: {lt: oneHourAgo},
      },
    })

    // S3からファイルを削除
    for (const attachment of unlinkedAttachments) {
      try {
        // S3のURLからファイルキーを抽出
        const s3FormData: S3_API_FormData = {
          backetKey: 'keihi',
          deleteImageUrl: attachment.url,
        }

        // FileHandlerを使用してS3から削除
        await FileHandler.sendFileToS3({
          file: null, // 削除の場合はnull
          formDataObj: s3FormData,
          validateFile: false,
        })
      } catch (error) {
        console.warn('S3ファイル削除エラー:', attachment.filename, error)
      }
    }

    // データベースから削除
    const result = await prisma.keihiAttachment.deleteMany({
      where: {
        keihiExpenseId: null,
        createdAt: {lt: oneHourAgo},
      },
    })

    return {
      success: true,
      deletedCount: result.count,
    }
  } catch (error) {
    console.error('未関連付けファイル削除エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'クリーンアップに失敗しました',
    }
  }
}

// 添付ファイル削除
export async function deleteAttachment(attachmentId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const attachment = await prisma.keihiAttachment.findUnique({
      where: {id: attachmentId},
    })

    if (!attachment) {
      return {success: false, error: '添付ファイルが見つかりません'}
    }

    // S3からファイルを削除
    try {
      const s3FormData: S3_API_FormData = {
        backetKey: 'keihi',
        deleteImageUrl: attachment.url,
      }

      // FileHandlerを使用してS3から削除
      await FileHandler.sendFileToS3({
        file: null, // 削除の場合はnull
        formDataObj: s3FormData,
        validateFile: false,
      })
    } catch (error) {
      console.warn('S3ファイル削除エラー:', attachment.filename, error)
    }

    // データベースから削除
    await prisma.keihiAttachment.delete({
      where: {id: attachmentId},
    })

    return {success: true}
  } catch (error) {
    console.error('添付ファイル削除エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '添付ファイルの削除に失敗しました',
    }
  }
}
