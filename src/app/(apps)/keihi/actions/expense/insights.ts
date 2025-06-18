'use server'

import {generatePersonalDevKeywords} from '@app/(apps)/keihi/actions/expense/generatePersonalDevKeywords'
import {revalidatePath} from 'next/cache'
import OpenAI from 'openai'
import {FileHandler} from 'src/cm/class/FileHandler'
import {S3_API_FormData} from '@pages/api/S3'
import prisma from '@lib/prisma'
import {MAJOR_ACCOUNTS} from '@app/(apps)/keihi/actions/expense/constants'
import {ExpenseFormData} from '@app/(apps)/keihi/types'

const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY})

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

// インサイト生成の設定オプション
interface InsightGenerationOptions {
  isDraft?: boolean // 下書きモードかどうか
  additionalInstruction?: string // 追加指示
  includeMoneyForwardData?: boolean // MoneyForward用データを含めるか
}

// インサイト生成結果の型
interface InsightGenerationResult {
  businessInsightDetail: string
  businessInsightSummary: string
  techInsightDetail: string
  techInsightSummary: string
  autoTags: string[]
  generatedKeywords?: string[] // 下書きモードの場合のみ
  mfSubject?: string // MoneyForward用データ
  mfTaxCategory?: string
  mfMemo?: string
}

// 共通のプロンプト生成関数
const generateInsightPrompt = (formData: ExpenseFormData, options: InsightGenerationOptions = {}): string => {
  const {isDraft = false, additionalInstruction, includeMoneyForwardData = false} = options

  // 個人開発関連キーワードを生成（下書きモードの場合）
  let generatedKeywords: string[] = []
  let allKeywords: string[] = []
  let uniqueKeywords: string[] = []

  if (isDraft) {
    generatedKeywords = generatePersonalDevKeywords(formData)
    allKeywords = [...(formData.keywords || []), ...generatedKeywords]
    uniqueKeywords = [...new Set(allKeywords)]
  }

  const additionalPrompt = additionalInstruction
    ? `\n\n**追加指示：**\n${additionalInstruction}\n上記の追加指示も考慮してインサイトを生成してください。`
    : ''

  const keywordSection = isDraft
    ? `
- 入力済みキーワード: ${formData.keywords?.join(', ') || 'なし'}
- 生成されたキーワード: ${generatedKeywords.join(', ')}
- 全キーワード: ${uniqueKeywords.join(', ')}`
    : `
- キーワード: ${formData.keywords?.join(', ') || 'なし'}`

  const contextDescription = isDraft
    ? `あなたは以下の経費記録の当事者です。その場にいて、実際に会話をし、経験した人として、主観的にどのような話をし、どのようなインサイトを得たのかを想像して個人記録・日記のようにまとめてください。
   特に、「具体的にどのような個人開発に繋げられるか」また、簡単にアプリの構想を書いてください。

   `
    : `【税務調査対応】以下の経費記録について、実際にビジネス情報交換会を行った当事者として、具体的で説得力のある記録を作成してください。`

  const guidelines = isDraft
    ? `**重要な指針：**
1. 上記のキーワード（特に生成されたキーワード）を参考にして、具体的な個人開発アイデアを考案してください
2. 相手の業種や課題から、どのような技術で解決できるかを具体的に提案してください
3. 実際に作れそうなアプリやツールの構想を含めてください
4. 技術的な実装方法も簡潔に触れてください`
    : `**税務調査対応の記録作成指針：**
- 相手の具体的な業務課題とそれに対するシステム開発提案を詳細に記録
- 「どのような技術的な解決策を提案したか」を具体的に記述
- 「相手からどのような業界の課題を聞いたか」を詳細に記録
- 今後のビジネス展開の可能性について言及
- 実際の開発案件につながる可能性を示唆

**記録の信憑性を高めるポイント：**
- 相手の業界特有の課題を具体的に記述
- 提案した技術ソリューションの実装方法に言及
- 競合他社の状況や市場動向についての情報交換内容
- 今後のフォローアップ予定や次回打ち合わせの可能性
- 相手の反応や関心度を具体的に記録`

  const styleGuidelines = isDraft
    ? `**文体の指針：**
- 事実を端的にまとめつつ、固くなりすぎない個人レポートとして。「だ。である。」体、体言止めや、「〜する。〜できる。」という未来志向・行動志向の表現。
- 〇〇さんから〇〇という課題があった。それを〇〇の方法で解決できるというアイデア、アプリ・ツールの構想も添えて。
- 〇〇を見て、〇〇に行かせそうなどでも可能。
- 「Next.jsで〇〇を作れそう」「Prismaで〇〇のデータ管理」など、具体的な技術名を使用`
    : `**文体の指針：**
- ビジネス記録として適切な敬語・丁寧語を使用
- 「〜について詳しく伺った」「〜を提案させていただいた」など
- 店舗や施設の担当者と話すことはあまりなく、観察から得た知見を活用して書くという仮定で
- 具体的な数値や期間を含める（可能な範囲で）`

  const jsonFormat = includeMoneyForwardData
    ? `{
 "businessInsightDetail": "営業・ビジネス面で得た気づきや学びを個人記録調で（150-200文字）",
 "businessInsightSummary": "営業インサイトを一言で（30-50文字）",
 "techInsightDetail": "技術・開発面で得た気づきや学びを個人記録調で（50-80文字）、その後改行して【要件定義】として5-10行程度の箇条書きを追加",
 "techInsightSummary": "技術インサイトを一言で（30-50文字）",
 "autoTags": ["その場で感じた印象や話題から3-5個のタグ"],
 "mfSubject": "${MAJOR_ACCOUNTS.find(acc => acc.account === formData.subject)?.account || formData.subject}",
 "mfTaxCategory": "${MAJOR_ACCOUNTS.find(acc => acc.account === formData.subject)?.taxCategory || '課仕 10%'}",
 "mfMemo": "MoneyForward用の簡潔な摘要（30文字以内）"
}`
    : isDraft
      ? `{
 "businessInsightDetail": "営業・ビジネス面で得た気づきや学びを個人記録調で、具体的な個人開発アイデアを含めて（150-200文字）",
 "businessInsightSummary": "営業インサイトを一言で（30-50文字）",
 "techInsightDetail": "技術・開発面で得た気づきや学びを個人記録調で（50-80文字）、その後改行して【要件定義】として5-10行程度の箇条書きを追加（合計200-300文字）",
 "techInsightSummary": "技術インサイトを一言で（30-50文字）",
 "autoTags": ["その場で感じた印象や話題、技術要素から3-5個のタグ"]
}`
      : `{
 "businessInsightDetail": "営業・ビジネス面で得た気づきや学びを個人記録調で（150-200文字）",
 "businessInsightSummary": "営業インサイトを一言で（30-50文字）",
 "techInsightDetail": "技術・開発面で得た気づきや学びを個人記録調で（50-80文字）、その後改行して【要件定義】として5-10行程度の箇条書きを追加",
 "techInsightSummary": "技術インサイトを一言で（30-50文字）",
 "autoTags": ["その場で感じた印象や話題から3-5個のタグ"]
}`

  return `
${contextDescription}

【記録内容】
- 日付: ${formData.date}
- 金額: ${formData.amount}円
- 科目: ${formData.subject}
- 場所: ${formData.location || '不明'}
- 相手: ${formData.counterpartyName || '不明'}
- 業種: ${formData.counterpartyIndustry || '不明'}${keywordSection}
- 目的: ${formData.conversationPurpose || '不明'}
- 会話要約: ${formData.conversationSummary || 'なし'}

${guidelines}

**技術インサイトの詳細について：**
- 最初に技術的な気づきや学びを記述（50-80文字程度）
- その後、改行して「アプリの機能例」として10行程度の箇条書きを追加
- 箇条書きは「・」で始める
- 具体的な機能要件、技術要件、UI/UX要件などを含める
- 実装可能性を考慮した現実的な要件にする${isDraft ? '' : '\n- 税務調査で説明できる具体性を持たせる'}

${styleGuidelines}${additionalPrompt}

以下のJSON形式で返してください：
${jsonFormat}
`
}

