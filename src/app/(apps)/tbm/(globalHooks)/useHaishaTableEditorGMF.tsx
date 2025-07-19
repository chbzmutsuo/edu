import {ColBuilder} from '@app/(apps)/tbm/(builders)/ColBuilders/ColBuilder'

import {requestResultType} from '@cm/types/types'
import {Button} from '@cm/components/styles/common-components/Button'
import {R_Stack} from '@cm/components/styles/common-components/common-components'
import {useGlobalModalForm} from '@cm/components/utils/modal/useGlobalModalForm'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import {atomKey} from '@cm/hooks/useJotai'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {toastByResult} from '@cm/lib/ui/notifications'
import {Prisma, TbmDriveSchedule, TbmRouteGroup, User} from '@prisma/client'

import React from 'react'

type formData = {
  id: number
  date: Date
  userId: number
  tbmVehicleId: number
  tbmRouteGroupId: number
  tbmBaseId: number
}
const useHaishaTableEditorGMF = (props: {
  afterUpdate?: (props: {res: requestResultType; tbmDriveSchedule: TbmDriveSchedule}) => void
  afterDelete?: (props: {res: requestResultType; tbmDriveSchedule: TbmDriveSchedule}) => void
}) => {
  const {afterUpdate = item => null, afterDelete = item => null} = props

  const atomKey = `haishaTableEditorGMF` as atomKey

  return useGlobalModalForm<{
    user: User
    date: Date
    tbmDriveSchedule?: any
    tbmBase?: any
    tbmRouteGroup: TbmRouteGroup
  }>(atomKey, null, {
    mainJsx: ({GMF_OPEN, setGMF_OPEN}) => {
      const useGlobalProps = useGlobal()
      const {user, date, tbmDriveSchedule, tbmBase, tbmRouteGroup} = GMF_OPEN ?? {}

      const {BasicForm, latestFormData} = useBasicFormProps({
        columns: ColBuilder.tbmDriveSchedule({
          useGlobalProps,
          ColBuilderExtraProps: {
            tbmBase,
            tbmDriveSchedule: tbmDriveSchedule ?? {
              date,
              userId: user?.id,
              tbmRouteGroupId: tbmRouteGroup?.id,
            },
          },
        }),
      })
      return (
        <BasicForm
          {...{
            latestFormData,
            onSubmit: async (data: formData) => {
              const queryObject: Prisma.TbmDriveScheduleUpsertArgs = {
                where: {id: tbmDriveSchedule?.id ?? 0},
                create: data,
                update: data,
                include: {
                  TbmVehicle: {
                    include: {OdometerInput: {}},
                  },
                  TbmRouteGroup: {},
                },
              }

              const res = await doStandardPrisma(`tbmDriveSchedule`, `upsert`, queryObject)
              toastByResult(res)

              afterUpdate?.({res, tbmDriveSchedule})
              // 配車テーブルの時の処理

              setGMF_OPEN(null)
              //
            },
          }}
        >
          <R_Stack className={`w-full justify-between gap-6`}>
            <Button
              color={`red`}
              type={`button`}
              {...{
                onClick: async () => {
                  if (confirm(`削除しますか？`)) {
                    const res = await doStandardPrisma(`tbmDriveSchedule`, `delete`, {
                      where: {id: tbmDriveSchedule?.id ?? 0},
                    })
                    toastByResult(res)

                    setGMF_OPEN(null)
                    afterDelete?.({res, tbmDriveSchedule})
                  }
                },
              }}
            >
              削除
            </Button>
            <Button>設定</Button>
          </R_Stack>
        </BasicForm>
      )
    },
  })
}

export default useHaishaTableEditorGMF
