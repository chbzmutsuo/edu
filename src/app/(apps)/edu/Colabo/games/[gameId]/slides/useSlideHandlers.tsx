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

export default function useSlideHandlers({
  game,
  slides,
  selectedSlideId,
  setSlides,
  setSelectedSlideId,
  router,
}: {
  game: any
  slides: any[]
  selectedSlideId: number | null
  setSlides: (slides: any[]) => void
  setSelectedSlideId: (selectedSlideId: number | null) => void
  router: any
}) {
  // スライド追加
  const selectedSlide = slides.find((s: any) => s.id === selectedSlideId) || null
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
        // router.refresh()
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

        const currentSlideIndex = slides.findIndex((s: any) => s.id === slideId)
        const previousSlideId = newSlides[currentSlideIndex - 1]?.id
        setSelectedSlideId(previousSlideId)
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
  return {
    handleAddSlide,
    handleUpdateSlide,
    handleDeleteSlide,
    handleReorderSlides,
  }
}
