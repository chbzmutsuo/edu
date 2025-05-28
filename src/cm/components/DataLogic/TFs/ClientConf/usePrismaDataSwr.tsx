import {prismaDataType} from '@cm/types/types'

import useGlobal from 'src/cm/hooks/globalHooks/useGlobal'

import useSWR from 'swr'
import {searchByQuery} from '@lib/server-actions/common-server-actions/SerachByQuery/SerachByQuery'

export default function usePrismaDataSwr({dataModelName, prismaDataExtractionQuery}) {
  const {query, asPath} = useGlobal()

  if (prismaDataExtractionQuery === undefined) {
    throw new Error(`prismaDataExtractionQuery is undefined`)
  }

  const {data = {records: [], totalCount: 0}, isValidating} = useSWR(
    JSON.stringify({...prismaDataExtractionQuery, asPath, query}),
    async () => await searchByQuery({modelName: dataModelName, prismaDataExtractionQuery})
  )

  const prismaData: prismaDataType = {
    ...data,
    loading: isValidating,
    noData: data.records.length === 0 && isValidating === false,
  }
  return {prismaData}
}
