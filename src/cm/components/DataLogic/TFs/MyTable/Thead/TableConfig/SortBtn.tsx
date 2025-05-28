import {colType} from '@cm/types/types'
import {TableConfigPropsType} from 'src/cm/components/DataLogic/TFs/MyTable/TableConfig'

import React from 'react'
import SortHandler from 'src/cm/components/DataLogic/TFs/MyTable/TableHandler/SortHandler/SortHandler'

export default function SortBtn(props: {TableConfigProps: TableConfigPropsType}) {
  const {columns, myTable, columnCount, useGlobalProps, dataModelName} = props.TableConfigProps
  const sortableCols = columns.flat().filter((col: colType) => col.sort)
  return (
    <>
      {myTable?.['sort'] !== false && sortableCols.length > 0 && (
        <SortHandler
          {...{
            sortableCols,
            columns,
            className: '',
            columnCount,
            useGlobalProps,
            dataModelName,
          }}
        />
      )}
    </>
  )
}
