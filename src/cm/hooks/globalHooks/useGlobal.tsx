export type useGlobalPropType = ReturnType<typeof useGlobalOrigin>

import {useGlobalContext} from '@hooks/useGlobalContext/hooks/useGlobalContext'
import {atomTypes, useJotaiByKey} from '@hooks/useJotai'
import useGlobalOrigin from 'src/cm/hooks/globalHooks/useGlobalOrigin'

export default function useGlobal(place?: any) {
  if (process.env.NEXT_PUBLIC_USE_JOTAI_GLOBAL === 'true') {
    const data = useJotaiByKey<atomTypes[`globalHooks`]>(`globalHooks`, null)
    const globalHooks = data[0] as useGlobalPropType
    return globalHooks
  } else {
    return useGlobalContext()
  }
}
