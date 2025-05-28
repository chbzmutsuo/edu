'use client'
import React, {useRef, useMemo, useCallback} from 'react'

import useMyTableParams from 'src/cm/components/DataLogic/TFs/MyTable/useMyTableParams'

import {SortableContext, verticalListSortingStrategy} from '@dnd-kit/sortable'
import {DndContext, closestCenter} from '@dnd-kit/core'

import {getMyTableDefault} from 'src/cm/constants/defaults'

import {cl} from 'src/cm/lib/methods/common'
import {C_Stack, R_Stack} from 'src/cm/components/styles/common-components/common-components'

import useTrActions from 'src/cm/components/DataLogic/TFs/MyTable/TableHandler/Tbody/useTrActions'

import TableConfig, {TableConfigPropsType} from 'src/cm/components/DataLogic/TFs/MyTable/TableConfig'

import {ClientPropsType2} from 'src/cm/components/DataLogic/TFs/PropAdjustor/PropAdjustor'

import MyPagination from '@components/DataLogic/TFs/MyTable/TableHandler/Pagination/MyPagination'
import {Z_INDEX} from '@lib/constants/constants'
import {TableWrapper} from '@components/styles/common-components/Table'
import {useElementScrollPosition} from '@hooks/scrollPosition/useElementScrollPosition'
import Tbody from '@components/DataLogic/TFs/MyTable/TableHandler/Tbody/Tbody'
import PlaceHolder from '@components/utils/loader/PlaceHolder'
import Thead from '@components/DataLogic/TFs/MyTable/Thead/Thead'
import {useSearchHandler} from '@components/DataLogic/TFs/MyTable/TableHandler/SearchHandler/useSearchHandler/useSearchHandler'
import {TableSkelton} from '@components/utils/loader/TableSkelton'

const MyTable = React.memo((props: {ClientProps2: ClientPropsType2}) => {
  let ClientProps2 = props.ClientProps2

  ClientProps2 = {
    ...ClientProps2,
    myTable: {...getMyTableDefault(), ...ClientProps2.myTable},
    useGlobalProps: ClientProps2?.useGlobalProps,
  }

  const {editType} = ClientProps2

  const {columns, dataModelName, setformData, myTable, formData, useGlobalProps, records, setrecords, deleteRecord} = ClientProps2

  const {
    columnCount,
    tableStyleRef,
    tableStyle,
    methods: {getPaginationProps, handleDragEndMemo},
    dndProps: {items, sensors},
  } = useMyTableParams({columns, dataModelName, useGlobalProps, myTable, records, setrecords})

  const {RowActionButtonComponent} = useTrActions({
    ...{records, setrecords, deleteRecord, setformData},
    ...{columns, editType, myTable, dataModelName, useGlobalProps},
  })
  const recordCount = records?.length ?? 0

  const {configPosition = `top`} = myTable ?? {}

  const TableConfigProps: TableConfigPropsType = {
    ...{columns, myTable, dataModelName, useGlobalProps},
    ...{records, setformData},
    ...{configPosition, getPaginationProps, columnCount},
  }

  const {showHeader} = myTable ?? {}

  // rows計算を最適化（メモ化）
  const rows = useMemo(() => {
    return ClientProps2.columns
      .filter(cols => {
        return cols.reduce((prev, col) => prev || !col?.td?.hidden, false)
      })
      .map(row => {
        return row.map(col => {
          const withLabel = showHeader ? false : true
          return {...col, td: {...col.td, withLabel}}
        })
      })
  }, [ClientProps2.columns, showHeader])

  // tableIdを安定化
  const tableId = useMemo(() => ['table', dataModelName, myTable?.tableId].join(`_`), [dataModelName, myTable?.tableId])

  const elementRef = useRef<HTMLDivElement>(null)

  // テーブルのスクロール位置を保存
  useElementScrollPosition({
    elementRef,
    scrollKey: tableId,
  })

  // SearchingStatusMemoを最適化
  const {SearchingStatusMemo} = useSearchHandler({
    columns: ClientProps2.columns,
    dataModelName: ClientProps2.dataModelName,
    useGlobalProps: ClientProps2.useGlobalProps,
  })

  // MainTablePropsを安定化
  const mainTableProps = useMemo(
    () => ({
      myTable,
      columns,
      elementRef,
      tableStyleRef,
      tableStyle,
      sensors,
      handleDragEndMemo,
      items,
      showHeader,
      TableConfigProps,
      useGlobalProps,
      ClientProps2,
      rows,
      getPaginationProps,
      RowActionButtonComponent,
    }),
    [
      myTable,
      columns,
      elementRef,
      tableStyleRef,
      tableStyle,
      sensors,
      handleDragEndMemo,
      items,
      showHeader,
      TableConfigProps,
      useGlobalProps,
      ClientProps2,
      rows,
      getPaginationProps,
      RowActionButtonComponent,
    ]
  )

  // MyPaginationPropsを安定化
  const paginationProps = useMemo(
    () => ({
      totalCount: ClientProps2.totalCount,
      recordCount,
      myTable,
      getPaginationProps,
      useGlobalProps,
      records,
    }),
    [ClientProps2.totalCount, recordCount, myTable, getPaginationProps, useGlobalProps, records]
  )

  return (
    <div>
      <div>
        {records === null ? (
          <div className={`max-w-[90%] w-[300px] h-fit overflow-hidden`}>
            <TableSkelton />
          </div>
        ) : records.length === 0 ? (
          <div
            style={{
              width: myTable?.style?.width,
              minWidth: myTable?.style?.minWidth,
              margin: 'auto',
            }}
          >
            <PlaceHolder>データが見つかりません</PlaceHolder>
          </div>
        ) : (
          <MainTable {...mainTableProps} />
        )}

        <section
          className={`sticky bottom-2 mx-auto mt-4   px-1 pb-2   md:scale-[1.25]`}
          style={{
            maxWidth: `80%`,
            zIndex: Z_INDEX.thead,
          }}
        >
          <div className={cl(`rounded-sm bg-white/70`, ` mx-auto  w-fit   px-1.5  py-1  `)}>
            <C_Stack className={` items-start`}>
              {SearchingStatusMemo && <div>{SearchingStatusMemo}</div>}
              <R_Stack className={`  w-fit  justify-center gap-y-0`}>
                <TableConfig {...{TableConfigProps, ClientProps2}} />

                {myTable?.pagination && recordCount > 0 && <MyPagination {...paginationProps} />}
              </R_Stack>
            </C_Stack>
          </div>
        </section>
      </div>
    </div>
  )
})

