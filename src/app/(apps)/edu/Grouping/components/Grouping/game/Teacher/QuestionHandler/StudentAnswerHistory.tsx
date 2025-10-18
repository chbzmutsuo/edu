import {Grouping} from '@app/(apps)/edu/class/Grouping'

import {formatDate} from '@cm/class/Days/date-utils/formatters'

import BasicModal from '@cm/components/utils/modal/BasicModal'
import SimpleTable from '@cm/components/utils/SimpleTable'
import {Alert} from '@cm/components/styles/common-components/Alert'

const StudentAnswerHistory = ({student, GameCtxValue}) => {
  const {Game, players, GAME_CLASS, activePrompt} = GameCtxValue
  const StudentAnswer = Game.Answer.filter(ans => ans.studentId === student.id)
  return (
    <>
      <BasicModal
        {...{
          alertOnClose: false,
          toggle: <button className={`icon-btn p-0.5 py-1  `}>{student.name}</button>,
        }}
      >
        <div>
          <SimpleTable
            {...{
              style: {width: 800},
              headerArr: ['時間', '好奇心', '効果的', '区分', '感想', '授業評価'],
              bodyArr: StudentAnswer.map(ans => {
                const {createdAt, questionPromptId, impression, lessonSatisfaction} = ans
                const {curiocity, efficacy} = Grouping.getCuriocityAndEfficacy(ans)

                const isRandomQuestion = !questionPromptId

                const type = isRandomQuestion ? (
                  <Alert color="red">ランダム</Alert>
                ) : lessonSatisfaction ? (
                  <Alert color="blue">まとめ</Alert>
                ) : (
                  <Alert>一斉</Alert>
                )
                return [
                  formatDate(createdAt, 'HH:mm'),
                  curiocity ? curiocity : '未回答',
                  efficacy ? efficacy : '未回答',
                  type,
                  <div className={`text-start`}>{impression}</div>,
                  lessonSatisfaction,
                ]
              }),
              options: {
                th: {
                  widthArr: [20, 20, 20, 20, 100, 20],
                },
              },
            }}
          />
        </div>
      </BasicModal>
    </>
  )
}

export default StudentAnswerHistory
