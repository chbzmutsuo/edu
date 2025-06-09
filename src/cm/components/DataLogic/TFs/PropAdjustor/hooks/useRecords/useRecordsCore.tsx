import {useState, useCallback, useEffect} from 'react'
import {easySearchDataSwrType} from '@class/builders/QueryBuilderVariables'
import {getInitModelRecordsProps, serverFetchProps} from '@components/DataLogic/TFs/Server/fetchers/getInitModelRecordsProps'
import {tableRecord} from './useRecords'

interface UseRecordsCoreProps {
  serverFetchProps: serverFetchProps
  initialModelRecords?: Awaited<ReturnType<typeof getInitModelRecordsProps>>
  fetchTime?: Date
  query: any
  rootPath: string
  isInfiniteScrollMode: boolean
  resetToFirstPage: () => void
}

interface UseRecordsCoreReturn {
  records: tableRecord[] | null
  setrecords: React.Dispatch<React.SetStateAction<tableRecord[] | null>>
  totalCount: number
  easySearchPrismaDataOnServer: easySearchDataSwrType
  EasySearcherQuery: any
  prismaDataExtractionQuery: any
  initFetchTableRecords: () => Promise<void>
  updateData: () => void
  mutateRecords: ({record}: {record: tableRecord}) => void
  deleteRecord: ({record}: {record: tableRecord}) => void
}

// 初期状態を定数として分離
const INITIAL_EASY_SEARCH_DATA: easySearchDataSwrType = {
  dataCountObject: {},
  availableEasySearchObj: null,
  loading: true,
  noData: false,
  beforeLoad: true,
}

// レコード更新ロジック
const updateRecordInArray = (prev: tableRecord[] | null, record: tableRecord): tableRecord[] | null => {
  if (prev === null) return prev

  const index = prev.findIndex(r => r.id === record?.id)
  if (index !== -1) {
    const newArray = [...prev]
    newArray[index] = {...prev[index], ...record}
    return newArray
  } else {
    return [...prev, record]
  }
}

// レコード削除ロジック
const deleteRecordFromArray = (prev: tableRecord[] | null, record: tableRecord): tableRecord[] | null => {
  if (prev === null) return prev

  const index = prev.findIndex(r => r.id === record?.id)
  if (index !== -1) {
    const newArray = [...prev]
    newArray.splice(index, 1)
    return newArray
  }
  return prev
}

export const useRecordsCore = (props: UseRecordsCoreProps): UseRecordsCoreReturn => {
  const {serverFetchProps, initialModelRecords, fetchTime, query, rootPath, isInfiniteScrollMode, resetToFirstPage} = props

  const [easySearchPrismaDataOnServer, seteasySearchPrismaDataOnServer] =
    useState<easySearchDataSwrType>(INITIAL_EASY_SEARCH_DATA)
  const [records, setrecords] = useState<tableRecord[] | null>(null)
  const [totalCount, settotalCount] = useState<number>(0)
  const [prismaDataExtractionQuery, setprismaDataExtractionQuery] = useState({})
  const [EasySearcherQuery, setEasySearcherQuery] = useState({})

  // 初期データ取得
  const initFetchTableRecords = useCallback(async () => {
    const {queries, data} = await getInitModelRecordsProps({
      ...serverFetchProps,
      query,
      env: 'useRecords',
      rootPath: rootPath,
    })

    setEasySearcherQuery(queries.EasySearcherQuery)
    setprismaDataExtractionQuery(queries.prismaDataExtractionQuery)
    seteasySearchPrismaDataOnServer(data.easySearchPrismaDataOnServer)
    setrecords(data.records)
    settotalCount(data.totalCount)

    // 無限スクロールモードの場合はページをリセット
    if (isInfiniteScrollMode) {
      resetToFirstPage()
    }
  }, [serverFetchProps, query, rootPath, isInfiniteScrollMode, resetToFirstPage])

  // レコード更新
  const mutateRecords = useCallback(({record}: {record: tableRecord}) => {
    setrecords(prev => updateRecordInArray(prev, record))
  }, [])

  // レコード削除
  const deleteRecord = useCallback(({record}: {record: tableRecord}) => {
    setrecords(prev => deleteRecordFromArray(prev, record))
  }, [])

  // 手動でデータを更新する関数
  const updateData = useCallback(() => {
    initFetchTableRecords()
  }, [initFetchTableRecords])

  // 無限スクロールモードが変更された時の処理
  useEffect(() => {
    if (isInfiniteScrollMode) {
      setrecords(null)
      initFetchTableRecords()
    }
  }, [isInfiniteScrollMode, initFetchTableRecords])

  // 初期化ロジック
  useEffect(() => {
    if (fetchTime && initialModelRecords) {
      const {data: InitialData, queries: InitialQueries} = initialModelRecords ?? {}
      const diff = new Date().getTime() - fetchTime.getTime()
      const firstRender = false

      if (firstRender) {
        console.log(`①render`, diff)
        setrecords(InitialData.records)
        settotalCount(InitialData.totalCount)
        seteasySearchPrismaDataOnServer(InitialData.easySearchPrismaDataOnServer)
        setEasySearcherQuery(InitialQueries.EasySearcherQuery)
        setprismaDataExtractionQuery(InitialQueries.prismaDataExtractionQuery)
      } else {
        console.log(`② query changed`, diff)
        initFetchTableRecords()
      }
    } else {
      initFetchTableRecords()
    }
  }, [])

  return {
    records,
    setrecords,
    totalCount,
    easySearchPrismaDataOnServer,
    EasySearcherQuery,
    prismaDataExtractionQuery,
    initFetchTableRecords,
    updateData,
    mutateRecords,
    deleteRecord,
  }
}
