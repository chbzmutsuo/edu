import {transactionQuery} from '@lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {P_Query} from 'src/cm/class/PQuery'

import {MouseSensor, useSensor, useSensors} from '@dnd-kit/core'
import {arrayMove} from '@dnd-kit/sortable'

import {doTransaction} from '@lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {useCallback, useEffect, useRef} from 'react'
import {getMyTableId} from '@components/DataLogic/TFs/MyTable/getMyTableId'

export type getPaginationPropsType = (props: {totalCount: number}) => {
  tableId: any
  totalCount: any
  page: any
  skip: any
  take: any
  pageCount: any
  from: any
  to: any
  pageKey: any
  skipKey: any
  takeKey
  changePage
  changeDataPerPage
}

const useMyTableParams = ({columns, dataModelName, useGlobalProps, myTable, records, setrecords}) => {
  const {query, addQuery, shallowAddQuery} = useGlobalProps

  const columnCount = columns ? Math.max(...columns.map((row: any) => Number(row.length))) : 0
  const tableId = getMyTableId({dataModelName, myTable})

  /**tableStyle */
  const {tableStyle, tableStyleRef} = (() => {
    const {tableStyleRef, rect} = (() => {
      const tableStyleRef: any = useRef(null)
      let rect
      if (tableStyleRef.current) {
        rect = tableStyleRef.current.getBoundingClientRect()
      }
      return {tableStyleRef, rect}
    })()

    const newWidth = myTable?.style?.width ?? 'fit-content'
    const newHeight = myTable?.style?.height ?? 'fit-content'

    const tableStyle = {
      ...myTable?.style,
      width: newWidth,
      hegiht: newHeight,
      margin: '0px auto',
      maxHeight: myTable?.style?.maxHeight,
      maxWidth: myTable?.style?.maxWidth ?? '90vw',
      overflow: 'auto',
    }

    return {tableStyle, tableStyleRef}
  })()
  //並び替えるアイテム
  const items = records
  const setitems = setrecords

  useEffect(() => setitems(records), [records])

  /**ドラッグ完了時の動作 */
  const handleDragEndMemo = useCallback(
    async (event: any) => {
      const {active, over} = event
      if (active.id !== over?.id) {
        type item = {id: number}
        const oldIndex = items.findIndex((item: item) => item.id === active?.id)
        const newIndex = items.findIndex((item: item) => item.id === over?.id)

        const switchedItemsInOrder = arrayMove(items, oldIndex, newIndex)
        setrecords(prev => switchedItemsInOrder)

        const transactionQueryList: transactionQuery[] = switchedItemsInOrder.map((item: item, idx) => {
          const result: transactionQuery = {
            model: dataModelName,
            method: 'update',
            queryObject: {
              where: {id: item?.id},
              data: {sortOrder: Number(idx)},
            },
          }

          return result
        })

        //順番入れ替え
        // await toggleLoad(async () => {

        const res = await doTransaction({transactionQueryList})

        setitems(switchedItemsInOrder)
        return res
        // })
      }
    },
    [items, dataModelName]
  )

  /**DND SENSORS */
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 1, // 5px ドラッグした時にソート機能を有効にする
      },
    })
  )

  /**
   * ページネーションの情報を取得
   */

  const getPaginationProps: getPaginationPropsType = useCallback(
    props => {
      const {page, skip, take, countPerPage} = P_Query.getPaginationPropsByQuery({
        tableId: tableId,
        query,
        countPerPage: myTable?.pagination?.countPerPage,
      })
      const {totalCount} = props

      const pageCount = Math.ceil(totalCount / take)

      const from = (page - 1) * take + 1
      const to = Math.min(from + take - 1, totalCount)

      const pageKey = `${tableId}_P`
      const skipKey = `${tableId}_S`
      const takeKey = `${tableId}_T`

      const calcSkip = (page, take) => (page - 1) * take
      const changePage = (pageNumber: number) => {
        // toggleLoad(
        // async () => {
        const newPage = pageNumber
        const newQuery = {
          ...query,
          [pageKey]: newPage,
          [skipKey]: calcSkip(newPage, take),
        }

        shallowAddQuery(newQuery)
      }

      const changeDataPerPage = (e, page) => {
        const newTake = e.target.value
        const newQuery = {
          ...query,
          [pageKey]: 1,
          [takeKey]: newTake,
          [skipKey]: calcSkip(page, countPerPage),
        }
        shallowAddQuery(newQuery)
      }

      return {
        tableId,
        totalCount,
        page,
        skip,
        take,
        pageCount,
        from,
        to,
        pageKey,
        skipKey,
        takeKey,
        changePage,
        changeDataPerPage,
      }
    },
    [query, addQuery, shallowAddQuery]
  )

  return {
    columnCount,
    tableStyle,
    tableStyleRef,
    methods: {
      getPaginationProps,
      handleDragEndMemo,
    },
    dndProps: {items, setitems, sensors},
  }
}

export default useMyTableParams
