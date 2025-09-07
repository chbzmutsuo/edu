import {Fields} from '@cm/class/Fields/Fields'
import {goBackAdoptor} from '@app/(apps)/tbm/(builders)/ColBuilders/TbmOperationGroupColBuilder'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import React from 'react'
import {FormProps} from '@app/(apps)/tbm/(pages)/tbmOperationGroupCreate/FormList/formList'
import {Button} from '@cm/components/styles/common-components/Button'

export default function GoBack(props: FormProps) {
  const {userInput, type, labelAffix} = props
  const data = userInput[type ?? '']

  const {toggleLoad, session} = useGlobal()
  const columns = new Fields(goBackAdoptor({type, labelAffix}).plain)
    .customAttributes(({col}) => ({...col, id: col.id.replace(`${type}_`, '')}))
    .transposeColumns()

  const {BasicForm, latestFormData} = useBasicFormProps({
    formData: data ?? {},
    columns,
  })
  return (
    <div>
      <BasicForm
        latestFormData={latestFormData}
        onSubmit={async data => {
          const tbmOperationGroupId = userInput[`base`]?.id
          const {tbmRouteGroupId, date, distanceKm} = data

          const payload: any = {tbmOperationGroupId, tbmRouteGroupId, date, distanceKm, type: type as string}

          toggleLoad(async () => {
            // const res = await doStandardPrisma(`tbmOperation`, `upsert`, {
            //   where: {id: data?.id ?? 0},
            //   create: payload,
            //   update: payload,
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
