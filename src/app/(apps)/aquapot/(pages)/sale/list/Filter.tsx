'use client'

import {AQ_CONST} from '@app/(apps)/aquapot/(constants)/options'
import {defaultRegister} from '@cm/class/builders/ColBuilderVariables'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {Fields} from '@cm/class/Fields/Fields'
import {Button} from '@cm/components/styles/common-components/Button'
import {R_Stack} from '@cm/components/styles/common-components/common-components'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import React from 'react'

export default function Filter() {
  const {query, addQuery} = useGlobal()

  const onSubmit = async data => {
    addQuery({...data, from: formatDate(new Date(data.from)), to: formatDate(new Date(data.to))})
  }
  const {BasicForm, latestFormData} = useBasicFormProps({
    formData: {...query},
    columns: new Fields([
      {id: `from`, label: `いつから`, type: `date`, form: {...defaultRegister, showResetBtn: false}},
      {id: `to`, label: `いつまで`, type: `date`, form: {...defaultRegister, showResetBtn: false}},
      {id: `paymentMethod`, label: `支払方法`, forSelect: {optionsOrOptionFetcher: AQ_CONST.PAYMENT_METHOD_LIST}},
      {id: `AqSupportGroupMaster`, label: `支援団体`, forSelect: {}},
      {id: `name`, label: `氏名`},
      {id: `companyName`, label: `会社名`},
      {
        id: `subsc`,
        label: `形態`,
        forSelect: {
          optionsOrOptionFetcher: [`通常`, `定期契約`, `BASEインポート`],
        },
      },
      // {id: `jobTitle`, label: `役職`},
    ])
      .customAttributes(({col}) => ({
        ...col,
        form: {
          ...col.form,
          style: {width: 160},
        },
      }))
      .transposeColumns(),
  })

  return (
    <R_Stack {...{className: ` justify-center`}}>
      <BasicForm {...{latestFormData, onSubmit, alignMode: `row`}}>
        <Button color={`red`}>条件変更</Button>
      </BasicForm>
    </R_Stack>
  )
}
