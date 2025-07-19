import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import {Fields} from '@cm/class/Fields/Fields'
import React from 'react'
import {Approval, PurchaseRequest} from '@prisma/client'
import {CODE_MASTER} from '@app/(apps)/shinsei/(constants)/CODE_MASTER'
import {Button} from '@cm/components/styles/common-components/Button'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {TextRed} from '@cm/components/styles/common-components/Alert'
import {C_Stack} from '@cm/components/styles/common-components/common-components'
import {isDev} from '@cm/lib/methods/common'
import {toastByResult} from '@cm/lib/ui/notifications'

export default function PurchaseApproveModal(props: {
  Approval: Approval
  request: PurchaseRequest
  fetchRequests: () => void
  handleClose: () => void
}) {
  const {Approval, request, fetchRequests, handleClose} = props

  const kaitoZumi = Approval?.status !== '未回答'
  const {BasicForm, latestFormData} = useBasicFormProps({
    formData: Approval,
    columns: new Fields([
      //
      {
        id: `status`,
        label: `ステータス`,
        form: {},
        forSelect: {optionsOrOptionFetcher: CODE_MASTER.APPROVAL_STATUS_OPTIONS},
      },
      {
        id: `comment`,
        label: `コメント`,
        form: {style: {minWidth: 400, minHeight: 200}},
        type: 'textarea',
      },
    ]).transposeColumns(),
  })

  const doUpdateStatus = async data => {
    const res = await doStandardPrisma(`approval`, `update`, {
      where: {id: Approval.id},
      data: {status: data.status, comment: data.comment},
    })
    toastByResult(res)
    await fetchRequests()
    handleClose()

    return res
  }
  return (
    <div>
      <C_Stack>
        {kaitoZumi && <TextRed>すでに回答済みです。</TextRed>}
        <div className={isDev ? '' : kaitoZumi ? 'pointer-events-none opacity-80' : ''}>
          <BasicForm
            {...{
              latestFormData,
              onSubmit: async data => {
                const {status, comment} = data
                if (status === '未回答') {
                  return alert('「未回答」は入力できません。')
                }

                const {result: userRole} = await doStandardPrisma(`userRole`, `findMany`, {
                  where: {userId: Approval.userId},
                  include: {RoleMaster: {}},
                })

                const message = '一度変更したデータはもとに戻せません。よろしいですか？'

                if (confirm(message)) {
                  await doUpdateStatus(data)
                }
              },
            }}
          >
            <Button>確定</Button>
          </BasicForm>
        </div>
      </C_Stack>
    </div>
  )
}
