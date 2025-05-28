'use client'

import React, {useState} from 'react'


import {STOCK_CONST} from '@app/(apps)/stock/(constants)/STOCK_CONST'

export default function page() {
  const [stocks, setStocks] = useState<any>([])

  const stockCols = STOCK_CONST.Y_FINANCE_COLS.filter(field => field.show)

  return <></>
}
