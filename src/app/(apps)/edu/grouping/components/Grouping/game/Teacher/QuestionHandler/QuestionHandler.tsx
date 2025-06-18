import {GameContextType} from '@app/(apps)/edu/grouping/components/Grouping/game/GameMainPage'
import {R_Stack} from '@components/styles/common-components/common-components'

import React from 'react'

import AnswerTable from './AnswerTable/AnswerTable'
import {Alert} from '@components/styles/common-components/Alert'
import {Button} from '@components/styles/common-components/Button'
import useGlobal from '@hooks/globalHooks/useGlobal'
import {twMerge} from 'tailwind-merge'

export default function QuestionHandler({
  useGroupReturnObj,
  GameCtxValue,
}: {
  useGroupReturnObj: any
  GameCtxValue: GameContextType
}) {
  const {handleCreateGroup, GroupConfirmationModal} = useGroupReturnObj
  const {Game, players} = GameCtxValue
  const {router} = useGlobal()

  const lastPrompt = GameCtxValue.Game.QuestionPrompt[GameCtxValue.Game.QuestionPrompt.length - 1]

  const requiredAnswerCount = players.filter(s => !Game.absentStudentIds.includes(s.id)).length

  const latestAnswers = Game?.Answer.filter(a => a.questionPromptId === lastPrompt.id)

  const filledAnswer = latestAnswers.filter(d => d.curiocity1)

  const answeredToBeFilledCount = requiredAnswerCount - filledAnswer.length

  return (
    <div className={`col-stack  mx-auto w-fit items-center `}>
      <R_Stack>
        <div className={`font-bold`}>回答状況</div>
        <Button color={`red`} className={`animate-pulse`} onClick={router.refresh}>
          更新する
        </Button>
      </R_Stack>

      <section>
        <R_Stack className={` items-start`}>
          {answeredToBeFilledCount === 0 && (
            <Alert
              className={`text-success-main p-0.5 text-center text-sm font-bold`}
              color={answeredToBeFilledCount === 0 ? `green` : `red`}
            >
              全員回答済
            </Alert>
          )}

          <table className={twMerge(`[&_td]:border-y-[1px]! [&_th]:border-y-[1px]!`, `text-center text-sm`)}>
            <thead>
              <tr>
                <th>必要回答数</th>
                <th>回答数</th>
                <th>未回答数</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td> {requiredAnswerCount}</td>
                <td>{filledAnswer.length}人</td>
                <td className={answeredToBeFilledCount > 0 ? 'bg-error-main text-white' : ''}>{answeredToBeFilledCount}人</td>
              </tr>
            </tbody>
          </table>
        </R_Stack>
      </section>

      <section className={``}>
        <AnswerTable {...{handleCreateGroup, GameCtxValue}} />
      </section>
    </div>
  )
}
