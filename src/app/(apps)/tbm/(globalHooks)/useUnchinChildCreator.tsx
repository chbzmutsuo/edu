import {ColBuilder} from '@app/(apps)/tbm/(builders)/ColBuilders/ColBuilder'
import ChildCreator from '@cm/components/DataLogic/RTs/ChildCreator/ChildCreator'
import {useGlobalModalForm} from '@cm/components/utils/modal/useGlobalModalForm'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {atomKey, useJotaiByKey} from '@cm/hooks/useJotai'
import React from 'react'

export default function useUnchinChildCreator() {
  type gasolineGMF = {
    TbmRouteGroup: any
  }

  return useGlobalModalForm<gasolineGMF>(`useUnchinChildCreatorGMF` as atomKey, null, {
    mainJsx: ({GMF_OPEN, setGMF_OPEN}) => {
      const globalStateKey = ['table-records', 'tbmRouteGroup'].join('_') as atomKey
      const [records, setrecords] = useJotaiByKey(globalStateKey, null)
      const useGlobalProps = useGlobal()
      const {TbmRouteGroup} = GMF_OPEN ?? {}

      return (
        <>
          <ChildCreator
            {...{
              ParentData: TbmRouteGroup,
              models: {parent: `tbmRouteGroup`, children: `tbmRouteGroupFee`},
              additional: {
                orderBy: [{startDate: `desc`}],
                // toggleLoadFunc: async cb => {
                //   const upsertedRecordRes = await cb()

                //   setrecords((prev: (TbmRouteGroup & {TbmRouteGroupFee: TbmRouteGroupFee[]})[]) => {
                //     const newRecords = [...prev]

                //     const theRecordIndex = newRecords.findIndex(r => r.id === upsertedRecordRes.result.tbmRouteGroupId)

                //     return prev.map(r => {
                //       if (r.id === theRecordIndex) {
                //         const groupFee = r.TbmRouteGroupFee

                //         const newGroupFee = groupFee.map(g => {
                //           if (g.id === upsertedRecordRes.result.id) {
                //             return upsertedRecordRes.result
                //           }
                //         })

                //         return {
                //           ...r,
                //           TbmRouteGroupFee: newGroupFee.sort((a, b) => b.startDate.getTime() - a.startDate.getTime()),
                //         }
                //       }
                //       return r
                //     })

                //   })

                //   return upsertedRecordRes
                // },
              },

              columns: ColBuilder.tbmRouteGroupFee({useGlobalProps}),
              useGlobalProps,
            }}
          />
        </>
      )
    },
  })
}
