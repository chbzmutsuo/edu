'use client'

import {GoogleDocs_batchUpdate} from '@app/api/google/actions/docsAPI'
import {DocsRequests} from '@app/api/google/actions/DocsRequests'
import {GoogleDrive_GetFilesInFolder, GoogleDrive_CopyFile} from '@app/api/google/actions/driveAPI'

import {formatDate} from '@class/Days/date-utils/formatters'
import {Button} from '@components/styles/common-components/Button'
import {Padding, R_Stack} from '@components/styles/common-components/common-components'

import NewDateSwitcher from '@components/utils/dates/DateSwitcher/NewDateSwitcher'

import useGlobal from '@hooks/globalHooks/useGlobal'

import {targetUsers} from '@app/(apps)/sohken/api/cron/targetUsers'
import {doStandardPrisma} from '@lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {T_LINK} from '@components/styles/common-components/links'
import {isDev} from '@lib/methods/common'
import {createDocData} from '@app/(apps)/sohken/(pages)/daily-summary/(utils)/createDocData'

export const DailySummaryCC = ({genbaDayList, allShiftBetweenDays, records, users, dayRemarksState, calendar}) => {
  const {toggleLoad} = useGlobal()

  const createNippoDoc = async () => {
    const parentFolderUrl = 'https://drive.google.com/drive/folders/124brhJc2jL-cDQyexzcZm2Hu50_UKpDa'

    toggleLoad(async () => {
      const finalData = createDocData({users, genbaDayList, allShiftBetweenDays, records, calendar, targetUsers})
      try {
        // 日報雛形を取得
        const getFilesRes = await GoogleDrive_GetFilesInFolder({folderId: parentFolderUrl, q: 'name = "日報雛形"'})

        const templateDoc = getFilesRes.files[0]

        if (!templateDoc) {
          throw new Error('日報雛形が見つかりません')
        }

        // 日付文字列を作成（ファイル名用）
        const dateStr =
          genbaDayList.length > 0 ? formatDate(genbaDayList[0].date, 'YYYY-MM-DD') : formatDate(new Date(), 'YYYY-MM-DD')

        // 雛形をコピーして新しいドキュメントを作成
        const newDoc = await GoogleDrive_CopyFile({
          fileId: templateDoc.id ?? '',
          newName: `${isDev ? `dev_` : ``}${dateStr}_日報`,
          parentFolderId: parentFolderUrl, // URLからフォルダIDを抽出
        })

        if (!newDoc || !newDoc.id) {
          throw new Error('ドキュメントのコピーに失敗しました')
        }

        // コピー先のドキュメントに転記
        const res = await GoogleDocs_batchUpdate({
          docId: newDoc.id,
          requests: DocsRequests.setIndex(finalData),
        })

        // コピー先のドキュメントのURLを生成
        const docUrl = `https://docs.google.com/document/d/${newDoc.id}/edit`

        // DayRemarks.nippoDocsUrlに格納
        if (genbaDayList.length > 0) {
          const targetDate = genbaDayList[0].date

          await doStandardPrisma(`dayRemarks`, `upsert`, {
            where: {date: targetDate},
            create: {date: targetDate, nippoDocsUrl: docUrl},
            update: {nippoDocsUrl: docUrl},
          })
        }

        // 成功メッセージを表示
        alert(`日報ドキュメントが作成されました。\nURL: ${docUrl}`)

        // 新しいタブでドキュメントを開く
        window.open(docUrl, '_blank')
      } catch (error) {
        console.error('日報作成エラー:', error)
        alert(`エラーが発生しました: ${error.message}`)
      }
    })
  }

  return (
    <Padding>
      <R_Stack className={`p-2 w-full justify-center  gap-10`}>
        <div className={`w-fit`}>
          <NewDateSwitcher />
        </div>

        {(isDev || !dayRemarksState.nippoDocsUrl) && (
          <Button
            color="blue"
            onClick={async () => {
              createNippoDoc()
            }}
          >
            日報データ更新
          </Button>
        )}

        {dayRemarksState.nippoDocsUrl && (
          <T_LINK target="_blank" href={dayRemarksState.nippoDocsUrl}>
            日報はこちら
          </T_LINK>
        )}
      </R_Stack>
    </Padding>
  )
}
