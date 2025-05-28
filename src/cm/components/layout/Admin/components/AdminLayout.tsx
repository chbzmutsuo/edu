import React from 'react'
import dynamic from 'next/dynamic'
import PlaceHolder from '@components/utils/loader/PlaceHolder'
import {adminContext, menuContext} from '../hooks/useAdminContext'
import {useGlobalPropType} from 'src/cm/hooks/globalHooks/useGlobalOrigin'

// 動的インポートでコード分割
const NavBar = dynamic(() => import('src/cm/components/layout/Navigation/NavBar'), {
  loading: () => <PlaceHolder />,
})
const Header = dynamic(() => import('src/cm/components/layout/Header'), {
  loading: () => <PlaceHolder />,
})
const Drawer = dynamic(() => import('src/cm/components/layout/Navigation/Drawer'), {
  loading: () => <PlaceHolder />,
})

type AdminLayoutProps = {
  children: React.ReactNode
  adminContext: adminContext
  menuContext: menuContext
  useGlobalProps: useGlobalPropType
}

export const AdminLayout = React.memo(({children, adminContext, menuContext, useGlobalProps}: AdminLayoutProps) => {
  const {device} = useGlobalProps
  const {PC} = device ?? {}
  const {horizontalMenu, pathItemObject} = adminContext

  const MainDisplay = React.memo(() => <div>{children}</div>)

  if (PC) {
    return (
      <PCLayout
        MainDisplay={MainDisplay}
        adminContext={adminContext}
        menuContext={menuContext}
        useGlobalProps={useGlobalProps}
        horizontalMenu={horizontalMenu}
        pathItemObject={pathItemObject}
      />
    )
  }

  return (
    <SPLayout
      MainDisplay={MainDisplay}
      adminContext={adminContext}
      menuContext={menuContext}
      useGlobalProps={useGlobalProps}
      horizontalMenu={horizontalMenu}
      pathItemObject={pathItemObject}
    />
  )
})

// PC用レイアウト
const PCLayout = React.memo(({MainDisplay, adminContext, menuContext, useGlobalProps, horizontalMenu, pathItemObject}: any) => (
  <div>
    <Header adminContext={adminContext} />

    {adminContext.navBarPosition === `left` && (
      <Drawer menuContext={menuContext}>
        <NavBar useGlobalProps={useGlobalProps} horizontalMenu={horizontalMenu} navItems={pathItemObject.navItems} />
      </Drawer>
    )}

    <MainDisplay />
  </div>
))

// SP用レイアウト
const SPLayout = React.memo(({MainDisplay, adminContext, menuContext, useGlobalProps, horizontalMenu, pathItemObject}: any) => (
  <div className="sticky top-0">
    <div>
      <Header adminContext={adminContext} />
      <Drawer menuContext={menuContext}>
        <NavBar useGlobalProps={useGlobalProps} horizontalMenu={horizontalMenu} navItems={pathItemObject.navItems} />
      </Drawer>
    </div>

    <MainDisplay />
  </div>
))

AdminLayout.displayName = 'AdminLayout'
PCLayout.displayName = 'PCLayout'
SPLayout.displayName = 'SPLayout'
