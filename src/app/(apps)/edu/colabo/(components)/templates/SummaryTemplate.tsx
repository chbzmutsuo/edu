'use client'

import {useState} from 'react'
import {SlideBlock} from '../SlideBlock'
import {Button} from '@cm/components/styles/common-components/Button'

const SUMMARY_QUESTIONS = [
  {
    category: '学習への取り組み',
    questions: [
      {type: 'curiocity1', label: '今日の授業内容に興味を持てました'},
      {type: 'curiocity2', label: '分からないことを積極的に質問できました'},
      {type: 'curiocity3', label: '難しい課題にも諦めずに取り組めました'},
      {type: 'curiocity4', label: '新しい発見や気づきがありました'},
      {type: 'curiocity5', label: 'もっと深く学びたいと思いました'}
    ]
  },
  {
    category: '理解度・達成感',
    questions: [
      {type: 'efficacy1', label: '今日の学習目標を達成できました'},
      {type: 'efficacy2', label: '授業の内容を理解することができました'},
      {type: 'efficacy3', label: '自分なりに考えて答えを見つけられました'},
      {type: 'efficacy4', label: '友達と協力して課題に取り組めました'},
      {type: 'efficacy5', label: '今日学んだことを他の人に説明できます'}
    ]
  }
]

const SCALE_OPTIONS = [
  {value: 1, label: 'まったくそう思わない'},
  {value: 2, label: 'そう思わない'},
  {value: 3, label: 'どちらでもない'},
  {value: 4, label: 'そう思う'},
  {value: 5, label: 'とてもそう思う'}
]

