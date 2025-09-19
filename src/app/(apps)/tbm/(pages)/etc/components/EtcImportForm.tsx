'use client'
import React, { useState, useEffect } from 'react'
import { Card } from '@cm/shadcn/ui/card'
import { Fields } from '@cm/class/Fields/Fields'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import { Days } from '@cm/class/Days/Days'
import { isDev } from '@cm/lib/methods/common'
import { getVehicleForSelectConfig } from '@app/(apps)/tbm/(builders)/ColBuilders/TbmVehicleColBuilder'
import { FileUploadFormData } from '../types'
import { EtcFileUpload } from './EtcFileUpload'
import { C_Stack } from '@cm/components/styles/common-components/common-components'

interface EtcImportFormProps {
  isLoading: boolean
  onImport: (data: { tbmVehicleId: number; month: Date; csvData: string }) => Promise<void>
  onFormChange: (tbmVehicleId: number, month: Date) => void
}

export const EtcImportForm: React.FC<EtcImportFormProps> = ({ isLoading, onImport, onFormChange }) => {
  const { firstDayOfMonth } = Days.month.getMonthDatum(new Date())
  const [csvContent, setCsvContent] = useState<string>('')

  const { BasicForm, latestFormData } = useBasicFormProps<FileUploadFormData>({
    columns: new Fields([
      {
        id: `tbmVehicleId`,
        label: `車両`,
        form: {
          defaultValue: isDev ? 5 : null,
          style: { width: 300 },
        },
        forSelect: { config: getVehicleForSelectConfig({}) },
      },
      {
        id: `month`,
        label: `月`,
        form: {
          defaultValue: isDev ? '2025-08-01T00:00:00+09:00' : firstDayOfMonth,
          style: { width: 300 },
        },
        type: `month`,
      },
    ]).transposeColumns(),
  })

  // フォームデータが変更されたときに呼び出される
  useEffect(() => {
    if (latestFormData?.tbmVehicleId && latestFormData?.month) {
      onFormChange(latestFormData.tbmVehicleId, latestFormData.month)
    }
  }, [latestFormData?.tbmVehicleId, latestFormData?.month, onFormChange])

  const handleFileLoaded = (content: string) => {
    setCsvContent(content)
  }

  const handleSubmit = () => {
    if (latestFormData?.tbmVehicleId && latestFormData?.month && csvContent) {
      onImport({
        tbmVehicleId: latestFormData.tbmVehicleId,
        month: latestFormData.month,
        csvData: csvContent,
      })
    }
  }

  return (
    <Card className="p-4">
      <h2 className="text-xl font-bold mb-4">①データインポート</h2>
      <C_Stack className="gap-4">
        <BasicForm latestFormData={latestFormData} />
        
        <EtcFileUpload 
          onFileLoaded={handleFileLoaded} 
          isLoading={isLoading} 
          onSubmit={handleSubmit}
        />
      </C_Stack>
    </Card>
  )
}