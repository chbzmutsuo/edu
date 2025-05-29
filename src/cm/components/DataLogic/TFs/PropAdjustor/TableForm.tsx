'use client'
import React, {useMemo} from 'react'
import {getMyTableDefault, myFormDefault, myModalDefault} from 'src/cm/constants/defaults'
import {ClientPropsType2} from 'src/cm/components/DataLogic/TFs/PropAdjustor/PropAdjustor'
import BasicModal from '@components/utils/modal/BasicModal'
import dynamic from 'next/dynamic'
import PlaceHolder from '@components/utils/loader/PlaceHolder'
import MyTable from '@components/DataLogic/TFs/MyTable/MyTable'

// 動的インポートでコード分割
const MyForm = dynamic(() => import('@components/DataLogic/TFs/MyForm/MyForm'), {
  loading: () => <PlaceHolder />,
})

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
    myModal: {
      ...myModalDefault,
      ...props.myModal,
    },
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
