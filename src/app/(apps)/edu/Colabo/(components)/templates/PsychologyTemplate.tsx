'use client'

import {useState} from 'react'
import {SlideBlock} from '../SlideBlock'
import {Button} from '@cm/components/styles/common-components/Button'

// Grouping.tsxから心理アンケートの質問を参照
const PSYCHOLOGY_QUESTIONS = [
  {
    category: '好奇心',
    questions: [
      {type: 'curiocity1', label: '新しいことを学ぶのが好きです'},
      {type: 'curiocity2', label: 'わからないことがあると調べたくなります'},
      {type: 'curiocity3', label: '難しい問題にチャレンジするのが好きです'},
      {type: 'curiocity4', label: '「なぜ？」「どうして？」と疑問を持つことが多いです'},
      {type: 'curiocity5', label: '新しい発見をするのが楽しいです'},
    ],
  },
  {
    category: '自己効力感',
    questions: [
      {type: 'efficacy1', label: '努力すれば成果を出すことができます'},
      {type: 'efficacy2', label: '困難な状況でも乗り越えることができます'},
      {type: 'efficacy3', label: '自分の能力を信じています'},
      {type: 'efficacy4', label: '目標を達成する自信があります'},
      {type: 'efficacy5', label: '失敗しても立ち直ることができます'},
    ],
  },
]

const SCALE_OPTIONS = [
  {value: 1, label: 'まったくそう思わない'},
  {value: 2, label: 'そう思わない'},
  {value: 3, label: 'どちらでもない'},
  {value: 4, label: 'そう思う'},
  {value: 5, label: 'とてもそう思う'},
]

export const PsychologyTemplate = ({
  slide,
  blocks = [],
  isTeacher = false,
  isPreview = false,
  responses = [],
  onSubmitResponse,
  showResults = false,
}: {
  slide: any
  blocks: any[]
  isTeacher: boolean
  isPreview: boolean
  responses: any[]
  onSubmitResponse: (response: any) => void
  showResults: boolean
}) => {
  const [answers, setAnswers] = useState({})
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const otherBlocks = blocks.filter(b => !['psychology_question'].includes(b.blockType))

  const handleAnswerChange = (questionType, value) => {
    if (!hasSubmitted && !isTeacher) {
      setAnswers(prev => ({
        ...prev,
        [questionType]: parseInt(value),
      }))
    }
  }

  const handleSubmit = () => {
    if (Object.keys(answers).length === 10 && onSubmitResponse) {
      onSubmitResponse({
        slideId: slide.id,
        responseType: 'psychology',
        ...answers,
      })
      setHasSubmitted(true)
    }
  }

  const isAllAnswered = Object.keys(answers).length === 10

  // Calculate average scores for teacher view
  const getAverageScores = () => {
    if (responses.length === 0) return {}

    const totals = {}
    PSYCHOLOGY_QUESTIONS.forEach(category => {
      category.questions.forEach(q => {
        totals[q.type] = responses.reduce((sum, r) => sum + (r[q.type] || 0), 0) / responses.length
      })
    })

    return totals
  }

  const averageScores = isTeacher ? getAverageScores() : {}

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* スライドタイトル */}
      {slide?.title && <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">{slide.title}</h1>}

      {/* その他のブロック */}
      {otherBlocks.length > 0 && (
        <div className="space-y-6 mb-8">
          {otherBlocks
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map(block => (
              <SlideBlock key={block.id || block.tempId} block={block} isPreview={isPreview} />
            ))}
        </div>
      )}

      {/* 心理アンケート質問 */}
      <div className="space-y-8">
        {PSYCHOLOGY_QUESTIONS.map((category, categoryIndex) => (
          <div key={categoryIndex} className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-6 text-gray-800">{category.category}に関する質問</h3>

            <div className="space-y-1">
              {category.questions.map((question, questionIndex) => (
                <div key={question.type} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      {categoryIndex * 5 + questionIndex + 1}. {question.label}
                    </h4>
                  </div>

                  {/* 生徒用回答選択肢 */}
                  {!isTeacher && !isPreview && (
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                      {SCALE_OPTIONS.map(option => {
                        const isSelected = answers[question.type] === option.value
                        return (
                          <button
                            key={option.value}
                            onClick={() => handleAnswerChange(question.type, option.value)}
                            disabled={hasSubmitted}
                            className={`
                              p-3 text-sm rounded-lg border transition-all
                              ${isSelected ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:border-gray-400'}
                              ${hasSubmitted ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                            `}
                          >
                            <div className="font-medium">{option.value}</div>
                            <div className="text-xs mt-1">{option.label}</div>
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {/* 教師用結果表示 */}
                  {isTeacher && showResults && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">平均スコア</span>
                        <span className="font-medium">
                          {averageScores[question.type] ? averageScores[question.type].toFixed(1) : '0.0'} / 5.0
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{width: `${(averageScores[question.type] || 0) * 20}%`}}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 生徒用回答ボタン */}
      {!isTeacher && !isPreview && !hasSubmitted && (
        <div className="text-center mt-8">
          <div className="mb-4">
            <div className="text-sm text-gray-600">回答済み: {Object.keys(answers).length} / 10</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{width: `${(Object.keys(answers).length / 10) * 100}%`}}
              />
            </div>
          </div>
          <Button onClick={handleSubmit} disabled={!isAllAnswered} size="lg">
            アンケートを送信
          </Button>
        </div>
      )}

      {/* 回答完了メッセージ */}
      {!isTeacher && hasSubmitted && (
        <div className="text-center mt-8 p-6 bg-green-50 rounded-lg">
          <div className="text-green-800 font-medium">アンケートを送信しました</div>
          <div className="text-green-600 text-sm mt-1">全員の回答が完了するまでお待ちください</div>
        </div>
      )}

      {/* 教師用コントロール */}
      {isTeacher && !isPreview && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-700">教師用コントロール</h3>
            <div className="text-sm text-gray-600">回答数: {responses.length}人</div>
          </div>

          <div className="flex space-x-2">
            <Button onClick={() => (showResults = !showResults)}>{showResults ? '結果を隠す' : '結果を表示'}</Button>
            <Button>強制締切</Button>
            <Button>自動班編成</Button>
            <Button>次のスライドへ</Button>
          </div>

          {showResults && responses.length > 0 && (
            <div className="mt-4 text-sm text-gray-600">アンケート結果に基づいて自動的に学習班を編成できます。</div>
          )}
        </div>
      )}
    </div>
  )
}
