import {Downloader} from '@components/styles/common-components/CsvTable/CsvDownloader'
import {CsvTableBody} from '@components/styles/common-components/CsvTable/CsvTableBody'
import {CsvTableHead} from '@components/styles/common-components/CsvTable/CsvTableHead'
import {TableBordered, TableWrapper} from '@components/styles/common-components/Table'
import {htmlProps} from '@components/styles/common-components/type'

import React, {CSSProperties} from 'react'
import {twMerge} from 'tailwind-merge'
export type recordsType = {
  headerRecords?: bodyRecordsType
  bodyRecords?: bodyRecordsType
  records?: bodyRecordsType
}
export type CsvTableProps = {
  stylesInColumns?: stylesInColumns

  SP?: boolean
  csvOutput?: {
    fileTitle: string
    dataArranger?: (props: recordsType) => Promise<any[]>
  }
} & recordsType

export const convertRecords = (props: recordsType) => {
  const {records} = props
  let {headerRecords, bodyRecords} = props
  if (records) {
    headerRecords = [records[0]].map(row => {
      return {
        ...row,
        csvTableRow: (row?.csvTableRow ?? []).map(d => {
          return {
            //
            ...d,
            cellValue: d.label,
          }
        }),
      }
    })
    bodyRecords = records.map(row => {
      return {
        ...row,
        csvTableRow: (row?.csvTableRow ?? []).map(d => {
          return {
            ...d,
            label: undefined,
          }
        }),
      }
    })
  }

  return {
    ...props,
    headerRecords,
    bodyRecords,
  }
}

export const CsvTable = (props: CsvTableProps) => {
  props = convertRecords(props)

  const getBodyWithHeader = () => {
    if (props.SP) {
      const {headerRecords = []} = props
      const {bodyRecords = []} = props
      const rowCount = Math.max(...headerRecords.map(d => d.csvTableRow.length))
      const bodyWithHeader = new Array(rowCount).fill(null).map((_, rowIdx) => {
        const headerCols = headerRecords
          .map((d, colIdx) => {
            const cols = d.csvTableRow

            const findTheCol = cols[rowIdx] ?? null

            if (findTheCol?.colSpan) {
              d.csvTableRow.splice(rowIdx + 1, 0, ...new Array(findTheCol.colSpan - 1).fill(null))
            }

            if (findTheCol) {
              return {...findTheCol, rowSpan: findTheCol?.colSpan, colSpan: 1}
            }
          })
          .filter(Boolean)

        const body = bodyRecords.map(d => d.csvTableRow[rowIdx])

        return {
          csvTableRow: [...headerCols, ...body],
        }
      }) as bodyRecordsType

      return bodyWithHeader
    } else {
      return props.bodyRecords
    }
  }

  const bodyWithHeader = getBodyWithHeader()

  // if (props.SP) {

  //   //
  //   return {
  //     WithWrapper: (
  //       props?: htmlProps & {
  //         size?: `sm` | `base` | `lg` | `xl`
  //       }
  //     ) => {
  //       return (
  //         <TableWrapper {...props}>
  //           <TableBordered {...{size: props?.size}}>{ALL()}</TableBordered>
  //         </TableWrapper>
  //       )
  //     },
  //     ALL,
  //     Thead: () => <CsvTableHead {...props} headerRecords={[]} />,
  //     Tbody: () => <CsvTableBody {...props} bodyRecords={bodyWithHeader} />,
  //     Downloader: () => <Downloader {...props} />,
  //   }
  // }

  const ALL = () => {
    return (
      <>
        <CsvTableHead {...props} />
        <CsvTableBody {...props} bodyRecords={bodyWithHeader} />
      </>
    )
  }

  const WithWrapper = (props: htmlProps & {size?: `sm` | `base` | `lg` | `xl`}) => {
    return (
      <TableWrapper {...props} {...{className: twMerge('max-h-[80vh] max-w-[90vw] mx-auto', props.className)}}>
        <TableBordered {...{size: props?.size}}>{ALL()}</TableBordered>
      </TableWrapper>
    )
  }

  return {
    WithWrapper,
    ALL,
    Thead: () => <CsvTableHead {...props} />,
    Tbody: () => <CsvTableBody {...props} />,
    Downloader: () => <Downloader {...props} />,
  }
}

export type trTdProps = {
  rowSpan?: number
  colSpan?: number
  className?: string
  style?: CSSProperties
  thStyle?: CSSProperties
  onClick?: any
}
export type csvTableCol = {cellValue: any; cellValueRaw?: any; label?: any} & trTdProps
export type csvTableRow = trTdProps & {csvTableRow: csvTableCol[]}
export type bodyRecordsType = csvTableRow[]
export type stylesInColumns = {
  [key: number]: {
    style?: CSSProperties
    className?: string
  }
}
