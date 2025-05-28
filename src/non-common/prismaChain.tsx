import {chain_shinsei_hacchu_notifyWhenUpdate} from 'src/non-common/(chains)/shinsei/chain_shinsei_hacchu_notifyWhenUpdate'
import {chain_shinsei_kyuka_notifyWhenUpdate} from 'src/non-common/(chains)/shinsei/chain_shinsei_kyuka_notifyWhenUpdate'
import {prismaMethodType, PrismaModelNames} from '@cm/types/prisma-types'
import {requestResultType} from '@cm/types/types'

import {Approval} from '@prisma/client'
import {chain_sohken_genbaDayUpdateChain} from 'src/non-common/(chains)/getGenbaScheduleStatus/chain_sohken_genbaDayUpdateChain'

type chainType = {
  [key in PrismaModelNames]?: {
    when: prismaMethodType[]
    do: (props: {res: requestResultType; queryObject: any}) => Promise<requestResultType>
  }[]
}
export const prismaChain: chainType = {
  genbaDay: [
    {
      when: [`upsert`, `update`, `create`],
      do: async ({res, queryObject}) => {
        // GetNinkuListを変える
        await chain_sohken_genbaDayUpdateChain({genbaId: res.result.genbaId})
        return res
      },
    },
  ],

  approval: [
    {
      when: [`upsert`, `update`, `create`, `updateMany`],
      do: async ({res, queryObject}) => {
        const data: Approval = res.result
        if (data.type === '発注') {
          await chain_shinsei_hacchu_notifyWhenUpdate({purchaseRequestId: res.result.purchaseRequestId})
        } else if (data.type === '休暇') {
          await chain_shinsei_kyuka_notifyWhenUpdate({leaveRequestId: res.result.leaveRequestId})
        }
        return res
      },
    },
  ],
}
