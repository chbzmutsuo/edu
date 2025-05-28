import {formatDate} from '@class/Days/date-utils/formatters'
import {R_Stack} from '@components/styles/common-components/common-components'
import {T_LINK} from '@components/styles/common-components/links'
import useMyNavigation from '@hooks/globalHooks/useMyNavigation'
import {createUpdate} from '@lib/methods/createUpdate'
import {HREF} from '@lib/methods/urls'
import {NotepadText} from 'lucide-react'
import React from 'react'

export default function DateThCell({tbmBase, mode, date, userList, scheduleListOnDate, doTransaction, fetchData}) {
  const {query, router} = useMyNavigation()
  const dateStr = formatDate(date, 'M/D(ddd)')

  const routeGroupMode = mode === `ROUTE`

  const ConfigButton = ({children}) => {
    return (
      <div
        className={`t-link `}
        onClick={async () => {
          const targetUserList = userList.filter(user => {
            // scheduleがapprovedのもの
            const schedule = scheduleListOnDate.find(schedule => schedule.approved && schedule.userId === user.id)
            return schedule
          })

          if (confirm(`${targetUserList.length}件のユーザーを稼働に設定しますか？`)) {
            await doTransaction({
              transactionQueryList: targetUserList.map((user, idx) => {
                const unique_userId_date = {
                  userId: user.id,
                  date,
                }

                return {
                  model: `userWorkStatus`,
                  method: `upsert`,
                  queryObject: {
                    where: {
                      unique_userId_date,
                    },
                    ...createUpdate({
                      ...unique_userId_date,
                      workStatus: '稼働',
                    }),
                  },
                }
              }),
            })
            fetchData()
          }
        }}
      >
        {children}
      </div>
    )
  }

  const href = HREF(
    '/tbm/DriveSchedule/tenko',
    {
      date: formatDate(date),
      tbmBaseId: tbmBase.id,
    },
    query
  )

  return (
    <R_Stack className={` justify-between`}>
      <div id={`#${dateStr}`}>{routeGroupMode ? <ConfigButton>{dateStr}</ConfigButton> : dateStr}</div>
      <T_LINK href={href}>
        <NotepadText />
      </T_LINK>
      {/* <button
        className={`onHover t-link`}
        onClick={async data => {
          // const pdf = await GoogleDrive_GeneratePdf({
          //   spreadsheetId:
          //     'https://docs.google.com/spreadsheets/d/1lBZqa8hogPiNagU0SlbR1Fnomj-tCUfArsKscNlc6m8/edit?gid=1632017277#gid=1632017277',
          //   pdfName: [tbmBase.name, dateStr].join(`_`) + `.pdf`,
          // })
          // // PDFデータをダウンロードする処理
          // if (pdf.pdfData) {
          //   // Base64データをバイナリに変換
          //   const byteCharacters = atob(pdf.pdfData)
          //   const byteNumbers = new Array(byteCharacters.length)
          //   for (let i = 0; i < byteCharacters.length; i++) {
          //     byteNumbers[i] = byteCharacters.charCodeAt(i)
          //   }
          //   const byteArray = new Uint8Array(byteNumbers)
          //   const blob = new Blob([byteArray], {type: 'application/pdf'})
          //   // ダウンロードリンクを作成して自動クリック
          //   const link = document.createElement('a')
          //   link.href = URL.createObjectURL(blob)
          //   link.download = `${tbmBase.name}_${dateStr}.pdf`
          //   document.body.appendChild(link)
          //   link.click()
          //   document.body.removeChild(link)
          // }
        }}
      >
        <NotepadText />
      </button> */}
    </R_Stack>
  )
}
