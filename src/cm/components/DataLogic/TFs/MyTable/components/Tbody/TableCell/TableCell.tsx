import {DnDTableRowPropsType} from '@components/DataLogic/TFs/MyTable/components/Tbody/DndTableRow'
import {tbodyParamsType} from '@components/DataLogic/TFs/MyTable/components/Tbody/Tbody'

import React, {useMemo} from 'react'
import {colType} from '@cm/types/types'

import {getValue} from '@components/DataLogic/TFs/MyTable/components/Tbody/TableCell/lib/getValue'

import TdContent from '@components/DataLogic/TFs/MyTable/components/Tbody/TableCell/childrens/TdContent'

export type TableCellPropsType = {
  columnIdx: number
  col: colType
}

const TableCell = React.memo(
  (props: {
    dndStyle: any
    rowColor: any
    tbodyRowParams: tbodyParamsType
    DnDTableRowProps: DnDTableRowPropsType
    TableCellProps: TableCellPropsType
    dataModelName
    mutateRecords
    showHeader?: boolean
  }) => {
    const {
      dndStyle,
      rowColor,
      dataModelName,
      mutateRecords,
      DnDTableRowProps: {record},
      TableCellProps: {columnIdx, col},
      showHeader,
    } = props

    const tdStyle = {wordBreak: 'break-word', ...dndStyle, ...col?.td?.style, background: rowColor, ...dndStyle}
    const value = getValue({col, record, dataModelName, mutateRecords, tdStyle})

    const tdProps = useMemo(() => {
      return {
        id: `${col.id}-${record.id}`,
        colSpan: col.td?.colSpan,
        rowSpan: col.td?.rowSpan,
        className: `align-top tableCell text-responsive    `,
        style: {...tdStyle},
      }
    }, [col, record, tdStyle])

    const TdContentMemo = useMemo(() => {
      return <TdContent {...{showHeader, dataModelName, col, record, value, tdStyle, mutateRecords}} />
    }, [showHeader, dataModelName, col, record, value, tdStyle, mutateRecords])

    return (
      <td key={`${col?.id}_dbId${record?.id}_index${columnIdx}`} {...tdProps}>
        <div className={`flex h-full w-full items-start  justify-center`}>{TdContentMemo}</div>
      </td>
    )
  }
)

export default TableCell
