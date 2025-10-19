'use client'

import {DndContext, closestCenter, PointerSensor, useSensor, useSensors} from '@dnd-kit/core'
import {SortableContext, verticalListSortingStrategy} from '@dnd-kit/sortable'
import SlideThumbnail from './SlideThumbnail'
import AutoGridContainer from '@cm/components/utils/AutoGridContainer'
const templates = [
  {type: 'normal', icon: '📝', label: 'ノーマル'},
  {type: 'choice', icon: '☑️', label: '選択クイズ'},
  {type: 'freetext', icon: '✍️', label: '自由記述'},
  {type: 'psycho', icon: '🧠', label: '心理アンケート'},
  {type: 'summary', icon: '📊', label: 'まとめ'},
]

interface LeftSidebarProps {
  slides: any[]
  selectedSlideId: number | null
  onSelectSlide: (slideId: number) => void
  onReorderSlides: (oldIndex: number, newIndex: number) => void
  onAddSlide: (templateType: string) => void
}

export default function LeftSidebar({slides, selectedSlideId, onSelectSlide, onReorderSlides, onAddSlide}: LeftSidebarProps) {
  const sensors = useSensors(useSensor(PointerSensor))

  const handleDragEnd = (event: any) => {
    const {active, over} = event
    if (!over || active.id === over.id) return

    const oldIndex = slides.findIndex(s => s.id === active.id)
    const newIndex = slides.findIndex(s => s.id === over.id)

    if (oldIndex !== -1 && newIndex !== -1) {
      onReorderSlides(oldIndex, newIndex)
    }
  }

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-sm text-gray-700 mb-3">スライドを追加</h3>
        <AutoGridContainer {...{maxCols: {md: 3}}} className="gap-2">
          {templates.map(template => (
            <button
              key={template.type}
              onClick={() => onAddSlide(template.type)}
              className="w-full flex items-center space-x-2 p-1 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
            >
              <span className="text-xl">{template.icon}</span>
              <span className="text-xs font-medium">{template.label}</span>
            </button>
          ))}
        </AutoGridContainer>
      </div>
      {/* ヘッダー */}
      <div className="p-3 border-b border-gray-200 bg-white">
        <h3 className="font-semibold text-sm text-gray-700">スライド一覧</h3>
        <p className="text-xs text-gray-500 mt-1">{slides.length}枚</p>
      </div>

      {/* スライドサムネイル一覧 */}
      <div className="flex-1 overflow-y-auto p-2">
        {slides.length > 0 ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={slides.map(s => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {slides.map((slide, index) => (
                  <SlideThumbnail
                    key={slide.id}
                    slide={slide}
                    index={index}
                    isSelected={slide.id === selectedSlideId}
                    onSelect={() => onSelectSlide(slide.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="text-center py-8 text-gray-400 text-sm">
            <div className="text-2xl mb-2">📄</div>
            <p>スライドがありません</p>
          </div>
        )}
      </div>
    </div>
  )
}
