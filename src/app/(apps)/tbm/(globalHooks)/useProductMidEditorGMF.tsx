import {Fields} from '@cm/class/Fields/Fields'
import {Button} from '@cm/components/styles/common-components/Button'
import {useGlobalModalForm} from '@cm/components/utils/modal/useGlobalModalForm'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import {atomKey} from '@cm/hooks/useJotai'
import React from 'react'

export default function useProductMidEditor() {
  type atomTyep = {
    TbmRouteGroup
  }

  return useGlobalModalForm<atomTyep>(`useProductMidEditor` as atomKey, null, {
    mainJsx: ({GMF_OPEN, setGMF_OPEN}) => {
      const useGlobalProps = useGlobal()
      const {TbmRouteGroup} = GMF_OPEN ?? {}

      const {BasicForm, latestFormData} = useBasicFormProps({
        columns: new Fields([
          //
          {id: `tbmCustomerId`, label: `顧客`, form: {}, forSelect: {}},
          {id: `tbmProductId`, label: `商品`, form: {}, forSelect: {}},
        ]).transposeColumns(),
      })
      return (
        <BasicForm
          {...{
            latestFormData,
            onSubmit: async data => {
              const {tbmCustomerId, tbmProductId} = data
            },
          }}
        >
          <Button>登録</Button>
        </BasicForm>
      )
    },
  })
}
