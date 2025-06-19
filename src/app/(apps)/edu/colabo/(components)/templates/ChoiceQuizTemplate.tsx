'use client'

import {useState, useEffect} from 'react'
import {SlideBlock} from '../SlideBlock'
import {Button} from '@cm/components/styles/common-components/Button'

export const ChoiceQuizTemplate = ({
  slide, 
  blocks = [], 
  isTeacher = false, 
  isPreview = false,
  responses = [],
  onSubmitResponse,
  onShowResults,
  showResults = false
}) => {
  const [selectedChoice, setSelectedChoice] = useState(null)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const questionBlocks = blocks.filter(b => b.blockType === 'quiz_question')
  const choiceBlocks = blocks.filter(b => b.blockType === 'choice_option')
  const otherBlocks = blocks.filter(b => !['quiz_question', 'choice_option'].includes(b.blockType))

  const handleChoiceSelect = (choiceId) => {
    if (!hasSubmitted && !isTeacher) {
      setSelectedChoice(choiceId)
    }
  }

  const handleSubmit = () => {
    if (selectedChoice && onSubmitResponse) {
      onSubmitResponse({
        slideId: slide.id,
        responseType: 'choice',
        choiceAnswer: selectedChoice
      })
      setHasSubmitted(true)
    }
  }

  // Calculate results for teacher view
  const getChoiceStats = () => {
    const stats = {}
    choiceBlocks.forEach(choice => {
      stats[choice.id] = {
        count: responses.filter(r => r.choiceAnswer === choice.id).length,
        percentage: responses.length > 0 ? 
          Math.round((responses.filter(r => r.choiceAnswer === choice.id).length / responses.length) * 100) : 0,
        isCorrect: choice.isCorrectAnswer
      }
    })
    return stats
  }

  const choiceStats = isTeacher ? getChoiceStats() : {}

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

      {/* クイズ問題 */}
      {questionBlocks.length > 0 && (
        <div className="mb-8">
          {questionBlocks
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map(block => (
              <div key={block.id || block.tempId} className="bg-blue-50 p-6 rounded-lg">
                <SlideBlock block={block} isPreview={true} />
              </div>
            ))}
        </div>
      )}

      {/* 選択肢 */}
      {choiceBlocks.length > 0 && (
        <div className="space-y-4 mb-8">
          {choiceBlocks
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((choice, index) => {
              const isSelected = selectedChoice === choice.id
              const stats = choiceStats[choice.id]
              
              return (
                <div key={choice.id || choice.tempId} className="relative">
                  <div
                    className={`
                      border-2 rounded-lg p-4 cursor-pointer transition-all
                      ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                      ${hasSubmitted && choice.isCorrectAnswer ? 'border-green-500 bg-green-50' : ''}
                      ${hasSubmitted && isSelected && !choice.isCorrectAnswer ? 'border-red-500 bg-red-50' : ''}
                    `}
                    onClick={() => handleChoiceSelect(choice.id)}
                  >
                    <div className="flex items-center">
                      <div className={`
                        w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center
                        ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}
                      `}>
                        {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {String.fromCharCode(65 + index)}. {choice.content}
                        </div>
                        
                        {/* 教師用統計表示 */}
                        {isTeacher && showResults && stats && (
                          <div className="mt-2 flex items-center space-x-4">
                            <div className="text-sm text-gray-600">
                              {stats.count}人 ({stats.percentage}%)
                            </div>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${stats.isCorrect ? 'bg-green-500' : 'bg-blue-500'}`}
                                style={{width: `${stats.percentage}%`}}
                              />
                            </div>
                            {stats.isCorrect && (
                              <span className="text-green-600 text-sm font-medium">正解</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
        </div>
      )}

      {/* 生徒用回答ボタン */}
      {!isTeacher && !isPreview && !hasSubmitted && (
        <div className="text-center">
          <Button
            onClick={handleSubmit}
            disabled={!selectedChoice}
            size="lg"
          >
            回答を送信
          </Button>
        </div>
      )}

      {/* 回答完了メッセージ */}
      {!isTeacher && hasSubmitted && (
        <div className="text-center p-6 bg-green-50 rounded-lg">
          <div className="text-green-800 font-medium">回答を送信しました</div>
          <div className="text-green-600 text-sm mt-1">
            先生が結果を発表するまでお待ちください
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
              onClick={() => onShowResults && onShowResults(!showResults)}
              variant={showResults ? "default" : "outline"}
            >
              {showResults ? '結果を隠す' : '結果を表示'}
            </Button>
            <Button variant="outline">
              締切
            </Button>
            <Button variant="outline">
              次のスライドへ
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}