export const SummaryTemplate = ({
  slide, 
  blocks = [], 
  isTeacher = false, 
  isPreview = false,
  responses = [],
  onSubmitResponse,
  showResults = false,
  showRanking = false
}) => {
  const [answers, setAnswers] = useState({})
  const [impression, setImpression] = useState('')
  const [satisfaction, setSatisfaction] = useState(null)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const otherBlocks = blocks.filter(b => !['summary_question'].includes(b.blockType))

  const handleAnswerChange = (questionType, value) => {
    if (!hasSubmitted && !isTeacher) {
      setAnswers(prev => ({
        ...prev,
        [questionType]: parseInt(value)
      }))
    }
  }

  const handleSubmit = () => {
    if (Object.keys(answers).length === 10 && satisfaction && onSubmitResponse) {
      onSubmitResponse({
        slideId: slide.id,
        responseType: 'summary',
        ...answers,
        lessonImpression: impression,
        lessonSatisfaction: satisfaction,
        asSummary: true
      })
      setHasSubmitted(true)
    }
  }

  const isAllAnswered = Object.keys(answers).length === 10 && satisfaction

  // Calculate ranking and averages for teacher view
  const getRankingData = () => {
    if (responses.length === 0) return []
    
    return responses.map((response, index) => {
      const totalScore = SUMMARY_QUESTIONS.reduce((sum, category) => {
        return sum + category.questions.reduce((catSum, q) => catSum + (response[q.type] || 0), 0)
      }, 0)
      
      return {
        studentId: response.studentId,
        student: response.Student,
        totalScore,
        satisfaction: response.lessonSatisfaction,
        impression: response.lessonImpression
      }
    }).sort((a, b) => b.totalScore - a.totalScore)
  }

  const getAverageScores = () => {
    if (responses.length === 0) return {}
    
    const totals = {}
    SUMMARY_QUESTIONS.forEach(category => {
      category.questions.forEach(q => {
        totals[q.type] = responses.reduce((sum, r) => sum + (r[q.type] || 0), 0) / responses.length
      })
    })
    
    return totals
  }

  const rankingData = isTeacher ? getRankingData() : []
  const averageScores = isTeacher ? getAverageScores() : {}

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* スライドタイトル */}
      {slide?.title && (
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          {slide.title}
        </h1>
      )}
      
      {/* その他のブロック */}
      {otherBlocks.length > 0 && (
        <div className="space-y-6 mb-8">
          {otherBlocks
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map(block => (
              <SlideBlock 
                key={block.id || block.tempId} 
                block={block} 
                isPreview={isPreview}
              />
            ))}
        </div>
      )}

      {/* まとめアンケート質問 */}
      {!isTeacher && !isPreview && !hasSubmitted && (
        <div className="space-y-8">
          {SUMMARY_QUESTIONS.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-6 text-gray-800">
                {category.category}
              </h3>
              
              <div className="space-y-6">
                {category.questions.map((question, questionIndex) => (
                  <div key={question.type} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">
                        {categoryIndex * 5 + questionIndex + 1}. {question.label}
                      </h4>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                      {SCALE_OPTIONS.map(option => {
                        const isSelected = answers[question.type] === option.value
                        return (
                          <button
                            key={option.value}
                            onClick={() => handleAnswerChange(question.type, option.value)}
                            className={`
                              p-3 text-sm rounded-lg border transition-all
                              ${isSelected ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:border-gray-400'}
                              cursor-pointer
                            `}
                          >
                            <div className="font-medium">{option.value}</div>
                            <div className="text-xs mt-1">{option.label}</div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* 授業満足度 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-6 text-gray-800">
              授業の満足度
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map(value => {
                const isSelected = satisfaction === value
                return (
                  <button
                    key={value}
                    onClick={() => setSatisfaction(value)}
                    className={`
                      p-4 text-center rounded-lg border transition-all
                      ${isSelected ? 'border-yellow-500 bg-yellow-50 text-yellow-700' : 'border-gray-300 hover:border-gray-400'}
                      cursor-pointer
                    `}
                  >
                    <div className="text-2xl mb-1">
                      {'★'.repeat(value)}{'☆'.repeat(5-value)}
                    </div>
                    <div className="text-xs">{value}点</div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 感想入力 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              今日の授業の感想
            </h3>
            <textarea
              value={impression}
              onChange={(e) => setImpression(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 h-24 resize-none"
              placeholder="今日の授業で学んだことや感じたことを自由に書いてください..."
            />
          </div>

          {/* 送信ボタン */}
          <div className="text-center">
            <div className="mb-4">
              <div className="text-sm text-gray-600">
                回答済み: {Object.keys(answers).length + (satisfaction ? 1 : 0)} / 11
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{width: `${((Object.keys(answers).length + (satisfaction ? 1 : 0)) / 11) * 100}%`}}
                />
              </div>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!isAllAnswered}
              size="lg"
            >
              まとめアンケートを送信
            </Button>
          </div>
        </div>
      )}

      {/* 回答完了メッセージ */}
      {!isTeacher && hasSubmitted && (
        <div className="text-center p-6 bg-green-50 rounded-lg">
          <div className="text-green-800 font-medium">まとめアンケートを送信しました</div>
          <div className="text-green-600 text-sm mt-1">
            お疲れさまでした！
          </div>
        </div>
      )}

      {/* 教師用ランキング表示 */}
      {isTeacher && showRanking && rankingData.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-center text-gray-800">
            学習への取り組みランキング
          </h3>
          
          <div className="space-y-4">
            {rankingData.slice(0, 10).map((student, index) => (
              <div key={student.studentId} className={`
                p-4 rounded-lg border-2 ${
                  index === 0 ? 'border-yellow-400 bg-yellow-50' :
                  index === 1 ? 'border-gray-400 bg-gray-50' :
                  index === 2 ? 'border-orange-400 bg-orange-50' :
                  'border-gray-200 bg-white'
                }
              `}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center font-bold text-white
                      ${index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-500' :
                        index === 2 ? 'bg-orange-500' :
                        'bg-blue-500'}
                    `}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{student.student?.name || `生徒${student.studentId}`}</div>
                      <div className="text-sm text-gray-600">
                        満足度: {'★'.repeat(student.satisfaction)}{'☆'.repeat(5-student.satisfaction)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{student.totalScore}</div>
                    <div className="text-sm text-gray-600">/ 50点</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 教師用コントロール */}
      {isTeacher && !isPreview && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-700">教師用コントロール</h3>
            <div className="text-sm text-gray-600">
              回答数: {responses.length}人
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              onClick={() => showResults = !showResults}
              variant={showResults ? "default" : "outline"}
            >
              {showResults ? '結果を隠す' : '結果を表示'}
            </Button>
            <Button
              onClick={() => showRanking = !showRanking}
              variant={showRanking ? "default" : "outline"}
            >
              {showRanking ? 'ランキングを隠す' : 'ランキングを表示'}
            </Button>
            <Button variant="outline">
              CSVダウンロード
            </Button>
            <Button variant="outline">
              授業終了
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}