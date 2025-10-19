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
      </div>
    </div>
  )
}
