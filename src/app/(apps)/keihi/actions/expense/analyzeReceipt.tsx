'use server'
import {MAJOR_ACCOUNTS} from '@app/(apps)/keihi/actions/expense/constants'
import {CONVERSATION_PURPOSES} from '@app/(apps)/keihi/(constants)/conversation-purposes'
import {ImageAnalysisResult} from '@app/(apps)/keihi/types'
import OpenAI from 'openai'

// 複数画像の統合解析
export const analyzeMultipleReceipts = async (
  imageDataList: string[]
): Promise<{
  success: boolean
  data?: {
    receipts: Array<{
      date: string
      location: string
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
                date: result.data.date,
                location: result.data.location,
                amount: result.data.amount,
                subject: result.data.subject,
                counterpartyName: result.data.suggestedCounterparties[0] || '',
                mfMemo: `${result.data.location}での${result.data.suggestedPurposes.join('・')}`,
                keywords: result.data.generatedKeywords,
                imageIndex: 0,
              },
            ],
            totalAmount: result.data.amount,
            suggestedMerge: false,
            allKeywords: result.data.generatedKeywords,
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
            date: result.data.date,
            location: result.data.location,
            amount: result.data.amount,
            subject: result.data.subject,
            counterpartyName: result.data.suggestedCounterparties[0] || '',
            mfMemo: `${result.data.location}での${result.data.suggestedPurposes.join('・')}`,
            keywords: result.data.generatedKeywords,
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
    const allKeywords = [...new Set(validResults.flatMap(receipt => receipt.keywords))]

    // 同じ日付・場所の領収書がある場合は統合を提案
    const suggestedMerge = validResults.some((receipt, index) =>
      validResults.some(
        (other, otherIndex) => index !== otherIndex && receipt.date === other.date && receipt.location === other.location
      )
    )

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
      error: error instanceof Error ? error.message : '画像解析に失敗しました',
    }
  }
}

// 画像からOCR＋AI解析（新仕様対応）
export const analyzeReceiptImage = async (
  imageBase64: string
): Promise<{
  success: boolean
  data?: ImageAnalysisResult
  error?: string
}> => {
  try {
    const conversationPurposeOptions = CONVERSATION_PURPOSES.map(p => p.value).join('\n')

    const prompt = `
この領収書画像から情報を抽出し、ビジネス交流記録として整理してください。

【抽出する情報】
1. 日付（YYYY-MM-DD形式）
2. 場所（店舗名・施設名）
3. 金額（数値のみ）
4. 適切な勘定科目（以下から選択）：
${MAJOR_ACCOUNTS.map(acc => `- ${acc.account}`).join('\n')}

【推測する情報】
5. 想定される相手（複数可能）：
   - 店舗の種類、立地、時間帯から推測
   - 例：「Aさん（教師）」「Bさん（エンジニア）」「その他複数名」

6. 会話の目的（複数選択、以下から推測）：
${conversationPurposeOptions}

7. キーワード（2〜3個）：
   - 相手、会話の目的、場所、科目から想定される交流内容
   - 例：「技術相談」「新規開拓」「人材紹介」

以下のJSON形式で回答してください：
{
  "date": "YYYY-MM-DD",
  "location": "店舗名・場所",
  "amount": 数値,
  "subject": "勘定科目",
  "suggestedCounterparties": ["相手1", "相手2"],
  "suggestedPurposes": ["目的1", "目的2"],
  "generatedKeywords": ["キーワード1", "キーワード2", "キーワード3"]
}
`

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
      temperature: 1.2, // 創造性を高めて多様な推測を促す
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

    // データの検証と正規化
    const result: ImageAnalysisResult = {
      date: parsedData.date || new Date().toISOString().split('T')[0],
      location: parsedData.location || '',
      amount: parsedData.amount || 0,
      subject: parsedData.subject || '会議費',
      suggestedCounterparties: Array.isArray(parsedData.suggestedCounterparties)
        ? parsedData.suggestedCounterparties
        : ['その他複数名'],
      suggestedPurposes: Array.isArray(parsedData.suggestedPurposes)
        ? parsedData.suggestedPurposes.filter(p => CONVERSATION_PURPOSES.some(cp => cp.value === p))
        : ['営業活動', 'リクルーティング'],
      generatedKeywords: Array.isArray(parsedData.generatedKeywords)
        ? parsedData.generatedKeywords.slice(0, 3)
        : ['ビジネス交流', '情報交換'],
    }

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    console.error('画像解析エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '画像解析に失敗しました',
    }
  }
}

// キーワード生成関数
export const generateKeywordsFromContext = async (
  counterpartyName?: string,
  conversationPurpose: string[] = [],
  location?: string,
  subject?: string
): Promise<string[]> => {
  const keywords: string[] = []

  // 相手からキーワードを生成
  if (counterpartyName) {
    if (counterpartyName.includes('教師') || counterpartyName.includes('先生')) {
      keywords.push('教育関係')
    }
    if (counterpartyName.includes('エンジニア') || counterpartyName.includes('開発')) {
      keywords.push('技術相談')
    }
    if (counterpartyName.includes('営業') || counterpartyName.includes('販売')) {
      keywords.push('営業活動')
    }
  }

  // 会話の目的からキーワードを生成
  conversationPurpose.forEach(purpose => {
    switch (purpose) {
      case '営業活動':
        keywords.push('新規開拓', 'ビジネス機会')
        break
      case 'リクルーティング':
        keywords.push('人材紹介', '採用活動')
        break
      case '技術・アイデア相談':
        keywords.push('技術相談', '開発支援')
        break
      case 'ビジネス相談':
        keywords.push('事業相談', '戦略検討')
        break
      case '研修・学習':
        keywords.push('スキル向上', '学習支援')
        break
      case '情報交換':
        keywords.push('情報共有', 'ネットワーキング')
        break
    }
  })

  // 場所からキーワードを生成
  if (location) {
    if (location.includes('カフェ') || location.includes('コーヒー')) {
      keywords.push('カジュアル面談')
    }
    if (location.includes('レストラン') || location.includes('料理')) {
      keywords.push('会食')
    }
    if (location.includes('ホテル') || location.includes('会議室')) {
      keywords.push('正式会議')
    }
  }

  // 科目からキーワードを生成
  if (subject) {
    if (subject.includes('会議費')) {
      keywords.push('ビジネス会議')
    }
    if (subject.includes('交際費')) {
      keywords.push('接待', '関係構築')
    }
    if (subject.includes('研修費')) {
      keywords.push('教育', 'スキル開発')
    }
  }

  // 重複を除去し、最大3つに制限
  return [...new Set(keywords)].slice(0, 3)
}
