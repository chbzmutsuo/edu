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
import {sendEmailWrapper} from 'src/non-common/(chains)/shinsei/sendEmailWrapper'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {toastByResult} from '@cm/lib/ui/notifications'
import {toUtc} from '@cm/class/Days/date-utils/calculations'

export default function PurchaseApproveModal(props: {
  Approval: Approval
  request: PurchaseRequest
  fetchRequests: () => void
  handleClose: () => void
}) {
  const {toggleLoad} = useGlobal()

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

                toggleLoad(async () => {
                  const {result: userRole} = await doStandardPrisma(`userRole`, `findMany`, {
                    where: {userId: Approval.userId},
                    include: {RoleMaster: {}},
                  })

                  const isHacchusha = userRole.find(userRole => userRole.RoleMaster.name === '発注担当者')

                  if (status !== '承認') {
                    if (confirm('一度変更したデータはもとに戻せません。よろしいですか？')) await doUpdateStatus(data)
                  } else {
                    if (isHacchusha) {
                      //発注者処理

                      const {result: requestData} = await doStandardPrisma(`purchaseRequest`, `findUnique`, {
                        where: {id: request.id},
                        include: {Product: {include: {ShiireSaki: true}}},
                      })
                      const shiiresaki = requestData?.Product?.ShiireSaki
                      if (confirm(`発注を確定すると、【${shiiresaki?.name}】へ自動でメール通知が実施されます。`)) {
                        await sendEmailToShiireSaki(request.id)
                        await doUpdateStatus({...data})
                      }
                    } else {
                      //承認者処理
                      if (confirm('一度変更したデータはもとに戻せません。よろしいですか？')) {
                        await doUpdateStatus(data)
                      }
                    }
                  }
                })
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

export const sendEmailToShiireSaki = async (requestId: number) => {
  let message = ''
  const {result: requestData} = await doStandardPrisma(`purchaseRequest`, `findUnique`, {
    where: {id: requestId},
    include: {Product: {include: {ShiireSaki: true}}},
  })
  const shiiresaki = requestData?.Product?.ShiireSaki
  if (!shiiresaki?.email || !shiiresaki?.name) {
    message = '仕入れ先のメールアドレスまたは名称が見つからないため、処理を実行できません。'
    return alert(message)
  }

  if (requestData.emailSentAt) {
    message = 'すでにメール送信が実施されています。'
    return alert(message)
  }

  const subject = `発注のご連絡（石田精工株式会社_自動）`
  const text = [
    `${shiiresaki.name}御中`,
    ``,
    `いつもお世話になっております。石田精工株式会社です。`,
    ``,
    `下記の通り注文致しますので、ご確認の程宜しくお願い申し上げます。`,
    ``,
    `・品番【${requestData.Product.code}】`,
    `・品名【${requestData.Product.name}】`,
    `・数量【${requestData.quantity}】`,
    ``,
    `※本メールは送信専用となります。 `,
    `ご返信の際は下記記載のアドレス、または弊社担当までお願いいたします。`,
    ``,
    `****************************************`,
    ``,
    `石田精工株式会社`,
    `TEL：072-962-9847`,
    `MAIL：info@ishidaseiko.com`,
    ``,
    `****************************************`,
  ].join(`\n`)

  await sendEmailWrapper({to: [shiiresaki.email], subject, text})

  await doStandardPrisma(`purchaseRequest`, `update`, {
    where: {id: requestId},
    data: {emailSentAt: toUtc(new Date())},
  })
}
