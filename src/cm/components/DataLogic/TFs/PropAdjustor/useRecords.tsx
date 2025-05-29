import {easySearchDataSwrType} from '@class/builders/QueryBuilderVariables'
import {useEffect, useState, useCallback} from 'react'
import useGlobal from '@hooks/globalHooks/useGlobal'
import {getInitModelRecordsProps, serverFetchProps} from '@components/DataLogic/TFs/Server/fetchers/getInitModelRecordsProps'
import useMyNavigation from '@hooks/globalHooks/useMyNavigation'

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
  easySearchPrismaDataOnServer: easySearchDataSwrType
  EasySearcherQuery: any
  prismaDataExtractionQuery: any
  initFetchTableRecords: () => Promise<void>
  updateData: () => void
}

// 初期状態を定数として分離
const INITIAL_EASY_SEARCH_DATA: easySearchDataSwrType = {
  dataCountObject: {},
  availableEasySearchObj: null,
  loading: true,
  noData: false,
  beforeLoad: true,
}

// レコード更新ロジックを分離
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

// レコード削除ロジックを分離
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

const useRecords = (props: UseRecordsProps): UseRecordsReturn => {
  const {serverFetchProps, initialModelRecords, fetchTime} = props
  const {rootPath} = useGlobal()
  const {query} = useMyNavigation() // path切り替え直後にエラーが出るので、useMyNavigationを使用

  const [easySearchPrismaDataOnServer, seteasySearchPrismaDataOnServer] =
    useState<easySearchDataSwrType>(INITIAL_EASY_SEARCH_DATA)
  const [records, setrecords] = useState<tableRecord[] | null>(null)
  const [totalCount, settotalCount] = useState<number>(0)
  const [prismaDataExtractionQuery, setprismaDataExtractionQuery] = useState({})
  const [EasySearcherQuery, setEasySearcherQuery] = useState({})

  // ✅ 非同期処理で重い処理なのでメモ化有効
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
  }, [serverFetchProps, query, rootPath])

  // ✅ 配列操作を含む関数なのでメモ化有効
  const mutateRecords = useCallback(({record}: {record: tableRecord}) => {
    setrecords(prev => updateRecordInArray(prev, record))
  }, [])

  // ✅ 配列操作を含む関数なのでメモ化有効
  const deleteRecord = useCallback(({record}: {record: tableRecord}) => {
    setrecords(prev => deleteRecordFromArray(prev, record))
  }, [])

  // 初期化ロジック
  useEffect(() => {
    if (fetchTime && initialModelRecords) {
      const {data: InitialData, queries: InitialQueries} = initialModelRecords ?? {}
      const diff = new Date().getTime() - fetchTime.getTime()

      // 初回レンダリング判定（0.5秒以内）
      // const firstRender = 0 < diff && diff < 2 * 1000
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

  // 手動でデータを更新する関数を追加
  const updateData = useCallback(() => {
    initFetchTableRecords()
  }, [])

  return {
    totalCount,
    records,
    setrecords,
    mutateRecords,
    deleteRecord,
    easySearchPrismaDataOnServer,

    EasySearcherQuery,
    prismaDataExtractionQuery,
    initFetchTableRecords,
    updateData,
  }
}

export default useRecords
