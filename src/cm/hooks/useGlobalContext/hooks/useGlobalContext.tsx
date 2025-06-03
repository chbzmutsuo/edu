'use client'
import {useSessionContext} from '@hooks/useGlobalContext/contexts/CustomSessionContext'
import {useDeviceContext} from '@hooks/useGlobalContext/contexts/DeviceContext'
import {useLoaderContext} from '@hooks/useGlobalContext/contexts/LoaderContext'
import {useNavigationContext} from '@hooks/useGlobalContext/contexts/NavigationContext'
import {useMemo} from 'react'
import {useGlobalPropType} from '@hooks/globalHooks/useGlobalOrigin'

// // 各Contextの型を直接取得
// type SessionData = ReturnType<typeof useSessionContext>
// type DeviceData = ReturnType<typeof useDeviceContext>
// type LoaderData = ReturnType<typeof useLoaderContext>
// type NavigationData = ReturnType<typeof useNavigationContext>

// 結合された型を定義
type CombinedGlobalData = useGlobalPropType
// セレクター用の型
type GlobalStateKeys = keyof CombinedGlobalData

export function useGlobalContext(): CombinedGlobalData {
  const sessionData = useSessionContext()
  const deviceData = useDeviceContext()
  const loaderData = useLoaderContext()
  const navigationData = useNavigationContext()

  // 基本データの結合をメモ化
  const baseData = useMemo(
    () => ({
      ...deviceData,
      ...navigationData,
      ...sessionData,
      ...loaderData,
    }),
    [deviceData, navigationData, sessionData, loaderData]
  )

  // 計算プロパティをメモ化
  const computedData = useMemo(() => {
    // 現在はwaitRenderingを無効化しているが、必要に応じて有効化可能
    const waitRendering = false
    // const waitRendering = [
    //   sessionData.status === 'loading',
    //   !sessionData.session,
    //   !deviceData.device,
    //   deviceData.width === 0,
    //   sessionData.sessionLoading,
    //   navigationData.query === null,
    //   navigationData.query === undefined,
    //   typeof window === 'undefined',
    // ].some(Boolean)

    const showLoader = loaderData.globalLoaderAtom
    const useGlobalDeps = [waitRendering, showLoader]

    return {
      waitRendering,
      showLoader,
      useGlobalDeps,
    }
  }, [loaderData.globalLoaderAtom]) // waitRenderingが固定値なので、globalLoaderAtomのみ監視

  // 最終結果をメモ化
  return useMemo(
    () => ({
      ...baseData,
      ...computedData,
    }),
    [baseData, computedData]
  )
}

// 型をエクスポート
export type {CombinedGlobalData, GlobalStateKeys}
