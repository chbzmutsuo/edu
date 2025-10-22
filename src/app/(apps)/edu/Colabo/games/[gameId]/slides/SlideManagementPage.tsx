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
import useSlideHandlers from './useSlideHandlers'
import {useJotaiByKey} from '@cm/hooks/useJotai'

interface SlideManagementPageProps {
  game: any
}

export default function SlideManagementPage({game}: SlideManagementPageProps) {
  const {query, router} = useGlobal()

  const [slides, setSlides] = useJotaiByKey<any[]>(`slides_${game.id}`, game.Slide || [])
  const [selectedSlideId, setSelectedSlideId] = useJotaiByKey<number | null>(`selectedSlideId_${game.id}`, slides[0]?.id || null)
  const QRModalReturn = useModal()

  console.log(selectedSlideId) //logs

  // 選択中のスライドを取得
  const selectedSlide = slides.find((s: any) => s.id === selectedSlideId) || null

  // スライドが追加/削除された時に選択を更新
  useEffect(() => {
    if (slides.length > 0 && !selectedSlideId) {
      setSelectedSlideId(slides[0].id)
    }
  }, [slides, selectedSlideId])

  const {handleAddSlide, handleUpdateSlide, handleDeleteSlide, handleReorderSlides} = useSlideHandlers({
    game,
    slides,
    selectedSlideId,
    setSlides,
    setSelectedSlideId,
    router,
  })

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
              <Link href={HREF(`/edu/Colabo/games/${game.id}/play`, {as: 'teacher'}, query)}>
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
        <RightSidebar selectedSlide={selectedSlide} handleUpdateSlide={handleUpdateSlide} handleDeleteSlide={handleDeleteSlide} />
      </div>
    </div>
  )
}
