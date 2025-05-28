import {atomKey, useJotaiByKey} from '@hooks/useJotai'

export default function useSelectedBase() {
  const selectedBaseKey = `selectedBaseKey` as atomKey
  const [selectedBase, setselectedBase] = useJotaiByKey<any>(selectedBaseKey, null)

  const selectedRouteGroupKey = `selectedRouteGroupKey` as atomKey
  const [selectedRouteGroup, setselectedRouteGroup] = useJotaiByKey<any>(selectedRouteGroupKey, null)

  return {selectedBase, setselectedBase, selectedRouteGroup, setselectedRouteGroup}
}
