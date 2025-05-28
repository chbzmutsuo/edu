import React, {useMemo, useState} from 'react'
import {colType} from '@cm/types/types'
import {useGlobalPropType} from 'src/cm/hooks/globalHooks/useGlobal'

import {R_Stack} from 'src/cm/components/styles/common-components/common-components'

import {SearchQuery, searchQueryKey, Sub} from 'src/cm/components/DataLogic/TFs/MyTable/TableHandler/SearchHandler/search-methods'

import useBasicFormProps from 'src/cm/hooks/useBasicForm/useBasicFormProps'

import SearchedItemList from '@components/DataLogic/TFs/MyTable/TableHandler/SearchHandler/useSearchHandler/SearchedItemList'

import {Button} from '@components/styles/common-components/Button'
import {Main} from '@components/DataLogic/TFs/MyTable/TableHandler/SearchHandler/useSearchHandler/Main'
import {IconBtn} from '@components/styles/common-components/IconBtn'

type SearchHandler = {
  columns: colType[][]
  dataModelName: string
  useGlobalProps: useGlobalPropType
}
export const useSearchHandler = (props: SearchHandler) => {
  const {dataModelName, useGlobalProps} = props
  const SearchCols = props.columns.flat().filter((col: colType) => col.search)
  const {toggleLoad, query, shallowAddQuery, device} = useGlobalProps
  const addQuery = shallowAddQuery
  const {SP} = device
  const [modalOpen, setmodalOpen] = useState(false)

  const columns = Sub.makeSearchColumns({columns: props.columns, dataModelName, SP})

  const currentSearchedQuerys = SearchQuery.getSearchDefaultObject({dataModelName, query})

  /**search form 関係 */

  const {MainColObject, SearchColObject} = Sub.makeMainColsAndSearchCols({columns})

  const {
    BasicForm: SearchBasicForm,
    latestFormData,
    ReactHookForm,
    Cached_Option_Props,
  } = useBasicFormProps({
    columns,
    formData: currentSearchedQuerys,
    autoApplyProps: {form: {}},
  })

  /**全ての入力データ */
  const allData = {...latestFormData}

  //confirm
  const ResetBtnMemo = useMemo(() => {
    return (
      <IconBtn
        {...{
          rounded: false,
          color: `red`,
          onClick: () => {
            addQuery({[searchQueryKey]: ``})
            setmodalOpen(false)
          },
        }}
      >
        解除
      </IconBtn>
    )
  }, [query, allData, ReactHookForm])

  /**modal Memo */
  const SearchHandlerMemo = useMemo(() => {
    if (columns.flat().length === 0) {
      return null
    }
    if (SearchCols.length > 0) {
      return (
        <R_Stack className={` flex-nowrap gap-0`}>
          <Button {...{size: `sm`, type: `button`, onClick: e => setmodalOpen(true)}}>検索</Button>
          <Main
            {...{
              SP,
              SearchBasicForm,
              ResetBtnMemo,
              modalOpen,
              setmodalOpen,
              toggleLoad,
              addQuery,
              dataModelName,
              MainColObject,
              SearchColObject,
            }}
          />
        </R_Stack>
      )
    }
  }, [SearchCols, modalOpen, query, ReactHookForm])

  const SearchingStatusMemo = useMemo(() => {
    if (query[searchQueryKey]) {
      return (
        <div>
          <R_Stack className={`text-gray-main gap-2  `}>
            <SearchedItemList
              {...{
                SearchQuery,
                searchQueryKey,
                Cached_Option_Props,
                columns,
                dataModelName,
                ResetBtnMemo,
                query,
                addQuery,
              }}
            />
            {ResetBtnMemo}
          </R_Stack>
        </div>
      )
    }
  }, [query, ResetBtnMemo])

  return {
    SearchBasicForm,
    SearchCols,
    SearchHandlerMemo,
    SearchingStatusMemo,
  }
}

export const confirmSeach = ({
  allData,
  MainColObject,
  SearchColObject,
  dataModelName,
  addQuery,
  searchQueryKey,
  SearchQuery,
  toggleLoad,
}) => {
  const searchQueryResult = SearchQuery.createQueryStr({allData, MainColObject, SearchColObject})

  const newQuery = {
    [searchQueryKey]: `${dataModelName.toUpperCase()}${searchQueryResult}`,
  }

  toggleLoad(async () => {
    addQuery(newQuery)
  })
}
