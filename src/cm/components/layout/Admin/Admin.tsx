import React, {JSX} from 'react'
import {PageBuilderGetterType} from '@cm/types/types'

import AdminClient from '@components/layout/Admin/AdminClient'

export type adminProps = {
  AppName: string | JSX.Element
  Logo?: any
  PagesMethod: string
  children?: JSX.Element
  additionalHeaders?: JSX.Element[]
  PageBuilderGetter?: PageBuilderGetterType
  showLogoOnly?: boolean
  ModelBuilder?: any
  getTopPageLink?: getTopPageLinkType
  navBarPosition?: 'left' | 'top'
}

export type getTopPageLinkType = (props: {session: any}) => string
const Admin = (props: adminProps) => {
  return <AdminClient {...props} />
}

export default Admin
