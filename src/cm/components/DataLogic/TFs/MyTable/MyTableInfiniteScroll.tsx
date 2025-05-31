import React, {useCallback} from 'react'
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
    const LoadingComponentMemo = useCallback(() => <LoadingComponent />, [])
    const EndMessageMemo = useCallback(() => <EndMessage totalCount={totalCount} />, [totalCount])

    return (
      <InfiniteScroll
        dataLength={recordCount}
        next={fetchNextPage}
        hasMore={hasMore}
        loader={<LoadingComponentMemo />}
        endMessage={<EndMessageMemo />}
        style={{overflow: 'visible'}}
        scrollThreshold={0.8}
      >
        {children}
      </InfiniteScroll>
    )
  }
)

MyTableInfiniteScroll.displayName = 'MyTableInfiniteScroll'
