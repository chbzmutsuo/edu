'use client'
import useRedirect from 'src/cm/hooks/useRedirect'
import PlaceHolder from '@components/utils/loader/PlaceHolder'

const Redirector = ({redirectPath}) => {
  useRedirect(redirectPath, redirectPath)

  return <PlaceHolder>Redirecting...</PlaceHolder>
}

export default Redirector
