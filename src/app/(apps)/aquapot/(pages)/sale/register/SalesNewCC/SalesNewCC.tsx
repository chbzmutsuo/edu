'use client'

import {Cart} from '@app/(apps)/aquapot/(pages)/sale/register/SalesNewCC/Cart'

import {Button} from '@components/styles/common-components/Button'
import {C_Stack, FitMargin, R_Stack} from '@components/styles/common-components/common-components'

import useGlobal from '@hooks/globalHooks/useGlobal'

import React, {useState} from 'react'

import {AqPriceOption, AqProduct} from '@prisma/client'
import {ShoppingCartIcon} from '@heroicons/react/20/solid'

import {useCustomerSelector} from '@app/(apps)/aquapot/(pages)/sale/register/SalesNewCC/useCustomerSelector'

import AddFormAndButton from '@app/(apps)/aquapot/(pages)/sale/register/SalesNewCC/AddFormAndButton'
import useAddFormAndButton from '@app/(apps)/aquapot/(pages)/sale/register/SalesNewCC/useAddFormAndButton'

import {serverUpdateSale} from '@app/(apps)/aquapot/(pages)/sale/register/SalesNewCC/server-updateSale'

import {isSaleTestMode} from '@app/(apps)/aquapot/(constants)/config'
import {sleep} from '@lib/methods/common'
import PlaceHolder from '@components/utils/loader/PlaceHolder'
import {PaperLarge} from '@components/styles/common-components/paper'
import {toastByResult} from '@lib/ui/notifications'
import useWindowSize from '@hooks/useWindowSize'

export type CartItem = {
  uuid: string
  quantity: number
  price: number
  selectedProduct: AqProduct
  selectedPriceOption: AqPriceOption
  setAsDefaultPrice: boolean
  remarks: string
}

export default function SalesNewCC() {
  const useGlobalProps = useGlobal()
  const {toggleLoad, query, router, session} = useGlobalProps
  const {width} = useWindowSize()

  const maxWidth = Math.min(width, 500)

  const [cartUser, setcartUser] = useState<any>(isSaleTestMode ? {aqCustomerId: 3} : null)
  const [cartItems, setcartItems] = useState<CartItem[]>(isSaleTestMode ? defaultState : [])

  const {latestFormData, Form: CustomerSelector, ReactHookForm} = useCustomerSelector({cartUser, setcartUser, maxWidth})
  const customer = latestFormData.aqCustomerId

  const {loading, formOpen, setformOpen, toggleForm, upsertToCart, aqProducts, aqCustomerPriceOption} = useAddFormAndButton({
    latestFormData,
    setcartItems,
  })

  const onSubmit = async () => {
    toggleLoad(async () => {
      const data = latestFormData
      const aqCustomerId = data.aqCustomerId

      if (!aqCustomerId) return alert(`お客様を選択してください`)

      //データ更新
      const result = await serverUpdateSale({
        userId: session.id,
        date: data.date,
        aqCustomerId: data.aqCustomerId,
        paymentMethod: data.paymentMethod,
        cartItems,
      })

      toastByResult(result)
      await sleep(1000)

      ReactHookForm.reset()
      setcartUser(null)
      setcartItems([])
      setformOpen(false)
    })
  }

  if (loading) return <PlaceHolder />

  return (
    <FitMargin>
      <PaperLarge>
        <>
          <C_Stack className={`items-center gap-4`}>
            <CustomerSelector {...{latestFormData}} />

            {customer && (
              <AddFormAndButton {...{formOpen, setformOpen, toggleForm, upsertToCart, aqProducts, aqCustomerPriceOption}} />
            )}

            {customer ? (
              <C_Stack>
                <Cart {...{cartItems, setcartItems, aqCustomerPriceOption, setformOpen}} />

                <Button
                  {...{
                    disabled: isSaleTestMode ? false : !customer || cartItems.length === 0,
                    onClick: onSubmit,
                    type: `button`,
                    color: 'blue',
                    className: ` mx-auto w-fit text-center`,
                  }}
                >
                  <R_Stack className={`w-[12.5rem] justify-center p-2 text-xl`}>
                    <span>受注確定</span> <ShoppingCartIcon className={`h-8`}></ShoppingCartIcon>
                  </R_Stack>
                </Button>
              </C_Stack>
            ) : (
              <small className={` text-error-main`}>お客様を選択してください</small>
            )}
          </C_Stack>
        </>
      </PaperLarge>
    </FitMargin>
  )
}

