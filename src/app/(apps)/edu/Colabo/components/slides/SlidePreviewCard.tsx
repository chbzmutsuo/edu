'use client'

import {SlideBlock} from '@app/(apps)/edu/Colabo/(components)/SlideBlock'

interface SlidePreviewCardProps {
  slide: any
  index: number
  isSelected: boolean
  onSelect: () => void
}

export default function SlidePreviewCard({slide, index, isSelected, onSelect}: SlidePreviewCardProps) {
  const getTemplateLabel = (type: string) => {
    switch (type) {
      case 'normal':
        return 'ノーマル'
      case 'psycho':
        return '心理アンケート'
      case 'choice':
        return '選択クイズ'
      case 'freetext':
        return '自由記述クイズ'
      case 'summary':
        return 'まとめアンケート'
      default:
        return type
    }
  }

  return (
    <div
      onClick={onSelect}
      className={`
        bg-white rounded-lg shadow-md cursor-pointer transition-all
        ${isSelected ? 'ring-4 ring-blue-500 ring-offset-2' : 'hover:shadow-lg'}
      `}
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-gray-700">スライド #{index + 1}</span>
          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">{getTemplateLabel(slide.templateType)}</span>
        </div>
        {isSelected && <span className="text-blue-600 text-sm font-medium">選択中</span>}
      </div>

      {/* スライド内容 */}
      <div className="p-8 min-h-[400px] bg-white aspect-video">
        {slide.contentData?.title && <h2 className="text-2xl font-bold mb-6 text-center">{slide.contentData.title}</h2>}

        {/* ノーマルスライド */}
        {slide.templateType === 'normal' && (
          <div className="space-y-4">
            {slide.contentData?.blocks && slide.contentData.blocks.length > 0 ? (
              slide.contentData.blocks.map((block: any, blockIndex: number) => (
                <SlideBlock key={blockIndex} block={block} isPreview={true} />
              ))
            ) : (
              <div className="text-center text-gray-400 py-12">
                <p>コンテンツがありません</p>
                <p className="text-sm mt-2">右側のパネルでブロックを追加してください</p>
              </div>
            )}
          </div>
        )}

        {/* 選択クイズスライド */}
        {slide.templateType === 'choice' && (
          <div className="space-y-6">
            {slide.contentData?.question && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-lg font-medium text-gray-800">{slide.contentData.question}</p>
              </div>
            )}

            {slide.contentData?.choices && slide.contentData.choices.length > 0 ? (
              <div className="space-y-3">
                {slide.contentData.choices.map((choice: any, choiceIndex: number) => (
                  <div
                    key={choice.id}
                    className={`flex items-start space-x-3 p-3 rounded-lg border-2 ${
                      choice.isCorrect ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                      {choiceIndex + 1}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-gray-800">{choice.text || '（未入力）'}</p>
                    </div>
                    {choice.isCorrect && <span className="flex-shrink-0 text-green-600 font-bold text-sm">✓ 正解</span>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <p>選択肢がありません</p>
              </div>
            )}
          </div>
        )}

        {/* 自由記述スライド */}
        {slide.templateType === 'freetext' && (
          <div className="space-y-6">
            {slide.contentData?.question && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-lg font-medium text-gray-800 whitespace-pre-wrap">{slide.contentData.question}</p>
              </div>
            )}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-400">
              <p>自由記述の回答欄</p>
            </div>
          </div>
        )}

        {/* 心理アンケート/まとめスライド */}
        {(slide.templateType === 'psycho' || slide.templateType === 'summary') && (
          <div className="space-y-4">
            <div className="bg-purple-50 p-6 rounded-lg text-center">
              <p className="text-lg font-medium text-purple-900 mb-2">
                {slide.templateType === 'psycho' ? '心理アンケート' : 'まとめアンケート'}
              </p>
              <p className="text-sm text-purple-700">Groupingアプリの質問項目を使用します</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
