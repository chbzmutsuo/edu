import {easySearchDataSwrType} from '@class/builders/QueryBuilderVariables'
import {useEffect, useState, useCallback} from 'react'
import useGlobal from '@hooks/globalHooks/useGlobal'
import {getInitModelRecordsProps, serverFetchProps} from '@components/DataLogic/TFs/Server/fetchers/getInitModelRecordsProps'
import useMyNavigation from '@hooks/globalHooks/useMyNavigation'
export type tableRecord = {
  id: number
  [key: string]: any
}

const useRecords = (props: {
  serverFetchProps: serverFetchProps
  initialModelRecords?: Awaited<ReturnType<typeof getInitModelRecordsProps>>
  fetchTime?: Date
}) => {
  const {serverFetchProps, initialModelRecords, fetchTime} = props
  const {rootPath} = useGlobal()
  const {query} = useMyNavigation() //path切り替え直後にエラーが出るので、useMyNavigationを使用

  const [easySearchPrismaDataOnServer, seteasySearchPrismaDataOnServer] = useState<easySearchDataSwrType>({
    dataCountObject: {},
    availableEasySearchObj: null,
    loading: true,
    noData: false,
    beforeLoad: true,
  })

  const [records, setrecords] = useState<tableRecord[] | null>(null)
  const [totalCount, settotalCount] = useState<number>(0)
  const [prismaDataExtractionQuery, setprismaDataExtractionQuery] = useState({})
  const [EasySearcherQuery, setEasySearcherQuery] = useState({})

  //データ更新関数
  const initFetchTableRecords = async () => {
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
  }

  const mutateRecords = ({record}) => {
    setrecords(prev => {
      if (prev === null) return prev
      const index = prev.findIndex(r => r.id === record?.id)
      if (index !== -1) {
        prev[index] = {...prev[index], ...record}
        return [...prev]
      } else {
        return [...prev, record]
      }
    })
  }

  const deleteRecord = ({record}) => {
    setrecords(prev => {
      if (prev === null) return prev
      const index = prev.findIndex(r => r.id === record?.id)
      if (index !== -1) {
        prev.splice(index, 1)
        return [...prev]
      } else {
        return [...prev]
      }
    })
  }

  useEffect(() => {
    if (fetchTime && initialModelRecords) {
      const {data: InitialData, queries: InitialQueries} = initialModelRecords ?? {}
      const diff = new Date().getTime() - fetchTime.getTime()

      const firstRender = 0 < diff && diff < 0.5 * 1000
      // const firstRender = false

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
