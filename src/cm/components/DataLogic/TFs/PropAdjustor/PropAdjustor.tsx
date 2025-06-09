'use client'
import React, {useMemo} from 'react'
import {NestHandler} from 'src/cm/class/NestHandler'
import {C_Stack, Padding, R_Stack} from 'src/cm/components/styles/common-components/common-components'

import {Z_INDEX} from '@lib/constants/constants'

import {TableSkelton} from '@components/utils/loader/TableSkelton'
import DetailedPageCC from '@components/DataLogic/TFs/PropAdjustor/components/DetailedPageCC'
import PlaceHolder from '@components/utils/loader/PlaceHolder'
import TableForm from '@components/DataLogic/TFs/PropAdjustor/components/TableForm'

import EasySearcher from '@components/DataLogic/TFs/MyTable/components/EasySearcher/EasySearcher'

import {usePropAdjustorLogic} from '@components/DataLogic/TFs/PropAdjustor/hooks/usePropAdjusctorLogic/usePropAdjustorLogic'
import {PropAdjustorPropsType, SurroundingComponentProps} from '@components/DataLogic/TFs/PropAdjustor/types/propAdjustor-types'

const SurroundingComponent = React.memo<SurroundingComponentProps>(({type, ClientProps2}) => {
  const {PageBuilder, dataModelName} = ClientProps2

  const componentMethod = useMemo(() => {
    if (!PageBuilder) return undefined
    const getter = `${dataModelName}.${type}`
    return NestHandler.GetNestedValue(getter, PageBuilder)
  }, [PageBuilder, dataModelName, type])

  if (componentMethod) {
    return componentMethod(ClientProps2)
  }

  if (type === 'table') {
    return <TableForm {...ClientProps2} />
  }

  return null
})

SurroundingComponent.displayName = 'SurroundingComponent'

const PropAdjustor = React.memo<PropAdjustorPropsType>(props => {
  const {serverFetchProps} = props
  const {ClientProps2, UseRecordsReturn, modelData, easySearchPrismaDataOnServer, useGlobalProps} = usePropAdjustorLogic(props)

  const {appbarHeight} = useGlobalProps

  const hasEasySearch = useMemo(
    () => Object.keys(easySearchPrismaDataOnServer?.availableEasySearchObj || {}).length > 0,
    [easySearchPrismaDataOnServer?.availableEasySearchObj]
  )

  const easySearcherProps = useMemo(
    () => ({
      dataModelName: ClientProps2.dataModelName,
      easySearchPrismaDataOnServer,
      useGlobalProps,
      UseRecordsReturn,
      hideEasySearch: ClientProps2?.myTable?.hideEasySearch,
    }),
    [
      ClientProps2.dataModelName,
      easySearchPrismaDataOnServer,
      useGlobalProps,
      UseRecordsReturn,
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

  const mainSectionStyle = useMemo(
    () => ({
      zIndex: Z_INDEX.EasySearcher - 10,
    }),
    []
  )

  if (UseRecordsReturn.records === null) {
    return (
      <Padding>
        <TableSkelton />
      </Padding>
    )
  }

  if (serverFetchProps.DetailePageId) {
    return modelData === null ? <PlaceHolder /> : <DetailedPageCC ClientProps2={ClientProps2} modelData={modelData} />
  }

  return (
    <div style={containerStyle}>
      <section className="p-0" style={stickyHeaderStyle}>
        <C_Stack className="gap-1 z-100">
          {hasEasySearch && <EasySearcher {...easySearcherProps} />}
          <SurroundingComponent ClientProps2={ClientProps2} type="top" />
        </C_Stack>
      </section>

      <section style={mainSectionStyle}>
        <R_Stack className="mx-auto items-start justify-around">
          <SurroundingComponent ClientProps2={ClientProps2} type="left" />
          <SurroundingComponent ClientProps2={ClientProps2} type="table" />
          <SurroundingComponent ClientProps2={ClientProps2} type="right" />
        </R_Stack>

        <div className="sticky bottom-0">
          <SurroundingComponent ClientProps2={ClientProps2} type="bottom" />
        </div>
      </section>
    </div>
  )
})

export default PropAdjustor
