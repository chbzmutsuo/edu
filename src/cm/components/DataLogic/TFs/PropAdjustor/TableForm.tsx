'use client'
import React from 'react'

import {getMyTableDefault, myFormDefault, myModalDefault} from 'src/cm/constants/defaults'

import {ClientPropsType2} from 'src/cm/components/DataLogic/TFs/PropAdjustor/PropAdjustor'
import BasicModal from '@components/utils/modal/BasicModal'
// import MyTable from '@components/DataLogic/TFs/MyTable/MyTable'
// import MyForm from '@components/DataLogic/TFs/MyForm/MyForm'
import dynamic from 'next/dynamic'
import PlaceHolder from '@components/utils/loader/PlaceHolder'
const MyTable = dynamic(() => import('@components/DataLogic/TFs/MyTable/MyTable'), {loading: () => <PlaceHolder />})
const MyForm = dynamic(() => import('@components/DataLogic/TFs/MyForm/MyForm'), {loading: () => <PlaceHolder />})

const TableForm = (props: ClientPropsType2) => {
  const ClientProps2 = convertProps(props)

  const {EditForm, myForm, myModal, setformData} = props

  return (
    <div>
      <MyTable {...{ClientProps2}} />
      <BasicModal
        {...{
          alertOnClose: true,
          style: {padding: `10px 10px`, background: `#fff`, ...myModal?.style},
          open: props.formData,
          handleClose: () => setformData?.(null),
        }}
      >
        <div id={`editFormOnMyDataViwer`}>
          {myForm?.caption}
          {EditForm ? <EditForm {...ClientProps2} /> : <MyForm {...ClientProps2} />}
        </div>
      </BasicModal>
    </div>
  )
}
export default TableForm

const convertProps = props => {
  const myTableDefault = getMyTableDefault()

  props = {
    ...props,
    myForm: {...myFormDefault, ...props.myForm, style: {...myFormDefault?.style, ...props.myForm?.style}},
    myTable: {...myTableDefault, ...props.myTable, style: {...myTableDefault?.style, ...props.myTable?.style}},
    myModal: {...myModalDefault, ...props.myModal},
  }

  return props as ClientPropsType2
}
