// 'use client'
// import {useSessionContext} from '@hooks/useGlobalContext/contexts/SessionContext'
// import {useDeviceContext} from '@hooks/useGlobalContext/contexts/DeviceContext'
// import {useLoaderContext} from '@hooks/useGlobalContext/contexts/LoaderContext'
// import {useNavigationContext} from '@hooks/useGlobalContext/contexts/NavigationContext'

// // 個別のセレクター（パフォーマンス最適化）
// export function useSession() {
//   const sessionData = useSessionContext()
//   return {
//     session: sessionData.session,
//     status: sessionData.status,
//     sessionLoading: sessionData.sessionLoading,
//   }
// }

// export function useDevice() {
//   const deviceData = useDeviceContext()
//   return {
//     device: deviceData.device,
//     PC: deviceData.PC,
//     width: deviceData.width,
//     height: deviceData.height,
//   }
// }

// export function useLoader() {
//   const loaderData = useLoaderContext()
//   return {
//     globalLoaderAtom: loaderData.globalLoaderAtom,
//     showLoader: loaderData.globalLoaderAtom, // showLoaderはglobalLoaderAtomと同じ
//     toggleLoad: loaderData.toggleLoad,
//     fullLoad: loaderData.fullLoad,
//   }
// }

// export function useNavigation() {
//   const navigationData = useNavigationContext()

//   return {
//     query: navigationData.query,
//     pathname: navigationData.pathname,
//     push: navigationData.push,
//     replace: navigationData.replace,
//     back: navigationData.back,
//   }
// }

// // 型安全な汎用セレクター
// export function useGlobalValue<T>(contextType: 'session' | 'device' | 'loader' | 'navigation', selector: (data: any) => T): T {
//   switch (contextType) {
//     case 'session':
//       return selector(useSessionContext())
//     case 'device':
//       return selector(useDeviceContext())
//     case 'loader':
//       return selector(useLoaderContext())
//     case 'navigation':
//       return selector(useNavigationContext())
//     default:
//       throw new Error(`Unknown context type: ${contextType}`)
//   }
// }
