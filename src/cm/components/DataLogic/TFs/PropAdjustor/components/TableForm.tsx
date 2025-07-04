'use client'
import React, {useMemo} from 'react'
import {getMyTableDefault, myFormDefault} from 'src/cm/constants/defaults'

import BasicModal from '@components/utils/modal/BasicModal'
import MyTable from '@components/DataLogic/TFs/MyTable/MyTable'
import MyForm from '@components/DataLogic/TFs/MyForm/MyForm'

import {ClientPropsType2} from '@components/DataLogic/TFs/PropAdjustor/types/propAdjustor-types'

// 動的インポートでコード分割

// 型定義を改善

// convertProps関数を分離して最適化
const convertProps = (props: ClientPropsType2): ClientPropsType2 => {
  const myTableDefault = getMyTableDefault()

  return {
    ...props,
    myForm: {
      ...myFormDefault,
      ...props.myForm,
      style: {
        ...myFormDefault?.style,
        ...props.myForm?.style,
      },
    },
    myTable: {
      ...myTableDefault,
      ...props.myTable,
      style: {
        ...myTableDefault?.style,
        ...props.myTable?.style,
      },
    },
    myModal: {...props.myModal},
  } as ClientPropsType2
}

const TableForm = (props: ClientPropsType2) => {
  // ✅ 重いオブジェクト作成（スプレッド演算子多用）なのでメモ化有効
  const ClientProps2 = useMemo(() => convertProps(props), [props])

  const {EditForm, myForm, myModal, setformData, formData} = props

  // ✅ オブジェクト作成なのでメモ化有効
  const modalStyle = useMemo(
    () => ({
      padding: '10px 10px',
      background: '#fff',
      ...myModal?.style,
    }),
    [myModal?.style]
  )

  // ✅ 条件分岐のあるJSX要素なのでメモ化有効
  const formComponent = useMemo(
    () => (EditForm ? <EditForm {...ClientProps2} /> : <MyForm {...ClientProps2} />),
    [EditForm, ClientProps2]
  )

  return (
    <div>
      <MyTable ClientProps2={ClientProps2} />
      <BasicModal alertOnClose={true} style={modalStyle} open={!!formData} handleClose={() => setformData?.(null)}>
        <div id="editFormOnMyDataViwer">
          {myForm?.caption}
          {formComponent}
        </div>
      </BasicModal>
    </div>
  )
}

TableForm.displayName = 'TableForm'

export default TableForm
