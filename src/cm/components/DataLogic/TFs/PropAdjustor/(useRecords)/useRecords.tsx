import useGlobal from '@hooks/globalHooks/useGlobal'
import {getInitModelRecordsProps, serverFetchProps} from '@components/DataLogic/TFs/Server/fetchers/getInitModelRecordsProps'
import useMyNavigation from '@hooks/globalHooks/useMyNavigation'
import {useRecordsCore} from './useRecordsCore'
import {useInfiniteScrollLogic} from './useInfiniteScrollLogic'

// 型定義を改善
export interface tableRecord {
  id: number
  [key: string]: any
}

interface UseRecordsProps {
  serverFetchProps: serverFetchProps
  initialModelRecords?: Awaited<ReturnType<typeof getInitModelRecordsProps>>
  fetchTime?: Date
}

interface UseRecordsReturn {
  totalCount: number
  records: tableRecord[] | null
  setrecords: React.Dispatch<React.SetStateAction<tableRecord[] | null>>
  mutateRecords: ({record}: {record: tableRecord}) => void
  deleteRecord: ({record}: {record: tableRecord}) => void
  easySearchPrismaDataOnServer: any
  EasySearcherQuery: any
  prismaDataExtractionQuery: any
  initFetchTableRecords: () => Promise<void>
  updateData: () => void
  fetchNextPage: () => Promise<void>
  hasMore: boolean
  isInfiniteScrollMode: boolean
  setInfiniteScrollMode: (enabled: boolean) => void
  resetToFirstPage: () => void
}

const useRecords = (props: UseRecordsProps) => {
  const {serverFetchProps, initialModelRecords, fetchTime} = props
  const {rootPath} = useGlobal()
  const {query} = useMyNavigation()

  // 🔧 コア機能とスクロール機能を分離
  const coreLogic = useRecordsCore({
    serverFetchProps,
    initialModelRecords,
    fetchTime,
    query,
    rootPath,
    isInfiniteScrollMode: false, // 一時的にfalse、後で更新
    resetToFirstPage: () => {}, // 一時的に空関数、後で更新
  })

  const infiniteScrollLogic = useInfiniteScrollLogic({
    serverFetchProps,
    query,
    rootPath,
    records: coreLogic.records,
    totalCount: coreLogic.totalCount,
    setrecords: coreLogic.setrecords,
  })

  const resetToFirstPage = () => {
    if (process.env.NEXT_PUBLIC_IS_INFINITE_SCROLL_MODE === 'true') {
      infiniteScrollLogic.resetToFirstPage()
      coreLogic.setrecords(null)
      coreLogic.initFetchTableRecords()
    }
  }

  return {
    ...coreLogic,
    ...infiniteScrollLogic,
    resetToFirstPage,
  }
}

export default useRecords
