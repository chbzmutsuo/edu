'use server'

import prisma from 'src/lib/prisma'

export interface MFJournalEntry {
  取引No: string
  取引日: string
  借方勘定科目: string
  借方補助科目: string
  借方部門: string
  借方取引先: string
  借方税区分: string
  借方インボイス: string
  '借方金額(円)': number
  借方税額: number
  貸方勘定科目: string
  貸方補助科目: string
  貸方部門: string
  貸方取引先: string
  貸方税区分: string
  貸方インボイス: string
  '貸方金額(円)': number
  貸方税額: number
  摘要: string
  仕訳メモ: string
  タグ: string
  MF仕訳タイプ: string
  決算整理仕訳: string
  作成日時: string
  作成者: string
  最終更新日時: string
  最終更新者: string
}

// MoneyForward用CSV生成
export async function generateMFCSV(expenseIds?: string[]): Promise<{
  success: boolean
  csvData?: string
  error?: string
}> {
  try {
    const whereClause = expenseIds ? {id: {in: expenseIds}} : {}

    const expenses = await prisma.keihiExpense.findMany({
      where: whereClause,
      orderBy: {date: 'desc'},
    })

    if (expenses.length === 0) {
      return {success: false, error: '出力対象の記録がありません'}
    }

    // CSVヘッダー
    const headers = [
      '取引No',
      '取引日',
      '借方勘定科目',
      '借方補助科目',
      '借方部門',
      '借方取引先',
      '借方税区分',
      '借方インボイス',
      '借方金額(円)',
      '借方税額',
      '貸方勘定科目',
      '貸方補助科目',
      '貸方部門',
      '貸方取引先',
      '貸方税区分',
      '貸方インボイス',
      '貸方金額(円)',
      '貸方税額',
      '摘要',
      '仕訳メモ',
      'タグ',
      'MF仕訳タイプ',
      '決算整理仕訳',
      '作成日時',
      '作成者',
      '最終更新日時',
      '最終更新者',
    ]

    // CSVデータ生成
    const csvRows = expenses.map((expense, index) => {
      const transactionNo = (index + 1).toString()
      const date = expense.date.toISOString().split('T')[0].replace(/-/g, '/')
      const tags = expense.autoTags.join('|')

      return [
        transactionNo,
        date,
        expense.mfSubject || expense.subject, // 借方勘定科目
        expense.mfSubAccount || '', // 借方補助科目
        expense.mfDepartment || '', // 借方部門
        expense.counterpartyName || '', // 借方取引先
        expense.mfTaxCategory || '課仕 10%', // 借方税区分
        '', // 借方インボイス
        expense.amount, // 借方金額
        0, // 借方税額
        '現金', // 貸方勘定科目（固定）
        '', // 貸方補助科目
        '', // 貸方部門
        '', // 貸方取引先
        '対象外', // 貸方税区分（固定）
        '', // 貸方インボイス
        expense.amount, // 貸方金額
        0, // 貸方税額
        expense.mfMemo || expense.conversationSummary || `${expense.subject} ${expense.amount}円`, // 摘要
        expense.insight || '', // 仕訳メモ
        tags, // タグ
        '', // MF仕訳タイプ
        '', // 決算整理仕訳
        '', // 作成日時
        '', // 作成者
        '', // 最終更新日時
        '', // 最終更新者
      ]
    })

    // CSV文字列生成
    const csvContent = [
      headers.join(','),
      ...csvRows.map(row =>
        row
          .map(cell => {
            // 文字列の場合はダブルクォートで囲む
            if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))) {
              return `"${cell.replace(/"/g, '""')}"`
            }
            return cell
          })
          .join(',')
      ),
    ].join('\n')

    return {
      success: true,
      csvData: csvContent,
    }
  } catch (error) {
    console.error('CSV生成エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'CSV生成に失敗しました',
    }
  }
}

// 全件CSV出力
export async function exportAllExpensesToCSV() {
  return await generateMFCSV()
}

// 選択した記録のCSV出力
export async function exportSelectedExpensesToCSV(expenseIds: string[]) {
  return await generateMFCSV(expenseIds)
}
