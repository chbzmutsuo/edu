'use client'
import useGlobalSaleEditor from '@app/(apps)/aquapot/(pages)/(template)/useGlobalSaleEditor'
import {Padding} from '@components/styles/common-components/common-components'

import React from 'react'

export default function Template({children}) {
  const {HK_SaleEditor} = useGlobalSaleEditor()

  return (
    <div>
      <Padding></Padding>
      {<HK_SaleEditor.Modal />}
      {children}
    </div>
  )
}
