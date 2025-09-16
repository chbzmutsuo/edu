import {Fields} from '@cm/class/Fields/Fields'
import {Button} from '@cm/components/styles/common-components/Button'
import {R_Stack} from '@cm/components/styles/common-components/common-components'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import React from 'react'

export default function HaishaTableSwitcher() {
  const {query, addQuery, shallowAddQuery} = useGlobal()
  const {BasicForm, latestFormData} = useBasicFormProps({
    columns: new Fields([
      //
      {
        id: `mode`,
        label: `モード`,
        forSelect: {
          optionsOrOptionFetcher: [
            {name: 'ドライバ', label: 'ドライバ', value: 'DRIVER'},
            {name: '便', label: '便', value: 'ROUTE'},
          ],
        },
      },
      {
        id: `sortBy`,
        label: `並び順`,
        forSelect: {
          optionsOrOptionFetcher: [
            {name: '出発時間順', label: '出発時間順', value: 'departureTime'},
            {name: '便コード順', label: '便コード順', value: 'routeCode'},
            {name: '荷主コード順', label: '荷主コード順', value: 'customerCode'},
          ],
        },
      },
    ]).transposeColumns(),

    formData: {
      mode: query.mode ?? 'DRIVER',
      sortBy: query.sortBy ?? 'departureTime',
    },
  })

  return (
    <>
      <R_Stack>
        <BasicForm
          {...{
            onSubmit: data => {
              shallowAddQuery(data)
            },
            alignMode: 'row',
            latestFormData,
          }}
        >
          <Button color={`blue`}>切り替え</Button>
        </BasicForm>
      </R_Stack>
    </>
  )
}
