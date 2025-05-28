import {anyObject, colType} from '@cm/types/types'

export type transposeColumnsOptionProps = {
  autoSplit?: {
    table?: number
    form?: number
  }
} & anyObject

export type optionsOrOptionFetcherProps = {
  latestFormData?: anyObject
  col: colType
  // additionalQuery?: anyObject
}

export type optionsOrOptionFetcherType = (
  props: optionsOrOptionFetcherProps
) => Promise<{optionObjArr: optionType[]; modelName?: string}>

export type optionType = {
  id?: any
  label?: any
  value: any
  color?: any
  // name?: any
} & anyObject
