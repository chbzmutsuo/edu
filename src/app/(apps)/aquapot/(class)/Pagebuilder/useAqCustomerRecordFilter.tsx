import {AqCustomerCl} from '@app/(apps)/aquapot/(models)/AqCustomerCl'
import {Fields} from '@class/Fields/Fields'
import useGlobal from '@hooks/globalHooks/useGlobal'
import useBasicFormProps from '@hooks/useBasicForm/useBasicFormProps'
import React from 'react'
import {Button} from '@components/styles/common-components/Button'

export default function useAqCustomerRecordFilter() {
  const {query, addQuery, PC} = useGlobal()
  const columns = new Fields(AqCustomerCl.Filter.aqCustomerRecord.getCols())
  const prismaWhere = AqCustomerCl.Filter.aqCustomerRecord.getPrismaWhereByQuery({query})
  const {BasicForm, latestFormData} = useBasicFormProps({
    formData: query,
    columns: new Fields(AqCustomerCl.Filter.aqCustomerRecord.getCols())
      .customAttributes(({col}) => ({
        ...col,
        form: {...col.form, style: {width: 160, margin: `0 10px`}},
      }))
      .transposeColumns(),
  })

  const Filter = (
    <BasicForm {...{latestFormData, onSubmit: data => addQuery(data), alignMode: `row`}}>
      <Button>絞り込み</Button>
    </BasicForm>
  )
  return {columns, prismaWhere, Filter}
}
