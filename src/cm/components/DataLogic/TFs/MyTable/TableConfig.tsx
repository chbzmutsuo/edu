import React from 'react'

import {R_Stack} from 'src/cm/components/styles/common-components/common-components'

import CreateBtn from 'src/cm/components/DataLogic/TFs/MyTable/Thead/TableConfig/CreateBtn'
import SearchBtn from 'src/cm/components/DataLogic/TFs/MyTable/Thead/TableConfig/SearchBtn'
import {ClientPropsType2} from 'src/cm/components/DataLogic/TFs/PropAdjustor/PropAdjustor'
import SortBtn from 'src/cm/components/DataLogic/TFs/MyTable/Thead/TableConfig/SortBtn'

const TableConfig = React.memo((props: {TableConfigProps: TableConfigPropsType; ClientProps2: ClientPropsType2}) => {
  const {TableConfigProps, ClientProps2} = props
  const {myTable} = TableConfigProps

  const {customActions} = myTable ?? {}
  return (
    <div className={``}>
      <R_Stack
        className={`
          itmes-start
          gap-x-1
          md:gap-x-4
    `}
      >
        <CreateBtn {...{TableConfigProps}} />
        <SearchBtn {...{TableConfigProps}} />
        <SortBtn {...{TableConfigProps}} />
        {customActions && customActions({ClientProps2})}
      </R_Stack>
    </div>
  )
})

export default TableConfig
export type TableConfigPropsType = {
  configPosition
  getPaginationProps
  records
  columnCount
  dataModelName
  myTable
  setformData
  columns
  useGlobalProps
}
