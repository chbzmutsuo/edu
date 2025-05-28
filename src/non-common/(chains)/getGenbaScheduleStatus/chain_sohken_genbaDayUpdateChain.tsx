'use server'

import {doTransaction, transactionQuery} from '@lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {calcGenbaDayStatus} from 'src/non-common/(chains)/getGenbaScheduleStatus/calcGenbaDayStatus'

export type genbaStatusType = '完了' | '不要' | '済' | '未完了'

export type GenbaDayProps = {
  id: any
  Genba: {
    GenbaDay: Array<{
      GenbaDayTaskMidTable: Array<{genbaTaskId: number}>
      finished: boolean
      date: Date
    }>
  }
  status: genbaStatusType
  GenbaDayTaskMidTable: Array<{genbaTaskId: number}>
  date: Date
  finished: boolean
}
export type groupByTaskType = {[key: string]: ({taskName: string} & GenbaDayProps)[]}

export const chain_sohken_genbaDayUpdateChain = async ({genbaId}) => {
  const allGenbaDay = await calcGenbaDayStatus({genbaId})

  const groupByTask = allGenbaDay.reduce((acc, curr) => {
    curr.GenbaDayTaskMidTable.forEach(mid => {
      const taskName = mid.GenbaTask.name
      const taskId = [mid.genbaTaskId, taskName].join(`_`)

      if (!acc[taskId]) {
        acc[taskId] = []
      }
      acc[taskId].push({taskName, ...curr})
    })
    return acc
  }, {})

  const transactionQueryList: transactionQuery[] = []

  // タスクごとにループ
  Object.keys(groupByTask).forEach(taskId => {
    const genbaDays = groupByTask[taskId]

    genbaDays.forEach(GenbaDay => {
      const {isLastFullfilledDay, status, active, ninkuFullfilled, allAssignedNinkuTillThisDay, allRequiredNinku} = GenbaDay

      transactionQueryList.push({
        model: `genbaDay`,
        method: `update`,
        queryObject: {
          where: {id: GenbaDay.id},
          data: {
            isLastFullfilledDay,
            status,
            active,
            ninkuFullfilled,
            allAssignedNinkuTillThisDay,
            allRequiredNinku,
          },
        },
      })
    })
  })

  const res = await doTransaction({transactionQueryList})
  return res
}
