'use client'

import {AQ_CONST} from '@app/(apps)/aquapot/(constants)/options'
import {defaultRegister} from '@class/builders/ColBuilderVariables'
import {NumHandler} from '@class/NumHandler'
import {Fields} from '@class/Fields/Fields'
import {colType} from '@cm/types/types'

import {Button} from '@components/styles/common-components/Button'
import {Center, C_Stack} from '@components/styles/common-components/common-components'
import useGlobal from '@hooks/globalHooks/useGlobal'

import useBasicFormProps from '@hooks/useBasicForm/useBasicFormProps'
import useDoStandardPrisma from '@hooks/useDoStandardPrisma'

import React, {useEffect} from 'react'

export const SaleRecordEditForm = ({
  showDate = false,
  formData,
  upsertToCart,
  aqProducts,
  aqCustomerPriceOption,
  fromSaleList = false,
}) => {
  const {data: aqPriceOption = []} = useDoStandardPrisma(`aqPriceOption`, `findMany`, {})

  const {session} = useGlobal()
  const colSource: colType[] = [
    {id: `userId`, label: `担当者`, form: {...defaultRegister, defaultValue: session.id}, forSelect: {}},
    {
      id: `aqProductId`,
      label: `商品`,
      forSelect: {},
      form: {...defaultRegister},
    },

    {
      id: `aqPriceOptionId`,
      label: `価格`,
      form: {},
      forSelect: {
        dependenceColIds: ['aqProductId'],
        config: {
          select: {price: `number`},
          nameChanger: op => {
            const name = op ? `${op?.name} (${NumHandler.toPrice(op?.price)}円)` : ''
            return {...op, name}
          },
          where: props => {
            return {aqProductId: props.latestFormData[`aqProductId`] ?? 0}
          },
        },
      },
    },
    {
      id: `price`,
      label: `金額`,
      type: `number`,
      form: {
        ...defaultRegister,
        disabled: props => {
          return !!props.record.aqPriceOptionId
        },
      },
    },

    {id: `quantity`, label: `数量`, type: `number`, form: {...defaultRegister}},
    {id: `remarks`, label: `但し書き`, type: `textarea`, form: {}},
  ]
  if (showDate) {
    colSource.push({
      id: `date`,
      label: `購入日`,
      type: `date`,
      form: {
        descriptionNoteAfter: `*カート単位で変更`,
        ...defaultRegister,
      },
    })
    colSource.push({
      id: `paymentMethod`,
      label: `支払方法`,
      forSelect: {optionsOrOptionFetcher: AQ_CONST.PAYMENT_METHOD_LIST},
      form: {
        ...defaultRegister,
        descriptionNoteAfter: `*カート単位で変更`,
      },
    })
  }
  if (fromSaleList === false) {
    colSource.push({
      id: `setAsDefaultPrice`,
      label: `デフォルト価格に設定`,
      type: `boolean`,
      form: {defaultValue: true},
    })
  }
  const columns = new Fields(colSource).transposeColumns()

  const setPriceOptionOnBlur = props => {
    const selectedProductId = props.newlatestFormData.aqProductId
    const theProduct = aqProducts?.find(d => d.id === selectedProductId)

    if (props.name === 'aqProductId') {
      const theDefaultPriceOption = (aqCustomerPriceOption ?? []).find(d => {
        return d.aqProductId === theProduct?.id
      })

      const priceOptoinId = theDefaultPriceOption?.aqPriceOptionId
      if (priceOptoinId) {
        // if (!confirm(`デフォルト価格が設定されています。反映しますか？`)) return
        ReactHookForm.setValue(`aqPriceOptionId`, priceOptoinId)
      }
    }
  }

  const {
    BasicForm,
    latestFormData: ItemInput,
    ReactHookForm,
  } = useBasicFormProps({
    onFormItemBlur: setPriceOptionOnBlur,
    columns,
    formData,
  })

  useEffect(() => {
    const selectedAqPriceOptionId = ItemInput[`aqPriceOptionId`]

    if (selectedAqPriceOptionId) {
      const price =
        aqPriceOption.find(item => {
          return item.id === selectedAqPriceOptionId
        })?.price ?? 0

      ReactHookForm.setValue(`price`, price)
    }
  }, [ItemInput[`aqPriceOptionId`]])

  const selectedProduct = aqProducts?.find(d => d.id === ItemInput.aqProductId)

  const selectedPriceOption = selectedProduct?.AqPriceOption?.find(d => {
    return d.id === ItemInput.aqPriceOptionId
  })

  const filled = columns
    .flat()
    .filter(d => {
      return d.form?.register
    })
    .every(d => {
      const hasValue = ItemInput[d.id] !== undefined
      return hasValue
    })

  return (
    <C_Stack className={`gap-4`}>
      <BasicForm latestFormData={ItemInput}></BasicForm>

      <Center>
        <Button
          disabled={!filled}
          type={`button`}
          onClick={async () => {
            const {date, userId, quanity} = ItemInput
            upsertToCart({
              ...ItemInput,
              selectedProduct,
              selectedPriceOption,
            })
          }}
        >
          登録
        </Button>
      </Center>
    </C_Stack>
  )
}
