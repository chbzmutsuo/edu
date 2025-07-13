'use server'

import {generateKeywordsFromContext} from '@app/(apps)/keihi/actions/expense/analyzeReceipt'
import OpenAI from 'openai'
import prisma from 'src/lib/prisma'

import {ExpenseFormData, AIDraft} from '@app/(apps)/keihi/types'

const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY})

export interface AIAnalysisResult {
  summary: string // 摘要
  insight: string // 統合されたインサイト
  autoTags: string[]
  // 旧形式（段階的削除予定）
  businessInsightDetail?: string
  businessInsightSummary?: string
  techInsightDetail?: string
  techInsightSummary?: string
  mfSubject?: string
  mfTaxCategory?: string
  mfMemo?: string
}

// インサイト生成のオプション
interface InsightGenerationOptions {
  additionalInstruction?: string
  isDraft?: boolean
}

// インサイト生成結果の型
interface InsightGenerationResult {
  summary: string
  insight: string
  autoTags: string[]
  generatedKeywords?: string[]
  // 旧形式（段階的削除予定）
  businessInsightDetail?: string
  businessInsightSummary?: string
  techInsightDetail?: string
  techInsightSummary?: string
  mfSubject?: string
  mfTaxCategory?: string
  mfMemo?: string
}

// インサイト生成用のプロンプト作成
const generateInsightPrompt = (formData: ExpenseFormData, options: InsightGenerationOptions = {}): string => {
  const {additionalInstruction, isDraft} = options

  const basePrompt = `
あなたは個人事業主として、ビジネス交流の記録を自分自身の視点で振り返っています。
以下の経費記録から、自分が後で思い出すための主観的なインサイトを生成してください。

【経費記録情報】
- 日付: ${formData.date}
- 金額: ${formData.amount}円
- 科目: ${formData.subject}
- 場所: ${formData.location || '不明'}
- 相手: ${formData.counterpartyName || '不明'}
- 会話の目的: ${formData.conversationPurpose.join('・')}
- キーワード: ${formData.keywords.join('・')}
- 会話内容: ${formData.conversationSummary || '記録なし'}

【生成する内容】
1. 摘要（summary）: 経費の簡潔な説明文（30文字以内）
2. インサイト（insight）: 自分が思い出して記述したような主観的な記録（200-300文字）
3. 自動タグ（autoTags）: 分類・検索用のタグ（5-8個）

【インサイト記述の重要な指針】
- 客観的な記録ではなく、自分自身が思い出して記述したような文体で書く
- 「〜について相談した」「〜を依頼した」「〜と感じた」「〜を検討している」など主観的表現を使用
- 今後のアクションや考えを含める（「次は〜してみよう」「〜を要検討」など）
- 相手の発言は「〜曰く」「〜とのこと」「〜らしい」などで表現。
- 効率よく記載したいという性格も考慮し、体言止めも使う。


【記述例】
- 「今後外注をしていきたいから、知人のIT関係者を紹介してもらえないかとAさんに依頼した。Aさんは〜」
- 「飲食店のレジアプリについて、アイデアを相談。Bさん曰く、〜。その場合、NextJSとtailwindで構築できるか要相談。次は実際の店舗でスタッフにヒアリングをしてみよう。」

【多様な交流目的を考慮】
- 営業・商談：新規顧客開拓、既存顧客との関係強化
- 人材・リクルーティング：プロジェクトメンバーの採用、人材紹介依頼
- 技術・開発：技術課題の解決、新技術の相談
- 外注・パートナー：業務委託先の発掘、協業相手の探索
- 顧客紹介：新規顧客の紹介依頼、ビジネスマッチング
- 関係構築：長期的な信頼関係の構築、人脈形成
- 学習・成長：スキル向上、知識習得、業界動向の把握

${additionalInstruction ? `\n【追加指示】\n${additionalInstruction}` : ''}

以下のJSON形式で回答してください：
{
  "summary": "摘要文",
  "insight": "主観的な記録文（自分が思い出して記述したような文体）",
  "autoTags": ["タグ1", "タグ2", "タグ3", "タグ4", "タグ5"],
  "mfSubject": "${formData.subject}",
  "mfTaxCategory": "課仕 10%",
  "mfMemo": "MoneyForward用の摘要"
}
`

  return basePrompt
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
      const generatedKeywords = await generateKeywordsFromContext(
        formData.counterpartyName,
        formData.conversationPurpose,
        formData.location,
        formData.subject
      )
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

// 下書き生成（新仕様対応）
export const generateInsightsDraft = async (
  formData: ExpenseFormData,
  additionalInstruction?: string
): Promise<{
  success: boolean
  data?: AIDraft
  error?: string
}> => {
  try {
    const result = await generateInsightsCore(formData, {
      additionalInstruction,
      isDraft: true,
    })

    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'インサイト生成に失敗しました',
      }
    }

    const draft: AIDraft = {
      summary: result.data.summary || '',
      insight: result.data.insight || '',
      autoTags: result.data.autoTags || [],
      generatedKeywords: result.data.generatedKeywords || [],
    }

    return {
      success: true,
      data: draft,
    }
  } catch (error) {
    console.error('下書き生成エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '下書き生成に失敗しました',
    }
  }
}

