import {gpt_chat_getGptReply} from '@app/api/openAi/open-ai-lib'
import {arr__uniqArray} from '@cm/class/ArrHandler/array-utils/basic-operations'

import {anyObject} from '@cm/types/utility-types'
import {Button} from '@cm/components/styles/common-components/Button'
import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'
import {Paper} from '@cm/components/styles/common-components/paper'

import Loader from '@cm/components/utils/loader/Loader'
import {MarkDownDisplay} from '@cm/components/utils/texts/MarkdownDisplay'
import {ChevronsDownIcon} from 'lucide-react'
import {Prisma} from '@prisma/client'
import React, {useState} from 'react'

export default function TaskScoring({game}) {
  const [evaludation, setevaludation] = useState({
    score: undefined,
    suggestions: [],
    Deductions_Additions: [],
  })
  const {GameStudent, SubjectNameMaster} = game as Prisma.GameUncheckedCreateInput & {
    SubjectNameMaster: Prisma.SubjectNameMasterUncheckedCreateInput & anyObject
    GameStudent: (Prisma.GameStudentUncheckedCreateInput & anyObject)[]
  }

  const {task, learningContent} = game ?? {}

  const classroomMaster = arr__uniqArray(
    GameStudent?.map(gameStudent => {
      const classroom = gameStudent.Student.Classroom
      return classroom.grade + '年生'
    })
  )

  const pointOfViews = [
    `学年に応じた2つの異なる意見が出てくる課題になっているか`,
    `生徒の興味を引きつけ、学習意欲を高める課題になっているか`,
    `以下の学習内容を用いられるようなテーマになっているか`,
  ]
  const systemPrompt = [
    `${classroomMaster.join(`,`)} ${SubjectNameMaster.name}の授業で行う学習課題を「${task}」に設定しています。`,
    `以下の情報を参考にして、${pointOfViews.join(`,`)}、10段階で評価しなさい。また、よりより学習課題を３つ提案してください。`,
    `指定のフォーマットで返答すること`,

    `* 授業名: ${game.name}」`,
    ``,
    `* 学習課題:「${task}」`,
    ``,
    `* 教科: ${SubjectNameMaster.name}`,
    ``,
    `* 学年: ${classroomMaster.join(`,`)}`,
    ``,
    `* 学習内容`,
    `${learningContent}`,
    ``,
    `* response_format`,
    `以下のJSON Objectを返してください。 {
    score:number,
    Deductions_Additions: [{score:number, reason:string},...]

    suggestions:[{task:string, suggestReason:string}
    ]}`,
  ].join(`\n`)

  const Arrow = () => (
    <R_Stack className={`text-primary-main    mx-auto gap-0 font-bold `}>
      <ChevronsDownIcon className={`w-8`} />
      <ChevronsDownIcon className={`w-8`} />
      <ChevronsDownIcon className={`w-8`} />
    </R_Stack>
  )

  const [loading, setloading] = useState(false)

  return (
    <div>
      <C_Stack className={` items-center`}>
        {loading && <Loader />}
        <Button
          color={`primary`}
          className={`p-4 py-2 text-2xl `}
          onClick={async () => {
            setloading(true)
            const res = await gpt_chat_getGptReply({
              model: `gpt-4o`,
              response_format: {type: `json_object`},
              messages: [{role: `system`, content: systemPrompt}],
            })

            const reply = res.result
            const {score, suggestions, Deductions_Additions} = JSON.parse(reply.content)

            setevaludation({score, suggestions, Deductions_Additions})
            setloading(false)
          }}
        >
          採点する
        </Button>

        <R_Stack className={` items-stretch gap-8`}>
          {evaludation.score && (
            <div>
              <C_Stack className={`gap-3`}>
                <C_Stack className={`items-stretch justify-between`}>
                  <Paper className={`  w-[800px]`}>
                    <h2>採点対象:</h2>
                    <C_Stack className={`gap-2`}>
                      <div>
                        <div>学習課題</div>
                        <strong className={`text-primary-main`}>{task}</strong>
                      </div>
                      <div>
                        <div>内容</div>
                        <strong className={`text-primary-main`}>
                          <MarkDownDisplay>{learningContent}</MarkDownDisplay>
                        </strong>
                      </div>
                    </C_Stack>
                  </Paper>
                  <Arrow />
                  <section>
                    <IconBtn color={`blue`} className="mb-4 text-center text-3xl font-bold">
                      総合評価: {evaludation.score}
                    </IconBtn>
                  </section>
                  <Paper className={`  w-[800px]`}>
                    <h3 className="mb-2 text-lg font-semibold">採点基準:</h3>
                    <ul className="mb-4 list-inside list-disc">
                      {evaludation?.Deductions_Additions?.map((d, index) => {
                        const {score, reason} = d

                        return (
                          <li key={index} className="border-primary-main mb-6 border-b-4 text-lg font-bold  text-gray-700 ">
                            {reason}
                          </li>
                        )
                      })}
                    </ul>
                  </Paper>
                  <Arrow />
                  <Paper className={`  w-[800px]`}>
                    <h3 className="mb-2 text-lg font-semibold">提案:</h3>
                    <div className="space-y-4">
                      {evaludation.suggestions.map((suggestion, index) => {
                        const {task, suggestReason} = suggestion
                        return (
                          <div className="rounded-md bg-gray-100 p-2">
                            <p className="font-medium">{task}</p>
                            <p className="text-red-600">{suggestReason}</p>
                          </div>
                        )
                      })}
                    </div>
                  </Paper>
                </C_Stack>
              </C_Stack>
            </div>
          )}
        </R_Stack>
      </C_Stack>
    </div>
  )
}

