import React from 'react'

import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

import {toast} from 'react-toastify'
import {GameContextType} from '@app/(apps)/edu/Grouping/components/Grouping/game/GameMainPage'
import {Thead} from '@app/(apps)/edu/Grouping/components/Grouping/game/Teacher/QuestionHandler/AnswerTable/Thead'
import {Tbody} from '@app/(apps)/edu/Grouping/components/Grouping/game/Teacher/QuestionHandler/AnswerTable/Tbody'
import {CsvTable} from '@cm/components/styles/common-components/CsvTable/CsvTable'
import {cn} from '@cm/shadcn/lib/utils'
import {C_Stack, Center, R_Stack} from '@cm/components/styles/common-components/common-components'
import {Circle, Trash2} from 'lucide-react'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {ClassRoom, Grouping} from '@app/(apps)/edu/class/Grouping'
import StudentAnswerHistory from '@app/(apps)/edu/Grouping/components/Grouping/game/Teacher/QuestionHandler/StudentAnswerHistory'
import {Button} from '@cm/components/styles/common-components/Button'

const AnswerTable = ({handleCreateGroup, GameCtxValue}) => {
  const {Game, players, GAME_CLASS, activePrompt, toggleLoad} = GameCtxValue as GameContextType

  const handleDeletePrompt = async prompt => {
    if (confirm('アンケートを削除しますか？')) {
      if (confirm('本当に削除してもよろしいですか？')) {
        await toggleLoad(async () => {
          await doStandardPrisma(`questionPrompt`, 'delete', {where: {id: prompt.id}})
        })
      }
    }
  }

  // 出欠情報情報更新関数;
  const toggleAttendance = async (e, studentId) => {
    await toggleLoad(async () => {
      const isAbsent = Boolean(e.target.checked) === false
      let array = Game.absentStudentIds
      if (isAbsent) {
        array.push(studentId)
      } else {
        array = array.filter(id => id !== studentId)
      }

      await doStandardPrisma('game', 'update', {where: {id: Game.id}, data: {absentStudentIds: array}})
    })
  }

  const deleteAnswer = async ({answer}) => {
    const CurrentPrompt = Game.QuestionPrompt.find(p => p.id === answer.questionPromptId)
    const isPromptActive = CurrentPrompt.active
    const isDeletable = isPromptActive === true
    if (!isDeletable) {
      alert('締め切られているアンケートの回答は削除できません。')
      return
    }
    const msg = `回答をやり直しますか？`
    if (confirm(msg)) {
      toggleLoad(async () => {
        await doStandardPrisma('answer', 'update', {
          where: {id: answer.id},
          data: {
            curiocity1: null,
            curiocity2: null,
            curiocity3: null,
            curiocity4: null,
            curiocity5: null,
            efficacy1: null,
            efficacy2: null,
            efficacy3: null,
            efficacy4: null,
            efficacy5: null,
            impression: null,
            lessonSatisfaction: null,
            lessonImpression: null,
          },
        })
        toast.warning(`回答を削除しました。再度入力できます。`)
      })
    }
  }

  const isSummary = activePrompt?.asSummary
  const btnClass = `onHover  rounded-full p-0.5 w-5  `

  return CsvTable({
    records: [
      ...players
        ?.sort((x, y) => {
          return new ClassRoom(x.Class).className.localeCompare(new ClassRoom(y.Class).className)
        })
        .map(s => {
          const StudentAnswer = Game.Answer.filter(a => a.studentId === s.id)
          return {
            csvTableRow: [
              {
                label: '出欠',
                cellValue: (
                  <>
                    <input
                      type="checkbox"
                      checked={GAME_CLASS.isThisStudentAttending(s.id)}
                      onChange={e => {
                        toggleAttendance(e, s.id)
                      }}
                    />
                  </>
                ),
              },
              {label: '学年', cellValue: <>{s?.Classroom?.grade}</>},
              {label: '組', cellValue: <>{s?.Classroom?.class}</>},
              {label: '性別', cellValue: <>{s?.gender}</>},
              {
                label: '児童・生徒',
                cellValue: (
                  <>
                    <StudentAnswerHistory {...{GameCtxValue, student: s}} />
                  </>
                ),
              },
              ...Game?.QuestionPrompt?.map((prompt, i) => {
                const isActivePrompt = activePrompt?.id === prompt.id

                const {createdAt, active, asSummary} = prompt
                const AnswerByThisStudent = StudentAnswer.find(a => {
                  return a.questionPromptId === prompt.id
                })

                const {curiocity, efficacy} = Grouping.getCuriocityAndEfficacy(AnswerByThisStudent) ?? {}

                return {
                  label: (
                    <div className={cn(` ${isActivePrompt ? (isSummary ? '  ' : 't-aler-warning') : ''}`)}>
                      <>
                        <C_Stack className={`gap-0.5`}>
                          <div>
                            <span>{formatDate(createdAt, 'HH:mm')}</span>
                            <small className={`text-[8px]`}>実施</small>
                          </div>
                          <R_Stack className={`justify-around gap-0`}>
                            <Trash2
                              className={`${btnClass} `}
                              onClick={async e => {
                                await handleDeletePrompt(prompt)
                              }}
                            />
                          </R_Stack>
                        </C_Stack>
                      </>
                    </div>
                  ),
                  cellValue: (
                    <>
                      {AnswerByThisStudent === undefined ? (
                        <Button
                          onClick={async () => {
                            toggleLoad(async () => {
                              await doStandardPrisma(`answer`, `create`, {
                                data: {studentId: s.id, gameId: Game.id, questionPromptId: prompt.id, curiocity1: null},
                              })
                            })
                          }}
                        >
                          回答枠作成
                        </Button>
                      ) : curiocity && efficacy ? (
                        <R_Stack>
                          <button
                            className={`onHover mx-auto  px-1 text-center  font-bold hover:bg-yellow-500`}
                            onClick={e => {
                              deleteAnswer({answer: AnswerByThisStudent})
                            }}
                          >
                            <R_Stack>
                              <Circle width={15} color="red" className={`text-[9px]`}>
                                好
                              </Circle>
                              <span>{curiocity}</span>
                            </R_Stack>
                            <R_Stack>
                              <Circle width={15} color="blue" className={`text-[9px]`}>
                                効
                              </Circle>
                              <span>{efficacy}</span>
                            </R_Stack>
                          </button>
                        </R_Stack>
                      ) : (
                        <Center className={`bg-error-main h-full `}>未回答</Center>
                      )}
                    </>
                  ),
                  className: `${asSummary ? 'bg-primary-light' : ''} `,
                }
              }),
            ],
          }
        }),
    ],
  }).WithWrapper({})
  return (
    <div className={` w-fit max-w-[300px] overflow-auto `}>
      <div className={`table-wrapper   max-h-[700px] border-2 border-gray-400 shadow-sm `}>
        <table className={`table-fixed`}>
          <Thead {...{Game, activePrompt, handleDeletePrompt, isSummary, btnClass}} />
          <Tbody {...{GameCtxValue, players, toggleAttendance, deleteAnswer}} />
        </table>
      </div>
    </div>
  )
}
export default AnswerTable
