import Loader from '@components/utils/loader/Loader'
import React, {useState} from 'react'

export default function useLocalLoading() {
  const [localLoading, setlocalLoading] = useState(false)
  const toggleLocalLoading = async cb => {
    setlocalLoading(true)
    const res = await cb()
    setlocalLoading(false)
    return res
  }

  const LocalLoader = () => {
    return <div>{localLoading && <Loader></Loader>}</div>
  }

  return {
    LocalLoader,
    toggleLocalLoading,
  }
}
