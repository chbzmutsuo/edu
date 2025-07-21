import React, {CSSProperties, useCallback, useMemo} from 'react'
import {useSortable} from '@dnd-kit/sortable'
import {DndContext, closestCenter} from '@dnd-kit/core'

import {ClientPropsType2} from '@cm/components/DataLogic/TFs/PropAdjustor/types/propAdjustor-types'
import {bodyRecordsType, CsvTable} from '@cm/components/styles/common-components/CsvTable/CsvTable'
import {cn} from '@cm/shadcn/lib/utils'
import {DnDTableRowPropsType} from '@cm/components/DataLogic/TFs/MyTable/components/Tbody/DndTableRow'
import {colType, MyTableType} from '@cm/types/types'
import {TableConfigPropsType} from '@cm/components/DataLogic/TFs/MyTable/components/TableConfig'
import {createRowColor, createTrClassName} from '@cm/components/DataLogic/TFs/MyTable/components/Tbody/Tbody-methods'

import {CSS} from '@dnd-kit/utilities'
import {getValue} from '@cm/components/DataLogic/TFs/MyTable/components/Tbody/TableCell/lib/getValue'
import {getR_StackClass} from '@cm/components/DataLogic/TFs/MyTable/components/Tbody/TableCell/childrens/DisplayedState'
import TdContent from '@cm/components/DataLogic/TFs/MyTable/components/Tbody/TableCell/childrens/TdContent'
import {CsvTableBodyProps} from '@cm/components/styles/common-components/CsvTable/CsvTableBody'
import {BodyLeftTh} from '@cm/components/DataLogic/TFs/MyTable/components/Tbody/BodyLeftTh'
import {getColorStyles} from '@cm/lib/methods/colors'
import {ArrowUpDownIcon} from 'lucide-react'
import {R_Stack} from '@cm/components/styles/common-components/common-components'
import useWindowSize from '@cm/hooks/useWindowSize'

interface MainTableProps {
  myTable: MyTableType
  columns: colType[][]
  elementRef: any
  tableStyleRef: any
  tableStyle: React.CSSProperties
  sensors: any
  handleDragEndMemo: any
  items: any
  showHeader: boolean | undefined
  TableConfigProps: TableConfigPropsType
  useGlobalProps: any
  ClientProps2: ClientPropsType2
  rows: colType[][]
  getPaginationProps: any
  RowActionButtonComponent: any
}

export const VertualMainTable = React.memo<MainTableProps>(props => {
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
  const {dataModelName, mutateRecords, formData} = ClientProps2
  const {SP, PC} = useWindowSize()

  const {from} = getPaginationProps({totalCount: ClientProps2.totalCount})
  const TableWrapperCard = useCallback(
    ({children}: {children: React.ReactNode}) => {
      if (myTable?.useWrapperCard === false) {
        return <div>{children}</div>
      } else {
        return <div className={`t-paper ${myTable?.showHeader ? 'p-0!' : 'p-2!'} relative`}>{children}</div>
      }
    },
    [myTable?.useWrapperCard, myTable?.showHeader]
  )

  const tableStyleMemo = {borderCollapse: 'separate' as const, borderSpacing: showHeader ? '0px' : '0px 6px'}

  const combinedTableStyle = useMemo(
    () => ({
      ...tableStyle,
      ...tableStyleMemo,
    }),
    [tableStyle, tableStyleMemo]
  )

  const TheadProps = useMemo(() => ({myTable, columns, useGlobalProps}), [myTable, columns, useGlobalProps])
  const tbodyRowParams = {getPaginationProps, RowActionButtonComponent}

  const records: any[] = []

  ClientProps2.records.map((record, recIdx: number) => {
    rows?.forEach((ColumnsOnTheRow, rowIdx) => {
      const DnDTableRowProps: DnDTableRowPropsType = {
        record,
        ColumnsOnTheRow,
        rowIdx,
        recIdx,
        showHeader: ClientProps2.myTable?.showHeader,
      }

      const {SP} = props.useGlobalProps

      const rowColor = useMemo(() => {
        return createRowColor({myTable, recIdx, record, rows})
      }, [myTable, recIdx, record, rows])

      const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({
        id: myTable?.['drag'] === false ? '' : record.id,
      })

      const dndStyle = {
        transform: CSS.Transform.toString(transform),
        transition,
        background: isDragging ? '#c2c2c2' : rowColor,
      }

      const allowDnd = myTable?.['drag']
      const dndProps = allowDnd ? {ref: setNodeRef, ...attributes, ...listeners, style: dndStyle} : undefined

      const recordIndex = record?.recordIndex || from + recIdx
      const recordId = record.id

      const tableCellCallBackProps = {
        dataModelName,
        mutateRecords,
        tbodyRowParams,
        DnDTableRowProps: DnDTableRowProps,
        dndStyle,
        rowColor,
      }

      const trClassName = cn(createTrClassName({myTable, record, formData}))

      const bodyLeftThProps = useMemo(() => {
        return {
          myTable,
          showHeader,
          rowColor,
          rowIdx,
          rowSpan: rowIdx === 0 ? rows.length : undefined,
          colSpan: 1,
          dndProps,
          recordIndex,
        }
      }, [myTable, showHeader, rowColor, rowIdx, rows.length, dndProps, recordIndex])

      const rowActionButtonProps = useMemo(
        () => ({
          record,
          myTable,
          rowColor,
          SP,
        }),
        [record, myTable, rowColor, SP]
      )

      const visibleColumns = useMemo(() => ColumnsOnTheRow?.filter(col => col?.td?.hidden !== true) || [], [ColumnsOnTheRow])

      const tds = visibleColumns.map((col, columnIdx) => {
        const tdStyle: CSSProperties = {
          wordBreak: 'break-word',
          ...dndStyle,
          ...col?.td?.style,
          ...dndStyle,
        }
        const value = getValue({col, record, dataModelName, mutateRecords, tdStyle})

        const tdProps = {
          id: `${col.id}-${record.id}`,
          colSpan: col.td?.colSpan,
          rowSpan: col.td?.rowSpan,
          className: `align-top tableCell     `,
          style: {...tdStyle},
        }

        return {
          ...tdProps,
          label: col.label,

          cellValue: (
            <div className={`flex ${getR_StackClass(col)}`}>
              <TdContent {...{showHeader, dataModelName, col, record, value, tdStyle, mutateRecords}} />
            </div>
          ),
        }
      })

      const rowData = {
        id: `tr-${recordId}`,
        className: trClassName,
        ...dndProps,
        csvTableRow: [
          {
            ...tableCellCallBackProps,
            style: {background: getColorStyles(rowColor).backgroundColor},
            className: 'px-0.5  align-top   ',
            label: '操作',
            cellValue: rowIdx === 0 && (
              <R_Stack className={`mx-auto px-1  flex-nowrap justify-around  gap-0`}>
                {myTable?.showRecordIndex !== false && <span className="text-gray-400">{recordIndex}.</span>}
                <div
                  className={cn(
                    `p-0.5  items-center  gap-0.5 gap-x-2 flex-nowrap`,
                    showHeader && !SP ? `row-stack` : `col-stack gap-2`
                  )}
                >
                  {dndProps && <ArrowUpDownIcon className={`w-4 onHover`} />}
                  <RowActionButtonComponent {...rowActionButtonProps} />
                </div>
              </R_Stack>
            ),
          },
          ...tds,
        ],
      }

      records.push(rowData)
    })
  })

  return (
    <div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndMemo}>
        {CsvTable({records}).WithWrapper({})}
      </DndContext>
    </div>
  )
})
