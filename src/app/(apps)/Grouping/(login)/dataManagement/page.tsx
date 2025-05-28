import {DataDownLoaderCC} from './DataDownLoaderCC'
import {Padding} from '@components/styles/common-components/common-components'
import React from 'react'

export default async function Page({params, searchParams: query}) {
  return (
    <Padding className={`p-4`}>
      <DataDownLoaderCC />
    </Padding>
  )
}