// 実際のインサイト生成（データベース保存用）
export const generateInsights = async (
  formData: ExpenseFormData,
  additionalInstruction?: string
): Promise<{
  success: boolean
  data?: AIAnalysisResult
  error?: string
}> => {
  try {
    const result = await generateInsightsCore(formData, {
      additionalInstruction,
      isDraft: false,
    })

    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'インサイト生成に失敗しました',
      }
    }

    const analysisResult: AIAnalysisResult = {
      summary: result.data.summary || '',
      insight: result.data.insight || '',
      autoTags: result.data.autoTags || [],
      mfSubject: result.data.mfSubject || formData.subject,
      mfTaxCategory: result.data.mfTaxCategory || '課仕 10%',
      mfMemo: result.data.mfMemo || result.data.summary || '',
    }

    return {
      success: true,
      data: analysisResult,
    }
  } catch (error) {
    console.error('インサイト生成エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'インサイト生成に失敗しました',
    }
  }
}

// 既存の経費記録にインサイトを追加
export const addInsightToExpense = async (
  expenseId: string,
  additionalInstruction?: string
): Promise<{
  success: boolean
  data?: {
    summary: string
    insight: string
    autoTags: string[]
  }
  error?: string
}> => {
  try {
    // 既存の経費記録を取得
    const expense = await prisma.keihiExpense.findUnique({
      where: {id: expenseId},
    })

    if (!expense) {
      return {
        success: false,
        error: '経費記録が見つかりません',
      }
    }

    // ExpenseFormData形式に変換
    const formData: ExpenseFormData = {
      date: expense.date.toISOString().split('T')[0],
      amount: expense.amount,
      subject: expense.subject,
      location: expense.location || '',
      counterpartyName: expense.counterpartyName || '',
      counterpartyIndustry: expense.counterpartyIndustry || '',
      conversationPurpose: Array.isArray(expense.conversationPurpose) ? expense.conversationPurpose : [],
      keywords: expense.keywords || [],
      conversationSummary: expense.conversationSummary || '',
      learningDepth: expense.learningDepth || undefined,
      counterpartyContact: expense.counterpartyContact || '',
      followUpPlan: expense.followUpPlan || '',
      businessOpportunity: expense.businessOpportunity || '',
      competitorInfo: expense.competitorInfo || '',
    }

    // インサイト生成
    const result = await generateInsights(formData, additionalInstruction)

    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'インサイト生成に失敗しました',
      }
    }

    // データベースを更新
    await prisma.keihiExpense.update({
      where: {id: expenseId},
      data: {
        insight: result.data.insight,
        autoTags: result.data.autoTags,
        mfSubject: result.data.mfSubject,
        mfTaxCategory: result.data.mfTaxCategory,
        mfMemo: result.data.mfMemo,
      },
    })

    return {
      success: true,
      data: {
        summary: result.data.summary,
        insight: result.data.insight,
        autoTags: result.data.autoTags,
      },
    }
  } catch (error) {
    console.error('インサイト追加エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'インサイト追加に失敗しました',
    }
  }
}
