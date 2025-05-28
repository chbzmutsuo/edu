import {CSSProperties, ReactNode, Ref, MouseEventHandler, KeyboardEventHandler, FocusEventHandler} from 'react'
import {JSX} from 'react'
import {
  FieldPathValue,
  FieldValues,
  InternalFieldName,
  Message,
  UseFormReturn,
  ValidateResult,
  ValidationRule,
} from 'react-hook-form'
import {acceptType, FileData, fileInfo} from '@cm/types/file-types'
import {ControlContextType, ControlOptionType} from '@cm/types/form-control-type'
import {PrismaModelNames} from '@cm/types/prisma-types'
export type anyObject = {
  [key: string | number]: any
}
import {optionsOrOptionFetcherType, optionType, transposeColumnsOptionProps} from 'src/cm/class/Fields/col-operator-types'
import {useGlobalPropType} from 'src/cm/hooks/globalHooks/useGlobal'
import {myFormDefaultUpsertPropType} from '@lib/formMethods/separateFormData'
import {prismaDataExtractionQueryType} from 'src/cm/components/DataLogic/TFs/Server/Conf'
import {surroundings} from 'src/cm/components/DataLogic/TFs/Server/SetCustomParams'
import {ClientPropsType2} from 'src/cm/components/DataLogic/TFs/PropAdjustor/PropAdjustor'
import {EasySearchObject} from 'src/cm/class/builders/QueryBuilderVariables'

import {HK_USE_RECORDS_TYPE} from '@components/DataLogic/TFs/PropAdjustor/usePropAdjustorProps'
import {codeObjectArgs} from '@class/Code'
import {twMerge} from 'tailwind-merge'
import React from 'react'

export type JSXReturnFunc = (props: any) => JSX.Element

export type colTypeStr =
  | `json`
  | 'url'
  | 'text'
  | 'price'
  | 'ratio'
  | 'selectId'
  | 'number'
  | 'int'
  | 'datetime-local'
  | 'float'
  | 'date'
  | 'boolean'
  | 'rating'
  | 'time'
  | 'month'
  | 'year'
  | 'datetime'
  | 'color'
  | 'select'
  | 'file'
  | 'slate'
  | 'email'
  | 'password'
  | 'textarea'
  | 'confirm'
  | 'string'
  | 'file'
  | 'review'
  | 'array'
  | 'rate'
  | ''

export type TdcreateFormPropss = {
  style?: CSSProperties | ((value, record) => any) | any
  hidden?: boolean
  rowSpan?: number
  colSpan?: number
  rowIndex?: any
  colIndex?: any
  reverseLabelTitle?: boolean
}

export type onFormItemBlurType = (props: {
  e: React.BaseSyntheticEvent
  id: string
  value: any
  name: string
  newlatestFormData: anyObject
  ReactHookForm: UseFormReturn
}) => any
export type forSelectConfig = {
  displayExtractKeys?: string[]
  modelName?: PrismaModelNames
  select?: {[key: string]: colTypeStr | boolean}
  where?: anyObject | ((props: {col: colType; latestFormData: anyObject}) => anyObject)
  orderBy?: any
  include?: any
  nameChanger?: (op: optionType & anyObject) => optionType & {name: any}
  messageWhenNoHit?: string
}

export type OptionCreatorProps = {searchedInput} & ControlContextType

export type getItems = (props: ControlContextType & {searchFormData: anyObject}) => Promise<{
  optionsHit: optionType[]
  searchFormData: anyObject
}>

export type allowCreateOptionsType = {
  creator?: () => {
    getCreatFormProps?: (props: ControlContextType & {searchFormData: anyObject}) => {
      columns: colType[][]
      formData: anyObject
    }
  }
}

export type multipleSelectProps = {
  models: {
    parent: PrismaModelNames
    mid: PrismaModelNames
    option: PrismaModelNames
    uniqueWhereKey: string
  }
}
export type forSelcetType = {
  codeMaster?: codeObjectArgs
  radio?: anyObject

  searcher?: (props: ControlContextType) => {
    getSearchFormProps?: () => {
      columns: colType[][]
      formData: anyObject
    }
    getItems?: getItems
  }

  config?: forSelectConfig
  dependenceColIds?: string[]
  allowCreateOptions?: allowCreateOptionsType
  optionsOrOptionFetcher?: optionsOrOptionFetcherType | optionType[] | any[]
  option?: {
    alignment?: {
      direction?: 'row' | 'column'
      justify?: 'start' | 'end' | 'center' | 'between' | 'around'
      alignItems?: 'start' | 'end' | 'center' | 'baseline' | 'stretch'
    }
    style: CSSProperties
  }
}
export type colTdProps = {
  withLabel?: boolean
  editable?: {
    upsertController?: upsertControllerType
    style?: CSSProperties
  }
  getRowColor?: dataFormatterType
  divider?: anyObject
  linkTo?: {
    format?: dataFormatterType
    href?: (record: anyObject) => string
  }
} & TdcreateFormPropss

