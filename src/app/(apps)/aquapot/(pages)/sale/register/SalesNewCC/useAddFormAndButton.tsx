'use client'

import {useState} from 'react'

import {Prisma} from '@prisma/client'

import useDoStandardPrisma from '@hooks/useDoStandardPrisma'
import {CartItem} from '@app/(apps)/aquapot/(pages)/sale/register/SalesNewCC/SalesNewCC'
import {v4 as uuidv4} from 'uuid'
export const useAddFormAndButton = ({latestFormData, setcartItems}) => {
  const {aqProducts, aqCustomerPriceOption, loading} = useProductsAndPriceOptions({aqCustomerId: latestFormData.aqCustomerId})

  const upsertToCart = ({date, selectedProduct, selectedPriceOption, quantity, setAsDefaultPrice, remarks, price}) => {
    const newItem: CartItem = {
      uuid: uuidv4(),
      selectedProduct,
      selectedPriceOption,
      quantity,
      setAsDefaultPrice,
      remarks,
      price,
    }

    setcartItems(prev => {
      const index = prev.findIndex(d => d.selectedProduct.id === newItem.selectedProduct.id)

      if (index !== -1) {
        prev[index] = newItem
        return [...prev]
      } else {
        return [...prev, newItem]
      }
    })
    toggleForm()
  }

  const [formOpen, setformOpen] = useState<any>(null)
  const toggleForm = () => (formOpen ? setformOpen(null) : setformOpen({}))

  return {
    loading,
    formOpen,
    setformOpen,
    toggleForm,
    upsertToCart,
    aqProducts,
    aqCustomerPriceOption,
  }
}
export default useAddFormAndButton

export const useProductsAndPriceOptions = ({aqCustomerId}) => {
  const {data: aqCustomerPriceOption} = useDoStandardPrisma(`aqCustomerPriceOption`, `findMany`, {
    where: {aqCustomerId: aqCustomerId ?? 0},
  } as Prisma.AqCustomerPriceOptionFindManyArgs)

  const {data: aqProducts} = useDoStandardPrisma(`aqProduct`, `findMany`, {
    include: {AqPriceOption: {include: {AqCustomerPriceOption: {}}}},
  } as Prisma.AqProductFindManyArgs)

  const kimuchi = aqProducts?.find(d => d.name.includes(`キムチ`))

  return {
    loading: aqProducts && aqCustomerPriceOption ? false : true,
    aqProducts,
    aqCustomerPriceOption,
  }
}
