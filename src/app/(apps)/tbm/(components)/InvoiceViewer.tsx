'use client'

import React, {useRef, useState} from 'react'
import {useReactToPrint} from 'react-to-print'
import {InvoiceDocument} from './InvoiceDocument'
import {InvoiceData} from '@app/(apps)/tbm/(server-actions)/getInvoiceData'
import {createInvoiceSpreadsheet} from '@app/(apps)/tbm/(server-actions)/createInvoiceSpreadsheet'
import {Button} from '@cm/components/styles/common-components/Button'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {toast} from 'react-toastify'

interface InvoiceViewerProps {
  invoiceData: InvoiceData
}

export default function InvoiceViewer({invoiceData}: InvoiceViewerProps) {
  const componentRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)
  // const {toastIfFailed} = useGlobal()

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `請求書_${formatDate(invoiceData.invoiceDetails.yearMonth, 'YYYY年MM月')}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 0;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .page-break-after-always {
          page-break-after: always !important;
        }
      }
    `,
  })

  const handleExportToSpreadsheet = async () => {
    setIsExporting(true)
    try {
      const result = await createInvoiceSpreadsheet(invoiceData)

      if (result.success && result.spreadsheetUrl) {
        toast.success(result.message)
        // 新しいタブでスプレッドシートを開く
        window.open(result.spreadsheetUrl, '_blank')
      } else {
        toast.error(result.error || result.message)
      }
    } catch (error) {
      console.error('スプレッドシート出力エラー:', error)
      toast.error('スプレッドシートの出力に失敗しました')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* 操作ボタン */}
      <div className="flex gap-4 p-4 bg-gray-50 rounded-lg no-print">
        <Button onClick={handlePrint} className="bg-blue-600 text-white hover:bg-blue-700">
          PDF出力・印刷
        </Button>
        <Button
          onClick={handleExportToSpreadsheet}
          disabled={isExporting}
          className="bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400"
        >
          {isExporting ? 'スプレッドシート作成中...' : 'スプレッドシート出力'}
        </Button>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>対象期間:</span>
          <span className="font-semibold">{formatDate(invoiceData.invoiceDetails.yearMonth, 'YYYY年MM月')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>請求先:</span>
          <span className="font-semibold">{invoiceData.customerInfo.name}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>合計金額:</span>
          <span className="font-semibold text-lg">¥{invoiceData.invoiceDetails.grandTotal.toLocaleString()}</span>
        </div>
      </div>

      {/* プレビュー */}
      <div className="border border-gray-300 rounded-lg overflow-hidden shadow-lg ">
        <InvoiceDocument ref={componentRef} invoiceData={invoiceData} />
      </div>

      {/* <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
        }
      `}</style> */}
    </div>
  )
}
