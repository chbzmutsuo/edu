'use client'

import {useSortable} from '@dnd-kit/sortable'
import {CSS} from '@dnd-kit/utilities'

interface SlideThumbnailProps {
  slide: any
  index: number
  isSelected: boolean
  onSelect: () => void
}

export default function SlideThumbnail({slide, index, isSelected, onSelect}: SlideThumbnailProps) {
  const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({id: slide.id})

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const getTemplateIcon = (type: string) => {
    switch (type) {
      case 'normal':
        return '📝'
      case 'psycho':
        return '🧠'
      case 'choice':
        return '☑️'
      case 'freetext':
        return '✍️'
      case 'summary':
        return '📊'
      default:
        return '📄'
    }
  }

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <button
        onClick={onSelect}
        className={`
          w-full text-left rounded-lg border-2 transition-all
          ${isSelected ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 bg-white hover:border-gray-300'}
        `}
      >
        {/* ドラッグハンドル */}
        <div {...attributes} {...listeners} className="absolute top-1 right-1 cursor-move p-1 text-gray-400 hover:text-gray-600">
          ⋮⋮
        </div>

        {/* サムネイル内容 */}
        <div className="p-2">
          {/* スライド番号 */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-600">#{index + 1}</span>
            <span className="text-lg">{getTemplateIcon(slide.templateType)}</span>
          </div>

          {/* プレビュー */}
          <div className="bg-gray-100 rounded border border-gray-200 aspect-video flex items-center justify-center overflow-hidden">
            {slide.contentData?.title ? (
              <div className="text-xs text-gray-600 px-2 text-center line-clamp-2">{slide.contentData.title}</div>
            ) : (
              <div className="text-xs text-gray-400">タイトルなし</div>
            )}
          </div>
        </div>
      </button>
    </div>
  )
}
