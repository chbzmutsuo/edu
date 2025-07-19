'use client'

import {NumHandler} from '@cm/class/NumHandler'

import {Fields} from '@cm/class/Fields/Fields'
import {columnGetterType} from '@cm/types/types'

export const aqSaleRecord = (props: columnGetterType) => {
  return new Fields([
    {
      id: `createdAt`,
      label: `登録時間`,
      type: `datetime`,
    },
    {id: `date`, label: `購入日`, type: `date`},
    {id: `aqCustomerId`, label: `顧客名`, forSelect: {}},
    {id: `userId`, label: `担当者`, forSelect: {}},

    // {id: `AqProduct.code`, label: `商品コード`, forSelect: {}},
    {
      id: `aqProductId`,
      label: `商品名`,
      forSelect: {},
      td: {style: {maxWidth: 200}},
    },
    {
      id: `AqPriceOption.name`,
      label: `価格オプション`,
      format: (value, row) => {
        if (row.AqPriceOption) {
          return `${row.AqPriceOption?.name}(${NumHandler.toPrice(row.AqPriceOption.price)}円)`
        }
      },
    },
    {id: `quantity`, label: `数量`, type: `number`},
    {id: `price`, label: `価格`, type: `price`},
    {id: `taxRate`, label: `消費税率`},
    {id: `taxedPrice`, label: `価格（税込）`, type: `price`},
    {id: `AqSaleCart.paymentMethod`, label: `支払方法`},

    // {
    //   id: `aqSaleCartId`,
    //   label: `カートID`,
    //   forSelect: {
    //     config: {
    //       select: {id: true, name: false},
    //       nameChanger: op => {
    //         return {...op, name: op.id}
    //       },
    //     },
    //   },
    // },
  ])
    .customAttributes(col => ({
      ...col,
      td: {withLabel: false},
    }))
    .transposeColumns()
}
