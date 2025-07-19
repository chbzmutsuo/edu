'use client'
import {GOOGLE_CONSTANTS} from '@app/(apps)/aquapot/(constants)/google-constants'
import {GoogleDrive_GeneratePdf} from '@app/api/google/actions/driveAPI'
import {GoogleSheet_BatchUpdate, GoogleSheet_copy} from '@app/api/google/actions/sheetAPI'
import {SheetRequests} from '@app/api/google/actions/SheetRequests'

import {Days} from '@cm/class/Days/Days'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {sheets_v4} from 'googleapis'
import {AQ_CONST} from '@app/(apps)/aquapot/(constants)/options'

export const showPdf = async ({router, customer, monthStr, data, defaultPaymentMethod, furikomisakiCD}) => {
  const furikomisaki = AQ_CONST.BANK_LIST[furikomisakiCD]

  const {bankName, branchName, accountType, accountNumber, accountHolder, invoiceNumber} = furikomisaki ?? {}
  const {postal, state, city, street, building, companyName, name} = customer ?? {}
  const toName = companyName ? `${companyName} 御中` : `${name} 様`

  const {firstDayOfMonth, lastDayOfMonth} = Days.month.getMonthDatum(Days.month.add(new Date(monthStr), 1))

  let remarks = ''

  const KOUZA_HIKIOTOSHI = defaultPaymentMethod === '自動口座引落'
  const GINKO_FURIKOMI = defaultPaymentMethod === '銀行振込'

  if (KOUZA_HIKIOTOSHI) {
    remarks = '口座振替は毎月27日（当日が金融機関休業日の場合は翌営業日）にご指定の口座より振替させて頂きます。'
  } else if (GINKO_FURIKOMI) {
    remarks = 'お振込手数料はお客様側ご負担にてお願いいたします。'
  }
  const newFileName = [
    //
    '請求書',
    toName,
    formatDate(firstDayOfMonth),
  ].join(`_`)
  const {template, FOLDER_URL} = GOOGLE_CONSTANTS.invoice

  const maxRowCount = 17

  const SS_URL = template.SS_URL

  const requests: sheets_v4.Schema$Request[] = [
    SheetRequests.updateCell(0, 0, 0, '〒 ' + postal),
    SheetRequests.updateCell(0, 1, 0, [state, city, street].join(``)),
    SheetRequests.updateCell(0, 2, 0, building ?? ''),
    //
    SheetRequests.updateCell(0, 4, 0, toName),
    SheetRequests.updateCell(0, 7, 0, GINKO_FURIKOMI ? '請求書' : 'ご利用明細書'),
    SheetRequests.updateCell(0, 9, 24, firstDayOfMonth),
    SheetRequests.updateCell(0, 10, 24, AQ_CONST.INVOICE_NUMBER),

    ...new Array(maxRowCount).fill(0).map((_, idx) => {
      const {date, name, quantity, unitPrice, totalPrice, ratio, remarks} = data[idx] ?? {}

      const startIdx = 14
      const row = startIdx + idx

      return [
        {value: date ?? '', col: 0},
        {value: name ?? '', col: 3},
        {value: quantity ?? '', col: 8},
        {value: unitPrice ?? '', col: 11},
        {value: ratio ? Number(ratio) / 100 : '', col: 14},
        {value: totalPrice ?? '', col: 17},
        {value: remarks ?? '', col: 21},
      ]

        .map(({value = '', col}, colIdx) => {
          const sheetIdx = 0
          const request = SheetRequests.updateCell(sheetIdx, row, col, value)
          return request
        })
        .flat()
    }),
  ].flat()

  if (furikomisaki) {
    requests.push(
      SheetRequests.updateCell(0, 34, 0, '入金期日'),
      SheetRequests.updateCell(0, 34, 2, formatDate(lastDayOfMonth)),
      SheetRequests.updateCell(0, 36, 0, '振込先'),
      SheetRequests.updateCell(0, 36, 2, bankName ?? ''),
      SheetRequests.updateCell(0, 36, 7, branchName ?? ''),
      SheetRequests.updateCell(0, 37, 2, [accountType ?? '', accountNumber ?? ''].join(`:`)),
      SheetRequests.updateCell(0, 37, 7, accountHolder ?? '')
    )
  } else {
    requests.push(
      SheetRequests.updateCell(0, 36, 0, ''),
      SheetRequests.updateCell(0, 36, 2, ''),
      SheetRequests.updateCell(0, 36, 7, ''),
      SheetRequests.updateCell(0, 37, 2, ''),
      SheetRequests.updateCell(0, 37, 7, '')
    )
  }

  requests.push(SheetRequests.updateCell(0, 40, 0, remarks))

  const copiedSpreadSheet = await GoogleSheet_copy({
    fromSSId: SS_URL,
    destinationFolderId: 'https://drive.google.com/drive/folders/12l3qAiSCWcuJMndDyFQnZg10Kz-uRHj2?hl=ja',
    fileName: [
      //
      customer.companyName ?? '',
      customer.name,
      customer.jobTitle,
      formatDate(new Date(), 'YYYYMMDDHHmmss'),
    ].join(`_`),
  })

  await GoogleSheet_BatchUpdate({spreadsheetId: copiedSpreadSheet.id ?? '', requests})

  // PDF化して取得
  const res = await GoogleDrive_GeneratePdf({spreadsheetId: copiedSpreadSheet.id ?? ''})
  const blob = new Blob([Uint8Array.from(atob(res.pdfData ?? ''), c => c.charCodeAt(0))], {
    type: 'application/pdf',
  })

  // downloadするようにしたい
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = '請求書.pdf'
  a.click()
  // router.push(url, '_blank')

  // // ポップアップブロックを回避するために、ユーザーアクションに応じてウィンドウを開く
  // const openPdf = () => {
  //   window.open(url, '_blank')
  // }

  // return <Redirector redirectPath={`/pdf-viewer?url=${encodeURIComponent(url)}`} />
}
