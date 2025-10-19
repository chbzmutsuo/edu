'use client'

import {useRouter} from 'next/navigation'
import {SlideEditor} from '../../../../../(components)/SlideEditor'
import {updateSlide} from '../../../../../colabo-server-actions'
import {toast} from 'react-toastify'
import Link from 'next/link'

interface SlideEditPageProps {
  game: any
  slide: any
}

export default function SlideEditPage({game, slide}: SlideEditPageProps) {
  const router = useRouter()

  const handleSave = async (slideData: any) => {
    try {
      const result = await updateSlide(slide.id, {
        templateType: slideData.templateType,
        contentData: {
          title: slideData.title,
          blocks: slideData.blocks,
          ...slideData,
        },
      })

      if (result.success) {
        toast.success('スライドを保存しました')
        router.push(`/edu/Colabo/games/${game.id}/slides`)
      } else {
        toast.error(result.error || 'スライドの保存に失敗しました')
      }
    } catch (error) {
      console.error('スライド保存エラー:', error)
      toast.error('予期しないエラーが発生しました')
    }
  }

  const handleCancel = () => {
    router.push(`/edu/Colabo/games/${game.id}/slides`)
  }

  // スライドデータを展開
  const slideData = {
    ...slide,
    title: slide.contentData?.title || '',
    blocks: slide.contentData?.blocks || [],
    SlideBlock: slide.contentData?.blocks || [],
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href={`/edu/Colabo/games/${game.id}/slides`}
                className="text-blue-600 hover:underline text-sm mb-2 inline-block"
              >
                ← スライド一覧に戻る
              </Link>
              <h1 className="text-2xl font-bold">{game.name} - スライド編集</h1>
            </div>
            <div className="text-sm text-gray-600">
              スライド ID: {slide.id} • タイプ: {slide.templateType}
            </div>
          </div>
        </div>
      </div>

      {/* スライドエディタ */}
      <div className="container mx-auto py-6">
        <SlideEditor slide={slideData} onSave={handleSave} onCancel={handleCancel} />
      </div>
    </div>
  )
}
