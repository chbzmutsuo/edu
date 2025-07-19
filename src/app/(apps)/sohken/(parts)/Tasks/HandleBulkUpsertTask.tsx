import {doTransaction} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {Prisma} from '@prisma/client'

export type taskObj = {
  checked: boolean
  name: string
  color: string
  from: string
  to: string
  requiredNinku: number
}

export const handleCopyTask = async (props: {selectedTaskArray: taskObj[]; activeTasks; Genba; handleClose; router}) => {
  const {selectedTaskArray, activeTasks, Genba, handleClose, router} = props

  const transactionQueryList: transactionQuery[] = []

  selectedTaskArray.forEach(task => {
    const data = {
      name: task.name,
      color: task.color,
      from: task.from,
      to: task.to,
      requiredNinku: task.requiredNinku,
      genbaId: Genba.id,
    }

    const queryObject: Prisma.GenbaTaskUpsertArgs = {
      where: {
        unique_name_genbaId: {
          name: task.name,
          genbaId: Genba.id,
        },
      },
      create: data,
      update: data,
    }
    transactionQueryList.push({model: `genbaTask`, method: `upsert`, queryObject})
  })

  // // 各日付について、タスクが振られているかどうかを確認する
  // GenbaDay.forEach(day => {
  //   const CurrentTask = day.GenbaDayTaskMidTable.map(v => v.GenbaTask)
  //   selectedTaskArray.forEach(task => {
  //     const isTaskAssigned = CurrentTask.find(v => v.name === task.name)

  //     if (isTaskAssigned) {
  //       const args: Prisma.GenbaDayTaskMidTableDeleteArgs = {
  //         where: {
  //           unique_genbaDayId_genbaTaskId: {
  //             genbaDayId: day.id,
  //             genbaTaskId: isTaskAssigned.id,
  //           },
  //         },
  //       }

  //       transactionQueryList.push({model: `genbaDay`, method: `update`, queryObject: args})
  //     } else {
  //       //
  //     }
  //   })

  //   // const isTaskAssigned = selectedTaskArray.some(task => CurrentTask.some(v => v.name === task.name))
  // })

  const res = await doTransaction({transactionQueryList})

  handleClose(null)
  router.refresh()
}

export const DEFAULT: any = [
  {
    id: 1,
    createdAt: '2024-09-17T22:25:59.036Z',
    updatedAt: '2024-10-02T00:49:44.991Z',
    sortOrder: 0,
    name: 'スリーブ',
    color: '#e90c0c',
    checked: true,
  },
  {
    id: 4,
    createdAt: '2024-10-15T12:53:12.422Z',
    updatedAt: '2024-10-15T13:26:22.646Z',
    sortOrder: 0,
    name: '外部配管',
    color: '#19cc7f',
    from: '2024-09-26T00:00:00.000Z',
    to: '2024-09-26T00:00:00.000Z',
    requiredNinku: 5,
    genbaId: 3,
    checked: true,
  },
  {
    id: 1,
    createdAt: '2024-10-15T12:53:12.422Z',
    updatedAt: '2024-10-15T13:48:00.000Z',
    sortOrder: 0,
    name: '床下さや',
    color: '#ff9900',
    from: '2024-09-30T00:00:00.000Z',
    to: '2024-09-30T00:00:00.000Z',
    requiredNinku: 3,
    genbaId: 3,
    checked: true,
  },
]
