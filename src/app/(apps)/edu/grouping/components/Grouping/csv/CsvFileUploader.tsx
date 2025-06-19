'use client'

import {ClassRoom} from '@app/(apps)/edu/class/Grouping'
import {createStudentDataFromCsv} from '@app/(apps)/edu/Grouping/grouping-server-actions'

import SimpleTable from '@cm/components/utils/SimpleTable'

import {useState} from 'react'

import {CSVLink} from 'react-csv'

import useGlobal from '@hooks/globalHooks/useGlobal'
import {C_Stack, R_Stack} from '@components/styles/common-components/common-components'

import {Button} from '@components/styles/common-components/Button'

import {toastByResult} from '@lib/ui/notifications'
import {MarkDownDisplay} from '@components/utils/texts/MarkdownDisplay'
import useFileUploadPropsOptimized from '@hooks/useFileUpload/useFileUploadPropsOptimized'

const CsvFileUploader = () => {
  const {toggleLoad, session, query, accessScopes} = useGlobal()
  const md = `
## 下記の注意事項に従って、CSVファイルを作成し、アップロードしてください。
1. ファイル名は、半角英数字で入力してください。
2. **「ID」は空欄**にしてください。
3. **必ず全ての列にデータを入力**してください。空欄があると、正しくデータが登録されない場合があります。
4. 「番号」は、**半角数字**で入力してください。それ以外は、数字でも文字でも可能です。
5. **「学年-組-番号」で重複があると**、登録できません。

---

##  ファイルをアップロードすると、次の登録処理がなされます。
1. ファイルに記載されている全ての「学年/組」データを自動で作成します
2. 設定されている児童・生徒データを登録します。
3. 「学年 / 組 / 番号」で一致するデータがすでに登録されている場合、既存の当該児童・生徒の「氏名」「かな」を上書きます。
 - (その児童・生徒の過去のデータ（アンケート回答など）は、全て保持され、「氏名」「かな」が変更されます。)
`
  const template = [['ID', '学年', '組', '番号', '性別', '氏名', 'かな']]
  const {
    fileArrState,
    fileUploadIsReady,
    component: {FileUploaderMemo},
  } = useFileUploadPropsOptimized({
    maxFiles: 1,
    readAs: 'readAsText',
    accept: {
      'text/csv': [],
    },
  })

  const csvContents = fileArrState[0]?.fileContent

  const [errors, seterrors] = useState<any>([])
  const [successes, setsuccesses] = useState<any[]>([])

  const onSubmit = async e => {
    const {schoolId} = accessScopes().getGroupieScopes()
    await toggleLoad(async () => {
      const csvArr = fileArrState[0].fileContent.filter(row => row[1])

      seterrors([])
      setsuccesses([])

      const res = await createStudentDataFromCsv({
        csvArr,
        schoolId: schoolId ?? 0,
      })

      toastByResult(res)
      if (res.success) {
        setsuccesses(res.result)
        seterrors(res.error)
      }
    })
  }

  return (
    <div className={`p-4`}>
      <C_Stack className={`items-start gap-4`}>
        <R_Stack className={`t-paper items-stretch`}>
          <section className={`t-alert-warning  w-fit`}>
            必ず、テンプレートファイルを
            <CSVLink data={template} className={`t-link`} filename={`データ作成テンプレート`}>
              ダウンロード
            </CSVLink>{' '}
            した上で、CSVファイルを作成してください。
            <MarkDownDisplay>{md}</MarkDownDisplay>
          </section>

          <section className={`w-[350px]`}>
            <C_Stack>
              <div className={`row-stack  justify-between `}>
                <div>{FileUploaderMemo}</div>
                <Button color="red" disabled={!fileUploadIsReady} onClick={onSubmit}>
                  送信
                </Button>
              </div>
              {csvContents && (
                <div className={`t-paper`}>
                  <small className={`text-error-main`}>
                    ファイルの中身を確認し、問題なければ「送信」ボタンを押してください。
                  </small>
                  <>
                    <R_Stack className={` flex-nowrap`}></R_Stack>
                    <ReadTable {...{csvContents}} />
                  </>
                </div>
              )}
            </C_Stack>
          </section>
        </R_Stack>

        <R_Stack className={` items-stretch`}>
          <Error {...{errors}} />
          <Success {...{successes}} />
        </R_Stack>
      </C_Stack>
    </div>
  )
}
export default CsvFileUploader

const tableHeaders = ['ID', '学年', '組', '番号', `性別`, '氏名', 'かな']
const tableOptions = {
  td: {
    widthArr: [50, 50, 50, 50, 50, 50],
  },
}
const Success = ({successes}) => {
  return (
    <div>
      {successes.length > 0 && (
        <div className={`t-alert-blue`}>
          <h2>更新済みデータ</h2>
          <SimpleTable
            {...{
              showIndex: true,

              headerArr: tableHeaders,
              bodyArr: successes.map(obj => {
                const {id, attendanceNumber, gender, name, kana, Classroom} = obj
                const [grade, classroom] = new ClassRoom(Classroom).className.split('-')
                return [id, grade, classroom, attendanceNumber, gender, name, kana]
              }),
            }}
          />
        </div>
      )}
    </div>
  )
}

const Error = ({errors}) => {
  const {emptyValueStudents, doubledStudents} = errors ?? {}

  return (
    <C_Stack>
      {emptyValueStudents?.length > 1 && (
        <div className={`t-alert`}>
          <h2>データ不足エラー</h2>
          <SimpleTable
            {...{
              headerArr: tableHeaders,
              bodyArr: emptyValueStudents.map(obj => {
                const {id, grade, classroom, attendanceNumber, gender, name, kana} = obj
                return [id, grade, classroom, attendanceNumber, gender, name, kana]
              }),
            }}
          />
        </div>
      )}
      {doubledStudents?.length > 0 && (
        <div className={`t-alert`}>
          <h2>学年・組・番号重複エラー</h2>
          <SimpleTable
            {...{
              headerArr: tableHeaders,
              bodyArr: doubledStudents.map(obj => {
                const {id, grade, classroom, attendanceNumber, gender, name, kana} = obj
                return [id, grade, classroom, attendanceNumber, gender, name, kana]
              }),
            }}
          />
        </div>
      )}
    </C_Stack>
  )
}

const ReadTable = ({csvContents}) => {
  return (
    <div className={` sticky-table-wrapper max-h-[300px] [&_td]:border-y-[1px]! [&_th]:border-y-[1px]! w-[300px]`}>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>学年</th>
            <th>組</th>
            <th>番号</th>
            <th>性別</th>
            <th>氏名</th>
            <th>かな</th>
          </tr>
        </thead>
        {csvContents?.map((row, i) => {
          const [id, grade, classroom, attendanceNumber, gender, name, kana] = row

          return (
            <tr key={i}>
              <td>{id}</td>
              <td>{grade}</td>
              <td>{classroom}</td>
              <td>{attendanceNumber}</td>
              <td>{gender}</td>
              <td>{name}</td>
              <td>{kana}</td>
            </tr>
          )
        })}
      </table>
    </div>
  )
}
