
import {PrismaModelNames} from '@cm/types/prisma-types'

import useGlobal from '@hooks/globalHooks/useGlobal'
import {atomKey} from '@hooks/useJotai'

import {useGlobalModalForm} from '@components/utils/modal/useGlobalModalForm'
import {Fields} from '@class/Fields/Fields'
import useBasicFormProps from '@hooks/useBasicForm/useBasicFormProps'
import {Button} from '@components/styles/common-components/Button'

export type shiftEditProps = {
  selectedData
  RelationalModel: PrismaModelNames
  GenbaDay
  baseModelName
} | null

export const useGenbaSearchModal = () => {
  const {router, getHref} = useGlobal()
  return useGlobalModalForm('genbaSearchShortCutModal' as atomKey, null, {
    mainJsx: ({GMF_OPEN, setGMF_OPEN, close}) => {
      const useGlobalProps = useGlobal()
      const {BasicForm, latestFormData} = useBasicFormProps({
        columns: new Fields([
          //
          {id: `genbaId`, label: `現場`, form: {}, forSelect: {}},
        ]).transposeColumns(),
      })
      return (
        <BasicForm
          {...{
            latestFormData,
            onSubmit: async data => {
              if (!data.genbaId) {
                return alert(`現場を選択してください`)
              }
              router.push(getHref(`/sohken/genba/${data.genbaId}`))
              close()
            },
          }}
        >
          <Button>現場詳細画面へ移動</Button>
        </BasicForm>
      )

      return (
        <div>
          <p>lkajslgsa</p>
          ljglkasjgkas
        </div>
      )
    },
  })
}
