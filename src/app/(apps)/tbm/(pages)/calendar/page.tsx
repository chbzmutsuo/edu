import CalendarCC from '@app/(apps)/tbm/(pages)/calendar/CalendarCC'
import {dateSwitcherTemplate} from '@cm/lib/methods/redirect-method'
import React from 'react'

export default async function Page(props) {
  const query = await props.searchParams
  const {redirectPath, whereQuery} = await dateSwitcherTemplate({query})

  // if (redirectPath) {
  //   return <Redirector {...{redirectPath}} />
  // }

  return <CalendarCC />
}
