'use client'

import {useState, useEffect} from 'react'
import {TemplateFactory} from '@app/(apps)/edu/colabo/(components)/templates/TemplateFactory'
import {response_actions} from '@app/(apps)/edu/colabo/actions/response_actions'
import {presentation_actions} from '@app/(apps)/edu/colabo/actions/presentation_actions'
import {Button} from '@cm/components/styles/common-components/Button'

export const PresentationClient = ({game, userRole, currentStudent, session}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [responses, setResponses] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const slides = game.Slide || []
  const currentSlide = slides[currentSlideIndex]

  useEffect(() => {
    if (currentSlide) {
      loadSlideResponses()
    }
  }, [currentSlide?.id])

  const loadSlideResponses = async () => {
    if (!currentSlide) return
    
    try {
      const slideResponses = await response_actions.getSlideResponses(currentSlide.id)
      setResponses(slideResponses)
    } catch (error) {
      console.error('Failed to load responses:', error)
    }
  }

  const handleNextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1)
      setShowResults(false)
    }
  }

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1)
      setShowResults(false)
    }
  }

  const handleGoToSlide = (index) => {
    setCurrentSlideIndex(index)
    setShowResults(false)
  }

  const handleSubmitResponse = async (responseData) => {
    if (!currentStudent) return
    
    setIsLoading(true)
    try {
      const newResponse = await response_actions.submitResponse({
        ...responseData,
        studentId: currentStudent.id,
        gameId: game.id
      })
      
      setResponses(prev => [...prev.filter(r => r.studentId !== currentStudent.id), newResponse])
    } catch (error) {
      console.error('Failed to submit response:', error)
      alert('回答の送信に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleShowResults = () => {
    setShowResults(!showResults)
  }

  const handleShareResponse = async (response) => {
    try {
      await presentation_actions.shareResponse(response.id)
      // リアルタイム更新の実装が必要
      alert('回答を共有しました')
    } catch (error) {
      console.error('Failed to share response:', error)
      alert('回答の共有に失敗しました')
    }
  }

  if (!currentSlide) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {userRole === 'teacher' ? 'スライドが見つかりません' : '授業を準備中です'}
          </h2>
          <p className="text-gray-600">
            {userRole === 'teacher' 
              ? 'スライドを作成してから授業を開始してください。'
              : '先生が授業を開始するまでお待ちください。'
            }
          </p>
        </div>
      </div>
    )
  }

  const currentSlideResponses = responses.filter(r => r.slideId === currentSlide.id)

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー（教師のみ） */}
      {userRole === 'teacher' && (
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900">{game.name}</h1>
                <p className="text-sm text-gray-600">
                  スライド {currentSlideIndex + 1} / {slides.length}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={handlePrevSlide}
                  disabled={currentSlideIndex === 0}
                >
                  ← 前へ
                </Button>
                <Button
                  onClick={handleNextSlide}
                  disabled={currentSlideIndex === slides.length - 1}
                >
                  次へ →
                </Button>
              </div>
            </div>
            
            {/* スライド一覧（小さく表示） */}
            <div className="mt-4 flex space-x-2 overflow-x-auto">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => handleGoToSlide(index)}
                  className={`
                    px-3 py-1 text-xs rounded whitespace-nowrap
                    ${index === currentSlideIndex 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }
                  `}
                >
                  {index + 1}. {slide.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* メインコンテンツ */}
      <div className={userRole === 'teacher' ? 'pt-0' : 'pt-8'}>
        {TemplateFactory.getTemplate(currentSlide.templateType, {
          slide: currentSlide,
          blocks: currentSlide.SlideBlock || [],
          isTeacher: userRole === 'teacher',
          isPreview: false,
          responses: currentSlideResponses,
          onSubmitResponse: handleSubmitResponse,
          onShowResults: handleShowResults,
          onShareResponse: handleShareResponse,
          showResults
        })}
      </div>

      {/* 生徒用ヘッダー（授業情報） */}
      {userRole === 'student' && (
        <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white z-10">
          <div className="container mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-bold">{game.name}</h1>
                <p className="text-blue-100 text-sm">
                  {game.Teacher?.name} • {game.SubjectNameMaster?.name}
                </p>
              </div>
              <div className="text-sm">
                {currentStudent ? (
                  <span>👋 {currentStudent.name}</span>
                ) : (
                  <span>ゲスト</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ローディングオーバーレイ */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">送信中...</p>
          </div>
        </div>
      )}
    </div>
  )
}