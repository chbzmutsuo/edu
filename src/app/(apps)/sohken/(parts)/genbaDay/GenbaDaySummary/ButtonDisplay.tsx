import {calcGenbaDayStatus} from 'src/non-common/(chains)/getGenbaScheduleStatus/calcGenbaDayStatus'
import React from 'react'
import {GENBA_DAY_STATUS} from 'src/non-common/(chains)/getGenbaScheduleStatus/GENBA_DAY_STATUS'
import {Button} from '@components/styles/common-components/Button'
import {doStandardPrisma} from '@lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {toast} from 'react-toastify'

import {colorVariants} from '@lib/methods/colors'
import {formatDate} from '@class/Days/date-utils/formatters'
import {isDev} from '@lib/methods/common'

export const ButtonDisplay = ({active, GenbaDay, toggleLoad}) => {
  const theStatus = GENBA_DAY_STATUS.find(d => d.label === (GenbaDay.status || '未完了'))
  const stuffAllocated = GenbaDay.GenbaDayShift.length > 0
  const isFinished = GENBA_DAY_STATUS.some(item => {
    return item.label === theStatus?.label && item.finishFlag
  })

  const confirmFinishedByGenbaDay = async e => {
    e.preventDefault()
    confirmFinished({GenbaDay, isFinished, toggleLoad})
  }

  if (isFinished) {
    if (theStatus?.label === '完了') {
      return (
        <Button onClick={confirmFinishedByGenbaDay} color={theStatus?.color as colorVariants}>
          {theStatus?.label}
        </Button>
      )
    }
  } else if (active && stuffAllocated) {
    if (GenbaDay?.isLastFullfilledDay) {
      return (
        <Button
          onClick={confirmFinishedByGenbaDay}
          color={GenbaDay.isLastFullfilledDay ? 'red' : 'orange'}
          size={`sm`}
          className={`p-0`}
        >
          {GenbaDay.isLastFullfilledDay ? '要確認' : '要確認'}
        </Button>
      )
    }
  } else {
    if (GenbaDay.finished) {
      return (
        <Button onClick={confirmFinishedByGenbaDay} color={theStatus?.color as colorVariants}>
          {theStatus?.label}
        </Button>
      )
    }
    return null
    // return (
    //   <Button onClick={confirmFinished} color={`orange`}>
    //     要確定
    //   </Button>
    // )
  }
}

const confirmFinished = async ({GenbaDay, isFinished, toggleLoad}) => {
  const {GenbaDayTaskMidTable} = GenbaDay

  const genbadays = await calcGenbaDayStatus({genbaId: GenbaDay.genbaId})

  const finishDate = genbadays.find(item => {
    const {isLastFullfilledDay} = item
    const tasksMatch = GenbaDayTaskMidTable.every(mid => {
      return item.GenbaDayTaskMidTable.some(item => mid.genbaTaskId === item.genbaTaskId)
    })

    return tasksMatch && isLastFullfilledDay
  })

  if (finishDate?.id === undefined) {
    return alert('このタスクはまだ完了していません。')
  }

  const allDeallocateGenbaDayShift = genbadays.filter(item => {
    const hasSameTask = GenbaDayTaskMidTable.every(mid => {
      return item.GenbaDayTaskMidTable.some(item => mid.genbaTaskId === item.genbaTaskId)
    })

    return finishDate?.date && new Date(item.date).getTime() > new Date(finishDate.date).getTime() && !item.active && hasSameTask
  })
  const message = !isFinished
    ? [
        '完了確定を実施すると、完了日以降のスタッフ・車両配置が削除されます。よろしいですか？',
        `削除予定のカード:`,
        allDeallocateGenbaDayShift
          .map(item => {
            return [
              //
              formatDate(item.date),
              item.GenbaDayShift.length > 0 ? `人員:${item.GenbaDayShift.length}件 ` : ``,
              item.GenbaDaySoukenCar.length > 0 ? `車両:${item.GenbaDaySoukenCar.length}件` : ``,
            ].join(' ')
          })
          .join('\n'),
      ].join('\n')
    : '完了入力を取り消します。すでに自動削除されたスタッフ・車両配置は復元されません。よろしいですか？'

  if (isDev && !confirm(message)) {
    return
  }

  toggleLoad(
    async () => {
      await doStandardPrisma(`genbaDay`, `update`, {where: {id: finishDate?.id}, data: {finished: !finishDate?.finished}})

      const genbaDayShiftDelete = await doStandardPrisma(`genbaDayShift`, `deleteMany`, {
        where: {
          genbaDayId: {
            in: allDeallocateGenbaDayShift.map(item => item.id),
          },
        },
      })

      if (genbaDayShiftDelete?.result?.count > 0) {
        toast.warn(`完了日の翌日以降の${genbaDayShiftDelete?.result?.count}件のスタッフ配置を削除しました。`)
      }

      const genbaDaySoukenCarDelete = await doStandardPrisma(`genbaDaySoukenCar`, `deleteMany`, {
        where: {genbaDayId: {in: allDeallocateGenbaDayShift.map(item => item.id)}},
      })
      if (genbaDaySoukenCarDelete?.result?.count > 0) {
        toast.warn(`完了日の翌日以降の${genbaDaySoukenCarDelete?.result?.count}件の車両配置を削除しました。`)
      }
    },
    {refresh: true, mutate: true}
  )
}
