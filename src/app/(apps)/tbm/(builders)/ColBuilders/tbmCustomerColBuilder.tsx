'use client'
import {defaultRegister} from '@class/builders/ColBuilderVariables'
import {Fields} from '@cm/class/Fields/Fields'
import {columnGetterType} from '@cm/types/types'

export const tbmCustomerColBuilder = (props: columnGetterType) => {
  const {date, tbmVehicleId, lastOdometerStart = 0, lastOdometerEnd = 0} = props.ColBuilderExtraProps ?? {}
  return new Fields([
    {
      id: 'code',
      label: 'コード',
      type: 'string',
    },
    {
      id: 'name',
      label: '名称',
      type: 'string',
      form: {...defaultRegister},
    },
    {
      id: 'address',
      label: '住所',
      type: 'string',
    },
    {
      id: 'phoneNumber',
      label: '電話番号',
      type: 'string',
    },
    {
      id: 'faxNumber',
      label: 'FAX番号',
      type: 'string',
    },
    {
      id: 'bankInformation',
      label: '銀行情報',
      type: 'string',
    },
  ])
    .customAttributes(({col}) => ({...col, form: {...col?.form}}))
    .transposeColumns()
}
