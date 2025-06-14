'use client'

import {useState, useEffect} from 'react'
import {getOptionsByCategory, type OptionMaster} from '../actions/master-actions'

export function useOptions(category: string) {
  const [options, setOptions] = useState<OptionMaster[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOptions = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await getOptionsByCategory(category)
        if (result.success && result.data) {
          setOptions(result.data)
        } else {
          setError(result.error || '選択肢の取得に失敗しました')
        }
      } catch (err) {
        setError('選択肢の取得に失敗しました')
      } finally {
        setIsLoading(false)
      }
    }

    fetchOptions()
  }, [category])

  // 再取得関数
  const refetch = async () => {
    const result = await getOptionsByCategory(category)
    if (result.success && result.data) {
      setOptions(result.data)
    }
  }

  return {
    options,
    isLoading,
    error,
    refetch,
  }
}

// 複数カテゴリを一度に取得するフック
export function useAllOptions() {
  const [allOptions, setAllOptions] = useState<{
    subjects: OptionMaster[]
    industries: OptionMaster[]
    purposes: OptionMaster[]
  }>({
    subjects: [],
    industries: [],
    purposes: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAllOptions = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const [subjectsResult, industriesResult, purposesResult] = await Promise.all([
          getOptionsByCategory('subjects'),
          getOptionsByCategory('industries'),
          getOptionsByCategory('purposes'),
        ])

        if (subjectsResult.success && industriesResult.success && purposesResult.success) {
          setAllOptions({
            subjects: subjectsResult.data || [],
            industries: industriesResult.data || [],
            purposes: purposesResult.data || [],
          })
        } else {
          setError('選択肢の取得に失敗しました')
        }
      } catch (err) {
        setError('選択肢の取得に失敗しました')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllOptions()
  }, [])

  return {
    allOptions,
    isLoading,
    error,
  }
}
