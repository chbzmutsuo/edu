import {atomKey, useJotaiByKey} from '@cm/hooks/useJotai'

export default function useGDS_DND() {
  return useJotaiByKey<{
    id: number
    fromGenbaId: number
    fromGenbaDayId: number
    userId: number
    sohkenCarId: number
    itemType: 'genbaDayShift' | 'genbaDaySoukenCar'
  }>(`GDS_DND` as atomKey, null)
}
