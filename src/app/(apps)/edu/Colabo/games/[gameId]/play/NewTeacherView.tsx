'use client'

import {Button} from '@cm/components/styles/common-components/Button'
import {SlideBlock} from '../../../(components)/SlideBlock'
import {useState, useEffect} from 'react'
import {getSlideAnswers, updateAnswerShareStatus, updateGameState} from '../../../colabo-server-actions'
import {toast} from 'react-toastify'
import type {GameData, SlideData, SlideMode, SlideAnswer, AnswerStats} from '../../../types/game-types'

interface SocketActions {
  changeSlide: (slideId: number, slideIndex: number) => void
  changeMode: (slideId: number, mode: SlideMode) => void
  closeAnswer: (slideId: number) => void
  shareAnswer: (slideId: number, answerId: number, isAnonymous: boolean) => void
  revealCorrect: (slideId: number) => void
}

interface TeacherViewProps {
  game: GameData
  currentSlide: SlideData | null
  currentSlideIndex: number
  currentMode: SlideMode | null
  answerStats: AnswerStats | null
  socket: SocketActions
  onSlideChange: (slideId: number, index: number) => void
}

export default function NewTeacherView({
  game,
  currentSlide,
  currentSlideIndex,
  currentMode,
  answerStats,
  socket,
  onSlideChange,
}: TeacherViewProps) {
  const [answers, setAnswers] = useState<SlideAnswer[]>([])
  const [isLoadingAnswers, setIsLoadingAnswers] = useState(false)
  const [sharedAnswerIds, setSharedAnswerIds] = useState<Set<number>>(new Set())

  const totalSlides = game.Slide?.length || 0
  const totalStudents = game.GameStudent?.length || 0

  // スライドを切り替え
  const handleChangeSlide = async (newIndex: number) => {
    if (newIndex < 0 || newIndex >= totalSlides) return

    const newSlide = game.Slide?.[newIndex]
    if (newSlide) {
      // // DBにゲーム状態を保存
      await updateGameState(game.id, {
        currentSlideId: newSlide.id,
        slideMode: 'view', // スライド切り替え時はviewモードに
      })

      socket.changeSlide(newSlide.id, newIndex)
      onSlideChange(newSlide.id, newIndex)
    }
  }

  // モードを変更
  const handleChangeMode = async (mode: SlideMode) => {
    if (!currentSlide) return

    // DBにモードを保存
    await updateGameState(game.id, {
      currentSlideId: currentSlide.id,
      slideMode: mode,
    })

    socket.changeMode(currentSlide.id, mode)
  }

  // 回答を締め切る
  const handleCloseAnswer = () => {
    if (!currentSlide) return
    socket.closeAnswer(currentSlide.id)
  }

  // 回答を取得（共有状態も含む）
  const loadAnswers = async () => {
    if (!currentSlide) return

    setIsLoadingAnswers(true)
    try {
      const result = await getSlideAnswers(currentSlide.id)
      if (result.success && result.answers) {
        setAnswers(result.answers as unknown as SlideAnswer[])

        // 共有されている回答のIDを記録
        const shared = new Set(result.answers.filter(a => a.isShared).map(a => a.id))
        setSharedAnswerIds(shared)
      }
    } catch (error) {
      console.error('回答取得エラー:', error)
      toast.error('回答の取得に失敗しました')
    } finally {
      setIsLoadingAnswers(false)
    }
  }

  // 回答を共有
  const handleShareAnswer = async (answerId: number, isAnonymous: boolean = false) => {
    if (!currentSlide) return

    try {
      // 既に共有済みかチェック
      const isCurrentlyShared = sharedAnswerIds.has(answerId)

      // DBに共有状態を保存
      const result = await updateAnswerShareStatus(answerId, !isCurrentlyShared, isAnonymous)

      if (result.success) {
        // ローカル状態を更新
        const newSharedIds = new Set(sharedAnswerIds)
        if (isCurrentlyShared) {
          newSharedIds.delete(answerId)
          toast.success('共有を解除しました')
        } else {
          newSharedIds.add(answerId)
          toast.success(isAnonymous ? '匿名で共有しました' : '共有しました')
        }
        setSharedAnswerIds(newSharedIds)

        // Socket.ioで他の参加者に通知
        socket.shareAnswer(currentSlide.id, answerId, isAnonymous)

        // 回答リストを再取得
        await loadAnswers()
      } else {
        toast.error('共有状態の更新に失敗しました')
      }
    } catch (error) {
      console.error('共有エラー:', error)
      toast.error('予期しないエラーが発生しました')
    }
  }

  // 正答を公開
  const handleRevealCorrect = () => {
    if (!currentSlide) return
    socket.revealCorrect(currentSlide.id)
  }

  // 結果モードになったら回答を取得
  useEffect(() => {
    if (currentMode === 'result') {
      loadAnswers()
    }
  }, [currentMode, currentSlide?.id])

  // 回答更新を監視
  useEffect(() => {
    if (currentMode === 'result' && answerStats) {
      loadAnswers()
    }
  }, [answerStats?.answerCount])

  return (
    <div className="grid grid-cols-[1fr_400px] gap-4">
      {/* 左側: スライド表示とコントロール */}
      <div className="space-y-4">
        {/* コントロールパネル */}
        <div className="bg-white rounded-lg shadow p-4">
          {/* スライド情報 */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{currentSlide?.contentData?.title || 'スライド'}</h2>
            <div className="text-sm text-gray-600">
              {currentSlideIndex + 1} / {totalSlides}
            </div>
          </div>

          {/* ナビゲーションボタン */}
          <div className="flex items-center justify-between mb-4">
            <Button
              onClick={() => handleChangeSlide(currentSlideIndex - 1)}
              disabled={currentSlideIndex === 0}
              className="bg-gray-600 hover:bg-gray-700"
            >
              ← 前のスライド
            </Button>
            <div className="text-sm text-gray-600">スライド #{currentSlideIndex + 1}</div>
            <Button
              onClick={() => handleChangeSlide(currentSlideIndex + 1)}
              disabled={currentSlideIndex >= totalSlides - 1}
              className="bg-gray-600 hover:bg-gray-700"
            >
              次のスライド →
            </Button>
          </div>

          {/* モード切り替え */}
          <div className="grid grid-cols-3 gap-2">
            <Button onClick={() => handleChangeMode('view')} className={currentMode === 'view' ? 'bg-blue-600' : 'bg-gray-400'}>
              📺 表示
            </Button>
            <Button
              onClick={() => handleChangeMode('answer')}
              className={currentMode === 'answer' ? 'bg-green-600' : 'bg-gray-400'}
              disabled={currentSlide?.templateType === 'normal'}
            >
              ✍️ 回答
            </Button>
            <Button
              onClick={() => handleChangeMode('result')}
              className={currentMode === 'result' ? 'bg-purple-600' : 'bg-gray-400'}
              disabled={currentSlide?.templateType === 'normal'}
            >
              📊 結果
            </Button>
          </div>

          {/* 回答締切ボタン */}
          {currentMode === 'answer' && (
            <div className="mt-4">
              <Button onClick={handleCloseAnswer} className="w-full bg-red-600 hover:bg-red-700">
                ⏱️ 回答を締め切る
              </Button>
            </div>
          )}
        </div>

        {/* スライドプレビュー */}
        {currentSlide ? (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">{currentSlide.contentData?.title || 'スライドプレビュー'}</h3>
            <div className="space-y-4 min-h-96">
              {/* ノーマルスライド */}
              {currentSlide.templateType === 'normal' &&
                currentSlide.contentData?.blocks?.map((block, index) => (
                  <SlideBlock key={index} block={block} isPreview={true} />
                ))}

              {/* 選択クイズ */}
              {currentSlide.templateType === 'choice' && (
                <div className="space-y-4">
                  {currentSlide.contentData?.question && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-lg font-medium">{currentSlide.contentData.question}</p>
                    </div>
                  )}
                  {currentSlide.contentData?.choices && currentSlide.contentData.choices.length > 0 && (
                    <div className="space-y-2">
                      {currentSlide.contentData.choices.map((choice, index) => (
                        <div
                          key={choice.id}
                          className={`flex items-center space-x-3 p-3 rounded-lg border-2 ${choice.isCorrect ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white'}`}
                        >
                          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1">{choice.text}</div>
                          {choice.isCorrect && <span className="text-green-600 font-bold">✓ 正解</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 自由記述 */}
              {currentSlide.templateType === 'freetext' && currentSlide.contentData?.question && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-lg font-medium whitespace-pre-wrap">{currentSlide.contentData.question}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">スライドがありません</p>
          </div>
        )}
      </div>

      {/* 右側: 回答状況・結果表示 */}
      <div className="space-y-4">
        {/* 参加者情報 */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3">参加状況</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">参加生徒</span>
              <span className="font-bold">{totalStudents}名</span>
            </div>
            {answerStats && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">回答済み</span>
                <span className="font-bold text-green-600">
                  {answerStats.answerCount} / {totalStudents}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 現在のモード */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-2">現在のモード</h3>
          <div className="text-center py-2">
            {currentMode === 'view' && <div className="text-blue-600 font-bold">📺 表示モード</div>}
            {currentMode === 'answer' && <div className="text-green-600 font-bold">✍️ 回答モード</div>}
            {currentMode === 'result' && <div className="text-purple-600 font-bold">📊 結果モード</div>}
            {!currentMode && <div className="text-gray-400">モードが選択されていません</div>}
          </div>
        </div>

        {/* 回答一覧（結果モード時） */}
        {currentMode === 'result' && (
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">回答一覧</h3>
              <Button size="sm" onClick={loadAnswers} disabled={isLoadingAnswers}>
                🔄 更新
              </Button>
            </div>

            {isLoadingAnswers ? (
              <div className="text-center py-4 text-gray-500">読み込み中...</div>
            ) : answers.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {answers.map(answer => {
                  const answerDataParsed =
                    typeof answer.answerData === 'string' ? JSON.parse(answer.answerData) : answer.answerData
                  const isShared = sharedAnswerIds.has(answer.id)

                  return (
                    <div
                      key={answer.id}
                      className={`border rounded p-3 text-sm ${isShared ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'}`}
                    >
                      <div className="font-medium mb-1">{answer.Student?.name}</div>
                      <div className="text-xs text-gray-600 mb-2">
                        {answerDataParsed.type === 'choice' && currentSlide?.contentData?.choices && (
                          <div>選択: {currentSlide.contentData.choices[answerDataParsed.choiceIndex]?.text}</div>
                        )}
                        {answerDataParsed.type === 'freetext' && (
                          <div className="whitespace-pre-wrap">{answerDataParsed.textAnswer}</div>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        {!isShared ? (
                          <>
                            <Button size="sm" onClick={() => handleShareAnswer(answer.id, false)} className="bg-blue-600 text-xs">
                              共有
                            </Button>
                            <Button size="sm" onClick={() => handleShareAnswer(answer.id, true)} className="bg-gray-600 text-xs">
                              匿名で共有
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button size="sm" onClick={() => handleShareAnswer(answer.id, false)} className="bg-red-600 text-xs">
                              共有解除
                            </Button>
                            <span className="text-xs text-blue-600 ml-2 flex items-center">
                              {answer.isAnonymous ? '🔒 匿名' : '👤 実名'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">回答がまだありません</div>
            )}

            {/* 正答公開ボタン */}
            {currentSlide?.templateType === 'choice' && (
              <div className="mt-4">
                <Button onClick={handleRevealCorrect} className="w-full bg-green-600 hover:bg-green-700">
                  ✅ 正答を公開
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
