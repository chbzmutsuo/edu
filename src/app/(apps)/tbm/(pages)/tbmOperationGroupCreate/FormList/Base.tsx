import {Fields} from '@cm/class/Fields/Fields'
import {getTbmOperationGroupBaseCols} from '@app/(apps)/tbm/(builders)/ColBuilders/TbmOperationGroupColBuilder'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import React from 'react'

import {Button} from '@cm/components/styles/common-components/Button'
import {FormProps} from '@app/(apps)/tbm/(pages)/tbmOperationGroupCreate/FormList/formList'

const test = true
export default function Base(props: FormProps) {
  const {userInput, type, labelAffix} = props
  const data = userInput[type ?? '']

  const {toggleLoad, session} = useGlobal()
  const {BasicForm, latestFormData} = useBasicFormProps({
    formData: data ?? {},
    columns: new Fields(getTbmOperationGroupBaseCols({session})).transposeColumns(),
  })
  return (
    <div>
      <BasicForm
        latestFormData={latestFormData}
        onSubmit={async data => {
          toggleLoad(async () => {
            // const res = await doStandardPrisma(`tbmOperationGroup`, `upsert`, {
            //   where: {id: data?.id ?? 0},
            //   ...createUpdate(data as Prisma.TbmOperationGroupCreateInput),
            // })
            // toastByResult(res)
          })

          return
        }}
      >
        <Button>決定</Button>
      </BasicForm>
    </div>
  )
}
