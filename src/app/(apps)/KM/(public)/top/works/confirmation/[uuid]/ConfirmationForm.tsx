'use client'
import {Fields} from '@cm/class/Fields/Fields'

import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'

import {doStandardPrisma} from '@lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {knockEmailApi} from '@lib/methods/knockEmailApi'
import {Button} from '@components/styles/common-components/Button'
import useGlobal from '@hooks/globalHooks/useGlobal'
import {toast} from 'react-toastify'

export const ConfirmationForm = ({work}) => {
  const {router, toggleLoad} = useGlobal()
  const columns = Fields.transposeColumns([
    {
      id: 'type',
      label: '許可区分',
      forSelect: {optionsOrOptionFetcher: ['許可', '差し戻し']},
      form: {register: {required: '必須です'}},
    },
    {
      id: 'correctionRequest',
      label: '修正内容',
      type: 'textarea',
      form: {
        style: {width: 400, maxWidth: '90vw', height: 200},
        register: {required: ''},
      },
    },
  ])
  const {BasicForm, latestFormData} = useBasicFormProps({columns})

  return (
    <BasicForm
      latestFormData={latestFormData}
      wrapperClass="col-stack items-start gap-10"
      onSubmit={async data => {
        const {type, correctionRequest} = data

        toggleLoad(async () => {
          const isPublic = type === '許可'
          await doStandardPrisma('kaizenWork', 'update', {
            where: {id: work.id ?? 0},
            data: {isPublic, correctionRequest},
          })

          await knockEmailApi({
            subject: `改善事例 申請承認 【${work.title}】 【${isPublic}】`,
            text: `【${isPublic}】 ${work.title}の申請がなされました。\n${correctionRequest}`,
            to: ['kaizen.mania.engineering@gmail.com'],
          })

          toast.success('送信しました。HPトップへ移動します。')
          router.push('/KM/top')
        })
      }}
    >
      <Button>送信</Button>
    </BasicForm>
  )
}
