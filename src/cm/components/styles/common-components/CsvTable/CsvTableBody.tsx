import {CsvTableProps} from '@components/styles/common-components/CsvTable/CsvTable'
import {Counter} from '@components/styles/common-components/Table'
import {cl} from '@lib/methods/common'

export function CsvTableBody(props: CsvTableProps) {
  return (
    <tbody>
      {props.bodyRecords?.map((row, rowIdx) => {
        const {csvTableRow, ...restPropsOnTr} = row

        return (
          <tr
            key={rowIdx}
            {...restPropsOnTr}
            className={[
              //
              restPropsOnTr?.className,
              `divide-x divide-y `,
            ].join(` `)}
          >
            {csvTableRow?.map((cell, celIdx) => {
              const stylesInThisColumn = props?.stylesInColumns?.[celIdx]
              const {cellValue, className, cellValueRaw, thStyle, ...restPropsOnTd} = cell ?? {}
              if (cell.colSpan === 0) return null
              const isNumber = typeof cellValue === 'number'
              const isString = typeof cellValue === 'string'

              let style = {...stylesInThisColumn?.style}
              if (isNumber) {
                style.textAlign = 'right'
              }
              style = {...style, ...cell.style}

              return (
                <td
                  key={celIdx}
                  {...restPropsOnTd}
                  {...{
                    style,
                    className: cl(className, stylesInThisColumn?.className),
                  }}
                >
                  {isNumber ? <Counter>{cellValue}</Counter> : cellValue}
                </td>
              )
            })}
          </tr>
        )
      })}
    </tbody>
  )
}
