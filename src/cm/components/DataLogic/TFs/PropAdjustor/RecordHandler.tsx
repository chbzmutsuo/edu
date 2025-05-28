'use client'
import React from 'react'
import {NestHandler} from 'src/cm/class/NestHandler'
import {C_Stack, Padding, R_Stack} from 'src/cm/components/styles/common-components/common-components'

import {HK_USE_RECORDS_TYPE} from 'src/cm/components/DataLogic/TFs/PropAdjustor/usePropAdjustorProps'

import {Z_INDEX} from '@lib/constants/constants'

import useMergeWithCustomViewParams from '@components/DataLogic/TFs/PropAdjustor/useMergeWithCustomViewParams'

import useColumns from '@components/DataLogic/TFs/PropAdjustor/useColumns'
import useRecords from '@components/DataLogic/TFs/PropAdjustor/useRecords'
import useInitFormState from '@hooks/useInitFormState'
import useEditForm from '@components/DataLogic/TFs/PropAdjustor/useEditForm'
import useMyTable from '@components/DataLogic/TFs/PropAdjustor/useMyTable'
import useAdditional from '@components/DataLogic/TFs/PropAdjustor/useAdditional'

import dynamic from 'next/dynamic'

import {ClientPropsType2} from '@components/DataLogic/TFs/PropAdjustor/PropAdjustor'
import {TableSkelton} from '@components/utils/loader/TableSkelton'
import useGlobal from '@hooks/globalHooks/useGlobal'
import DetailedPageCC from '@components/DataLogic/TFs/PropAdjustor/DetailedPageCC'
import PlaceHolder from '@components/utils/loader/PlaceHolder'

const TableForm = dynamic(() => import('src/cm/components/DataLogic/TFs/PropAdjustor/TableForm'))
const EasySearcher = dynamic(() => import('@components/DataLogic/TFs/MyTable/EasySearcher/EasySearcher'))

const RecordHandler = ({serverFetchProps, initialModelRecords, fetchTime, ClientProps}) => {
  const useGlobalProps = useGlobal()
  const HK_USE_RECORDS: HK_USE_RECORDS_TYPE = useRecords({
    serverFetchProps,
    initialModelRecords,
    fetchTime,
  })

  const {prismaDataExtractionQuery, easySearchPrismaDataOnServer} = HK_USE_RECORDS
  const modelData = HK_USE_RECORDS?.records?.[0]

  const {formData, setformData} = useInitFormState(null, [modelData])

  const columns = useColumns({
    useGlobalProps,
    HK_USE_RECORDS,
    dataModelName: ClientProps.dataModelName,
    ColBuilder: ClientProps.ColBuilder,
    ColBuilderExtraProps: ClientProps.ColBuilderExtraProps,
  })

  const additional = useAdditional({additional: ClientProps.additional, prismaDataExtractionQuery})

  const EditForm = useEditForm({
    PageBuilderGetter: ClientProps.PageBuilderGetter,
    PageBuilder: ClientProps.PageBuilder,
    dataModelName: ClientProps.dataModelName,
  })

  const myTable = useMyTable({
    columns,
    displayStyle: ClientProps.displayStyle,
    myTable: ClientProps.myTable,
  })

  const ClientProps2: ClientPropsType2 = useMergeWithCustomViewParams({
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
  })

  const {appbarHeight} = ClientProps2.useGlobalProps

  const hasEasySearch = Object.keys(easySearchPrismaDataOnServer?.availableEasySearchObj || {}).length > 0

  const Top = SurroundingComponent({ClientProps2, type: 'top'})

  if (HK_USE_RECORDS.records === null) {
    return (
      <Padding>
        <TableSkelton />
      </Padding>
    )
  }
  if (serverFetchProps.DetailePageId) {
    if (modelData === null) {
      return <PlaceHolder></PlaceHolder>
    }
    return <DetailedPageCC {...{ClientProps2, modelData}} />
  }

  return (
    <div style={{...ClientProps2.displayStyle, paddingTop: 10}}>
      <div>
        <section
          {...{
            className: `p-0`,
            style: {
              position: `sticky`,
              top: appbarHeight + 10,
              zIndex: Z_INDEX.EasySearcher,
              marginBottom: 12,
            },
          }}
        >
          <C_Stack className={`gap-1 z-100`}>
            {hasEasySearch && (
              <div>
                <EasySearcher
                  {...{
                    dataModelName: ClientProps2.dataModelName,
                    easySearchPrismaDataOnServer,
                    useGlobalProps,
                    HK_USE_RECORDS: ClientProps2.HK_USE_RECORDS,
                    hideEasySearch: ClientProps2?.myTable?.hideEasySearch,
                  }}
                />
              </div>
            )}

            {Top && <div>{Top}</div>}
          </C_Stack>
        </section>

        <section {...{style: {zIndex: Z_INDEX.EasySearcher - 10}}}>
          <>
            <div>
              <R_Stack className={`mx-auto items-start justify-around `}>
                {<SurroundingComponent {...{ClientProps2, type: 'left'}} />}

                <SurroundingComponent {...{ClientProps2, type: 'table'}} />

                {<SurroundingComponent {...{ClientProps2, type: 'right'}} />}
              </R_Stack>
            </div>
            <div className={`sticky bottom-0`}>
              <div>{<SurroundingComponent {...{ClientProps2, type: 'bottom'}} />}</div>
            </div>
          </>
        </section>
      </div>
    </div>
  )
}

const SurroundingComponent = ({type, ClientProps2}) => {
  const {PageBuilder, dataModelName} = ClientProps2
  const getter = `${dataModelName}.${type}`

  const ComponentMethod = PageBuilder ? NestHandler.GetNestedValue(getter, PageBuilder) : undefined
  if (ComponentMethod) {
    return ComponentMethod(ClientProps2)
  } else if (type === `table`) {
    return <TableForm {...ClientProps2} />
  }
}

export default RecordHandler
