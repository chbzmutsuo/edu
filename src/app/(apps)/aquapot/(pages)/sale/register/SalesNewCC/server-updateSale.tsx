'use server'

import {createSaleRecordArgs} from '@app/(apps)/aquapot/(pages)/sale/register/SalesNewCC/createSaleRecordArgs'
import {CartItem} from '@app/(apps)/aquapot/(pages)/sale/register/SalesNewCC/SalesNewCC'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

import prisma from 'src/lib/prisma'
import {Prisma} from '@prisma/client'

export const serverUpdateSale = async (props: {
  date: Date
  userId
  aqCustomerId: number
  paymentMethod: string
  cartItems: CartItem[]
}) => {
  const {date, userId, cartItems, aqCustomerId, paymentMethod} = props
  const messages: string[] = []
  let success = 0
  const result = await prisma.$transaction(async transactionPrisma => {
    const args: Prisma.AqSaleCartCreateArgs = {
      data: {
        userId: userId,
        aqCustomerId: aqCustomerId,
        paymentMethod: paymentMethod,
        date: date,
        AqSaleRecord: {
          create: [
            ...cartItems.map((item: CartItem) => {
              const args = createSaleRecordArgs({userId, aqCustomerId, item, date: date})
              return args
            }),
          ],
        },
      },
    }

    const newCartRes = await doStandardPrisma(`aqSaleCart`, `create`, args, transactionPrisma)

    if (newCartRes.success) {
      messages.push(`${cartItems?.length} 件の受注を登録しました`)
      success += 1
    } else {
      messages.push(`受注登録に失敗しました。 `)
    }

    try {
      const targetItems = cartItems.filter(item => item.setAsDefaultPrice)

      const createdPriceOptions = await Promise.all(
        targetItems.map(async item => {
          const payload = {
            aqCustomerId: aqCustomerId,
            aqProductId: item?.selectedProduct?.id,
          }

          const args: Prisma.AqCustomerPriceOptionUpsertArgs = {
            where: {unique_aqCustomerId_aqProductId: {...payload}},
            create: {...payload, aqPriceOptionId: item?.selectedPriceOption?.id},
            update: {...payload, aqPriceOptionId: item?.selectedPriceOption?.id},
          }
          const res = await doStandardPrisma(`aqCustomerPriceOption`, `upsert`, args, transactionPrisma)

          if (!res.success) {
            throw new Error('Failed to create price option')
          }
        })
      )
      const count = createdPriceOptions.length
      if (count > 0) {
        messages.push(`${count}件のデフォルト価格を設定しました`)
      }
    } catch (error) {
      console.error(error.stack)
      throw new Error('Failed to create price option')
    }
    success += 1

    return {
      success: success === 2,
      message: messages.join('\n'),
      result: newCartRes.result,
    }
  })

  return result
}
