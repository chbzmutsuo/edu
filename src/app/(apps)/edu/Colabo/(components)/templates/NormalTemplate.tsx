'use client'

import {SlideBlock} from '../SlideBlock'

export const NormalTemplate = ({
  slide,
  blocks = [],
  isTeacher = false,
  isPreview = false,
}: {
  slide: any
  blocks: any[]
  isTeacher: boolean
  isPreview: boolean
}) => {
  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* スライドタイトル */}
      {slide?.title && <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">{slide.title}</h1>}
      gsa'jgas'
      {/* ブロック表示 */}
      <div className="space-y-1">
        {blocks
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map(block => (
            <SlideBlock key={block.id || block.tempId} block={block} isPreview={isPreview} />
          ))}
      </div>
      {/* 教師用コントロール */}
      {isTeacher && !isPreview && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-2">教師用コントロール</h3>
          <p className="text-sm text-gray-600">
            ノーマルモードでは生徒の操作は必要ありません。 次のスライドに進むか、他のテンプレートに切り替えてください。
          </p>
        </div>
      )}
    </div>
  )
}
