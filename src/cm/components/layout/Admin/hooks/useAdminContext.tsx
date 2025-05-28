import {useState, useEffect, useMemo, JSX} from 'react'
import {MenuButton} from 'src/cm/components/layout/MenuButton'
import {getPathItemRelatedProps} from '@components/layout/Admin/getPathItemRelatedProps'
import {useGlobalPropType} from 'src/cm/hooks/globalHooks/useGlobalOrigin'
import {adminProps} from '@components/layout/Admin/Admin'

export type menuContext = {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  toggleMenu: () => void
  MenuButton: JSX.Element
}

export type adminContext = adminProps & {
  horizontalMenu: boolean
  pathItemObject: ReturnType<typeof getPathItemRelatedProps>
  useGlobalProps: useGlobalPropType
  getTopPageLink?: (props: {session: any}) => string
  menuContext: menuContext
}

export const useAdminContext = (props: adminProps, useGlobalProps: useGlobalPropType) => {
  const {pathname, query, device} = useGlobalProps
  const {PC} = device ?? {}
  const horizontalMenu = PC && (props.navBarPosition ?? `top`) === `top`

  const [isOpen, setIsOpen] = useState(false)

  // パス変更時にメニューを閉じる
  useEffect(() => {
    setIsOpen(false)
  }, [pathname, query])

  const toggleMenu = () => setIsOpen(!isOpen)

  // パス関連プロパティをメモ化
  const pathItemObject = useMemo(() => {
    return getPathItemRelatedProps({PagesMethod: props.PagesMethod, useGlobalProps})
  }, [props.PagesMethod, useGlobalProps])

  // メニューコンテキストをメモ化
  const menuContext: menuContext = useMemo(
    () => ({
      isOpen,
      setIsOpen,
      toggleMenu,
      MenuButton: <MenuButton onClick={toggleMenu} />,
    }),
    [isOpen, toggleMenu]
  )

  // 管理コンテキストをメモ化
  const adminContext: adminContext = useMemo(
    () => ({
      ...props,
      pathItemObject,
      useGlobalProps,
      navBarPosition: props.navBarPosition ?? `top`,
      horizontalMenu,
      menuContext,
    }),
    [props, pathItemObject, useGlobalProps, horizontalMenu, menuContext]
  )

  return {
    adminContext,
    menuContext,
    pathItemObject,
    horizontalMenu,
  }
}
