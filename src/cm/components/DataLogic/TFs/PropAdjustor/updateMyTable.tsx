import {Fields} from '@class/Fields/Fields'
import {colType, MyTableType} from '@cm/types/types'

export function updateMyTable({ClientProps, columns}) {
  const {displayStyle} = ClientProps
  const showHeader = checkShowHeader({myTable: ClientProps.myTable, columns})

  const myTable = {
    ...ClientProps.myTable,
    style: {
      ...displayStyle,
      ...ClientProps.myTable?.style,
    },
    showHeader,
  }
  ClientProps.myTable = myTable
  return myTable
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
