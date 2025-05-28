'use client'
import {useEffect, useState} from 'react'
import {useParams} from 'next/navigation'
import {io} from 'socket.io-client'

let socket: any = null

export default function SessionPage() {
  const params = useParams()
  const {sessionId} = params ?? {}
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slides, setSlides] = useState<any[]>([])

  useEffect(() => {
    // socket.ioサーバーに接続
    if (!socket) {
      socket = io(`/api/slide-socket`)
    }

    socket.emit('join-session', sessionId)
    socket.on('slide-update', ({slideIndex, slides}) => {
      setCurrentSlide(slideIndex)
      if (slides) setSlides(slides)
    })
    return () => {
      socket.off('slide-update')
      socket.emit('leave-session', sessionId)
    }
  }, [sessionId])

  // スライドを送る（ページ送り）
  const goToSlide = (idx: number) => {
    if (slides.length === 0) return
    const newIdx = Math.max(0, Math.min(idx, slides.length - 1))
    setCurrentSlide(newIdx)
    // ホストがページ送りしたらsocketで同期
    socket?.emit('slide-update', {sessionId, slideIndex: newIdx, slides})
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">ホスト操作画面</h1>
      <div className="mb-2 text-gray-500">セッションID: {sessionId}</div>
      <div className="w-full max-w-2xl bg-white border rounded shadow p-4 min-h-[300px] flex flex-col items-center justify-center">
        {slides.length > 0 ? (
          <div className="w-full flex flex-col items-center">
            <div className="flex items-center gap-4 mb-2">
              <button
                onClick={() => goToSlide(currentSlide - 1)}
                disabled={currentSlide === 0}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                前へ
              </button>
              <div className="text-lg font-bold">
                スライド {currentSlide + 1} / {slides.length}
              </div>
              <button
                onClick={() => goToSlide(currentSlide + 1)}
                disabled={currentSlide === slides.length - 1}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                次へ
              </button>
            </div>
            {/* スライド内容の簡易表示 */}
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto w-full">
              {JSON.stringify(slides[currentSlide], null, 2)}
            </pre>
          </div>
        ) : (
          <div className="text-gray-400">スライドがまだ共有されていません</div>
        )}
      </div>
    </main>
  )
}
