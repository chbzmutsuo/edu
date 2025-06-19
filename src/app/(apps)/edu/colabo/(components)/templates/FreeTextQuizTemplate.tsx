'use client'

import {useState} from 'react'
import {SlideBlock} from '../SlideBlock'
import {Button} from '@cm/components/styles/common-components/Button'

export const FreeTextQuizTemplate = ({
  slide, 
  blocks = [], 
  isTeacher = false, 
  isPreview = false,
  responses = [],
  onSubmitResponse,
  onShareResponse,
  showResults = false
}) => {
  const [textAnswer, setTextAnswer] = useState('')
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const questionBlocks = blocks.filter(b => b.blockType === 'quiz_question')
  const otherBlocks = blocks.filter(b => b.blockType !== 'quiz_question')

  const handleSubmit = () => {
    if (textAnswer.trim() && onSubmitResponse) {
      onSubmitResponse({
        slideId: slide.id,
        responseType: 'text',
        textAnswer: textAnswer.trim()
      })
      setHasSubmitted(true)
    }
  }

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

      {/* 生徒用回答入力 */}
      {!isTeacher && !isPreview && !hasSubmitted && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              あなたの回答
            </label>
            <textarea
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 h-32 resize-none"
              placeholder="こちらに自由に回答を入力してください..."
            />
          </div>
          
          <div className="text-center">
            <Button
              onClick={handleSubmit}
              disabled={!textAnswer.trim()}
              size="lg"
            >
              回答を送信
            </Button>
          </div>
        </div>
      )}

      {/* 回答完了メッセージ */}
      {!isTeacher && hasSubmitted && (
        <div className="text-center p-6 bg-green-50 rounded-lg">
          <div className="text-green-800 font-medium">回答を送信しました</div>
          <div className="text-green-600 text-sm mt-1">
            先生が回答を共有するまでお待ちください
          </div>
        </div>
      )}

      {/* 教師用回答一覧 */}
      {isTeacher && showResults && responses.length > 0 && (
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-semibold text-gray-800">生徒の回答一覧</h3>
          <div className="space-y-3">
            {responses.map((response, index) => (
              <div key={response.id || index} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-sm text-gray-500 mb-1">
                      生徒 {index + 1}
                    </div>
                    <div className="text-gray-900">
                      {response.textAnswer}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onShareResponse && onShareResponse(response)}
                  >
                    共有
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 共有された回答の表示 */}
      {!isTeacher && isPreview && (
        <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-medium text-yellow-800 mb-2">共有された回答</h3>
          <div className="text-yellow-700">
            {/* 共有された回答がここに表示される */}
            先生が選んだ回答がここに表示されます
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
              {showResults ? '回答を隠す' : '回答を表示'}
            </Button>
            <Button variant="outline">
              締切
            </Button>
            <Button variant="outline">
              次のスライドへ
            </Button>
          </div>
          
          {showResults && (
            <div className="mt-4 text-sm text-gray-600">
              回答を選択して「共有」ボタンを押すと、生徒の画面に表示されます。
            </div>
          )}
        </div>
      )}
    </div>
  )
}