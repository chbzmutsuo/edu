'use client'

import useMyNavigation from '@hooks/globalHooks/useMyNavigation'
import {HREF} from '@lib/methods/urls'
import {redirect} from 'next/navigation'

import {useEffect} from 'react'

export default function useRedirect(mustRedirect, redirectUrl = '/404', shouldRedirect = true) {
  const {asPath, router, query} = useMyNavigation()

  const doRedirect = mustRedirect && shouldRedirect && redirectUrl

  useEffect(() => {
    const [path, searchParams] = redirectUrl.split(`?`)

    const newQuery = Object.fromEntries(
      String(searchParams)
        .split(`&`)
        .map(item => {
          const [key, value] = item.split(`=`)
          return [key, value]
        })
    )

    const newPath = HREF(path, newQuery, query)

    if (doRedirect && !asPath.includes(newPath)) {
      // router.push(newPath)
      redirect(newPath)
    }
  }, [doRedirect, redirectUrl, mustRedirect])

  return {
    isValidUser: !mustRedirect,
  }
}
