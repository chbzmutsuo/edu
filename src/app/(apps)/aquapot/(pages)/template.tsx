'use client'
import useGlobalSaleEditor from '@app/(apps)/aquapot/(pages)/(template)/useGlobalSaleEditor'
import React from 'react'

export default function Template({children}) {
  const {HK_SaleEditor} = useGlobalSaleEditor()

  return (
    <div>
      {<HK_SaleEditor.Modal />}
      {children}
    </div>
  )
}
