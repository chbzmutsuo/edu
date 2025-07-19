import {ColBuilder} from '@app/(apps)/sohken/class/ColBuilder'
import {PrismaModelNames} from '@cm/types/prisma-types'
import {Button} from '@cm/components/styles/common-components/Button'
import {R_Stack} from '@cm/components/styles/common-components/common-components'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import {generalDoStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {toastByResult} from '@cm/lib/ui/notifications'

import React from 'react'

export default function SingleAddForm({RelationalModel, GenbaDay, selectedData, useGlobalProps, handleClose}) {
  const {toggleLoad} = useGlobalProps

  const handleDelete = async () => {
    if (!selectedData) return

    if (confirm(`削除しますか？`)) {
      toggleLoad(
        async () => {
          const id = selectedData?.id

          const res = await generalDoStandardPrisma(RelationalModel as PrismaModelNames, `delete`, {
            where: {id},
          })

          handleClose()
          toastByResult(res)
        },
        {refresh: true}
      )
    }
  }

  const handleSubmit = async data => {
    const payload = {
      ...data,
      genbaDayId: GenbaDay.id,
      genbaId: GenbaDay.genbaId,
    }

    toggleLoad(
      async () => {
        const res = await generalDoStandardPrisma(RelationalModel as PrismaModelNames, `upsert`, {
          where: {id: selectedData?.id ?? 0},
          ...payload,
        })

        handleClose()
        toastByResult(res)
      },
      {refresh: true}
    )
  }
  const {BasicForm, latestFormData} = useBasicFormProps({
    columns: ColBuilder[RelationalModel]({useGlobalProps}),
    formData: {genbaId: GenbaDay.genbaId, ...selectedData},
  })

  return (
    <div>
      <BasicForm onSubmit={handleSubmit} latestFormData={latestFormData}>
        <R_Stack>
          {selectedData && <Button {...{type: `button`, color: `red`, onClick: handleDelete}}>削除</Button>}

          <Button>登録</Button>
        </R_Stack>
      </BasicForm>
    </div>
  )
}
