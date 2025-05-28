import {jquants_getStockList} from '@app/(apps)/stock/api/jquants-server-actions/jquants-getter'
import {NextResponse} from 'next/server'

export const GET = async () => {
  const data = await jquants_getStockList({})
  return NextResponse.json({data})
}
