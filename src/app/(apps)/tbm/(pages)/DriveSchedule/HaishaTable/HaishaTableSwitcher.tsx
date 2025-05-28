import {Fields} from '@class/Fields/Fields'
import {Button} from '@components/styles/common-components/Button'
import {R_Stack} from '@components/styles/common-components/common-components'
import useGlobal from '@hooks/globalHooks/useGlobal'
import useBasicFormProps from '@hooks/useBasicForm/useBasicFormProps'
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
            {
              name: 'ドライバ',
              label: 'DRIVER',
              value: 'DRIVER',
            },
            {
              name: '便',
              label: 'ROUTE',
              value: 'ROUTE',
            },
          ],
        },
      },
      // {id: `date`, label: `日付`, form: {}},
      // {id: `userId`, label: `スタッフ`, forSelect: {}},
    ]).transposeColumns(),

    formData: {mode: query.mode ?? 'DRIVER'},
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
          <Button color={`blue`}>設定</Button>
        </BasicForm>
      </R_Stack>
    </>
  )
}
