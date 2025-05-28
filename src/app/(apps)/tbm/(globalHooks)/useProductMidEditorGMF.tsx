import {Fields} from '@class/Fields/Fields'
import {Button} from '@components/styles/common-components/Button'
import {useGlobalModalForm} from '@components/utils/modal/useGlobalModalForm'
import useGlobal from '@hooks/globalHooks/useGlobal'
import useBasicFormProps from '@hooks/useBasicForm/useBasicFormProps'
import {atomKey} from '@hooks/useJotai'
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
