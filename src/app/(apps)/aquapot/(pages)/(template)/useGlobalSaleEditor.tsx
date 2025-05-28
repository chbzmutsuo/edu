'use client'
import {createSaleRecordArgs} from '@app/(apps)/aquapot/(pages)/sale/register/SalesNewCC/createSaleRecordArgs'
import {SaleRecordEditForm} from '@app/(apps)/aquapot/(pages)/sale/register/SalesNewCC/SaleRecordEditForm'
import {useProductsAndPriceOptions} from '@app/(apps)/aquapot/(pages)/sale/register/SalesNewCC/useAddFormAndButton'
import PlaceHolder from '@components/utils/loader/PlaceHolder'
import {useGlobalModalForm} from '@components/utils/modal/useGlobalModalForm'
import useGlobal from '@hooks/globalHooks/useGlobal'
import useDoStandardPrisma from '@hooks/useDoStandardPrisma'
import {atomTypes} from '@hooks/useJotai'
import {doStandardPrisma} from '@lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {Prisma} from '@prisma/client'
import React from 'react'

export default function useGlobalSaleEditor() {
  const {toggleLoad} = useGlobal()
  const HK_SaleEditor = useGlobalModalForm<atomTypes[`saleEditorGMF`]>(`saleEditorGMF`, null, {
    mainJsx: ({GMF_OPEN, setGMF_OPEN}) => {
      const {saleRecordId} = GMF_OPEN ?? {}
      const {data: SaleRecord} = useDoStandardPrisma(`aqSaleRecord`, `findUnique`, {
        where: {id: saleRecordId},
        include: {
          User: {},
          AqCustomer: {},
          AqSaleCart: {},
          AqProduct: {},
          AqPriceOption: {},
        },
      })
      const {loading, aqProducts, aqCustomerPriceOption} = useProductsAndPriceOptions({aqCustomerId: SaleRecord?.AqCustomer?.id})

      if (!SaleRecord || loading) return <PlaceHolder />

      return (
        <SaleRecordEditForm
          {...{
            showDate: true,
            fromSaleList: true,
            formData: {...SaleRecord, paymentMethod: SaleRecord.AqSaleCart?.paymentMethod},
            aqProducts,
            aqCustomerPriceOption,
            upsertToCart: async props => {
              const {date, selectedProduct, selectedPriceOption, quantity, setAsDefaultPrice, paymentMethod, remarks, price} =
                props

              await toggleLoad(async () => {
                const args = createSaleRecordArgs({
                  date,
                  userId: SaleRecord.userId,
                  aqCustomerId: SaleRecord.aqCustomerId,
                  item: {
                    uuid: SaleRecord.uuid,
                    quantity,
                    selectedProduct,
                    selectedPriceOption,
                    setAsDefaultPrice,
                    remarks,
                    price,
                  },
                })

                const args2: Prisma.AqSaleRecordUpdateArgs = {
                  where: {id: SaleRecord.id},
                  data: {
                    ...args,
                    AqSaleCart: {update: {paymentMethod, date}},
                  },
                }
                const res = await doStandardPrisma(`aqSaleRecord`, `update`, args2)
                setGMF_OPEN(null)
              })
            },
          }}
        />
      )
    },
  })

  return {HK_SaleEditor}
}
