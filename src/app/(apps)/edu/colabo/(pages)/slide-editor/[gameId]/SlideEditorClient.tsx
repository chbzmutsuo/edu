'use client'

import {useState} from 'react'
import {useRouter} from 'next/navigation'
import {Button} from '@cm/components/styles/common-components/Button'
import {SlideEditor} from '@app/(apps)/edu/colabo/(components)/SlideEditor'
import {slide_actions} from '@app/(apps)/edu/colabo/actions/slide_actions'

export const SlideEditorClient = ({game}) => {
  const [slides, setSlides] = useState(game.Slide || [])
  const [selectedSlide, setSelectedSlide] = useState<any>(null)
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()

  const handleCreateSlide = () => {
    setSelectedSlide({
      gameId: game.id,
      title: '',
      templateType: 'normal',
      SlideBlock: [],
    })
    setIsCreating(true)
  }

  const handleEditSlide = slide => {
    setSelectedSlide(slide)
    setIsCreating(false)
  }

  const handleSaveSlide = async slideData => {
    try {
      let result
      if (isCreating) {
        result = await slide_actions.createSlide({
          ...slideData,
          gameId: game.id,
        })
        setSlides(prev => [...prev, result])
      } else {
        result = await slide_actions.updateSlide(selectedSlide.id, slideData)
        setSlides(prev => prev.map(s => (s.id === selectedSlide.id ? result : s)))
      }
      setSelectedSlide(null)
      setIsCreating(false)
    } catch (error) {
      console.error('Failed to save slide:', error)
      alert('スライドの保存に失敗しました')
    }
  }

  const handleDeleteSlide = async slideId => {
    if (!confirm('このスライドを削除しますか？')) return

    try {
      await slide_actions.deleteSlide(slideId)
      setSlides(prev => prev.filter(s => s.id !== slideId))
    } catch (error) {
      console.error('Failed to delete slide:', error)
      alert('スライドの削除に失敗しました')
    }
  }

  const handleDuplicateSlide = async slide => {
    try {
      const duplicatedSlide = await slide_actions.duplicateSlide(slide.id)
      setSlides(prev => [...prev, duplicatedSlide])
    } catch (error) {
      console.error('Failed to duplicate slide:', error)
      alert('スライドの複製に失敗しました')
    }
  }

  if (selectedSlide) {
    return (
      <SlideEditor
        slide={selectedSlide}
        onSave={handleSaveSlide}
        onCancel={() => {
          setSelectedSlide(null)
          setIsCreating(false)
        }}
      />
    )
  }

  return (
    <div className="container mx-auto p-6">
      {/* ヘッダー */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{game.name}</h1>
            <p className="text-gray-600">
              {game.SubjectNameMaster?.name} • {new Date(game.date).toLocaleDateString('ja-JP')}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => router.push('/edu/colabo')}>ダッシュボードに戻る</Button>
            <Button onClick={handleCreateSlide}>新しいスライドを作成</Button>
          </div>
        </div>
      </div>

      {/* スライド一覧 */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">スライド一覧 ({slides.length}枚)</h2>
        </div>

        {slides.length > 0 ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {slides.map((slide, index) => (
                <div key={slide.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">スライド {index + 1}</span>
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          slide.templateType === 'normal'
                            ? 'bg-blue-100 text-blue-800'
                            : slide.templateType === 'psychology'
                              ? 'bg-purple-100 text-purple-800'
                              : slide.templateType === 'choice_quiz'
                                ? 'bg-green-100 text-green-800'
                                : slide.templateType === 'free_text_quiz'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {slide.templateType === 'normal' && 'ノーマル'}
                        {slide.templateType === 'psychology' && '心理アンケート'}
                        {slide.templateType === 'choice_quiz' && '選択クイズ'}
                        {slide.templateType === 'free_text_quiz' && '自由記述'}
                        {slide.templateType === 'summary_survey' && 'まとめアンケート'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-2">{slide.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">ブロック数: {slide.SlideBlock?.length || 0}</p>

                    <div className="flex space-x-2">
                      <Button size="sm" onClick={() => handleEditSlide(slide)}>
                        編集
                      </Button>
                      <Button size="sm" onClick={() => handleDuplicateSlide(slide)}>
                        複製
                      </Button>
                      <Button size="sm" onClick={() => handleDeleteSlide(slide.id)}>
                        削除
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">📄</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">スライドがありません</h3>
            <p className="text-gray-500 mb-6">最初のスライドを作成して授業を始めましょう</p>
            <Button onClick={handleCreateSlide}>スライドを作成</Button>
          </div>
        )}
      </div>
    </div>
  )
}
