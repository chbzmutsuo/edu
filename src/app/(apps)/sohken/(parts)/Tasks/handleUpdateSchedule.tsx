import {Days} from '@cm/class/Days/Days'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {doTransaction, transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'

import {Prisma} from '@prisma/client'
type genbaTaskByDate = {
  date: string
  genbaId: number
  genbaTaskId: number
}

export async function handleUpdateSchedule({genbaTask}) {
  if (!genbaTask.from && !genbaTask.to) {
    return
  }

  const {from, to} = genbaTask

  const days = to ? [...Days.day.getDaysBetweenDates(from, to)] : [from]

  const newGenbaTaskListByDate: genbaTaskByDate[] = days.map(date => {
    return {date, genbaId: genbaTask.genbaId, genbaTaskId: genbaTask.id}
  })

  await createGenbaDaysBetween({genbaTask, newGenbaTaskListByDate})

  const {result: genbaDayList} = await doStandardPrisma(`genbaDay`, `findMany`, {
    where: {genbaId: genbaTask.genbaId},
    include: {
      GenbaDayTaskMidTable: {
        include: {
          GenbaDay: {},
          GenbaTask: true,
        },
      },
    },
  })

  const attachedRes = await attach({newGenbaTaskListByDate, genbaDayList})

  const detachedRes = await detach({genbaTask, genbaDayList, newGenbaTaskListByDate})
  return {}
}

//分離
const detach = async ({genbaTask, genbaDayList, newGenbaTaskListByDate}) => {
  const genbaDayIdToDetach = genbaDayList
    .filter(v => {
      const isTaskAssigned = newGenbaTaskListByDate.find(v2 => {
        const hitByDate = Days.validate.isSameDate(v.date, v2.date)
        const hitByTaskkId = v2.genbaTaskId === genbaTask.id
        return hitByDate && hitByTaskkId
      })
      return !isTaskAssigned
    })
    .map(v => v.id)

  const allMidTable = genbaDayList.map(v => v.GenbaDayTaskMidTable).flat()

  // このタスクに関連する中間テーブルのみを抽出
  const midTableForThisTask = allMidTable.filter(v => v.GenbaTask.id === genbaTask.id)

  // このタスクに関連する中間テーブルのうち、日付が存在しないものを抽出
  const deleteTarget = midTableForThisTask.filter(v => {
    const isInSchedule = newGenbaTaskListByDate.find(v2 => {
      return Days.validate.isSameDate(v2.date, v?.GenbaDay?.date)
    })

    return !isInSchedule
  })

  if (deleteTarget.length) {
    const args: Prisma.GenbaDayTaskMidTableDeleteManyArgs = {
      where: {
        id: {in: deleteTarget.map(v => v.id)},
      },
    }
    const res = await doStandardPrisma(`genbaDayTaskMidTable`, `deleteMany`, args)

    return res
  }
}

// 付与
const attach = async ({newGenbaTaskListByDate, genbaDayList}) => {
  const transactionQueryList: transactionQuery[] = []

  newGenbaTaskListByDate.forEach(obj => {
    const {date, genbaId, genbaTaskId} = obj
    const theGenbaDay = genbaDayList.find(v => Days.validate.isSameDate(v.date, date))

    if (!theGenbaDay) {
      throw new Error(`タスクを割り振る日付が見つかりませんでした。`)
    }

    const genbaDayId = theGenbaDay.id
    const data = {
      genbaDayId,
      genbaTaskId,
    }
    const args: Prisma.GenbaDayTaskMidTableUpsertArgs = {
      where: {unique_genbaDayId_genbaTaskId: data},
      create: data,
      update: data,
    }
    transactionQueryList.push({model: `genbaDayTaskMidTable`, method: `upsert`, queryObject: args})
  })

  const res = await doTransaction({transactionQueryList})
  return res
}

export const deleteGenbaDayWithoutAnyResource = async ({genbaId}) => {
  const args: Prisma.GenbaDayDeleteManyArgs = {
    where: {
      genbaId,
      GenbaDayShift: {none: {}},
      GenbaDayTaskMidTable: {none: {}},
      GenbaDaySoukenCar: {none: {}},
    },
  }

  const res = await doStandardPrisma(`genbaDay`, `deleteMany`, args)

  return res
}

// 関連する日付データを作る
const createGenbaDaysBetween = async ({genbaTask, newGenbaTaskListByDate}) => {
  const transactionQueryList: transactionQuery[] = []
  const {from, to} = genbaTask
  const days = to ? [...Days.day.getDaysBetweenDates(from, to)] : [from]
  newGenbaTaskListByDate.forEach(obj => {
    const {date, genbaId, genbaTaskId} = obj
    const data = {date, genbaId}
    const queryObject: Prisma.GenbaDayUpsertArgs = {
      where: {unique_date_genbaId: data},
      create: data,
      update: data,
    }
    transactionQueryList.push({model: `genbaDay`, method: `upsert`, queryObject})
  })
  const {result} = await doTransaction({transactionQueryList})
}
