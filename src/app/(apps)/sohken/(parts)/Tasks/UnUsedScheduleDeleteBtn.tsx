import {deleteGenbaDayWithoutAnyResource} from '@app/(apps)/sohken/(parts)/Tasks/handleUpdateSchedule'
import {Button} from '@components/styles/common-components/Button'
import useMatchMutate from '@hooks/useMatchMutate'
import React from 'react'
import {toast} from 'react-toastify'

export default function UnUsedScheduleDeleteBtn({genba, router}) {
  const mutateAll = useMatchMutate()
  return (
    <Button
      className={`text-xs`}
      color={`red`}
      onClick={async () => {
        if (confirm(`人員、車両、タスクのいずれも未振当てのスケジュールを削除します。`)) {
          const res = await deleteGenbaDayWithoutAnyResource({genbaId: genba.id})
          if (res?.result?.count) {
            toast.success(`${res?.result?.count}件のスケジュールを削除しました。`)
          } else {
            toast.warn(`削除するスケジュールがありませんでした。`)
          }
        }
        mutateAll()
        router.refresh()
      }}
    >
      リソース未振当ての日付を削除
    </Button>
  )
}
