import React from 'react'

import {adminContext, menuContext} from '@components/layout/Admin/type'
import {useGlobalPropType} from 'src/cm/hooks/globalHooks/useGlobalOrigin'
import useWindowSize from '@hooks/useWindowSize'
import Header from '@components/layout/Header'
import Drawer from '@components/layout/Navigation/Drawer'
import NavBar from '@components/layout/Navigation/NavBar'

type AdminLayoutProps = {
  children: React.ReactNode
  adminContext: adminContext
  menuContext: menuContext
  useGlobalProps: useGlobalPropType
}

export const AdminLayout = React.memo(({children, adminContext, menuContext, useGlobalProps}: AdminLayoutProps) => {
  const {PC} = useWindowSize()
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
