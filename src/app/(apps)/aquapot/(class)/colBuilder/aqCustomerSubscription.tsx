'use client'

import {aqCustomerForSelectConfig} from '@app/(apps)/aquapot/(class)/colBuilder/aqCustomer'
import {defaultRegister} from '@cm/class/builders/ColBuilderVariables'
import {NumHandler} from '@cm/class/NumHandler'

import {Fields} from '@cm/class/Fields/Fields'
import {columnGetterType} from '@cm/types/types'
import {TextRed} from '@cm/components/styles/common-components/Alert'

export const aqCustomerSubscription = (props: columnGetterType) => {
  const {aqCustomerId} = props.ColBuilderExtraProps ?? {}

  // 対象商品は名称に「使用料」を含むものに限定
  // const {data} = useDoStandardPrisma(`aqProduct`, `findMany`, {where: {name: {contains: `サーバー`}}})
  // const serverProduct = data?.[0]
  return new Fields([
    ...new Fields([
      {
        id: `aqCustomerId`,
        label: `法人名/顧客名`,
        form: {
          ...defaultRegister,
          defaultValue: aqCustomerId,
          disabled: aqCustomerId,
        },
        forSelect: {
          config: aqCustomerForSelectConfig,
        },
        search: {},
      },
      {
        id: `aqProductId`,
        label: `商品`,
        form: {
          ...defaultRegister,
          // defaultValue: serverProduct?.id,
          // disabled: serverProduct?.id,
        },
        forSelect: {
          config: {
            where: {
              name: {contains: `使用料`},
            },
          },
        },
      },
      {id: `aqDeviceMasterId`, label: `デバイス`, form: {...defaultRegister}, forSelect: {}, search: {}},
      {id: `remarks`, label: `摘要記載文言`, form: {}, type: `textarea`},
    ]).buildFormGroup({groupName: `商品情報`}).plain,

    ...new Fields([
      // {id: `updateDate`, label: `更新日`, form: {...defaultRegister, }, type: `date`},
      {id: `maintananceYear`, label: `メンテ年`, form: {...defaultRegister}, type: `number`},
      {id: `maintananceMonth`, label: `メンテ月`, form: {...defaultRegister}, type: `number`},
      {id: `active`, label: `有効`, form: {defaultValue: true, hidden: true}, type: `boolean`},
      {id: `startDate`, label: `開始日`, form: {...defaultRegister}, type: `date`},
      {id: `endDate`, label: `終了日`, form: {...defaultRegister}, type: `date`},
    ]).buildFormGroup({groupName: `メンテ情報`}).plain,

    {
      id: `price`,
      label: `金額`,
      form: {hidden: true},
      format: (value, subscription) => {
        const thePriceMaster = subscription?.AqCustomer?.AqCustomerPriceOption.find(
          p => p.AqPriceOption?.aqProductId === subscription?.AqProduct?.id
        )?.AqPriceOption

        return thePriceMaster ? (
          [thePriceMaster.name, NumHandler.WithUnit(thePriceMaster?.price, '円')].join(` `)
        ) : (
          <TextRed>未設定</TextRed>
        )
      },
    },
    {
      id: `paymentMethod`,
      label: `支払方法`,
      format: (value, subscription) => {
        return subscription?.AqCustomer?.defaultPaymentMethod ?? <TextRed>未設定</TextRed>
      },
    },
  ]).transposeColumns()
}
