'use client'
import {getVehicleForSelectConfig} from '@app/(apps)/tbm/(builders)/ColBuilders/TbmVehicleColBuilder'
import {defaultRegister} from '@class/builders/ColBuilderVariables'
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
      forSelect: {
        config: getVehicleForSelectConfig({}),
      },
    },
    {id: 'name', label: 'タイトル', form: {...defaultRegister}},
    {id: 'date', label: '日付', form: {...defaultRegister}, type: 'date'},
  ]).transposeColumns()
}
