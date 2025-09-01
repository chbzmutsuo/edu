'use client'

import React, { useState } from 'react'
import { CsvTable } from '@cm/components/styles/common-components/CsvTable/CsvTable'
import { Days } from '@cm/class/Days/Days'
import { NumHandler } from '@cm/class/NumHandler'
import { Checkbox } from '@cm/shadcn/ui/checkbox'
import { Button } from '@cm/components/styles/common-components/Button'
import { ungroupEtcRecords } from '@app/(apps)/tbm/server-actions/etc-csv'
import { toastByResult } from '@cm/lib/ui/notifications'

interface EtcDataTableProps {
  data: any[]
  selectedRows: {[key: number]: boolean}
  toggleRowSelection: (id: number) => void
  onDataChange: () => void
}

export default function EtcDataTable({ data, selectedRows, toggleRowSelection, onDataChange }: EtcDataTableProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  // グループ済みのレコードを取得
  const groupedRecords = {}
  data.forEach(record => {
    if (record.isGrouped && record.tbmEtcMeisaiId) {
      if (!groupedRecords[record.tbmEtcMeisaiId]) {
        groupedRecords[record.tbmEtcMeisaiId] = []
      }
      groupedRecords[record.tbmEtcMeisaiId].push(record)
    }
  })
  
  // グループを解除する処理
  const handleUngroupRecords = async (meisaiId: number) => {
    if (!confirm('このグループを解除しますか？')) return
    
    setIsLoading(true)
    try {
      const result = await ungroupEtcRecords(meisaiId)
      toastByResult(result)
      
      if (result.success) {
        onDataChange()
      }
    } catch (error) {
      console.error('グループ解除中にエラーが発生しました:', error)
      toastByResult({ success: false, message: 'グループ解除中にエラーが発生しました' })
    } finally {
      setIsLoading(false)
    }
  }
  
  // グループ化されたデータを表示
  const groupedRows = Object.keys(groupedRecords).map(meisaiId => {
    const records = groupedRecords[meisaiId]
    const firstRecord = records[0]
    const lastRecord = records[records.length - 1]
    const sum = records.reduce((acc, record) => acc + record.fee, 0)
    
    return {
      isGroupHeader: true,
      meisaiId: parseInt(meisaiId),
      fromDate: firstRecord.fromDate,
      fromTime: firstRecord.fromTime,
      toDate: lastRecord.toDate,
      toTime: lastRecord.toTime,
      fromIc: firstRecord.fromIc,
      toIc: lastRecord.toIc,
      fee: sum,
      records
    }
  })
  
  // 未グループのレコード
  const ungroupedRecords = data.filter(record => !record.isGrouped)
  
  // すべてのレコードを日付順にソート
  const allRecords = [
    ...groupedRows,
    ...ungroupedRecords
  ].sort((a, b) => {
    const dateA = a.isGroupHeader ? new Date(a.fromDate) : new Date(a.fromDate)
    const dateB = b.isGroupHeader ? new Date(b.fromDate) : new Date(b.fromDate)
    return dateA.getTime() - dateB.getTime()
  })
  
  if (data.length === 0) {
    return <p>表示するデータがありません</p>
  }
  
  return CsvTable({
    virtualized: { enabled: false },
    records: allRecords.map((record, i) => {
      if (record.isGroupHeader) {
        // グループヘッダー行
        return {
          csvTableRow: [
            {
              label: '',
              cellValue: (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleUngroupRecords(record.meisaiId)}
                  disabled={isLoading}
                >
                  解除
                </Button>
              ),
              cellProps: {
                className: 'bg-blue-100'
              }
            },
            {
              label: '利用年月日（自）',
              cellValue: Days.format.formatDate(record.fromDate),
              cellProps: {
                className: 'bg-blue-100'
              }
            },
            {
              label: '時分（自）',
              cellValue: record.fromTime,
              cellProps: {
                className: 'bg-blue-100'
              }
            },
            {
              label: '利用年月日（至）',
              cellValue: Days.format.formatDate(record.toDate),
              cellProps: {
                className: 'bg-blue-100'
              }
            },
            {
              label: '時分（至）',
              cellValue: record.toTime,
              cellProps: {
                className: 'bg-blue-100'
              }
            },
            {
              label: '利用IC（自）',
              cellValue: record.fromIc,
              cellProps: {
                className: 'bg-blue-100'
              }
            },
            {
              label: '利用IC（至）',
              cellValue: record.toIc,
              cellProps: {
                className: 'bg-blue-100'
              }
            },
            {
              label: '通行料金',
              cellValue: `¥${NumHandler.formatNumber(record.fee)}`,
              cellProps: {
                className: 'bg-blue-100'
              }
            },
            {
              label: 'グループ',
              cellValue: '✓',
              cellProps: {
                className: 'bg-blue-100'
              }
            }
          ]
        }
      } else {
        // 通常の行
        return {
          csvTableRow: [
            {
              label: '',
              cellValue: (
                <Checkbox
                  checked={!!selectedRows[record.id]}
                  onCheckedChange={() => toggleRowSelection(record.id)}
                />
              )
            },
            {
              label: '利用年月日（自）',
              cellValue: Days.format.formatDate(record.fromDate)
            },
            {
              label: '時分（自）',
              cellValue: record.fromTime
            },
            {
              label: '利用年月日（至）',
              cellValue: Days.format.formatDate(record.toDate)
            },
            {
              label: '時分（至）',
              cellValue: record.toTime
            },
            {
              label: '利用IC（自）',
              cellValue: record.fromIc
            },
            {
              label: '利用IC（至）',
              cellValue: record.toIc
            },
            {
              label: '通行料金',
              cellValue: `¥${NumHandler.formatNumber(record.fee)}`
            },
            {
              label: 'グループ',
              cellValue: record.isGrouped ? '✓' : ''
            }
          ]
        }
      }
    })
  }).WithWrapper({ className: `max-h-[600px] overflow-auto` })
}
