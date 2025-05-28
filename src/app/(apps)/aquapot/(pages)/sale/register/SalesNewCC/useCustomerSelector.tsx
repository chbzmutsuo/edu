'use client'

import {Fields} from '@class/Fields/Fields'

import useBasicFormProps from '@hooks/useBasicForm/useBasicFormProps'

import {useEffect} from 'react'
import {doStandardPrisma} from '@lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

import {defaultRegister} from '@class/builders/ColBuilderVariables'
import {getMidnight} from '@class/Days/date-utils/calculations'
import {AQ_CONST} from '@app/(apps)/aquapot/(constants)/options'
import {aqCustomerForSelectConfig} from '@app/(apps)/aquapot/(class)/colBuilder/aqCustomer'
export const useCustomerSelector = ({cartUser, setcartUser, maxWidth}) => {
  const colWidth = maxWidth - 20
  const columns = new Fields([
    {
      id: `date`,
      label: `日付`,
      type: `date`,
      form: {...defaultRegister, style: {width: colWidth}, defaultValue: getMidnight()},
    },
    {
      id: `aqCustomerId`,
      label: `お客様（会社名/役職/氏名）`,
      forSelect: {
        config: aqCustomerForSelectConfig,
      },
      form: {...defaultRegister, style: {width: colWidth}},
    },
    {
      id: `paymentMethod`,
      label: `支払方法`,
      forSelect: {optionsOrOptionFetcher: AQ_CONST.PAYMENT_METHOD_LIST},
      form: {...defaultRegister, style: {width: colWidth}},
    },
  ]).transposeColumns()

  const {BasicForm, latestFormData, ReactHookForm} = useBasicFormProps({
    onFormItemBlur: props => {
      setcartUser(props.newlatestFormData)
    },
    columns,
    formData: cartUser ?? {},
  })

  useEffect(() => {
    const setDefaultPaymentMethod = async () => {
      const {result: theCustomer} = await doStandardPrisma(`aqCustomer`, `findUnique`, {
        where: {id: latestFormData.aqCustomerId ?? 0},
      })

      ReactHookForm.setValue(`paymentMethod`, theCustomer?.defaultPaymentMethod)
    }
    setDefaultPaymentMethod()
  }, [latestFormData.aqCustomerId])

  return {
    ReactHookForm,
    latestFormData,
    Form: BasicForm,
  }
}
