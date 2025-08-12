'use client'
import {getVehicleForSelectConfig} from '@app/(apps)/tbm/(builders)/ColBuilders/TbmVehicleColBuilder'
import {defaultRegister} from '@cm/class/builders/ColBuilderVariables'
import {getMidnight} from '@cm/class/Days/date-utils/calculations'
import {Fields} from '@cm/class/Fields/Fields'
import {columnGetterType} from '@cm/types/types'

export const TbmFuelCardColBuilder = (props: columnGetterType) => {
  const {useGlobalProps} = props
  const {tbmVehicleId} = props.ColBuilderExtraProps ?? {}
  return new Fields([
    {
      id: 'tbmVehicleId',
      label: '車両',
      form: {
        ...defaultRegister,
        defaultValue: tbmVehicleId,
        disabled: tbmVehicleId ? true : false,
      },
      forSelect: {config: getVehicleForSelectConfig({})},
    },
    {id: 'name', label: '件名', form: {...defaultRegister}},
    {
      id: 'startDate',
      label: '利用開始日',
      form: {
        ...defaultRegister,
        defaultValue: getMidnight(),
      },
      type: 'date',
    },
    {id: 'endDate', label: '有効期限', form: {...defaultRegister}, type: 'date'},
  ]).transposeColumns()
}
