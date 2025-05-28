'use client'
import useRedirect from 'src/cm/hooks/useRedirect'
import Loader from '@components/utils/loader/Loader'

const Redirector = ({redirectPath}) => {
  useRedirect(redirectPath, redirectPath)

  return <Loader>Redirecting...</Loader>
}

export default Redirector
