'use client'

import {Fields} from '@cm/class/Fields/Fields'

import GlobalIdSelector from '@components/GlobalIdSelector/GlobalIdSelector'
import useMySession from '@hooks/globalHooks/useMySession'

export class PageBuilder {
  static getGlobalIdSelector = ({useGlobalProps}) => {
    return () => {
      const {accessScopes} = useMySession()
      const {admin} = accessScopes()

      const columns = Fields.transposeColumns([
        {
          label: 'ユーザー',
          id: 'g_userId',
          form: {},
          forSelect: {
            config: {
              modelName: `user`,
              where: {OR: [{membershipName: {not: null}}]},
            },
          },
        },
      ])
      if (admin) {
        return (
          <GlobalIdSelector
            {...{
              useGlobalProps,
              columns,
            }}
          />
        )
      }
    }
  }
}