// 統合されたインサイト生成関数
const generateInsightsCore = async (
  formData: ExpenseFormData,
  options: InsightGenerationOptions = {}
): Promise<{
  success: boolean
  data?: InsightGenerationResult
  error?: string
}> => {
  try {
    const prompt = generateInsightPrompt(formData, options)

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{role: 'user', content: prompt}],
      max_tokens: 1500,
      temperature: 1,
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

    // 下書きモードの場合は生成されたキーワードを追加
    if (options.isDraft) {
      const generatedKeywords = generatePersonalDevKeywords(formData)
      parsedData.generatedKeywords = generatedKeywords
    }

    return {
      success: true,
      data: parsedData,
    }
  } catch (error) {
    console.error('インサイト生成エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'インサイト生成に失敗しました',
    }
  }
}

// AI下書き生成（プレビュー用）
export const generateInsightsDraft = async (
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
}> => {
  const result = await generateInsightsCore(formData, {
    isDraft: true,
    additionalInstruction,
    includeMoneyForwardData: false,
  })

  if (!result.success || !result.data) {
    return {
      success: false,
      error: result.error || '下書き生成に失敗しました',
    }
  }

  return {
    success: true,
    data: {
      businessInsightDetail: result.data.businessInsightDetail,
      businessInsightSummary: result.data.businessInsightSummary,
      techInsightDetail: result.data.techInsightDetail,
      techInsightSummary: result.data.techInsightSummary,
      autoTags: result.data.autoTags,
      generatedKeywords: result.data.generatedKeywords || [],
    },
  }
}

