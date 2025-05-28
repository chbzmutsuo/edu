/**=====================人工の取得==================== */
export const getAllAssignedNinkuTillThisDay = ({GenbaDay, ninkuFullfilled}) => {
  let allAssignedNinkuTillThisDay = 0
  GenbaDay.Genba.GenbaDayShift.forEach(shift => {
    // 当日以前のタスクに絞る
    const isBefore = new Date(shift.GenbaDay.date).getTime() <= new Date(GenbaDay.date).getTime()

    // 同じタスクに絞る
    const forSameTask = shift.GenbaDay.GenbaDayTaskMidTable.some(mid => {
      return mid.genbaTaskId === GenbaDay.GenbaDayTaskMidTable.find(mid => mid.genbaTaskId === mid.genbaTaskId)?.genbaTaskId
    })

    if (isBefore && forSameTask) {
      // const addCount = shift.addCount
      allAssignedNinkuTillThisDay++
    }
  })

  const allRequiredNinku = GenbaDay.GenbaDayTaskMidTable.reduce((acc, curr) => acc + curr.GenbaTask.requiredNinku, 0)

  return {allAssignedNinkuTillThisDay, allRequiredNinku, ninkuFullfilled}
}
// =========================================
