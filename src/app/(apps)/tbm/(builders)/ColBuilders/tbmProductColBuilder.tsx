'use client'
import {defaultRegister} from '@class/builders/ColBuilderVariables'
import {Fields} from '@cm/class/Fields/Fields'
import {columnGetterType} from '@cm/types/types'

export const tbmProductColBuilder = (props: columnGetterType) => {
  return new Fields([
    {id: 'code', label: 'コード', type: 'text'},
    {id: 'name', label: '名称', type: 'text'},
  ])
    .customAttributes(({col}) => ({...col, form: {...defaultRegister}}))
    .transposeColumns()
}
