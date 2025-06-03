import React, {useCallback, useEffect, useRef} from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import {LoadingComponent, EndMessage} from './MyTableComponents'

interface MyTableInfiniteScrollProps {
  recordCount: number
  fetchNextPage: () => Promise<void>
  hasMore: boolean
  totalCount: number
  children: React.ReactNode
}

export const MyTableInfiniteScroll = React.memo<MyTableInfiniteScrollProps>(
  ({recordCount, fetchNextPage, hasMore, totalCount, children}) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const hasTriggeredInitialLoad = useRef(false)

    const LoadingComponentMemo = useCallback(() => <LoadingComponent />, [])
    const EndMessageMemo = useCallback(() => <EndMessage totalCount={totalCount} />, [totalCount])

    // 初回レンダリング後、画面内に収まる場合の自動ロード
    useEffect(() => {
      const checkAndTriggerLoad = async () => {
        if (!containerRef.current || hasTriggeredInitialLoad.current || !hasMore) return

        const container = containerRef.current
        const containerHeight = container.scrollHeight
        const viewportHeight = window.innerHeight

        // コンテンツが画面より小さく、かつまだデータがある場合
        if (containerHeight <= viewportHeight && hasMore) {
          hasTriggeredInitialLoad.current = true
          try {
            await fetchNextPage()
          } catch (error) {
            console.error('Error fetching next page:', error)
          }
        }
      }

      // 少し遅延させてDOMが完全に描画されてから実行
      const timeoutId = setTimeout(checkAndTriggerLoad, 100)

      return () => clearTimeout(timeoutId)
    }, [recordCount, hasMore, fetchNextPage])

    // データ数が変わったら再度チェック
    useEffect(() => {
      hasTriggeredInitialLoad.current = false
    }, [recordCount])

    return (
      <div ref={containerRef}>
        <InfiniteScroll
          dataLength={recordCount}
          next={fetchNextPage}
          hasMore={hasMore}
          loader={<LoadingComponentMemo />}
          endMessage={<EndMessageMemo />}
          style={{
            overflow: 'visible',
            minHeight: 'calc(100vh - 200px)', // 最小高度を設定してスクロール可能にする
          }}
          scrollThreshold={0.8}
          // 親要素でのスクロールを有効にする
          scrollableTarget={undefined}
        >
          {children}
        </InfiniteScroll>
      </div>
    )
  }
)

MyTableInfiniteScroll.displayName = 'MyTableInfiniteScroll'
