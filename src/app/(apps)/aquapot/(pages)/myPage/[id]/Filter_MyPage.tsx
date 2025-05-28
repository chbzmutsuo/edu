'use client'
import {Fields} from '@class/Fields/Fields'
import {Button} from '@components/styles/common-components/Button'
import useGlobal from '@hooks/globalHooks/useGlobal'
import useBasicFormProps from '@hooks/useBasicForm/useBasicFormProps'
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
