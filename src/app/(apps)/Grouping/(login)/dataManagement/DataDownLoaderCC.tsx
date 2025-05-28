'use client'

import React, {useState} from 'react'
import {R_Stack} from '@components/styles/common-components/common-components'
import useBasicFormProps from '@hooks/useBasicForm/useBasicFormProps'
import {Fields} from '@class/Fields/Fields'
import {Button} from '@components/styles/common-components/Button'
import {doStandardPrisma} from '@lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {Prisma} from '@prisma/client'
import {Days} from '@class/Days/Days'

import {formatDate, toIsoDateIfExist} from '@class/Days/date-utils/formatters'
import {anyObject} from '@cm/types/types'
import {CssString} from '@components/styles/cssString'
import {cl} from '@lib/methods/common'

export const DataDownLoaderCC = () => {
  const columns = new Fields([
    {id: `from`, label: `from`, type: `date`},
    {id: `to`, label: `to`, type: `date`},
    {id: `schoolId`, label: `学校`, forSelect: {}},
  ])
    .customAttributes(({col}) => {
      return {form: {...col.form}}
    })
    .transposeColumns()

  const {firstDayOfMonth, lastDayOfMonth} = Days.month.getMonthDatum(new Date())
  const {BasicForm, latestFormData, ReactHookForm, formRef} = useBasicFormProps({
    columns,
    formData: {
      from: firstDayOfMonth,
      to: lastDayOfMonth,
    },
  })

  const [data, setdata] = useState<any[]>([])

  const onSubmit = async () => {
    const {from, to, schoolId} = latestFormData
    const AND: Prisma.AnswerWhereInput[] = [{createdAt: {gte: toIsoDateIfExist(from), lte: toIsoDateIfExist(to)}}]
    if (schoolId) {
      AND.push({Game: {schoolId: schoolId}})
    }
    const queryObject: Prisma.AnswerFindManyArgs = {
      include: {
        Game: {
          include: {
            Group: {},
            Teacher: {},
            SubjectNameMaster: {},
          },
        },
        Student: {
          include: {
            Squad: {
              orderBy: {createdAt: `desc`},
              take: 1,
              include: {StudentRole: {include: {LearningRoleMasterOnGame: {}}}},
            },
            Classroom: {},
            School: {},
          },
        },
      },
      where: {AND},
    }
    const {result} = await doStandardPrisma(`answer`, `findMany`, queryObject)
    setdata(result)
  }

  const formattedData: any[] = data.map(item => {
    const Answer = item as Prisma.AnswerUncheckedCreateInput & anyObject
    const Game: Prisma.GameUncheckedCreateInput & anyObject = Answer.Game
    const SubjectNameMaster: Prisma.SubjectNameMasterUncheckedCreateInput & anyObject = Game.SubjectNameMaster
    const Teacher: Prisma.TeacherUncheckedCreateInput & anyObject = Game.Teacher
    const Student: Prisma.StudentUncheckedCreateInput & anyObject = Answer.Student
    const Classroom: Prisma.ClassroomUncheckedCreateInput & anyObject = Student.Classroom
    const School: Prisma.SchoolUncheckedCreateInput & anyObject = Student.School
    const curiocitySum = new Array(5).fill(0).reduce((acc, _, i) => acc + Answer[`curiocity${i + 1}`], 0)
    const efficacySum = new Array(5).fill(0).reduce((acc, _, i) => acc + Answer[`efficacy${i + 1}`], 0)

    const role = Student?.Squad?.[0]?.StudentRole.find(sr => sr?.studentId === Student?.id)?.LearningRoleMasterOnGame?.name

    return {
      学校ID: School.id,
      学校名: School.name,
      教師ID: Teacher.id,
      教師名: Teacher.name,
      ゲームID: Game.id,
      ゲームキー: Game.secretKey,
      ゲーム名: Game.name,
      ゲーム日付: formatDate(Game.date),
      科目名: SubjectNameMaster.name,
      次数: Game.nthTime,
      学習課題: Game.task,
      回答ID: Answer.id,
      学年: Classroom.grade,
      学級: Classroom.class,
      出席番号: Student.attendanceNumber,
      性別: Student.gender,
      氏名: Student.name,
      班: Student?.Squad?.[0]?.name,
      役割: role,
      興味1: Answer.curiocity1,
      興味2: Answer.curiocity2,
      興味3: Answer.curiocity3,
      興味4: Answer.curiocity4,
      興味5: Answer.curiocity5,
      効力感1: Answer.efficacy1,
      効力感2: Answer.efficacy2,
      効力感3: Answer.efficacy3,
      効力感4: Answer.efficacy4,
      効力感5: Answer.efficacy5,
      興味合計: curiocitySum,
      効力感合計: efficacySum,
    }
  })

  const exportToExcel = async () => {
    return
    // const workbook = new ExcelJS.Workbook()
    // const groupedData = formattedData.reduce((acc, item) => {
    //   const key = item.gameId + '_' + item.gameName
    //   if (!acc[key]) {
    //     acc[key] = []
    //   }
    //   acc[key].push(item)
    //   return acc
    // }, {})

    // Object.keys(groupedData).forEach(key => {
    //   const worksheet = workbook.addWorksheet(`id${key}`)
    //   const gameData = groupedData[key]
    //   const columns = Object.keys(gameData[0])
    //   worksheet.columns = columns.map(col => ({header: col, key: col, width: 20}))
    //   gameData.forEach(item => {
    //     worksheet.addRow(Object.values(item))
    //   })
    // })
    // const buffer = await workbook.xlsx.writeBuffer()
    // const blob = new Blob([buffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})
    // saveAs(blob, 'project_data.xlsx')
  }

  const {table} = CssString
  return (
    <div>
      <R_Stack>
        <BasicForm {...{latestFormData, alignMode: `row`}} />
        <Button onClick={onSubmit}>検索</Button>
        <Button onClick={exportToExcel}>抽出</Button>
      </R_Stack>
      <div className={cl(table.borderCerllsY, `sticky-table-wrapper max-h-[70vh] [&_td]:min-w-[110px]!`, `text-center`)}>
        <table>
          <thead>
            <tr>
              <td>学校ID</td>
              <td>学校名</td>
              <td>教師ID</td>
              <td>教師名</td>
              <td>ゲームID</td>
              <td>ゲームキー</td>
              <td>ゲーム名</td>
              <td>日付</td>
              <td>科目名</td>
              <td>回数</td>
              <td>タスク</td>
              <td>回答ID</td>
              <td>学年</td>
              <td>学級</td>
              <td>出席番号</td>
              <td>性別</td>
              <td>生徒名</td>
              <td>班</td>
              <td>興味1</td>
              <td>興味2</td>
              <td>興味3</td>
              <td>興味4</td>
              <td>興味5</td>
              <td>効果1</td>
              <td>効果2</td>
              <td>効果3</td>
              <td>効果4</td>
              <td>効果5</td>
              <td>興味合計</td>
              <td>効果合計</td>
            </tr>
          </thead>
          <tbody>
            {formattedData.map(item => {
              const toArr = (obj: anyObject) => Object.values(obj)
              return (
                <tr key={item.answerId}>
                  {toArr(item).map((value, i) => (
                    <td key={i}>{value}</td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
