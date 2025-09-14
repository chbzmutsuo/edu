'use client'

import React, {useRef} from 'react'
import {useReactToPrint} from 'react-to-print'
import {InvoiceDocument} from './InvoiceDocument'
import {InvoiceData} from '@app/(apps)/tbm/(server-actions)/getInvoiceData'
import {Button} from '@cm/components/styles/common-components/Button'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

interface InvoiceViewerProps {
  invoiceData: InvoiceData
}

export default function InvoiceViewer({invoiceData}: InvoiceViewerProps) {
  const componentRef = useRef<HTMLDivElement>(null)

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

  return (
    <div className="space-y-4">
      {/* 操作ボタン */}
      <div className="flex gap-4 p-4 bg-gray-50 rounded-lg no-print">
        <Button onClick={handlePrint} className="bg-blue-600 text-white hover:bg-blue-700">
          PDF出力・印刷
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
      <div className="border border-gray-300 rounded-lg overflow-hidden shadow-lg">
        <InvoiceDocument ref={componentRef} invoiceData={invoiceData} />
      </div>

      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