// AIインサイト生成（実際の記録作成用）
export const generateInsights = async (formData: ExpenseFormData): Promise<AIAnalysisResult> => {
  const result = await generateInsightsCore(formData, {
    isDraft: false,
    includeMoneyForwardData: true,
  })

  if (!result.success || !result.data) {
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

  return {
    businessInsightDetail: result.data.businessInsightDetail,
    businessInsightSummary: result.data.businessInsightSummary,
    techInsightDetail: result.data.techInsightDetail,
    techInsightSummary: result.data.techInsightSummary,
    autoTags: result.data.autoTags,
    mfSubject: result.data.mfSubject || formData.subject,
    mfTaxCategory: result.data.mfTaxCategory || '課仕 10%',
    mfMemo: result.data.mfMemo || `${formData.subject} ${formData.amount}円`,
  }
}

// バックグラウンドでインサイト生成
export const generateInsightsForExpense = async (
  expenseId: string
): Promise<{
  success: boolean
  error?: string
}> => {
  try {
    // 既存のレコードを取得
    const expense = await prisma.keihiExpense.findUnique({
      where: {id: expenseId},
    })

    if (!expense) {
      return {success: false, error: 'レコードが見つかりません'}
    }

    // フォームデータ形式に変換
    const formData: ExpenseFormData = {
      date: expense.date.toISOString().split('T')[0],
      amount: expense.amount,
      subject: expense.subject,
      location: expense.location || '',
      counterpartyName: expense.counterpartyName || '',
      counterpartyIndustry: expense.counterpartyIndustry || '',
      conversationPurpose: expense.conversationPurpose || '',
      keywords: expense.keywords,
      conversationSummary: expense.conversationSummary || '',
      learningDepth: expense.learningDepth || 3,
      counterpartyContact: expense.counterpartyContact || '',
      followUpPlan: expense.followUpPlan || '',
      businessOpportunity: expense.businessOpportunity || '',
      competitorInfo: expense.competitorInfo || '',
    }

    // インサイト生成
    const insightResult = await generateInsightsCore(formData, {
      isDraft: false,
      includeMoneyForwardData: true,
    })

    if (!insightResult.success || !insightResult.data) {
      return {success: false, error: insightResult.error || 'インサイト生成に失敗しました'}
    }

    // レコードを更新
    await prisma.keihiExpense.update({
      where: {id: expenseId},
      data: {
        businessInsightDetail: insightResult.data.businessInsightDetail,
        businessInsightSummary: insightResult.data.businessInsightSummary,
        techInsightDetail: insightResult.data.techInsightDetail,
        techInsightSummary: insightResult.data.techInsightSummary,
        autoTags: insightResult.data.autoTags,
        mfSubject: insightResult.data.mfSubject || expense.mfSubject,
        mfTaxCategory: insightResult.data.mfTaxCategory || expense.mfTaxCategory,
        mfMemo: insightResult.data.mfMemo || expense.mfMemo,
      },
    })

    return {success: true}
  } catch (error) {
    console.error('インサイト生成エラー:', error)

    // エラーが発生した場合もフラグを更新
    try {
      await prisma.keihiExpense.update({
        where: {id: expenseId},
        data: {
          businessInsightDetail: 'インサイト生成に失敗しました',
          businessInsightSummary: 'エラーが発生しました',
          techInsightDetail: 'インサイト生成に失敗しました',
          techInsightSummary: 'エラーが発生しました',
        },
      })
    } catch (updateError) {
      console.error('フラグ更新エラー:', updateError)
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'インサイト生成に失敗しました',
    }
  }
}

// 複数レコードのバックグラウンドインサイト生成
export const generateInsightsForMultipleExpenses = async (
  expenseIds: string[]
): Promise<{
  success: boolean
  processedCount?: number
  error?: string
}> => {
  try {
    let processedCount = 0

    // 各レコードを順次処理（並列処理だとAPI制限に引っかかる可能性があるため）
    for (const expenseId of expenseIds) {
      try {
        const result = await generateInsightsForExpense(expenseId)
        if (result.success) {
          processedCount++
        }
        // API制限を避けるため少し待機
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`レコード ${expenseId} のインサイト生成エラー:`, error)
        // 個別のエラーは続行
      }
    }

    // revalidatePath('/keihi') // 一括処理では状態保持のためrevalidateを削除

    return {
      success: true,
      processedCount,
    }
  } catch (error) {
    console.error('一括インサイト生成エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '一括インサイト生成に失敗しました',
    }
  }
}
