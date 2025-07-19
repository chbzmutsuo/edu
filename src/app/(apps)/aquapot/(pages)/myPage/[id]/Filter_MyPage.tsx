'use client'
import {Fields} from '@cm/class/Fields/Fields'
import {Button} from '@cm/components/styles/common-components/Button'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import React from 'react'

export default function Filter_MyPage() {
  const {query} = useGlobal()
  const {BasicForm, latestFormData} = useBasicFormProps({
    formData: {month: query},
    columns: new Fields([
      //
      {id: `year `, label: `年`, form: {}},
    ]).transposeColumns(),
  })

  return (
    <BasicForm {...{alignMode: `row`, latestFormData}}>
      <Button>検索</Button>
    </BasicForm>
  )
}
