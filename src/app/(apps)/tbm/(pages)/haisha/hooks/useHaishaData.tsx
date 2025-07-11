'use client'
import {useState, useEffect, useCallback} from 'react'
import {formatDate} from '@class/Days/date-utils/formatters'
import {showSpendTime} from '@lib/methods/toast-helper'
import useLocalLoading from '@hooks/globalHooks/useLocalLoading'
import {getListData, haishaListData} from '../components/getListData'
import {haishaTableMode} from '../components/HaishaTable'

interface UseHaishaDataProps {
  tbmBaseId: number
  whereQuery: {
    gte?: Date
    lt?: Date
  }
  mode: haishaTableMode
  currentPage: number
  itemsPerPage: number
}

export function useHaishaData({tbmBaseId, whereQuery, mode, currentPage, itemsPerPage}: UseHaishaDataProps) {
  const [listDataState, setListDataState] = useState<haishaListData | null>(null)
  const [maxRecord, setMaxRecord] = useState(0)
  const {LocalLoader, toggleLocalLoading} = useLocalLoading()

  const fetchData = useCallback(async () => {
    toggleLocalLoading(async () => {
      await showSpendTime(async () => {
        const takeSkip = {take: itemsPerPage, skip: (currentPage - 1) * itemsPerPage}
        const data = await getListData({tbmBaseId, whereQuery, mode, takeSkip})
        setMaxRecord(data.maxCount)
        setListDataState(data)
      })
    })
  }, [tbmBaseId, whereQuery, mode, currentPage, itemsPerPage])

  useEffect(() => {
    fetchData()
  }, [])

  // スケジュールデータを日付とユーザー/ルートで整理
  const scheduleByDateAndUser =
    listDataState?.TbmDriveSchedule?.reduce(
      (acc, schedule) => {
        const dateKey = formatDate(schedule.date)
        const userKey = String(schedule.userId)
        if (!acc[dateKey]) acc[dateKey] = {}
        if (!acc[dateKey][userKey]) acc[dateKey][userKey] = []
        acc[dateKey][userKey].push(schedule)
        return acc
      },
      {} as Record<string, Record<string, any[]>>
    ) ?? {}

  const scheduleByDateAndRoute =
    listDataState?.TbmDriveSchedule?.reduce(
      (acc, schedule) => {
        const dateKey = formatDate(schedule.date)
        const routeKey = String(schedule.tbmRouteGroupId)
        if (!acc[dateKey]) acc[dateKey] = {}
        if (!acc[dateKey][routeKey]) acc[dateKey][routeKey] = []
        acc[dateKey][routeKey].push(schedule)
        return acc
      },
      {} as Record<string, Record<string, any[]>>
    ) ?? {}

  // ローカルstate更新用のヘルパー関数
  const updateScheduleInState = useCallback((updatedSchedule: any) => {
    setListDataState(prev => {
      if (!prev) return null

      const newList = [...prev.TbmDriveSchedule]
      const findIndex = newList.findIndex(item => item.id === updatedSchedule.id)

      if (findIndex !== -1) {
        newList[findIndex] = updatedSchedule
      } else {
        newList.push(updatedSchedule)
      }

      return {...prev, TbmDriveSchedule: newList}
    })
  }, [])

  const removeScheduleFromState = useCallback((scheduleId: number) => {
    setListDataState(prev => {
      if (!prev) return null

      const newList = prev.TbmDriveSchedule.filter(item => item.id !== scheduleId)
      return {...prev, TbmDriveSchedule: newList}
    })
  }, [])

  return {
    listDataState,
    maxRecord,
    LocalLoader,
    fetchData,
    scheduleByDateAndUser,
    scheduleByDateAndRoute,
    updateScheduleInState,
    removeScheduleFromState,
  }
}
