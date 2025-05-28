import {atomTypes, useJotaiByKey} from '@hooks/useJotai'

export default function useDataUpdated() {
  const [dataUpdated, setdataUpdated] = useJotaiByKey<atomTypes[`dataUpdated`]>(`dataUpdated`, false)
  const addUpdated = () => setdataUpdated(dataUpdated + 1)
  return {dataUpdated, setdataUpdated, addUpdated}
}
