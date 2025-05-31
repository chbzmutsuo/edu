'use client'
import React, {useMemo} from 'react'
import {NestHandler} from 'src/cm/class/NestHandler'
import {C_Stack, Padding, R_Stack} from 'src/cm/components/styles/common-components/common-components'

import {HK_USE_RECORDS_TYPE} from 'src/cm/components/DataLogic/TFs/PropAdjustor/usePropAdjustorProps'

import {Z_INDEX} from '@lib/constants/constants'

import {useMergeWithCustomViewParams} from '@components/DataLogic/TFs/PropAdjustor/useMergeWithCustomViewParams'

import useColumns from '@components/DataLogic/TFs/PropAdjustor/useColumns'
import useRecords from '@components/DataLogic/TFs/PropAdjustor/(useRecords)/useRecords'
import useInitFormState from '@hooks/useInitFormState'
import useEditForm from '@components/DataLogic/TFs/PropAdjustor/useEditForm'
import useMyTable from '@components/DataLogic/TFs/PropAdjustor/useMyTable'
import useAdditional from '@components/DataLogic/TFs/PropAdjustor/useAdditional'

import {TableSkelton} from '@components/utils/loader/TableSkelton'
import useGlobal, {useGlobalPropType} from '@hooks/globalHooks/useGlobal'
import DetailedPageCC from '@components/DataLogic/TFs/PropAdjustor/DetailedPageCC'
import PlaceHolder from '@components/utils/loader/PlaceHolder'
import TableForm from '@components/DataLogic/TFs/PropAdjustor/TableForm'
import {ClientPropsType} from '@cm/types/types'
import {getInitModelRecordsProps, serverFetchProps} from '@components/DataLogic/TFs/Server/fetchers/getInitModelRecordsProps'

import EasySearcher from '@components/DataLogic/TFs/MyTable/EasySearcher/EasySearcher'

export interface PropAdjustorPropsType {
  ClientProps: ClientPropsType
  serverFetchProps: serverFetchProps
  initialModelRecords: Awaited<ReturnType<typeof getInitModelRecordsProps>>
  fetchTime: Date
}

export interface ClientPropsType2 extends ClientPropsType {
  HK_USE_RECORDS?: HK_USE_RECORDS_TYPE
  useGlobalProps: useGlobalPropType
  columns: any
  formData: any
  setformData: any
  records: any
  setrecords: any
  totalCount: number
  mutateRecords: any
  deleteRecord: any
}

interface SurroundingComponentProps {
  type: 'top' | 'left' | 'table' | 'right' | 'bottom'
  ClientProps2: ClientPropsType2
}

const SurroundingComponent = React.memo<SurroundingComponentProps>(({type, ClientProps2}) => {
  const {PageBuilder, dataModelName} = ClientProps2

  const getter = useMemo(() => `${dataModelName}.${type}`, [dataModelName, type])

  const ComponentMethod = useMemo(
    () => (PageBuilder ? NestHandler.GetNestedValue(getter, PageBuilder) : undefined),
    [getter, PageBuilder]
  )

  if (ComponentMethod) {
    return ComponentMethod(ClientProps2)
  } else if (type === 'table') {
    return <TableForm {...ClientProps2} />
  }

  return null
})

SurroundingComponent.displayName = 'SurroundingComponent'

