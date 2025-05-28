import {ClassRoom, Grouping} from '@app/(apps)/Grouping/class/Grouping'
import StudentAnswerHistory from '@app/(apps)/Grouping/components/Grouping/game/Teacher/QuestionHandler/StudentAnswerHistory'
import {Button} from '@components/styles/common-components/Button'

import {Center, Circle, R_Stack} from '@components/styles/common-components/common-components'
import useGlobal from '@hooks/globalHooks/useGlobal'
import {doStandardPrisma} from '@lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

import {Fragment} from 'react'

export const Tbody = ({GameCtxValue, players, toggleAttendance, deleteAnswer}) => {
  const {Game, GAME_CLASS, activePrompt, player} = GameCtxValue

  const {toggleLoad} = useGlobal()
  return (
    <tbody>
      {players
        ?.sort((x, y) => {
          return new ClassRoom(x.Class).className.localeCompare(new ClassRoom(y.Class).className)
        })
        .map((s: any) => {
          const StudentAnswer = Game.Answer.filter(a => a.studentId === s.id)

          return (
            // 児童・生徒一人分
            <tr key={s.id} className={` text-center text-[11px]`}>
              <td>
                <input
                  type="checkbox"
                  checked={GAME_CLASS.isThisStudentAttending(s.id)}
                  onChange={e => {
                    toggleAttendance(e, s.id)
                  }}
                />
              </td>
              <td>{s?.Classroom?.grade}</td>
              <td>{s?.Classroom?.class}</td>
              <td>{s?.gender}</td>
              <td width={100}>
                <StudentAnswerHistory {...{GameCtxValue, student: s}} />
              </td>

              {Game?.QuestionPrompt.map((prompt, i) => {
                const {createdAt, active, asSummary} = prompt
                const AnswerByThisStudent = StudentAnswer.find(a => {
                  return a.questionPromptId === prompt.id
                })

                const {curiocity, efficacy} = Grouping.getCuriocityAndEfficacy(AnswerByThisStudent) ?? {}

                return (
                  <Fragment key={prompt.id}>
                    <td width={45} className={`${asSummary ? 'bg-primary-light' : ''} `}>
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
                    </td>
                  </Fragment>
                )
              })}
            </tr>
          )
        })}
    </tbody>
  )
}
