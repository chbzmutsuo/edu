'use client'

import {ViewParamBuilderProps} from '@components/DataLogic/TFs/PropAdjustor/usePropAdjustorProps'
import {doStandardPrisma} from '@lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {toast} from 'react-toastify'

export class ViewParamBuilder {
  static aqCustomer: ViewParamBuilderProps = props => {
    const {router} = props.ClientProps2.useGlobalProps
    return {
      myForm: {
        create: {
          finalizeUpdate: props => {
            if (confirm(`更新が完了しました。そのまま個別ページに移動しますか？`)) {
              router.push(`/aquapot/aqCustomer/${props.res.result.id}`)
            }

            return props.res
          },
        },
      },
    }
  }
  static aqInventoryRegister: ViewParamBuilderProps = props => {
    const {router} = props.ClientProps2.useGlobalProps
    return {
      myForm: {
        create: {
          finalizeUpdate: async props => {
            const customerId = props.res.result?.aqCustomerId
            const productId = props.res.result?.aqProductId

            const res = await doStandardPrisma(`aqProduct`, `update`, {
              where: {id: productId},
              data: {aqDefaultShiireAqCustomerId: customerId},
            })

            toast.success(`仕入れ先を更新しました。`)

            // return props.res
          },
        },
      },
    }
  }
}
