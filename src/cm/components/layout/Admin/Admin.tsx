import React, {JSX} from 'react'
import {PageBuilderGetterType} from '@cm/types/types'

import dynamic from 'next/dynamic'
import PlaceHolder from '@components/utils/loader/PlaceHolder'

const AdminClient = dynamic(() => import('@components/layout/Admin/AdminClient'), {loading: () => <PlaceHolder />})

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
