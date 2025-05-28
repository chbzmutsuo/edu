import {CSSProperties} from 'react'
import {PrismaModelNames} from '@cm/types/prisma-types'
import {additionalPropsType, editTypePropType, MyFormType, MyModalType, MyTableType, PageBuilderGetterType} from '@cm/types/types'

export type surroundings = {
  table?: PageBuilderGetterType
  top?: PageBuilderGetterType
  right?: PageBuilderGetterType
  bottom?: PageBuilderGetterType
  left?: PageBuilderGetterType
  form?: PageBuilderGetterType
}

export type optionsType = {
  dataModelName?: string
  additional?: additionalPropsType
  surroundings?: surroundings
  editType?: editTypePropType
  ColBuilderExtraProps?: any
  PageBuilderExtraProps?: any
  QueryBuilderExtraProps?: any
  easySearchExtraProps?: any
  myForm?: MyFormType
  myTable?: MyTableType
  myModal?: MyModalType
  EditForm?: any
  PageBuilderGetter?: PageBuilderGetterType
  displayStyle?: CSSProperties
  redirectPath?: any
  methodsThroughClass?: {
    myFormCreate: {class: any; key: string}
  }
}

export type setParams = () => Promise<optionsType>

export type setCustomParamsType = {
  variants: {modelNames: PrismaModelNames[] | string[]; setParams: setParams}[]
  dataModelName: any
}

export const setCustomParams = async (props: setCustomParamsType) => {
  const {dataModelName, variants} = props

  const customParams: optionsType = {
    dataModelName,
    additional: {},
    surroundings: {},
    ColBuilderExtraProps: {},
    PageBuilderExtraProps: {},
    QueryBuilderExtraProps: {},
    easySearchExtraProps: {},
    myForm: {},
    myTable: {drag: dataModelName.includes('Master') ? {} : false},
    myModal: {},
    EditForm: undefined,
    PageBuilderGetter: undefined,
    editType: {type: 'modal'},
    displayStyle: {width: 'fit-content', margin: 'auto'},
  }

  const theVariant = variants.find(variant => {
    return variant.modelNames.includes(dataModelName)
  })

  const {setParams} = theVariant ?? {}

  const options = (await setParams?.()) ?? {}

  Object.keys(options ?? {}).forEach(key => {
    customParams[key] = options[key]
  })

  const redirectPath = options.redirectPath
  return {dataModelName, ...customParams, redirectPath}
}
