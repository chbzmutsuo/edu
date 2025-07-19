import {defaultRegister} from '@cm/class/builders/ColBuilderVariables'
import {Fields} from '@cm/class/Fields/Fields'
import {Button} from '@cm/components/styles/common-components/Button'
import {R_Stack} from '@cm/components/styles/common-components/common-components'

import {useGlobalModalForm} from '@cm/components/utils/modal/useGlobalModalForm'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import useDoStandardPrisma from '@cm/hooks/useDoStandardPrisma'
import {atomTypes} from '@cm/hooks/useJotai'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {toastByResult} from '@cm/lib/ui/notifications'
import {GenbaTask, Prisma} from '@prisma/client'
import {toast} from 'react-toastify'

import {chain_sohken_genbaDayUpdateChain} from 'src/non-common/(chains)/getGenbaScheduleStatus/chain_sohken_genbaDayUpdateChain'

export const useGenbaDayCardEditorModalGMF = () => {
  return useGlobalModalForm<atomTypes[`GenbaDayCardEditorModalGMF`]>(`GenbaDayCardEditorModalGMF`, null, {
    mainJsx: props => {
      const close = props.close
      const {router, toggleLoad} = useGlobal()

      const {taskMidTable, genbaId, genbaDayId} = props.GMF_OPEN
      const {data: GenbaTask = []} = useDoStandardPrisma(`genbaTask`, `findMany`, {
        where: {genbaId: genbaId ?? 0},
        orderBy: [{sortOrder: 'asc'}, {id: 'asc'}],
      })

      const {BasicForm, latestFormData} = useBasicFormProps({
        formData: {
          genbaTaskId: Number(taskMidTable?.genbaTaskId),
          requiredNinku: Number(taskMidTable?.GenbaTask?.requiredNinku),
        },
        columns: new Fields([
          {
            id: 'genbaTaskId',
            label: 'タスク',
            form: {...defaultRegister},
            forSelect: {
              optionsOrOptionFetcher: GenbaTask.map((d: GenbaTask) => {
                return {value: d.name, id: d.id, color: d.color}
              }),
            },
          },
          {
            id: 'requiredNinku',
            label: '人工',
            type: `number`,
            inputProps: {step: 0.1},

            form: {},
          },
        ]).transposeColumns(),
      })

      const onSubmit = async data => {
        const genbaTaskId = Number(data.genbaTaskId)
        const args: Prisma.GenbaDayTaskMidTableUpsertArgs = {
          where: {id: taskMidTable?.id ?? 0},
          create: {genbaTaskId, genbaDayId},
          update: {
            genbaTaskId,
            genbaDayId,
          },
        }
        const {result: theTask} = await doStandardPrisma(`genbaTask`, `findUnique`, {where: {id: genbaTaskId}})

        if (
          data.requiredNinku !== theTask.requiredNinku &&
          !confirm(`既存の「${theTask.name}」の人工と異なる人工が設定されています。上書きしてもよろしいですか？`)
        ) {
          toast.warn(`処理を中止しました。`)
          return
        }
        toggleLoad(async () => {
          const res = await doStandardPrisma(`genbaDayTaskMidTable`, `upsert`, args)

          await doStandardPrisma(`genbaTask`, `update`, {
            where: {id: genbaTaskId},
            data: {
              requiredNinku: Number(data.requiredNinku),
            },
          })

          await chain_sohken_genbaDayUpdateChain({genbaId})
          toastByResult(res)

          router.refresh()
          close()
        })
      }
      return (
        <div>
          <BasicForm {...{onSubmit, latestFormData}}>
            <R_Stack className={` justify-between gap-4 `}>
              <Button
                color={`red`}
                type={`button`}
                onClick={async () => {
                  if (!confirm('削除しますか？')) return

                  toggleLoad(async () => {
                    await doStandardPrisma(`genbaDayTaskMidTable`, `delete`, {
                      where: {
                        id: taskMidTable.id,
                      },
                    })

                    await chain_sohken_genbaDayUpdateChain({genbaId})
                  })
                  close()
                }}
              >
                削除
              </Button>
              <Button>確定</Button>
            </R_Stack>
          </BasicForm>
        </div>
      )
    },
  })
}
