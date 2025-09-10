import ProductsClient from '@app/(apps)/sbm/(pages)/products/ProductsClient'
import {initServerComopnent} from 'src/non-common/serverSideFunction'
import React from 'react'

export default async function Page(props) {
  const query = await props.searchParams
  const {session} = await initServerComopnent({query})
  return <ProductsClient />
}