export default MyTable

// MainTableコンポーネントも最適化
const MainTable = React.memo(
  (props: {
    myTable: any
    columns: any
    elementRef: any
    tableStyleRef: any
    tableStyle: any
    sensors: any
    handleDragEndMemo: any
    items: any
    showHeader: any
    TableConfigProps: any
    useGlobalProps: any
    ClientProps2: any
    rows: any
    getPaginationProps: any
    RowActionButtonComponent: any
  }) => {
    const {
      myTable,
      columns,
      elementRef,
      tableStyleRef,
      tableStyle,
      sensors,
      handleDragEndMemo,
      items,
      showHeader,
      TableConfigProps,
      useGlobalProps,
      ClientProps2,
      rows,
      getPaginationProps,
      RowActionButtonComponent,
    } = props

    // TableWrapperCardを安定化
    const TableWrapperCard = useCallback(
      ({children}) => {
        if (myTable?.useWrapperCard === false) {
          return children
        } else {
          return <div className={` t-paper  ${myTable?.showHeader ? 'p-0!' : `p-2!`} relative  `}>{children}</div>
        }
      },
      [myTable?.useWrapperCard, myTable?.showHeader]
    )

    // tableStyleを安定化
    const tableStyleMemo = useMemo(
      () => ({
        borderCollapse: `separate` as const,
        borderSpacing: showHeader ? `0px` : `0px  6px`,
      }),
      [showHeader]
    )

    return (
      <>
        {typeof myTable?.header === 'function' && myTable?.header()}
        <section className={` bg-error-man  bg-inherit  `}>
          <TableWrapperCard>
            <TableWrapper ref={elementRef} style={{...tableStyle}}>
              {myTable?.caption && <div>{myTable?.caption}</div>}
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndMemo}>
                <SortableContext items={items} strategy={verticalListSortingStrategy}>
                  <div>
                    <table style={tableStyleMemo} ref={tableStyleRef} className={cl(myTable?.className)}>
                      {myTable?.showHeader && (
                        <Thead {...{TableConfigProps, TheadProps: {myTable, columns, useGlobalProps}, ClientProps2}} />
                      )}

                      <Tbody
                        {...{
                          ClientProps2,
                          rows,
                          tbodyRowParams: {getPaginationProps, RowActionButtonComponent},
                        }}
                      />
                    </table>
                  </div>
                </SortableContext>
              </DndContext>
            </TableWrapper>
          </TableWrapperCard>
        </section>
      </>
    )
  }
)
