import {Fragment} from 'react'

import {anyObject} from '@cm/types/utility-types'
import {obj__initializeProperty} from '@class/ObjHandler/transformers'

const Waiting = ({Game, GameCtxValue}) => {
  const allAnswerObject = {}
  const GameAnswer = Game?.Answer ?? []

  Game?.QuestionPrompt?.forEach((data, i) => {
    const Answer = GameAnswer.filter(ans => ans.questionPromptId === data.id)
    // const {Answer} = data
    const objKey = `prompt${i + 1}`
    obj__initializeProperty(allAnswerObject, objKey, [])
    const answers = Answer?.sort((a, b) => {
      return a.createdAt - b.createdAt
    })

    allAnswerObject[objKey] = answers
  })

  return (
    <div className={` mx-auto  `}>
      <h1>今日のクラスメートの感想・意気込み</h1>
      <div className={`sticky-table-wrapper  text-xl`}>
        <table className={` `}>
          {Object.keys(allAnswerObject).map((key, i) => {
            const data = allAnswerObject[key] ?? []

            return (
              <Fragment key={i}>
                <tbody>
                  <tr>
                    <th className={`bg-primary-main text-white`}>{`${i + 1}回目回答`}</th>
                  </tr>
                  {data.map((answer: anyObject, idx) => {
                    const {impression} = answer
                    if (impression) {
                      return (
                        <tr key={idx}>
                          <td>{answer.impression}</td>
                        </tr>
                      )
                    }
                  })}
                </tbody>
              </Fragment>
            )
          })}
        </table>
      </div>
    </div>
  )
}

export default Waiting
