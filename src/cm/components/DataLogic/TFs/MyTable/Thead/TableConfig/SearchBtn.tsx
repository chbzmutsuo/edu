import {TableConfigPropsType} from 'src/cm/components/DataLogic/TFs/MyTable/TableConfig'

import React from 'react'
import {useSearchHandler} from '@components/DataLogic/TFs/MyTable/TableHandler/SearchHandler/useSearchHandler/useSearchHandler'

export default function SearchBtn(props: {TableConfigProps: TableConfigPropsType}) {
  const {columns, myTable, columnCount, useGlobalProps, dataModelName} = props.TableConfigProps

  const {SearchCols, SearchHandlerMemo} = useSearchHandler({
    columns,
    dataModelName,
    useGlobalProps,
  })
  return <>{myTable?.['search'] !== false && SearchHandlerMemo}</>
}
