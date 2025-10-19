'use client'

import {useState} from 'react'
import {Button} from '@cm/components/styles/common-components/Button'
import {toast} from 'react-toastify'
import {createSlide, deleteSlide, updateSlideOrder} from '../../../colabo-server-actions'
import QRCodeDisplay from '../../../parts/QRCodeDisplay'
import Link from 'next/link'
import {DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import {CSS} from '@dnd-kit/utilities'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {HREF} from '@cm/lib/methods/urls'

interface SlideManagementPageProps {
  game: any
}

// ドラッグ可能なスライドアイテム
function SortableSlideItem({slide, onDelete, gameId}: {slide: any; onDelete: (id: number) => void; gameId: number}) {
  const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({id: slide.id})
  const {query} = useGlobal()
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

  const getTemplateName = (type: string) => {
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
    <div ref={setNodeRef} style={style} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {/* ドラッグハンドル */}
          <button {...attributes} {...listeners} className="cursor-move text-gray-400 hover:text-gray-600 mt-1">
            ⋮⋮
          </button>

          {/* スライド情報 */}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl">{getTemplateIcon(slide.templateType)}</span>
              <span className="text-sm font-medium text-gray-600">{getTemplateName(slide.templateType)}</span>
            </div>
            <div className="text-sm text-gray-500">
              スライド #{Math.floor(slide.sortOrder) + 1} • ID: {slide.id}
            </div>
          </div>
        </div>

        {/* アクション */}
        <div className="flex items-center space-x-2">
          <Link href={HREF(`/edu/Colabo/games/${gameId}/slides/${slide.id}/edit`, {}, query)}>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              編集
            </Button>
          </Link>
          <Button size="sm" onClick={() => onDelete(slide.id)} className="bg-red-600 hover:bg-red-700">
            削除
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function SlideManagementPage({game}: SlideManagementPageProps) {
  const {query, router} = useGlobal()

  const [slides, setSlides] = useState(game.Slide || [])
  const [showQR, setShowQR] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // テンプレートタイプの選択肢
  const templateTypes = [
    {value: 'normal', label: 'ノーマル', icon: '📝'},
    {value: 'choice', label: '選択クイズ', icon: '☑️'},
    {value: 'freetext', label: '自由記述クイズ', icon: '✍️'},
    {value: 'psycho', label: '心理アンケート', icon: '🧠'},
    {value: 'summary', label: 'まとめアンケート', icon: '📊'},
  ]

  // スライド作成
  const handleCreateSlide = async (templateType: string) => {
    setIsCreating(true)
    try {
      const result = await createSlide({
        gameId: game.id,
        templateType,
        contentData: {
          blocks: [],
          question: null,
          choices: [],
        },
      })

      if (result.success && result.slide) {
        toast.success('スライドを作成しました')
        router.push(HREF(`/edu/Colabo/games/${game.id}/slides/${result.slide.id}/edit`, {}, query))
      } else {
        toast.error(result.error || 'スライド作成に失敗しました')
      }
    } catch (error) {
      console.error('スライド作成エラー:', error)
      toast.error('予期しないエラーが発生しました')
    } finally {
      setIsCreating(false)
    }
  }

  // スライド削除
  const handleDeleteSlide = async (slideId: number) => {
    if (!confirm('このスライドを削除してもよろしいですか？')) {
      return
    }

    try {
      const result = await deleteSlide(slideId)

      if (result.success) {
        toast.success('スライドを削除しました')
        setSlides(slides.filter((s: any) => s.id !== slideId))
        router.refresh()
      } else {
        toast.error(result.error || 'スライド削除に失敗しました')
      }
    } catch (error) {
      console.error('スライド削除エラー:', error)
      toast.error('予期しないエラーが発生しました')
    }
  }

  // ドラッグ終了時の処理
  const handleDragEnd = async (event: any) => {
    const {active, over} = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = slides.findIndex((s: any) => s.id === active.id)
    const newIndex = slides.findIndex((s: any) => s.id === over.id)

    const newSlides = arrayMove(slides, oldIndex, newIndex)
    setSlides(newSlides)

    // サーバーに順序を保存
    try {
      const result = await updateSlideOrder(newSlides.map((s: any) => s.id))
      if (result.success) {
        toast.success('スライドの順序を更新しました')
      } else {
        toast.error('順序の更新に失敗しました')
        setSlides(slides) // 元に戻す
      }
    } catch (error) {
      console.error('順序更新エラー:', error)
      toast.error('予期しないエラーが発生しました')
      setSlides(slides) // 元に戻す
    }
  }

  return (
    <div className="container mx-auto p-6">
      {/* ヘッダー */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <Link href={HREF(`/edu/Colabo`, {}, query)} className="text-blue-600 hover:underline text-sm mb-2 inline-block">
              ← 授業一覧に戻る
            </Link>
            <h1 className="text-3xl font-bold">{game.name}</h1>
            <p className="text-gray-600 mt-1">
              {new Date(game.date).toLocaleDateString('ja-JP')} • {game.School?.name}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={() => setShowQR(!showQR)} className="bg-green-600 hover:bg-green-700">
              📱 QRコード表示
            </Button>
            <Link href={HREF(`/edu/Colabo/games/${game.id}/play`, {as: 'teacher'}, query)}>
              <Button className="bg-purple-600 hover:bg-purple-700">▶️ 授業を開始</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* QRコード表示 */}
      {showQR && (
        <div className="mb-6">
          <QRCodeDisplay secretKey={game.secretKey} gameName={game.name} />
        </div>
      )}

      {/* スライド追加セクション */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">新しいスライドを追加</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {templateTypes.map(template => (
            <button
              key={template.value}
              onClick={() => handleCreateSlide(template.value)}
              disabled={isCreating}
              className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all text-center disabled:opacity-50"
            >
              <div className="text-3xl mb-2">{template.icon}</div>
              <div className="text-sm font-medium text-gray-800">{template.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* スライド一覧 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">スライド一覧 ({slides.length}枚)</h2>

        {slides.length > 0 ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={slides.map((s: any) => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-1">
                {slides.map((slide: any) => (
                  <SortableSlideItem key={slide.id} slide={slide} onDelete={handleDeleteSlide} gameId={game.id} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">📄</div>
            <p className="text-lg">まだスライドがありません</p>
            <p className="text-sm mt-2">上のボタンから最初のスライドを追加しましょう</p>
          </div>
        )}
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 mb-1">参加生徒数</div>
          <div className="text-2xl font-bold">{game.GameStudent?.length || 0}名</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 mb-1">スライド数</div>
          <div className="text-2xl font-bold">{slides.length}枚</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 mb-1">参加キー</div>
          <div className="text-lg font-mono font-bold">{game.secretKey}</div>
        </div>
      </div>
    </div>
  )
}