const SuggestionsComponent = () => {
  return (
    <div className="mx-auto max-w-3xl rounded-lg bg-white p-6 shadow-lg">
      <h2 className="mb-4 text-xl font-bold">評価: 6</h2>
      <ul className="mb-4 list-inside list-disc">
        <li className="text-gray-700">
          2点 テーマは2位数の加法に焦点を当てているが、3位数の加法の筆算に関する要素が不足している。
        </li>
        <li className="text-gray-700">
          1点 ポテトチップスとポッキーの価格が具体的であるが、1年生にとっては少し難しいかもしれない。
        </li>
        <li className="text-gray-700">1点 テーマが具体的な商品に限定されているため、他の例に応用しにくい。</li>
      </ul>
      <h3 className="mb-2 text-lg font-semibold">提案:</h3>
      <div className="space-y-4">
        <div className="rounded-md bg-gray-100 p-4">
          <p className="font-medium">「ポテトチップス416円とチョコレートバー245円を合わせるといくらになりますか？」</p>
          <p className="text-red-600">3位数の加法を含む具体的な例であり、既習の2位数の加法の筆算を基に練習しやすい。</p>
        </div>
        <div className="rounded-md bg-gray-100 p-4">
          <p className="font-medium">「おもちゃの車が312円、ぬいぐるみが189円です。合わせていくらになりますか？」</p>
          <p className="text-red-600">子供が興味を持ちやすいテーマであり、3位数の加法の筆算を練習するのに適している。</p>
        </div>
        <div className="rounded-md bg-gray-100 p-4">
          <p className="font-medium">「本が275円、ノートが128円です。合わせていくらになりますか？」</p>
          <p className="text-red-600">日常生活でよく使う物を題材にしており、3位数の加法の筆算を練習するのに適している。</p>
        </div>
      </div>
    </div>
  )
}

// const defaultConfigs = [
//   {
//     subject: '国語',
//     grade: '小学校2年生',
//     task: 'スイミーの気もちを考えよう',
//     learningContent: [
//       '第 3 場面からスイミーが元気を取り戻していく様子や心情の変化について考える。',
//       'スイミーの心情の変化がわかりやすいように、ワークシートを使い色を使って表す。',
//     ].join(`\n`),
//   },
//   {
//     subject: '算数',
//     grade: '小学校3年生',
//     task: '大きいたし算の筆算を考えよう',
//     learningContent: [
//       '3 位数＋3 位数の筆算の仕方を、数の構成や既習の加法の筆算の仕方を基に考えることができる。',
//       'たし算の筆算は、3 けたになっても、位をそろえて書き、一の位からじゅんに位ごとに計算する。',
//     ].join(`\n`),
//   },
//   {
//     subject: '社会',
//     grade: '中学校１年生',
//     task: 'ヨーロッパ州の自然環境や農業にはどのような特色があるのだろうか。',
//     learningContent: [
//       'ヨーロッパ州の自然環境や農業の特色を理解する。',
//       'ヨーロッパ州の自然環境の特色と農業の関連を多面的・多角的に考察し，自分の言葉で表現できるようにする。',
//     ].join(`\n`),
//   },
//   {
//     subject: '道徳',
//     grade: '小学校4年生',
//     task: '友達と関わるとき、互いに気持ちよく生活するためにはどうすれば良いか考える',
//     learningContent: ['相手のことを理解して，寛容な気持ちをもてるようにする', '相手の事を考えて，相互理解を促す'],
//   },
// ]

// const defaultEvaluation = {
//   score: 6,
//   suggestions: [
//     {
//       task: '「ポテトチップス416円とチョコレートバー245円を合わせるといくらになりますか？」',
//       suggestReason: '3位数の加法を含む具体的な例であり、既習の2位数の加法の筆算を基に類推しやすい。',
//     },
//     {
//       task: '「おもちゃの車が312円、ぬいぐるみが189円です。合わせていくらになりますか？」',
//       suggestReason: '子供が興味を持ちやすいテーマであり、3位数の加法の筆算を練習するのに適している。',
//     },
//     {
//       task: '「本が275円、ノートが128円です。合わせていくらになりますか？」',
//       suggestReason: '日常生活でよく使う物を題材にしており、3位数の加法の筆算を練習するのに適している。',
//     },
//   ],
//   Deductions_Additions: [
//     {
//       score: -2,
//       reason: 'テーマは2位数の加法に焦点を当てているが、3位数の加法の筆算に関する要素が不足している。',
//     },
//     {
//       score: -1,
//       reason: 'ポテトチップスとポッキーの価格が具体的であるが、1年生にとっては少し難しいかもしれない。',
//     },
//     {
//       score: -1,
//       reason: 'テーマが具体的な商品に限定されているため、他の例に応用しにくい。',
//     },
//   ],
// }