const PropAdjustor = React.memo<PropAdjustorPropsType>(props => {
  const {ClientProps, serverFetchProps, initialModelRecords, fetchTime} = props
  const useGlobalProps = useGlobal()

  const HK_USE_RECORDS: HK_USE_RECORDS_TYPE = useRecords({
    serverFetchProps,
    initialModelRecords,
    fetchTime,
  })

  const {prismaDataExtractionQuery, easySearchPrismaDataOnServer} = HK_USE_RECORDS

  const modelData = useMemo(() => HK_USE_RECORDS?.records?.[0], [HK_USE_RECORDS?.records])

  const {formData, setformData} = useInitFormState(null, [modelData])

  const columnsArgs = useMemo(
    () => ({
      useGlobalProps,
      HK_USE_RECORDS,
      dataModelName: ClientProps.dataModelName,
      ColBuilder: ClientProps.ColBuilder,
      ColBuilderExtraProps: ClientProps.ColBuilderExtraProps,
    }),
    [
      useGlobalProps.session?.id,
      useGlobalProps.query,
      HK_USE_RECORDS.records?.length,
      HK_USE_RECORDS.totalCount,
      ClientProps.dataModelName,
      ClientProps.ColBuilder,
      ClientProps.ColBuilderExtraProps,
    ]
  )

  const columns = useColumns(columnsArgs)

  const additionalArgs = useMemo(
    () => ({
      additional: ClientProps.additional,
      prismaDataExtractionQuery,
    }),
    [ClientProps.additional, prismaDataExtractionQuery]
  )

  const additional = useAdditional(additionalArgs)

  const editFormArgs = useMemo(
    () => ({
      PageBuilderGetter: ClientProps.PageBuilderGetter,
      PageBuilder: ClientProps.PageBuilder,
      dataModelName: ClientProps.dataModelName,
    }),
    [ClientProps.PageBuilderGetter, ClientProps.PageBuilder, ClientProps.dataModelName]
  )

  const EditForm = useEditForm(editFormArgs)

  const myTableArgs = useMemo(
    () => ({
      columns,
      displayStyle: ClientProps.displayStyle,
      myTable: ClientProps.myTable,
    }),
    [columns, ClientProps.displayStyle, ClientProps.myTable]
  )

  const myTable = useMyTable(myTableArgs)

  const mergeArgs = useMemo(
    () => ({
      ...ClientProps,
      ...HK_USE_RECORDS,
      additional,
      EditForm,
      myTable,
      useGlobalProps,
      columns,
      formData,
      setformData,
      HK_USE_RECORDS,
      prismaDataExtractionQuery,
    }),
    [
      ClientProps,
      HK_USE_RECORDS,
      additional,
      EditForm,
      myTable,
      useGlobalProps,
      columns,
      formData,
      setformData,
      prismaDataExtractionQuery,
    ]
  )

  const ClientProps2: ClientPropsType2 = useMergeWithCustomViewParams(mergeArgs)

  const {appbarHeight} = ClientProps2.useGlobalProps

  const hasEasySearch = useMemo(
    () => Object.keys(easySearchPrismaDataOnServer?.availableEasySearchObj || {}).length > 0,
    [easySearchPrismaDataOnServer?.availableEasySearchObj]
  )

  const easySearcherProps = useMemo(
    () => ({
      dataModelName: ClientProps2.dataModelName,
      easySearchPrismaDataOnServer,
      useGlobalProps,
      HK_USE_RECORDS: ClientProps2.HK_USE_RECORDS,
      hideEasySearch: ClientProps2?.myTable?.hideEasySearch,
    }),
    [
      ClientProps2.dataModelName,
      easySearchPrismaDataOnServer,
      useGlobalProps,
      ClientProps2.HK_USE_RECORDS,
      ClientProps2?.myTable?.hideEasySearch,
    ]
  )

  const containerStyle = useMemo(
    () => ({
      ...ClientProps2.displayStyle,
      paddingTop: 10,
    }),
    [ClientProps2.displayStyle]
  )

  const stickyHeaderStyle = useMemo(
    () => ({
      position: 'sticky' as const,
      top: appbarHeight + 10,
      zIndex: Z_INDEX.EasySearcher,
      marginBottom: 12,
    }),
    [appbarHeight]
  )

  const mainSectionStyle = {
    zIndex: Z_INDEX.EasySearcher - 10,
  }

  if (HK_USE_RECORDS.records === null) {
    return (
      <Padding>
        <TableSkelton />
      </Padding>
    )
  }
  if (serverFetchProps.DetailePageId) {
    if (modelData === null) {
      return <PlaceHolder />
    }
    return <DetailedPageCC ClientProps2={ClientProps2} modelData={modelData} />
  }

  return (
    <div style={containerStyle}>
      <div>
        <section className="p-0" style={stickyHeaderStyle}>
          <C_Stack className="gap-1 z-100">
            {hasEasySearch && (
              <div>
                <EasySearcher {...easySearcherProps} />
              </div>
            )}
            <SurroundingComponent ClientProps2={ClientProps2} type="top" />
          </C_Stack>
        </section>

        <section style={mainSectionStyle}>
          <div>
            <R_Stack className="mx-auto items-start justify-around">
              <SurroundingComponent ClientProps2={ClientProps2} type="left" />
              <SurroundingComponent ClientProps2={ClientProps2} type="table" />
              <SurroundingComponent ClientProps2={ClientProps2} type="right" />
            </R_Stack>
          </div>
          <div className="sticky bottom-0">
            <div>
              <SurroundingComponent ClientProps2={ClientProps2} type="bottom" />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
})

export default PropAdjustor
