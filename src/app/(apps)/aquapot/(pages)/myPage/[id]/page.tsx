import MyPageCC from '@app/(apps)/aquapot/(pages)/myPage/[id]/MyPageCC'
import {getCustomerDataWithSales} from '@app/(apps)/aquapot/(pages)/myPage/getCustomerDataWithSales'
import NewDateSwitcher from '@components/utils/dates/DateSwitcher/NewDateSwitcher'
import {C_Stack, FitMargin} from '@components/styles/common-components/common-components'

import Redirector from '@components/utils/Redirector'

import {dateSwitcherTemplate} from '@lib/methods/redirect-method'

import React from 'react'
import {initServerComopnent} from 'src/non-common/serverSideFunction'

export default async function page(props: {searchParams: any; params: any}) {
  const query = await props.searchParams
  const params = await props.params

  const {session, scopes} = await initServerComopnent({query})
  const {aqCustomerId} = scopes.getAquepotScopes()

  const isValidUser = aqCustomerId && session.id === Number(params.id)

  const {whereQuery, redirectPath} = await dateSwitcherTemplate({query})

  if (redirectPath) {
    return <Redirector {...{redirectPath}} />
  }

  if (!isValidUser) {
    return <small className={`mx-auto w-full text-center`}>このページは存在しません</small>
  }

  const {customer, salesByMonth} = await getCustomerDataWithSales({userId: Number(params.id), query})

  return (
    <FitMargin>
      <C_Stack className={`p-2`}>
        <NewDateSwitcher {...{yearOnly: true}} />
        <MyPageCC {...{customer, salesByMonth}} />
      </C_Stack>
    </FitMargin>
  )
}
