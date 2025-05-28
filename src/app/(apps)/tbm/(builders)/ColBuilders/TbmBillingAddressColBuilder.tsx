'use client'
import {defaultRegister} from '@class/builders/ColBuilderVariables'
import {Fields} from '@cm/class/Fields/Fields'
import {columnGetterType} from '@cm/types/types'

export const TbmBillingAddressColBuilder = (props: columnGetterType) => {
  return new Fields([{...{id: 'name', label: '名称'}, form: {...defaultRegister}}]).transposeColumns()
}
