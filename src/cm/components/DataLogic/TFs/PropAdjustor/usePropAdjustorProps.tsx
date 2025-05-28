'use client'

import {NestHandler} from 'src/cm/class/NestHandler'

import {ClientPropsType, prismaDataType} from '@cm/types/types'

import {useGlobalPropType} from 'src/cm/hooks/globalHooks/useGlobal'
import useInitFormState from 'src/cm/hooks/useInitFormState'
import {ClientPropsType2} from 'src/cm/components/DataLogic/TFs/PropAdjustor/PropAdjustor'
import useRecords from 'src/cm/components/DataLogic/TFs/PropAdjustor/useRecords'
import {updateMyTable} from '@components/DataLogic/TFs/PropAdjustor/updateMyTable'

const usePropAdjustorProps = (props: {
  ClientProps: ClientPropsType
  useGlobalProps: useGlobalPropType
  prismaData: prismaDataType
  prismaDataExtractionQuery
  // easySearchObject
  // easySearchWhereAnd
  columns
  HK_USE_RECORDS
}) => {
  const {
    ClientProps,
    useGlobalProps,
    prismaData,
    prismaDataExtractionQuery,
    // easySearchObject,
    // easySearchWhereAnd,
    columns,
    HK_USE_RECORDS,
  } = props

  const {formData, setformData} = useInitFormState(null, prismaData?.records)
  const {records, setrecords, mutateRecords, deleteRecord, totalCount} = HK_USE_RECORDS

  const {displayStyle, easySearchPrismaDataOnServer} = ClientProps
  const {dataModelName} = ClientProps ?? {}

  const EditForm = getEditForm({dataModelName, ClientProps})
  const myTable = updateMyTable({ClientProps, columns})

  const ClientProps2: ClientPropsType2 = {
    ...ClientProps,
    totalCount,
    EditForm,
    myTable,
    displayStyle,
    useGlobalProps,
    columns,
    formData,
    setformData,
    easySearchPrismaDataOnServer,
    HK_USE_RECORDS,
    records,
    setrecords,
    mutateRecords,
    deleteRecord,
    // prismaData,
    prismaDataExtractionQuery,
    // easySearchObject,
    // easySearchWhereAnd,
  }

  updateClientProps2({ClientProps, ClientProps2})

  return {ClientProps2}
}

// ---------------関数start------------------
//EditFormを取得する
function getEditForm({dataModelName, ClientProps}) {
  const PageBuilderGetter = ClientProps.PageBuilderGetter ?? {class: ClientProps.PageBuilder, getter: `${dataModelName}.form`}

  // if (PageBuilderGetter) {
  const {getter} = PageBuilderGetter
  const EditForm = NestHandler.GetNestedValue(getter, PageBuilderGetter['class'])

  // }
  return EditForm
}

export function updateClientProps2({ClientProps, ClientProps2}) {
  const {dataModelName, ViewParamBuilder} = ClientProps ?? {}
  const CustomViewParamsMethod: ViewParamBuilderProps = ViewParamBuilder?.[dataModelName]

  const CustomViewParams = CustomViewParamsMethod?.({ClientProps2})

  Object.keys(CustomViewParams ?? {}).forEach(key => {
    ClientProps2[key] = {
      ...ClientProps2[key],
      ...CustomViewParams[key],
    }
  })

  ClientProps2.additional = {
    ...ClientProps2.additional,
    include: {...ClientProps2.additional.include, ...ClientProps2.prismaDataExtractionQuery.include},
  }
}
// ---------------関数end------------------

export default usePropAdjustorProps

export type ViewParamBuilderProps = (props: {ClientProps2: ClientPropsType2}) => {
  [key in keyof ClientPropsType]?: ClientPropsType[key]
}

export type HK_USE_RECORDS_TYPE = ReturnType<typeof useRecords>
