import {useState, useCallback, useEffect} from 'react'
import {easySearchDataSwrType} from '@class/builders/QueryBuilderVariables'
import {getInitModelRecordsProps, serverFetchProps} from '@components/DataLogic/TFs/Server/fetchers/getInitModelRecordsProps'
import {tableRecord} from './useRecords'
import {atomKey, useJotaiByKey} from '@hooks/useJotai'
import {diff} from 'node:util'
import useLogOnRender from '@hooks/useLogOnRender'
import useGlobal from '@hooks/globalHooks/useGlobal'
import {sleep} from '@lib/methods/common'

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
  const {
    serverFetchProps,
    initialModelRecords = {
      data: {
        records: [],
        totalCount: 0,
        easySearchPrismaDataOnServer: INITIAL_EASY_SEARCH_DATA,
      },
      queries: {
        EasySearcherQuery: {},
        prismaDataExtractionQuery: {},
      },
    },
    query,
    rootPath,
    isInfiniteScrollMode,
    resetToFirstPage,
  } = props

  const globalStateKey = ['table-records', serverFetchProps.dataModelName].join('_') as atomKey

  const {toggleLoad} = useGlobal()
  const [refresedAt, setrefresedAt] = useJotaiByKey<Date | null>('refreshedAt' as atomKey, new Date())
  const [records, setrecords] = useJotaiByKey<tableRecord[] | null>(globalStateKey, null)
  const [easySearchPrismaDataOnServer, seteasySearchPrismaDataOnServer] =
    useState<easySearchDataSwrType>(INITIAL_EASY_SEARCH_DATA)
  const [totalCount, settotalCount] = useState<number>(0)
  const [prismaDataExtractionQuery, setprismaDataExtractionQuery] = useState({})
  const [EasySearcherQuery, setEasySearcherQuery] = useState({})

  // 初期データ取得
  const initFetchTableRecords = useCallback(async () => {
    console.time('initFetchTableRecords')
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
    console.timeEnd('initFetchTableRecords')
    setrefresedAt(new Date())
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
    if (refresedAt && Math.abs(new Date().getTime() - refresedAt.getTime()) >= 100) {
      initFetchTableRecords()
      setrefresedAt(new Date())
    } else {
      console.log(`data from server`)
      const {data: InitialData, queries: InitialQueries} = initialModelRecords ?? {}
      setrecords(InitialData?.records)
      settotalCount(InitialData?.totalCount)
      seteasySearchPrismaDataOnServer(InitialData?.easySearchPrismaDataOnServer)
      setEasySearcherQuery(InitialQueries?.EasySearcherQuery)
      setprismaDataExtractionQuery(InitialQueries?.prismaDataExtractionQuery)
      setrefresedAt(new Date())
    }
  }, [query, initialModelRecords])

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
