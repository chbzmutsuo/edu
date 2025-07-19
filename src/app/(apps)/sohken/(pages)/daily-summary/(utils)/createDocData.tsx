import {GenbaCl} from '@app/(apps)/sohken/class/GenbaCl'
import {textInsertRequest} from '@app/api/google/actions/DocsRequests'

import {formatDate} from '@cm/class/Days/date-utils/formatters'

import {GetNinkuList} from 'src/non-common/(chains)/getGenbaScheduleStatus/getNinkuList'

import {Days} from '@cm/class/Days/Days'

export const createDocData = ({users, genbaDayList, allShiftBetweenDays, records, calendar, targetUsers}) => {
  // 倉庫の自由な人を取得（DayRemarkComponentのロジックを参考）
  const getFreeUsers = date => {
    return (
      users?.filter(user => {
        const noShift = user.GenbaDayShift.length === 0

        const userDayRemarks = user.DayRemarksUser?.filter(item => {
          return Days.validate.isSameDate(item?.DayRemarks?.date, date)
        })

        const kyuka = userDayRemarks?.filter(item => {
          const bool = item.kyuka + item.kyukaTodoke
          return bool
        })

        const hasKyuka = kyuka?.length > 0

        // 監督者は除外
        const isKantokusha = (user.UserRole ?? []).some(role => role?.RoleMaster.name === `監督者`)

        return noShift && !hasKyuka && !isKantokusha
      }) || []
    )
  }

  // 休暇の人を取得
  const getKyukaUsers = date => {
    // 日付の文字列表現を取得して比較
    const dateStr = formatDate(date, 'YYYY-MM-DD')

    return users.filter(user => {
      // ユーザーの休暇情報をチェック
      return user.DayRemarksUser.some(item => item.kyuka && formatDate(item.DayRemarks.date, 'YYYY-MM-DD') === dateStr)
    })
  }

  // 休暇願いの人を取得
  const getKyukaTodokeUsers = date => {
    // 日付の文字列表現を取得して比較
    const dateStr = formatDate(date, 'YYYY-MM-DD')

    return users.filter(user => {
      // ユーザーの休暇願い情報をチェック
      return user.DayRemarksUser.some(item => item.kyukaTodoke && formatDate(item.DayRemarks.date, 'YYYY-MM-DD') === dateStr)
    })
  }

  // Google予定を取得
  const getGoogleSchedule = date => {
    const scheduleByUser = {}

    targetUsers
      .filter(data => data.name !== '日本のカレンダー')
      .forEach(targetUser => {
        const events = calendar
          .filter(event => {
            return Days.validate.isSameDate(event.date, date) && event.calendarId === targetUser.email
          })
          .sort((a, b) => {
            return new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
          })

        if (events.length > 0) {
          scheduleByUser[targetUser.name] = events
        }
      })

    return scheduleByUser
  }

  const data = genbaDayList
    .map((GenbaDay, i) => {
      const num = i + 1

      const allShift = GenbaDay.GenbaDayShift ?? []
      const GenbaDayTaskMidTable = GenbaDay.GenbaDayTaskMidTable ?? []
      const GenbaDayShift = GenbaDay.GenbaDayShift ?? []

      const genbaDaySoukenCar = GenbaDay.GenbaDaySoukenCar ?? []
      const Genba = GenbaDay.Genba
      const {floorThisPlay} = new GenbaCl(GenbaDay.Genba)
      const defaultStartTime =
        formatDate(GenbaDay.date, 'ddd') === '土' && Genba?.defaultStartTime === '早出' ? '通常' : Genba?.defaultStartTime

      const forceNormalCon1 = allShift.some(s => {
        return !s.from
      })
      const forceNormal = forceNormalCon1

      const subTasksOnGenbaTask = GenbaDayTaskMidTable.map(item => item.GenbaTask.subTask)
      const subTasksOnGenbaDay = GenbaDay.subTask
      const subTasks = [...subTasksOnGenbaTask, subTasksOnGenbaDay]

      const remarksOnGenbaTask = GenbaDayTaskMidTable.map(item => item.GenbaTask.remarks)
      const remarksOnGenbaDay = GenbaDay.remarks
      const remarks = [...remarksOnGenbaTask, remarksOnGenbaDay]

      const {result} = GetNinkuList({GenbaDay, theDay: GenbaDay.date, GenbaDayTaskMidTable})

      const requests: textInsertRequest[] = [
        //
        {text: `(${num})`},
        {
          text: !forceNormal ? `---` : defaultStartTime,
          color: forceNormal ? (defaultStartTime === '通常' ? '#0059ff' : '#f000e4') : undefined,
        },
        {text: Genba?.PrefCity?.city},
        {text: Genba?.name},
        {text: `(${floorThisPlay})`},
        {text: remarks.join(` `)},

        // タスク
        GenbaDayTaskMidTable.length ? {text: `\n`} : undefined,
        ...GenbaDayTaskMidTable.map((d, i) => {
          const {name, from, to, requiredNinku, color} = d.GenbaTask

          return {
            text: [
              //
              name,
              formatDate(from, 'M/D') + '~' + formatDate(to, 'M/D'),
            ].join(` `),
            // タスクは黒文字にするためcolorを指定しない
          }
        }),

        //サブタスク
        subTasks.filter(Boolean).length ? {text: `\n`} : undefined,
        {
          text: subTasks
            .filter(Boolean)
            .map(data => data.replace(/\n/g, ' '))
            .join(``),
        },

        // シフト
        GenbaDayShift.length ? {text: `\n`} : undefined,
        ...GenbaDayShift.map((shift, i) => {
          const {User, from, to, important, directGo, directReturn, shokucho, userId} = shift

          const shiftsOnOtherGembaOnSameDate = allShiftBetweenDays
            .filter(shift => {
              return (
                shift.userId === User.id &&
                Days.validate.isSameDate(shift.GenbaDay.date, GenbaDay.date) &&
                shift.GenbaDay.genbaId !== GenbaDay.genbaId &&
                shift.from
              )
            })
            .sort((a, b) => {
              const aTime = new Date(formatDate(a.GenbaDay.date) + ' ' + a.from)
              const bTime = new Date(formatDate(b.GenbaDay.date) + ' ' + b.from)
              return aTime.getTime() - bTime.getTime()
            })

          const cardDate = new Date(formatDate(GenbaDay.date) + ' ' + to)
          const nextShift =
            to &&
            shiftsOnOtherGembaOnSameDate.find(shift => {
              const date2 = new Date(formatDate(shift.GenbaDay.date) + ' ' + shift.from)

              return cardDate <= date2 && shift.from
            })

          const nextShiftIndex = nextShift
            ? records?.findIndex(genbaday => {
                return genbaday.id === nextShift?.genbaDayId
              })
            : null

          const nextShiftDisplay =
            nextShift && nextShiftIndex ? ['➡︎', nextShiftIndex + 1, nextShift?.from, nextShift?.to].join(` `) : ''

          // シフト表示を分割して、人名のみ赤文字にする
          const shiftParts: {text: string; color: string}[] = []

          // 直行・直帰の表示
          if (directGo) shiftParts.push({text: '直行)', color: important ? 'orange' : shokucho ? 'green' : 'white'})
          if (directReturn) shiftParts.push({text: '直帰)', color: important ? 'orange' : shokucho ? 'green' : 'white'})

          // 人名（赤文字）
          shiftParts.push({text: `${User?.name} `, color: '#ff0000'})

          // 時間の表示
          const timeText = [from ? from : '', from || to ? '~' : '', to ? to : ''].filter(Boolean).join(' ')

          if (timeText) {
            shiftParts.push({text: timeText, color: important ? 'orange' : shokucho ? 'green' : 'white'})
          }

          // 次のシフト表示
          if (nextShiftDisplay) {
            shiftParts.push({text: ` ${nextShiftDisplay}`, color: important ? 'orange' : shokucho ? 'green' : 'white'})
          }

          return shiftParts
        }).flat(),

        // 車両情報（茶文字で表示）
        ...genbaDaySoukenCar.map((mid, i) => {
          const SohkenCar = mid.SohkenCar
          return {
            text: SohkenCar.name,
            color: '#8B4513', // 茶文字
          }
        }),

        // 人工（にんく）表示を最後に移動
        ...GenbaDayTaskMidTable.map((d, i) => {
          const {name, from, to, requiredNinku, color} = d.GenbaTask
          return {
            text: `<${requiredNinku}-${result[name ?? '']}>`,
            color: '#008000', // 人工表示を緑色に変更
          }
        }),
        {text: `\n\n`},
      ]

      return requests
    })
    .flat()
    .filter(Boolean)
    .map(data => {
      const text = String(data.text).includes('\n') ? String(data.text) : `${String(data.text)} `
      return {...data, text}
    })

  // 全体の最後に倉庫、休暇、休暇願い、Google予定の情報を追加
  const additionalInfo: {text: string; color?: string}[] = []

  // 日付の重複を避けるため、一意の日付のセットを作成
  const uniqueDates = [...new Set(genbaDayList.map(GenbaDay => formatDate(GenbaDay.date, 'YYYY-MM-DD')))]

  // 一意の日付ごとに1回だけ処理
  uniqueDates.forEach(dateKey => {
    const date = new Date(dateKey as string)
    const dateStr = formatDate(date, 'M/D')

    // 倉庫情報
    const freeUsers = getFreeUsers(date)
    additionalInfo.push({text: `\n倉庫(${dateStr}): `})
    if (freeUsers.length > 0) {
      freeUsers.forEach(user => {
        additionalInfo.push({
          text: `${user.name}, `,
          color: '#ff0000',
        })
      })
    } else {
      additionalInfo.push({text: `なし`})
    }

    // 休暇情報
    const kyukaUsers = getKyukaUsers(date)
    additionalInfo.push({text: `\n休暇(${dateStr}): `})
    if (kyukaUsers.length > 0) {
      kyukaUsers.forEach(user => {
        additionalInfo.push({
          text: `${user.name}, `,
          color: '#ff0000',
        })
      })
    } else {
      additionalInfo.push({text: `なし`})
    }

    // 休暇願い情報
    const kyukaTodokeUsers = getKyukaTodokeUsers(date)
    additionalInfo.push({text: `\n休暇願い(${dateStr}): `})
    if (kyukaTodokeUsers.length > 0) {
      kyukaTodokeUsers.forEach(user => {
        additionalInfo.push({
          text: `${user.name}, `,
          color: '#ff0000',
        })
      })
    } else {
      additionalInfo.push({text: `なし`})
    }

    // Google予定情報
    const googleSchedule = getGoogleSchedule(date)
    additionalInfo.push({text: `\n予定(${dateStr}):\n`})
    if (Object.keys(googleSchedule).length > 0) {
      Object.entries(googleSchedule).forEach(([userName, events]: [string, any[]]) => {
        additionalInfo.push({
          text: `${userName}: `,
          color: '#ff0000',
        })

        const eventTexts = events.map(event => {
          const start = formatDate(event.startAt, 'HH:mm')
          const end = formatDate(event.endAt, 'HH:mm')
          const timeDisplay = end ? `${start}~${end}` : start

          return `${event.summary}${timeDisplay ? `(${timeDisplay})` : ''}`
        })

        additionalInfo.push({
          text: eventTexts.join(', ') + '\n',
        })
      })
    } else {
      additionalInfo.push({text: `なし\n`})
    }
  })

  // データの最後に追加情報を結合
  // ドキュメントの最初に日付ヘッダーを追加
  const dateHeader: {text: string; color?: string; alignment?: 'START' | 'CENTER' | 'END' | 'JUSTIFIED'}[] = []
  if (genbaDayList.length > 0) {
    const firstDate = genbaDayList[0].date
    dateHeader.push({
      text: `${formatDate(firstDate, 'YYYY年M月D日(ddd)')}\n\n`,
      alignment: 'CENTER', // 中央寄せ
    })
  }

  const finalData = [...dateHeader, ...data, ...additionalInfo]
  return finalData
}
