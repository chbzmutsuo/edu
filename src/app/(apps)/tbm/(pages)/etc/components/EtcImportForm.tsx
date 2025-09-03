import React, {useEffect} from 'react'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import {Fields} from '@cm/class/Fields/Fields'
import {getVehicleForSelectConfig} from '@app/(apps)/tbm/(builders)/ColBuilders/TbmVehicleColBuilder'
import {Button} from '@cm/components/styles/common-components/Button'
import {Card} from '@cm/shadcn/ui/card'
import {Days} from '@cm/class/Days/Days'
import {isDev} from '@cm/lib/methods/common'
import {FormData} from '../types'

interface EtcImportFormProps {
  isLoading: boolean
  onImport: (data: FormData) => Promise<void>
  onFormChange: (tbmVehicleId: number, month: Date) => void
}

export const EtcImportForm: React.FC<EtcImportFormProps> = ({isLoading, onImport, onFormChange}) => {
  const {firstDayOfMonth} = Days.month.getMonthDatum(new Date())

  const {BasicForm, latestFormData} = useBasicFormProps({
    columns: new Fields([
      {
        id: `tbmVehicleId`,
        label: `車両`,
        form: {
          defaultValue: isDev ? 5 : null,
        },
        forSelect: {config: getVehicleForSelectConfig({})},
      },
      {
        id: `month`,
        label: `月`,
        form: {
          defaultValue: isDev ? '2025-08-01T00:00:00+09:00' : firstDayOfMonth,
        },
        type: `month`,
      },
      {
        id: `csvData`,
        label: `CSVデータ`,
        form: {defaultValue: '', style: {maxHeight: 120, minWidth: 350, lineHeight: 1.2}},
        type: 'textarea',
      },
    ]).transposeColumns(),
  })

  // フォームデータが変更されたときに呼び出される
  useEffect(() => {
    if (latestFormData?.tbmVehicleId && latestFormData?.month) {
      onFormChange(latestFormData.tbmVehicleId, latestFormData.month)
    }
  }, [latestFormData?.tbmVehicleId, latestFormData?.month])

  return (
    <Card className="p-4">
      <h2 className="text-xl font-bold mb-4">①データインポート</h2>
      <BasicForm
        {...{
          latestFormData,
          onSubmit: onImport,
        }}
      >
        <div className="mb-4">{/* CSVデータ入力フィールド */}</div>
        <Button disabled={isLoading}>{isLoading ? 'インポート中...' : 'CSVデータをインポート'}</Button>
      </BasicForm>
    </Card>
  )
}
