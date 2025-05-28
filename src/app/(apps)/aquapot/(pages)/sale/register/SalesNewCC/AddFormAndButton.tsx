import {SaleRecordEditForm} from '@app/(apps)/aquapot/(pages)/sale/register/SalesNewCC/SaleRecordEditForm'
import {Button} from '@components/styles/common-components/Button'
import {Center} from '@components/styles/common-components/common-components'
import BasicModal from '@components/utils/modal/BasicModal'
import React, {Fragment} from 'react'

export default function AddFormAndButton({formOpen, setformOpen, toggleForm, upsertToCart, aqProducts, aqCustomerPriceOption}) {
  return (
    <Fragment>
      <Center onClick={() => setformOpen({})}>
        <Button type={`button`} color="sub">
          新規追加
        </Button>
      </Center>

      {/* 登録フォーム */}
      <BasicModal {...{open: formOpen, handleClose: toggleForm}}>
        <SaleRecordEditForm
          {...{
            showDate: false,
            formData: {
              ...formOpen,
              quantity: formOpen?.quantity ?? 1,
              price: formOpen?.price ?? 0,
              setAsDefaultPrice: !!formOpen?.setAsDefaultPrice,
              aqProductId: formOpen?.selectedProduct?.id,
              aqPriceOptionId: formOpen?.selectedPriceOption?.id,
            },
            upsertToCart,
            aqProducts,
            aqCustomerPriceOption,
          }}
        />
      </BasicModal>
    </Fragment>
  )
}
