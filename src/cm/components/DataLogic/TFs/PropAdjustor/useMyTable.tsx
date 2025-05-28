import {Fields} from '@class/Fields/Fields'
import {MyTableType} from '@cm/types/types'
import {colType} from '@cm/types/types'

export default function useMyTable({displayStyle, columns, myTable}) {
  const showHeader = checkShowHeader({myTable, columns})

  return {
    ...myTable,
    style: {...displayStyle, ...myTable?.style},
    showHeader,
  }
}

export const checkShowHeader = (props: {myTable: MyTableType; columns: colType[][]}) => {
  const {myTable, columns} = props

  const noColHasLabel = columns?.flat()?.every(col => {
    const showLabel = Fields.doShowLabel(col)
    return !showLabel
  })

  const showHeader = myTable?.header ?? noColHasLabel

  return showHeader
}
