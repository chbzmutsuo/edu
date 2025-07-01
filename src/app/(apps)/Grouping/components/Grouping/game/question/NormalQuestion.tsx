import React from 'react'

import {anyObject} from '@cm/types/utility-types'
import {Center, C_Stack, R_Stack} from '@components/styles/common-components/common-components'
import {Paper, PaperLarge} from '@components/styles/common-components/paper'

const NormalQuestions = (props: anyObject) => {
  const {sortedQuestions, setanswers, answers, showFurigana, BasicForm, headerClass} = props
  const mustSummarize = props.mustSummarize

  const switchers = [
    {before: 'と思（おも）う', after: 'と思（おも）った', color: 'blue'},
    {before: 'と感じ（かんじ）る', after: 'と感じ（かんじ）た', color: 'blue'},
    {before: 'かからないと思（おも）う', after: 'あまりかからなかった', color: 'blue'},
    {before: 'とりくめる', after: 'とりくめた', color: 'blue'},
    {before: 'とりくむことができる', after: 'とりくむことができた', color: 'blue'},
    {before: 'やっていける', after: 'やっていけた', color: 'blue'},
    {before: '自信（じしん）がある', after: '自信（じしん）があった', color: 'blue'},
    {before: '力がある', after: '力があった', color: 'blue'},
  ]

  let summarizeQuestionSentence = mustSummarize
    ? '今日（きょう）の感想（かんそう）を記録（きろく）しましょう。'
    : 'グループで取（と）り組（く）みたいこと、抱負（ほうふ）などを書（か）いてください。'
  if (showFurigana === false) {
    // 括弧を取り除く
    summarizeQuestionSentence = summarizeQuestionSentence
      .split('）')
      .map(str => {
        const fix = str + '）'
        return fix.replace(/（.+）|）/g, '')
      })
      .join('')
  }

  return (
    <C_Stack className={`gap-10`}>
      <PaperLarge className={`bg-pink-100`}>
        {sortedQuestions.map((question, idx) => {
          const {type, questionKey} = question
          let label = question.label

          if (mustSummarize) {
            switchers.forEach(obj => {
              label = label.replace(obj.before, obj.after)
            })
          }

          if (!showFurigana) {
            const array = label.split('）').map(str => {
              const fix = str + '）'
              return fix.replace(/（.+）|）/g, '')
            })
            label = array.join('')
          }

          return (
            <div key={idx} className={`t-paper m-2 mb-4 bg-pink-50`}>
              <label className={` `}>
                <span className={`inline-block max-w-[600px] text-lg font-bold `}>{label}</span>
                <div className={`row-stack mx-auto my-4  justify-around text-center`}>
                  {new Array(5).fill(0).map((_, i) => {
                    const value = i + 1
                    return <Question {...{answers, setanswers, questionKey, value}} />
                  })}
                </div>
              </label>
            </div>
          )
        })}
      </PaperLarge>
      {mustSummarize && (
        <PaperLarge className={`bg-pink-100`}>
          <BasicForm
            {...{
              onSubmit: async (data, e) => undefined,
              ControlOptions: {
                ControlStyle: {width: '90vw'},
              },
            }}
          ></BasicForm>
        </PaperLarge>
      )}

      <PaperLarge className={`bg-pink-100`}>
        <R_Stack>
          <p className={headerClass}>{summarizeQuestionSentence}</p>
          <textarea
            // value={}
            value={answers['impression']}
            onChange={e => {
              setanswers(prev => {
                return {
                  ...prev,
                  ['impression']: e.target.value,
                }
              })
            }}
            className={`myFormControl  h-40`}
          />
        </R_Stack>
      </PaperLarge>
    </C_Stack>
  )
}

const Question = ({answers, setanswers, questionKey, value}) => {
  return (
    <Paper
      onClick={() => {
        setanswers(prev => {
          return {
            ...prev,
            [questionKey]: value,
          }
        })
      }}
      className={` detectHover h-10 w-10 rounded-sm text-2xl  font-bold
     ${answers[questionKey] === value ? ' bg-primary-main  text-2xl text-white opacity-100' : ''}
`}
    >
      <Center>{value}</Center>
    </Paper>
  )
}

export default NormalQuestions
