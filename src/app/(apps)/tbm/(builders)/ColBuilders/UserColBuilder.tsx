'use client'
import {getVehicleForSelectConfig} from '@app/(apps)/tbm/(builders)/ColBuilders/TbmVehicleColBuilder'
import {TBM_CODE} from '@app/(apps)/tbm/(class)/TBM_CODE'
import {defaultRegister} from '@class/builders/ColBuilderVariables'
import {Fields} from '@cm/class/Fields/Fields'
import {columnGetterType} from '@cm/types/types'

export const UserColBuilder = (props: columnGetterType) => {
  const {tbmBaseId} = props.ColBuilderExtraProps ?? {}
  return new Fields([
    {id: 'tbmBaseId', label: '営業所', forSelect: {}, form: {...defaultRegister, defaultValue: tbmBaseId}},
    {
      id: 'type',
      label: '区分',
      forSelect: {codeMaster: TBM_CODE.USER.TYPE},
      form: {defaultValue: `01`},
    },
    {id: 'employeeCode', label: '従業員コード', form: {...defaultRegister}},
    {id: 'name', label: '名称', form: {...defaultRegister}, search: {}},
    {id: 'email', label: 'Email', form: {...defaultRegister}},
    {id: 'password', label: 'パスワード', type: `password`, form: {}},
    {
      id: 'tbmVehicleId',
      label: '利用車両',
      form: {},
      forSelect: {config: getVehicleForSelectConfig({tbmBaseId})},
    },
  ]).transposeColumns()
}
