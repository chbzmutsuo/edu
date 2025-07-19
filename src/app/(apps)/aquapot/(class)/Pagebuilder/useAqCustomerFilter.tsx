import {AqCustomerCl} from '@app/(apps)/aquapot/(models)/AqCustomerCl'
import {Fields} from '@cm/class/Fields/Fields'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import React from 'react'
import {Button} from '@cm/components/styles/common-components/Button'

export default function useAqCustomerFilter() {
  const {query, addQuery} = useGlobal()
  const columns = new Fields(AqCustomerCl.Filter.aqCustomer.getCols())
  const prismaWhere = AqCustomerCl.Filter.aqCustomer.getPrismaWhereByQuery({query})
  const {BasicForm, latestFormData} = useBasicFormProps({
    formData: query,
    columns: new Fields(AqCustomerCl.Filter.aqCustomer.getCols())
      .customAttributes(({col}) => ({
        ...col,
        form: {...col.form, style: {width: 160, margin: `0 10px`}},
      }))
      .transposeColumns(),
  })

  const Filter = (
    <BasicForm
      {...{
        latestFormData,
        onSubmit: data => addQuery(data),
        alignMode: `row`,
      }}
    >
      <Button>絞り込み</Button>
    </BasicForm>
  )
  return {columns, prismaWhere, Filter}
}
