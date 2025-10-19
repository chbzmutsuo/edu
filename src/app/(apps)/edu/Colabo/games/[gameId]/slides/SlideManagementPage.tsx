'use client'

import {useState, useEffect} from 'react'
import {Button} from '@cm/components/styles/common-components/Button'
import {toast} from 'react-toastify'
import {createSlide, deleteSlide, updateSlide, updateSlideOrder} from '../../../colabo-server-actions'
import QRCodeDisplay from '../../../parts/QRCodeDisplay'
import Link from 'next/link'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {HREF} from '@cm/lib/methods/urls'
import {arrayMove} from '@dnd-kit/sortable'
import LeftSidebar from '../../../components/slides/LeftSidebar'
import CenterPreview from '../../../components/slides/CenterPreview'
import RightSidebar from '../../../components/slides/RightSidebar'
import useModal from '@cm/components/utils/modal/useModal'

interface SlideManagementPageProps {
  game: any
}

export default function SlideManagementPage({game}: SlideManagementPageProps) {
  const {query, router} = useGlobal()
  const [slides, setSlides] = useState(game.Slide || [])
  const [selectedSlideId, setSelectedSlideId] = useState<number | null>(slides[0]?.id || null)
  const QRModalReturn = useModal()

  // 選択中のスライドを取得
  const selectedSlide = slides.find((s: any) => s.id === selectedSlideId) || null

  // スライドが追加/削除された時に選択を更新
  useEffect(() => {
    if (slides.length > 0 && !selectedSlideId) {
      setSelectedSlideId(slides[0].id)
    }
  }, [slides, selectedSlideId])

  // スライド追加
  const handleAddSlide = async (templateType: string) => {
    try {
      const sortOrder = selectedSlide ? selectedSlide.sortOrder + 1 : slides.length

      const result = await createSlide({
        gameId: game.id,
        templateType,
        contentData: {
          title: '',
          blocks: [],
        },
        sortOrder,
      })

      if (result.success && result.slide) {
        toast.success('スライドを追加しました')

        // 新しいスライドを配列に挿入
        const newSlides = [...slides]
        newSlides.splice(sortOrder, 0, result.slide)

        // sortOrderを再計算
        newSlides.forEach((slide: any, index) => {
          slide.sortOrder = index
        })

        setSlides(newSlides)
        setSelectedSlideId(result.slide.id)
        router.refresh()
      } else {
        toast.error(result.error || 'スライド追加に失敗しました')
      }
    } catch (error) {
      console.error('スライド追加エラー:', error)
      toast.error('予期しないエラーが発生しました')
    }
  }

  // スライド更新
  const handleUpdateSlide = async (slideId: number, updates: any) => {
    try {
      const result = await updateSlide(slideId, updates)

      if (result.success && result.slide) {
        // ローカル状態を更新
        setSlides(slides.map((s: any) => (s.id === slideId ? {...s, ...result.slide} : s)))
        toast.success('スライドを更新しました')
      } else {
        toast.error(result.error || 'スライド更新に失敗しました')
      }
    } catch (error) {
      console.error('スライド更新エラー:', error)
      toast.error('予期しないエラーが発生しました')
    }
  }

  // スライド削除
  const handleDeleteSlide = async (slideId: number) => {
    try {
      const result = await deleteSlide(slideId)

      if (result.success) {
        toast.success('スライドを削除しました')
        const newSlides = slides.filter((s: any) => s.id !== slideId)
        setSlides(newSlides)

        // 選択中のスライドを削除した場合、次のスライドを選択
        if (slideId === selectedSlideId) {
          setSelectedSlideId(newSlides[0]?.id || null)
        }

        router.refresh()
      } else {
        toast.error(result.error || 'スライド削除に失敗しました')
      }
    } catch (error) {
      console.error('スライド削除エラー:', error)
      toast.error('予期しないエラーが発生しました')
    }
  }

  // スライド並び替え
  const handleReorderSlides = async (oldIndex: number, newIndex: number) => {
    const newSlides = arrayMove(slides, oldIndex, newIndex)

    // sortOrderを更新
    newSlides.forEach((slide: any, index) => {
      slide.sortOrder = index
    })

    setSlides(newSlides)

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
    <div className="flex flex-col h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b shadow-sm flex-shrink-0">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <Link href={HREF(`/edu/Colabo`, {}, query)} className="text-blue-600 hover:underline text-sm mb-2 inline-block">
                ← 授業一覧に戻る
              </Link>
              <h1 className="text-2xl font-bold">{game.name}</h1>
              <p className="text-sm text-gray-600 mt-1">
                {new Date(game.date).toLocaleDateString('ja-JP')} • {game.School?.name}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button onClick={() => QRModalReturn.handleOpen()} className="bg-green-600 hover:bg-green-700">
                📱 QRコード
              </Button>
              <Link href={HREF(`/edu/Colabo/games/${game.id}/play?as=teacher`, {}, query)}>
                <Button className="bg-purple-600 hover:bg-purple-700">▶️ 授業開始</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* QRコードモーダル */}
      <QRModalReturn.Modal>
        <QRCodeDisplay secretKey={game.secretKey} gameName={game.name} />
      </QRModalReturn.Modal>

      {/* メインコンテンツ: 3ペインレイアウト */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左サイドバー: スライドサムネイル */}
        <LeftSidebar
          slides={slides}
          selectedSlideId={selectedSlideId}
          onSelectSlide={setSelectedSlideId}
          onReorderSlides={handleReorderSlides}
          onAddSlide={handleAddSlide}
        />

        {/* 中央: スライドプレビュー */}
        <CenterPreview slides={slides} selectedSlideId={selectedSlideId} onSelectSlide={setSelectedSlideId} />

        {/* 右サイドバー: 編集パネル */}
        <RightSidebar selectedSlide={selectedSlide} onUpdateSlide={handleUpdateSlide} onDeleteSlide={handleDeleteSlide} />
      </div>
    </div>
  )
}
