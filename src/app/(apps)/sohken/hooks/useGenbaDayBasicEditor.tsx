import {PrismaModelNames} from '@cm/types/prisma-types'

import {atomTypes} from '@hooks/useJotai'

import {useGlobalModalForm} from '@components/utils/modal/useGlobalModalForm'
import {Fields} from '@class/Fields/Fields'
import useBasicFormProps from '@hooks/useBasicForm/useBasicFormProps'
import {Button} from '@components/styles/common-components/Button'
import {doStandardPrisma} from '@lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import useGlobal from '@hooks/globalHooks/useGlobal'

export type shiftEditProps = {
  selectedData
  RelationalModel: PrismaModelNames
  GenbaDay
  baseModelName
} | null

export const useGenbaDayBasicEditor = () => {
  return useGlobalModalForm<atomTypes[`GenbaDayBasicEditorGMF`] | null>(`GenbaDayBasicEditorGMF`, null, {
    mainJsx: ({GMF_OPEN, setGMF_OPEN, close}) => {
      const {toggleLoad} = useGlobal()
      const {BasicForm, latestFormData} = useBasicFormProps({
        formData: GMF_OPEN?.GenbaDay,
        columns: new Fields([
          {id: 'remarks', label: '連絡事項・備考', form: {style: {width: 400}}, type: `textarea`},
          {id: 'subTask', label: 'その他', form: {style: {width: 400}}, type: `textarea`},
        ]).transposeColumns(),
      })
      return (
        <div style={{zIndex: 9999}}>
          <BasicForm
            {...{
              latestFormData,
              onSubmit: async (data: any) => {
                toggleLoad(async item => {
                  await doStandardPrisma(`genbaDay`, `update`, {
                    where: {id: GMF_OPEN?.GenbaDay.id},
                    data,
                  })
                })
                close()
              },
            }}
          >
            <Button>確定</Button>
          </BasicForm>
        </div>
      )
      return <></>
    },
  })
}