export type editFormatType = ClientPropsType2 & {
  ReactHookForm: anyObject
}

export type registerType = {
  required?: Message | ValidationRule<boolean>
  min?: ValidationRule<number | string>
  max?: ValidationRule<number | string>
  maxLength?: ValidationRule<number>
  minLength?: ValidationRule<number>
  validate?: (value?: string, formValues?: any) => ValidateResult | Promise<ValidateResult>
  value?: FieldPathValue<FieldValues, string>
  setValueAs?: (value?: any) => any
  shouldUnregister?: boolean
  onChange?: (event?: any) => void
  onBlur?: (event?: any) => void
  disabled?: boolean
  deps?: InternalFieldName | InternalFieldName[]
}
export type colFormProps = {
  showResetBtn?: boolean
  placerHolder?: any
  file?: {
    accept?: acceptType
    backetKey: string
  }
  send?: boolean //prisma送信時に含めるかどうか(default true)
  descriptionNoteAfter?: dataFormatterType | string
  style?: CSSProperties
  defaultValue?: any
  register?: registerType

  editFormat?: (props: ControlContextType) => any
  addFormat?: JSXReturnFunc | any
  disabled?: boolean | ((props: {record: any; col: any}) => boolean)
} & TdcreateFormPropss
export type colTypeOptional = {
  isMain?: boolean

  surroundings?: {
    form?: {
      left?: any
      right?: any
    }
  }

  onFormItemBlur?: onFormItemBlurType
  type?: colTypeStr
  inputProps?: {
    step?: number
    min?: number
    required?: boolean
    placeholder?: string
  } & anyObject
  inputTypeAs?: colTypeStr
  th?: {
    format?: (col: colType) => any
    style?: CSSProperties
    divider?: anyObject
    hidden?: boolean
    // format: dataFormatterType
  }
  affix?: {
    label?: string
    prefix?: string
    suffix?: string
  }
  format?: dataFormatterType
  multipleSelect?: multipleSelectProps
  forSelect?: forSelcetType

  td?: colTdProps
  form?: colFormProps | null
  search?: anyObject
  sort?: anyObject
  // Register?: anyObject
  originalColIdx?: number // このカラムが元々のカラムの何番目か（自動計算のため手動は不要）
}
export type colType = {
  id: string
  label: any
} & colTypeOptional

export type columnGetterType = {
  useGlobalProps: useGlobalPropType
  transposeColumnsOptions?: transposeColumnsOptionProps
  ColBuilderExtraProps?: anyObject & {HK_USE_RECORDS?: HK_USE_RECORDS_TYPE}
}

export type MyTableType =
  | {
      NoDataElement?: () => JSX.Element
      className?: string
      configPosition?: 'popover' | 'top'
      tableId?: string
      style?: anyObject
      create?: anyObject | boolean
      delete?: anyObject | boolean | {allowByRecord: (props: {record: any}) => void}
      update?: anyObject | boolean
      search?: anyObject | boolean
      sort?: anyObject | boolean
      pagination?: {countPerPage?: number}
      drag?: anyObject | boolean
      header?: anyObject | boolean
      AdditionalActionButtonObject?: {
        [key: string]: (props: {record: any}) => JSX.Element
      }
      fixedCols?: number
      customActions?: (props: {ClientProps2: ClientPropsType2}) => JSX.Element
      caption?: JSX.Element | string

      showHeader?: boolean
      showRecordIndex?: boolean
      hideEasySearch?: boolean

      useWrapperCard?: boolean
    }
  | undefined

export type extraFormStateType = {
  files?: {[key in PrismaModelNames | string]?: FileData[]}
}
type myformCreateDeleteMethod = ((props: myFormDefaultUpsertPropType) => void) | boolean | anyObject

export type upsertControllerType =
  | {
      //更新するかどうか判定する
      validateUpdate?: (props: myFormDefaultUpsertPropType) => Promise<requestResultType>

      //メインの更新処理を実施する
      executeUpdate?: (props: myFormDefaultUpsertPropType) => Promise<requestResultType>

      //更新後の処理を実行する
      finalizeUpdate?: (props: {res: requestResultType; formData: any}) => void
    }
  | boolean

export type MyFormType = {
  create?: upsertControllerType
  delete?: myformCreateDeleteMethod
  style?: anyObject
  className?: string
  showHeader?: (formData: anyObject) => JSX.Element
  customActions?: JSXReturnFunc
  caption?: JSX.Element | string
  basicFormClassName?: string
  basicFormControlOptions?: ControlOptionType
  onFormItemBlur?: onFormItemBlurType
}

