import {Days} from '@cm/class/Days/Days'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

import {GenbaDay, GenbaDayShift, GenbaDayTaskMidTable, GenbaTask} from '@prisma/client'

export const GetNinkuList = ({
  GenbaDay,
  theDay,
  GenbaDayTaskMidTable,
}: {
  GenbaDay
  theDay: Date
  GenbaDayTaskMidTable: (GenbaDayTaskMidTable & {GenbaTask: GenbaTask})[]
}) => {
  // 全てのシフトを日付順にソート
  const allShiftForGenba: (GenbaDayShift & {
    GenbaDay: GenbaDay & {
      GenbaDayTaskMidTable: (GenbaDayTaskMidTable & {GenbaTask: GenbaTask})[]
    }
    assignedTask?: GenbaTask
    addCount: number
    originalAddCount: number
    filledNinku: number
    requiredNinku: number
    name: string
    id: number
    sortOrder: number
  })[] = GenbaDay.Genba.GenbaDayShift.sort((a, b) => {
    const dateCompare = new Date(a.GenbaDay.date).getTime() - new Date(b.GenbaDay.date).getTime()
    if (dateCompare !== 0) return dateCompare
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder
    return a.id - b.id
  })

  let lastRemainNinku = 0

  const allTaskForGenba = Object.fromEntries(
    GenbaDay.Genba.GenbaTask.sort((a, b) => a.sortOrder - b.sortOrder).map(genbaTask => {
      const key = genbaTask.id
      const value = {taskId: genbaTask.id, taskName: genbaTask.name, requiredNinku: genbaTask.requiredNinku, filledNinku: 0}
      return [key, value]
    })
  )

  GenbaDay?.Genba?.GenbaDay.sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  }).map(gd => {
    let remain = 0
    const tasksMd = gd.GenbaDayTaskMidTable.sort((a, b) => a.GenbaTask.sortOrder - b.GenbaTask.sortOrder)
    const shiftMd = allShiftForGenba.filter(shift => {
      const isBefore = new Date(shift.GenbaDay.date).getTime() <= new Date(theDay).getTime()
      return isBefore
    })

    // taskMdの人工を満たすように、割り当てる。（allShiftForGenbaの各要素に、taskIdを設定)

    for (let i = 0; i < tasksMd.length; i++) {
      const taskMd = tasksMd[i]
      const Task = taskMd.GenbaTask
      const requiredNinku = Task.requiredNinku || 0
      let assignedCount = 0

      // 必要な人工数に達するまでシフトにタスクを割り当てる
      for (let j = 0; j < shiftMd.length; j++) {
        const isLastRoop = i === tasksMd.length - 1 && j === shiftMd.length - 1
        const filledNinuk = allTaskForGenba[Task.id].filledNinku

        // if (fullfilled) {
        //   continue
        // }
        const shift = shiftMd[j]
        const {from, to} = shift
        const sameTaskAssigned = shift.assignedTask?.name === Task.name
        const conditionA = !shift.assignedTask || sameTaskAssigned
        const conditionB = Days.validate.isSameDate(shift.GenbaDay.date, gd.date)

        if (conditionA && conditionB) {
          const fullfilled = filledNinuk >= requiredNinku

          if (!fullfilled) {
            // まだタスクが割り当てられていないシフトの場合
            shift.assignedTask = Task

            const originalAddCount = !!to || !!from ? 0.5 : 1
            let addCount = originalAddCount + remain

            remain = 0

            if (allTaskForGenba[Task.id].filledNinku + addCount > requiredNinku) {
              addCount = 0.5
              remain = 0.5
            }

            shift.addCount = addCount
            shift.originalAddCount = originalAddCount
            assignedCount += addCount
            allTaskForGenba[Task.id].filledNinku += addCount
          }

          if (isLastRoop) {
            lastRemainNinku = remain
          }
        }
      }
    }

    return gd
  })

  const shiftForGenbaTillToday = allShiftForGenba.filter(shift => {
    const isBefore = new Date(shift.GenbaDay.date).getTime() <= new Date(theDay).getTime()
    const isSameTaskAssigned = shift.GenbaDay.GenbaDayTaskMidTable.some(mid => {
      return GenbaDay.GenbaDayTaskMidTable.some(mid2 => {
        return mid.genbaTaskId === mid2.genbaTaskId
      })
    })
    return isBefore && isSameTaskAssigned
  })

  const ninkuList = shiftForGenbaTillToday.reduce((acc, curr) => {
    return [...acc, curr.addCount]
  }, [])

  const source = Object.fromEntries(GenbaDayTaskMidTable.map(d => [d?.GenbaTask?.name, 0]))
  const result: any = {...source}
  const realResult: any = {...source}

  shiftForGenbaTillToday.forEach(shift => {
    const {assignedTask, addCount = 0, originalAddCount = 0} = shift
    const name = assignedTask?.name
    result[name ?? ''] += addCount
    realResult[name ?? ''] += originalAddCount
  })

  const overShift = GenbaDay.allAssignedNinkuTillThisDay ? lastRemainNinku : 0

  if (formatDate(theDay) === '2025-07-14') {
    console.log({lastRemainNinku})
  }

  return {ninkuList, result, overShift}
}
