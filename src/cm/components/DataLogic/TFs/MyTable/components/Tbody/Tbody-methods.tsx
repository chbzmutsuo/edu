import {COLORS} from 'src/cm/lib/constants/constants'

import {cl} from 'src/cm/lib/methods/common'
import {CSS} from '@dnd-kit/utilities'
import {useSortable} from '@dnd-kit/sortable'

export const createRowColor = ({myTable, recIdx, record, rows}) => {
  const allColumns = rows.flat()
  const {oddNumberRow, evenNumberRow} = COLORS.table
  let rowColor = myTable?.stripedTableRow !== false ? (recIdx % 2 === 0 ? COLORS.table.evenNumberRow : oddNumberRow) : ''
  // 1行当たりの処理

  const designatedRowColor = allColumns
    .map(col => {
      const getRowColor = col?.td?.getRowColor
      if (getRowColor) {
        return getRowColor(record[col.id], record)
      }

      return ''
    })
    .find(val => val)

  rowColor = designatedRowColor ?? rowColor ?? '#ffffff'

  return rowColor
}

export const createTrClassName = ({myTable, record, formData}) =>
  cl(
    `relative `,
    formData?.id === record?.id ? 'bg-sub-light' : '',
    // rowIdx === rows.length - 1 ? 'border-b-[.0625rem] border-solid!' : '',
    myTable?.showHeader ? '' : `roundedTr`
  )

export const getDndProps = ({dndId, rowColor, myTable}) => {
  const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({
    id: dndId,
  })
  const dndStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: isDragging ? '#fef788' : rowColor,
  }

  const allowDnd = myTable?.['drag']
  const dndProps = allowDnd ? {ref: setNodeRef, ...attributes, ...listeners, style: dndStyle} : undefined
  return {dndProps, dndStyle}
}
