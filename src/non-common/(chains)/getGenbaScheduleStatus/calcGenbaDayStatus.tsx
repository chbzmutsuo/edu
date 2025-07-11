'use server'
import {GetNinkuList} from 'src/non-common/(chains)/getGenbaScheduleStatus/getNinkuList'
import {prisma} from 'src/lib/prisma'
import {GenbaDayProps} from 'src/non-common/(chains)/getGenbaScheduleStatus/chain_sohken_genbaDayUpdateChain'

import {getAllAssignedNinkuTillThisDay} from 'src/non-common/(chains)/getGenbaScheduleStatus/getAllAssignedNinkuTillThisDay'
import {getGenbaScheduleStatus} from 'src/non-common/(chains)/getGenbaScheduleStatus/getGenbaScheduleStatus'
export const calcGenbaDayStatus = async ({genbaId}) => {
  const allGenbaDay = await prisma.genbaDay.findMany({
    where: {genbaId: genbaId},
    include: {
      Genba: {
        include: {
          GenbaDay: {
            include: {
              Genba: {},
              GenbaDayTaskMidTable: {
                orderBy: {sortOrder: 'asc'},
                include: {GenbaTask: {}},
              },
            },
            orderBy: {date: 'asc'},
          },
          GenbaDayShift: {include: {GenbaDay: {include: {GenbaDayTaskMidTable: {orderBy: {sortOrder: 'asc'}}}}}},
          GenbaTask: {},
        },
      },
      GenbaDayShift: {
        include: {GenbaDay: {}, User: {include: {SohkenCar: {}}}},
      },
      GenbaDaySoukenCar: {include: {SohkenCar: {}}},
      GenbaDayTaskMidTable: {
        orderBy: {sortOrder: 'asc'},
        include: {GenbaTask: {}},
      },
    },
    orderBy: {date: 'asc'},
  })

  console.debug(`${allGenbaDay.length}件のGenbaDayを更新します。`)

  const calculatedGenbaDayList = allGenbaDay.map(GenbaDay => {
    const {ninkuList, result} = GetNinkuList({
      GenbaDay,
      theDay: GenbaDay.date,
      GenbaDayTaskMidTable: GenbaDay.GenbaDayTaskMidTable,
    })

    const allocatedNinku = Object.keys(result).reduce((acc, key) => {
      const num = result[key]
      if (isNaN(num)) {
        return acc
      }
      return acc + num
    }, 0)

    const allRequiredNinku = GenbaDay.GenbaDayTaskMidTable.reduce((acc, curr) => acc + (curr.GenbaTask.requiredNinku ?? 0), 0)
    const ninkuFullfilled = allocatedNinku >= allRequiredNinku

    const {allAssignedNinkuTillThisDay} = getAllAssignedNinkuTillThisDay({
      GenbaDay,
      ninkuFullfilled,
    })
    return {
      ...GenbaDay,
      allAssignedNinkuTillThisDay,
      allRequiredNinku,
      ninkuFullfilled,
      allocatedNinku,
      ninkuList,
      result,
    }
  })

  const result = calculatedGenbaDayList.map(GenbaDay => {
    const {ninkuList, result} = GenbaDay

    //最後に人工が埋まった日を取得
    const {status} = getGenbaScheduleStatus({
      GenbaDay: GenbaDay as GenbaDayProps,
    })

    const lastFullfilledGenbaDay = calculatedGenbaDayList.find(GD => {
      const {ninkuFullfilled} = GD
      // タスクが完全に一致しているかどうかを両方向で判定
      const allTasksMatch =
        GD.GenbaDayTaskMidTable.every(mid => GenbaDay.GenbaDayTaskMidTable.some(item => item.genbaTaskId === mid.genbaTaskId)) &&
        GenbaDay.GenbaDayTaskMidTable.every(item => GD.GenbaDayTaskMidTable.some(mid => mid.genbaTaskId === item.genbaTaskId))

      return ninkuFullfilled && allTasksMatch
    })

    const isBeforeOrEqualToLastFullfilledDay =
      lastFullfilledGenbaDay && GenbaDay.date.getTime() <= lastFullfilledGenbaDay.date.getTime()

    const isAllNinkuFullfilled = GenbaDay.GenbaDayTaskMidTable.every(d => {
      const assinCount: number = result[d.GenbaTask.name ?? '']
      const requiredNinku: number = d.GenbaTask.requiredNinku ?? 0

      const islastFullfilledGenbaDay = lastFullfilledGenbaDay?.id === GenbaDay.id

      if (assinCount) {
        return assinCount >= requiredNinku && !islastFullfilledGenbaDay
      }
      return false
    })

    const afterLastFullfilledDay = !isBeforeOrEqualToLastFullfilledDay

    let active = true

    if (afterLastFullfilledDay) {
      if (isAllNinkuFullfilled) {
        active = false
      } else {
        active = true
      }
    } else {
      !lastFullfilledGenbaDay
    }

    const isLastFullfilledDay = lastFullfilledGenbaDay?.id === GenbaDay.id

    return {
      ...GenbaDay,
      isLastFullfilledDay,
      status,
      active,
    }
  })

  return result
}
