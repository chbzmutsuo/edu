import {makePrismaDataExtractionQuery} from '@components/DataLogic/TFs/ClientConf/makePrismaDataExtractionQuery'

import {getEasySearchWhereAnd} from '@class/builders/QueryBuilderVariables'
import {SearchQuery} from '@components/DataLogic/TFs/MyTable/components/SearchHandler/search-methods'
import {P_Query} from '@class/PQuery'
import {getMyTableId} from '@components/DataLogic/TFs/MyTable/helpers/getMyTableId'

export const getQueryArgs = ({
  dataModelName,
  query,
  additional,
  myTable,
  DetailePageId,
  include,

  easySearchObject,
}) => {
  const {page, take, skip} = P_Query.getPaginationPropsByQuery({
    query,
    tableId: getMyTableId({dataModelName, myTable}),
    countPerPage: myTable?.pagination?.countPerPage,
  })

  const searchQueryAnd: any = SearchQuery.createWhere({dataModelName, query: query})
  const easySearchWhereAnd = getEasySearchWhereAnd({
    easySearchObject,
    query,
    additionalWhere: {...additional?.where},
  })

  const prismaDataExtractionQuery = makePrismaDataExtractionQuery({
    query,
    dataModelName,
    additional,
    myTable,
    DetailePageId,
    include,
    take,
    skip,
    page,
    easySearchWhereAnd,
    searchQueryAnd,
  })

  return {prismaDataExtractionQuery, easySearchWhereAnd, searchQueryAnd}
}
