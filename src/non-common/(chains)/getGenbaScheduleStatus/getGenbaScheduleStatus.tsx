import {GenbaDayProps, genbaStatusType} from 'src/non-common/(chains)/getGenbaScheduleStatus/chain_sohken_genbaDayUpdateChain'

// =====================statusの取得====================
export const getGenbaScheduleStatus = (props: {GenbaDay: GenbaDayProps}) => {
  const {GenbaDay} = props
  const allScheduleListOnGenba = GenbaDay.Genba.GenbaDay.sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  })
  let vanished = false
  let doneInFuture = false

  GenbaDay.GenbaDayTaskMidTable.every(mid => {
    const sameTaskHasFinishedOnThisDay = allScheduleListOnGenba.find(d => {
      const hasSameTask = d.GenbaDayTaskMidTable.some(mid2 => {
        return mid2.genbaTaskId === mid.genbaTaskId
      })
      const finished = d.finished
      return hasSameTask && finished
    })

    const isBefore =
      sameTaskHasFinishedOnThisDay && new Date(sameTaskHasFinishedOnThisDay.date).getTime() < new Date(GenbaDay.date).getTime()
    if (sameTaskHasFinishedOnThisDay) {
      if (isBefore) {
        vanished = true
      } else {
        doneInFuture = true
      }
    }
  })

  let status: genbaStatusType
  if (GenbaDay.finished) {
    status = '完了'
  } else if (vanished) {
    status = '不要'
  } else if (doneInFuture) {
    status = '済'
  } else {
    status = '未完了'
  }

  return {status}
}

// =====================取得====================