export type MyModalType = {
  style?: CSSProperties
}

export type additionalPropsType =
  | {
      select?: {[key: string]: boolean}
      omit?: {[key: string]: boolean}
      orderBy?: any[]
      payload?: anyObject
      where?: anyObject
      include?: anyObject | null
      toggleLoadFunc?: any
    }
  | undefined

export type prismaDataType = {
  records: any[]
  totalCount: number
  noData: boolean
  loading: boolean
  beforeLoad?: boolean
}
export type editTypePropType =
  | {
      type: 'modal' | 'page' | 'pageOnSame'
      path?: string
      pathnameBuilder?: (props: {record: any; pathname: string; rootPath: string}) => string
    }
  | undefined
  | null

export type dataMinimumServerType = {
  prismaDataExtractionQuery?: prismaDataExtractionQueryType
  EditForm?: any
  additional?: additionalPropsType
  editType?: editTypePropType
}

export type dataMinimumCommonType = dataMinimumServerType & {
  columns: colType[][]
  useGlobalProps: useGlobalPropType
}

//最低限必要
export type dataMinimul_FormData_Type = dataMinimumCommonType & formDataStateType
export type dataModelNameType = PrismaModelNames

//クライアントで使うformDataを含んだもの
export type formDataStateType = {
  dataModelName: dataModelNameType
  // prismaData: prismaDataType
  formData: anyObject | null | undefined
  setformData: any
}

export type DetailPagePropType = {
  HK_USE_RECORDS?: HK_USE_RECORDS_TYPE
  myForm?: MyFormType
  myTable?: MyTableType
  PageBuilderExtraProps?: anyObject
  records: any[]
  setrecords: any
  mutateRecords: any
  deleteRecord: any
} & dataMinimul_FormData_Type

export type form_table_modal_config = {
  myForm?: MyFormType
  myTable?: MyTableType
  myModal?: MyModalType
}

export type dataFormatterType = (value: any, row: anyObject, col: colType) => any

export type requestResultType = {
  success: boolean
  message: string
  error?: any
  result?:
    | any
    | ({
        fileInfo?: fileInfo
        url?: string
      } & anyObject)
}

export type DetailedPageCCPropType = {
  dataModelName: dataModelNameType
  // prismaData: prismaDataType
  ColBuilder?: anyObject

  EditForm?: any
  additional?: additionalPropsType
  myForm: MyFormType | undefined
  backToListFunction?: () => void
}

export type PageBuilderGetterType = {
  class: anyObject
  getter: string
}

export type serverFetchihngDataType = {
  DetailePageId: number | undefined
  easySearchObject: EasySearchObject
  easySearchWhereAnd: any[]
  EasySearcherQuery: any
  prismaDataExtractionQuery: any
  // prismaData: any
  // easySearchPrismaDataOnServer: easySearchDataSwrType
}
export type ClientPropsType = {
  params: anyObject
  dataModelName: dataModelNameType
  surroundings?: surroundings
  displayStyle?: CSSProperties
  DetailePageId?: any
  redirectPath?: any
  EasySearchBuilder?: any
  ColBuilder?: anyObject
  PageBuilder?: anyObject
  ViewParamBuilder?: anyObject
  ColBuilderExtraProps?: anyObject
  PageBuilderExtraProps?: anyObject
  easySearchPrismaDataOnServer?: anyObject
  easySearchExtraProps?: anyObject
  serverFetchihngData?: anyObject
  include?: anyObject
} & dataMinimumServerType &
  form_table_modal_config & {
    PageBuilderGetter?: PageBuilderGetterType
  }

export type globalModalString = 'workLogHistory' | `sateiConnection` | `SaleEditor`

export type htmlProps = {
  id?: string
  className?: string
  ref?: Ref<any>
  style?: CSSProperties
  type?: 'button' | 'submit'
  disabled?: boolean

  onClick?: MouseEventHandler
  onKeyDown?: KeyboardEventHandler
  onBlur?: FocusEventHandler
  onMouseEnter?: MouseEventHandler
  onMouseLeave?: MouseEventHandler
  onMouseDown?: MouseEventHandler

  children?: ReactNode
}

export const mergeHtmlProps = (htmlProps: htmlProps, uniqueProps?: any) => {
  const newObject = {...htmlProps}
  // styleだけobjectマージ
  if (uniqueProps?.style) {
    newObject.style = {...uniqueProps.style, ...newObject.style}
  }
  // classNameはtwMerge
  if (uniqueProps?.className) {
    newObject.className = newObject.className ? twMerge(uniqueProps.className, newObject.className) : uniqueProps.className
  }
  // その他は上書き
  Object.keys(uniqueProps ?? {}).forEach(key => {
    if (key !== 'style' && key !== 'className') {
      newObject[key] = uniqueProps[key]
    }
  })
  return newObject
}
