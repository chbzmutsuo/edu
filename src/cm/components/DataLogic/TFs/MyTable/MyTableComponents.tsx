import React from 'react'

export const LoadingComponent = React.memo(() => (
  <div className="flex justify-center items-center py-4">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
    <span className="ml-2 text-sm">読み込み中...</span>
  </div>
))

LoadingComponent.displayName = 'LoadingComponent'

interface EndMessageProps {
  totalCount: number
}

export const EndMessage = React.memo<EndMessageProps>(({totalCount}) => (
  <div className="text-center py-4 text-gray-500">
    <p className="text-sm">全てのデータを表示しました ({totalCount.toLocaleString()}件)</p>
  </div>
))

EndMessage.displayName = 'EndMessage'

interface InfiniteScrollToggleProps {
  isInfiniteScrollMode: boolean
  setInfiniteScrollMode: (enabled: boolean) => void
}

export const InfiniteScrollToggle = React.memo<InfiniteScrollToggleProps>(({isInfiniteScrollMode, setInfiniteScrollMode}) => {
  return null
  return (
    <div className="flex items-center gap-2 px-2">
      <button
        onClick={() => setInfiniteScrollMode(!isInfiniteScrollMode)}
        className={`px-3 py-1 text-xs rounded transition-colors ${
          isInfiniteScrollMode ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        {isInfiniteScrollMode ? '無限スクロール ON' : '無限スクロール OFF'}
      </button>
    </div>
  )
})

InfiniteScrollToggle.displayName = 'InfiniteScrollToggle'

interface RecordCountDisplayProps {
  isInfiniteScrollMode: boolean
  recordCount: number
  totalCount: number
  hasMore: boolean
  getPaginationProps: (args: {totalCount: number}) => any
  isRestoredFromCache?: boolean
}

export const RecordCountDisplay = React.memo<RecordCountDisplayProps>(
  ({isInfiniteScrollMode, recordCount, totalCount, hasMore, getPaginationProps, isRestoredFromCache = false}) => {
    if (isInfiniteScrollMode) {
      // 無限スクロールモードの場合
      const percentage = totalCount > 0 ? Math.round((recordCount / totalCount) * 100) : 0
      return (
        <div className="flex items-center gap-2 px-2">
          <span className="text-xs text-gray-600">
            <span>
              {recordCount.toLocaleString()}件 / {totalCount.toLocaleString()}件{' '}
            </span>
            {/* <span> ({percentage}%)</span> */}
            {/* {hasMore && <span className="text-blue-500 ml-1">読み込み可能</span>} */}
            {isRestoredFromCache && <span className="text-green-500 ml-1">📋</span>}
          </span>
        </div>
      )
    } else {
      // ページネーションモードの場合
      const paginationInfo = getPaginationProps({totalCount})
      const {from, to} = paginationInfo || {}

      if (from && to && totalCount > 0) {
        return (
          <div className="flex items-center gap-2 px-2">
            <span className="text-xs text-gray-600">
              {from.toLocaleString()}-{to.toLocaleString()}件 / {totalCount.toLocaleString()}件
              {isRestoredFromCache && <span className="text-green-500 ml-1">📋</span>}
            </span>
          </div>
        )
      } else if (recordCount > 0) {
        return (
          <div className="flex items-center gap-2 px-2">
            <span className="text-xs text-gray-600">
              {recordCount.toLocaleString()}件{totalCount > 0 && ` / ${totalCount.toLocaleString()}件`}
              {isRestoredFromCache && <span className="text-green-500 ml-1">📋</span>}
            </span>
          </div>
        )
      }
    }
    return null
  }
)

RecordCountDisplay.displayName = 'RecordCountDisplay'
