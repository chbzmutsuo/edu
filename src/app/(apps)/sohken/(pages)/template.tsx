'use client'

import CalenderRefresher from '@app/(apps)/sohken/(pages)/genbaDay/CalenderRefresher'
import {useGenbaDayBasicEditor} from '@app/(apps)/sohken/hooks/useGenbaDayBasicEditor'
import {useGenbaDayCardEditorModalGMF} from '@app/(apps)/sohken/hooks/useGenbaDayCardEditorModalGMF'
import {useGenbaDetailModal} from '@app/(apps)/sohken/hooks/useGenbaDetailModal'
import {useGenbaSearchModal} from '@app/(apps)/sohken/hooks/useGenbaSearchModal'
import {useShiftEditFormModal} from '@app/(apps)/sohken/hooks/useShiftEditFormModal'
import {Button} from '@components/styles/common-components/Button'
import {R_Stack} from '@components/styles/common-components/common-components'
import useGlobal from '@hooks/globalHooks/useGlobal'
import {useGlobalShortcut} from '@hooks/useGlobalShortcut'
import {sleep} from '@lib/methods/common'
import {doStandardPrisma} from '@lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

import React from 'react'
import {toast} from 'react-toastify'
import {chain_sohken_genbaDayUpdateChain} from 'src/non-common/(chains)/getGenbaScheduleStatus/chain_sohken_genbaDayUpdateChain'

export default function template({children}) {
  const {router, getHref} = useGlobal()
  const GenbaDayCardEditModal_HK = useGenbaDayCardEditorModalGMF()
  const ShiftEditFormModal_HK = useShiftEditFormModal()
  const GenbaDayBasicEditor_HK = useGenbaDayBasicEditor()
  const GenbaDetailModal_HK = useGenbaDetailModal()
  const GenbaSearchModal_HK = useGenbaSearchModal()

  const {accessScopes, toggleLoad} = useGlobal()
  const {admin} = accessScopes()
  useGlobalShortcut({key: 'b', ctrlKey: true}, async () => {
    router.push(getHref(`/sohken/calendar`))
    await sleep(500)
    toast.info(`日付選択ショートカット`)
  })
  useGlobalShortcut({key: 's', ctrlKey: true}, async () => {
    toast.info(`現場一覧検索ショートカット`)
    GenbaSearchModal_HK.setGMF_OPEN(true)
  })
  return (
    <div>
      <GenbaDayCardEditModal_HK.Modal />
      <ShiftEditFormModal_HK.Modal />
      <GenbaDayBasicEditor_HK.Modal />
      <GenbaDetailModal_HK.Modal />
      <GenbaSearchModal_HK.Modal />
      {children}
      {admin && (
        <R_Stack className={` sticky bottom-1 px-2`}>
          <CalenderRefresher />
          {admin && (
            <Button
              onClick={async () => {
                if (!confirm(`リセットしますか？`)) {
                  return
                }
                toggleLoad(async () => {
                  const {result: genbaList} = await doStandardPrisma(`genba`, 'findMany', {})
                  for (const genba of genbaList) {
                    const res = await doStandardPrisma(`genbaDay`, `updateMany`, {
                      where: {genbaId: genba.id},
                      data: {
                        finished: false,
                        active: true,
                        status: null,
                      },
                    })
                    await chain_sohken_genbaDayUpdateChain({genbaId: genba.id})
                    await sleep(300)
                  }
                })
              }}
            >
              PLAY
            </Button>
          )}
        </R_Stack>
      )}
    </div>
  )
}