const defaultState: any[] = [
  {
    selectedProduct: {
      id: 1,
      createdAt: '2024-11-15T01:32:11.141Z',
      updatedAt: '2024-11-27T03:42:43.000Z',
      sortOrder: 1,
      productCode: '1',
      name: 'アクアポット12リットルボトル',
      aqProductCategoryMasterId: 1,
      price: 0,
      cost: 450,
      sku: null,
      taxType: null,
      taxRate: 8,
      stock: 0,
      AqPriceOption: [
        {
          id: 1,
          createdAt: '2024-11-15T01:33:37.007Z',
          updatedAt: '2024-11-15T05:17:36.000Z',
          sortOrder: 1,
          name: '一般',
          price: 1200,
          aqProductId: 1,
          AqCustomerPriceOption: [
            {
              id: 1,
              createdAt: '2024-11-21T00:54:35.420Z',
              updatedAt: '2024-11-21T00:54:35.000Z',
              sortOrder: 1,
              aqCustomerId: 4,
              aqProductId: 1,
              aqPriceOptionId: 1,
            },
            {
              id: 2,
              createdAt: '2024-11-21T00:55:23.254Z',
              updatedAt: '2024-11-21T00:55:23.000Z',
              sortOrder: 2,
              aqCustomerId: 3,
              aqProductId: 1,
              aqPriceOptionId: 1,
            },
            {
              id: 3,
              createdAt: '2024-11-21T00:55:47.494Z',
              updatedAt: '2024-11-21T00:55:47.000Z',
              sortOrder: 3,
              aqCustomerId: 5,
              aqProductId: 1,
              aqPriceOptionId: 1,
            },
            {
              id: 4,
              createdAt: '2024-11-21T00:56:08.090Z',
              updatedAt: '2024-11-21T00:56:08.000Z',
              sortOrder: 4,
              aqCustomerId: 6,
              aqProductId: 1,
              aqPriceOptionId: 1,
            },
            {
              id: 5,
              createdAt: '2024-11-21T00:56:29.695Z',
              updatedAt: '2024-11-21T00:56:29.000Z',
              sortOrder: 5,
              aqCustomerId: 7,
              aqProductId: 1,
              aqPriceOptionId: 1,
            },
            {
              id: 6,
              createdAt: '2024-11-21T02:23:01.871Z',
              updatedAt: '2024-11-21T02:23:01.000Z',
              sortOrder: 6,
              aqCustomerId: 11,
              aqProductId: 1,
              aqPriceOptionId: 1,
            },
          ],
        },
        {
          id: 2,
          createdAt: '2024-11-15T01:34:08.299Z',
          updatedAt: '2024-11-15T05:17:46.000Z',
          sortOrder: 2,
          name: '卸価格A',
          price: 1000,
          aqProductId: 1,
          AqCustomerPriceOption: [],
        },
        {
          id: 3,
          createdAt: '2024-11-15T01:34:24.439Z',
          updatedAt: '2024-11-15T05:17:54.000Z',
          sortOrder: 3,
          name: '卸価格B',
          price: 900,
          aqProductId: 1,
          AqCustomerPriceOption: [],
        },
        {
          id: 4,
          createdAt: '2024-11-15T01:35:37.023Z',
          updatedAt: '2024-11-15T05:18:02.000Z',
          sortOrder: 4,
          name: '卸価格C',
          price: 800,
          aqProductId: 1,
          AqCustomerPriceOption: [],
        },
        {
          id: 10,
          createdAt: '2024-11-15T05:17:12.438Z',
          updatedAt: '2024-11-15T05:18:19.000Z',
          sortOrder: 10,
          name: '卸価格D',
          price: 700,
          aqProductId: 1,
          AqCustomerPriceOption: [],
        },
      ],
    },
    selectedPriceOption: {
      id: 2,
      createdAt: '2024-11-15T01:34:08.299Z',
      updatedAt: '2024-11-15T05:17:46.000Z',
      sortOrder: 2,
      name: '卸価格A',
      price: 1000,
      aqProductId: 1,
      AqCustomerPriceOption: [],
    },
    quantity: 1,
    setAsDefaultPrice: true,
  },
]
