import {useState, useEffect, useCallback} from 'react'

interface UseChunkedRenderingOptions {
  chunkSize: number
  delay: number // ms
  autoStart: boolean
}

export function useChunkedRendering<T>(data: T[], options: Partial<UseChunkedRenderingOptions> = {}) {
  const {
    chunkSize = 25,
    delay = 32, // ~30fps
    autoStart = true,
  } = options

  const [renderedData, setRenderedData] = useState<T[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isStarted, setIsStarted] = useState(false)

  const startRendering = useCallback(() => {
    setRenderedData([])
    setCurrentIndex(0)
    setIsComplete(false)
    setIsStarted(true)
  }, [])

  const renderAll = useCallback(() => {
    setRenderedData(data || [])
    setIsComplete(true)
    setCurrentIndex(data?.length || 0)
  }, [data])

  // データが変更されたときの初期化
  useEffect(() => {
    if (!data?.length) {
      setRenderedData([])
      setIsComplete(true)
      setIsStarted(false)
      return
    }

    if (autoStart) {
      startRendering()
    } else {
      setIsStarted(false)
      setIsComplete(false)
      setRenderedData([])
    }
  }, [data, autoStart, startRendering])

  // チャンクレンダリングの実行
  useEffect(() => {
    if (!data?.length || isComplete || !isStarted) return

    const timer = setTimeout(() => {
      const nextChunk = data.slice(currentIndex, currentIndex + chunkSize)

      if (nextChunk.length > 0) {
        setRenderedData(prev => [...prev, ...nextChunk])
        setCurrentIndex(prev => prev + chunkSize)
      }

      if (currentIndex + chunkSize >= data.length) {
        setIsComplete(true)
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [data, currentIndex, chunkSize, delay, isComplete, isStarted])

  const progress = data?.length ? Math.min(currentIndex / data.length, 1) : 1

  return {
    renderedData,
    isComplete,
    progress,
    startRendering,
    renderAll,
    totalCount: data?.length || 0,
    renderedCount: renderedData.length,
    isStarted,
  }
}
