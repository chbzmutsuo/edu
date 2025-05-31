'use client'
import {
  dataMinimumCommonType,
  form_table_modal_config,
  anyObject,
  prismaDataType,
  colType,
  additionalPropsType,
  MyTableType,
} from '@cm/types/types'

import {C_Stack, NoData} from 'src/cm/components/styles/common-components/common-components'
import {PrismaModelNames} from '@cm/types/prisma-types'
import React, {JSX, useMemo} from 'react'
import TableForm from 'src/cm/components/DataLogic/TFs/PropAdjustor/TableForm'
import {useParams} from 'next/navigation'
import {StrHandler} from '@class/StrHandler'
import {checkShowHeader} from '@components/DataLogic/TFs/PropAdjustor/useMyTable'
import useRecords from '@components/DataLogic/TFs/PropAdjustor/(useRecords)/useRecords'
import useInitFormState from '@hooks/useInitFormState'
import {serverFetchProps} from '@components/DataLogic/TFs/Server/fetchers/getInitModelRecordsProps'
import useGlobal from '@hooks/globalHooks/useGlobal'
import {getQueryArgs} from '@components/DataLogic/TFs/Server/fetchers/getQueryArgs'
import EasySearcher from '@components/DataLogic/TFs/MyTable/EasySearcher/EasySearcher'

export type ChildCreatorProps = dataMinimumCommonType &
  form_table_modal_config & {
    NoDatawhenParentIsUndefined?: () => JSX.Element
    ParentData: anyObject
    models: {
      parent: PrismaModelNames
      children: PrismaModelNames
    }
    nonRelativeColumns?: string[]
    forcedPirsmaData?: prismaDataType
    easySearchExtraProps?: anyObject
  }

export const ChildCreator = React.memo((props: ChildCreatorProps) => {
  const params = useParams()
  const {query, rootPath} = useGlobal()
  const {NoDatawhenParentIsUndefined, ParentData, models, additional, EditForm, editType, useGlobalProps} = props
  const {parentModelIdStr, childrenModelIdStr} = getModelData(models)
  const columns = convertColumns(props)

  const orderBy = useMemo(
    () => [...(props.myTable?.drag ? [{sortOrder: 'asc'}] : []), ...(additional?.orderBy ?? [{sortOrder: 'asc'}, {id: 'asc'}])],
    [props.myTable?.drag, additional?.orderBy]
  )

  const tunedAdditional: additionalPropsType = useMemo(
    () => ({
      ...additional,
      payload: {...additional?.payload, [parentModelIdStr]: ParentData?.id},
      where: {...additional?.where, [parentModelIdStr]: ParentData?.id},
      orderBy,
    }),
    [additional, parentModelIdStr, ParentData?.id, orderBy]
  )

  const childTableProps = useMemo(
    () => ({
      myTable: {
        showHeader: checkShowHeader({myTable: props.myTable, columns}),
        ...{sort: false, drag: false},
        ...props.myTable,
      } as MyTableType,
      myForm: {...props.myForm},
    }),
    [props.myTable, props.myForm, columns]
  )

  const myTable = childTableProps.myTable
  const myForm = childTableProps.myForm
  const dataModelName = models.children

  const prismaDataExtractionQuery = useMemo(() => {
    const {prismaDataExtractionQuery} = getQueryArgs({
      dataModelName,
      query,
      additional: tunedAdditional,
      myTable,
      DetailePageId: null,
      include: tunedAdditional?.include ? tunedAdditional?.include : undefined,
      easySearchObject: null,
    })
    return prismaDataExtractionQuery
  }, [dataModelName, query, tunedAdditional, myTable])

  const serverFetchProps: serverFetchProps = useMemo(
    () => ({
      prismaDataExtractionQuery,
      DetailePageId: null,
      dataModelName: models.children,
      additional: tunedAdditional,
      myTable,
      include: tunedAdditional?.include ? tunedAdditional?.include : undefined,
      session: null,
      easySearchExtraProps: props.easySearchExtraProps ?? null,
    }),
    [prismaDataExtractionQuery, models.children, tunedAdditional, myTable, props.easySearchExtraProps]
  )

  const HK_USE_RECORDS = useRecords({
    serverFetchProps,
    initialModelRecords: undefined,
    fetchTime: undefined,
  })

  const {records, setrecords, mutateRecords, deleteRecord, totalCount, easySearchPrismaDataOnServer} = HK_USE_RECORDS

  const hasEasySearch = useMemo(
    () => Object.keys(easySearchPrismaDataOnServer?.availableEasySearchObj || {}).length > 0,
    [easySearchPrismaDataOnServer?.availableEasySearchObj]
  )

  const {formData, setformData} = useInitFormState(null, [])

  const toggleLoadFunc = useMemo(
    () => props.additional?.toggleLoadFunc ?? (async cb => await cb()),
    [props.additional?.toggleLoadFunc]
  )

  const tableFormProps = useMemo(
    () => ({
      params: params as any,
      easySearchPrismaDataOnServer: easySearchPrismaDataOnServer,
      prismaDataExtractionQuery,
      dataModelName,
      columns,

      formData,
      setformData,
      records,
      setrecords,
      mutateRecords,
      deleteRecord,
      totalCount,
      myTable,
      myForm,
      additional: {...tunedAdditional, toggleLoadFunc},
      EditForm,
      editType,
      useGlobalProps,
      HK_USE_RECORDS,
    }),
    [
      params,
      easySearchPrismaDataOnServer,
      prismaDataExtractionQuery,
      dataModelName,
      columns,
      formData,
      setformData,
      records,
      setrecords,
      mutateRecords,
      deleteRecord,
      totalCount,
      myTable,
      myForm,
      tunedAdditional,
      toggleLoadFunc,
      EditForm,
      editType,
      useGlobalProps,
      HK_USE_RECORDS,
    ]
  )

  return (
    <div className={`w-fit`}>
      {!ParentData?.id ? (
        (NoDatawhenParentIsUndefined?.() ?? <NoData>データ作成後に登録可能</NoData>)
      ) : (
        <C_Stack>
          {hasEasySearch && (
            <div>
              <EasySearcher
                dataModelName={dataModelName}
                easySearchPrismaDataOnServer={easySearchPrismaDataOnServer}
                useGlobalProps={useGlobalProps}
                HK_USE_RECORDS={HK_USE_RECORDS}
              />
            </div>
          )}
          <TableForm {...tableFormProps} />
        </C_Stack>
      )}
    </div>
  )
})

export default ChildCreator

const getModelData = models => {
  const parentModelIdStr = models.parent ? StrHandler.lowerCaseFirstLetter(models.parent) + 'Id' : ''
  const childrenModelIdStr = models.children ? StrHandler.lowerCaseFirstLetter(models.children) + 'Id' : ''

  return {
    parentModelIdStr,
    childrenModelIdStr,
  }
}

const convertColumns = props => {
  const columns = props.columns as unknown as colType[][]
  // わかりきっているカラムは削除
  columns.forEach((rows, i) => {
    rows.forEach((col: {id: any}, j: any) => {
      if (props?.nonRelativeColumns?.includes(col?.id)) {
        columns[i].splice(j, 1)
      }
    })
  })
  return columns
}
