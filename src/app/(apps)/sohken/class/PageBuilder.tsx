'use client'

import {GenbaDayShiftForm} from '@app/(apps)/sohken/class/pageBuilderComponents/GenbaDayShift/GenbaDayShiftForm'
import GenbaDayShiftEmptyStuffSearcher from '@app/(apps)/sohken/class/pageBuilderComponents/GenbaDayShift/GenbaDayShiftEmptyStuffSearcher'
import {GenbaForm} from '@app/(apps)/sohken/class/pageBuilderComponents/GenbaDayShift/Genba/GenbaForm'
import useGlobal from '@hooks/globalHooks/useGlobal'
import {Fields} from '@class/Fields/Fields'
import GlobalIdSelector from '@components/GlobalIdSelector/GlobalIdSelector'
import {DataModelBuilder, roleMaster} from '@class/builders/PageBuilderVariables'

export class PageBuilder {
  static roleMaster: DataModelBuilder = roleMaster
  static genba = {form: GenbaForm}
  static genbaDay = {
    top: GenbaDayShiftEmptyStuffSearcher,

    form: GenbaDayShiftForm,
  }
  static getGlobalIdSelector = ({useGlobalProps}) => {
    return () => {
      const {accessScopes} = useGlobal()
      const scopes = accessScopes()
      const {admin} = scopes

      if (!admin) {
        return <></>
      }

      const columns = Fields.transposeColumns([
        {
          label: '',
          id: 'g_userId',
          forSelect: {
            config: {
              where: {apps: {has: `sohken`}},
            },
          },
          form: {},
        },
      ])

      return <GlobalIdSelector {...{useGlobalProps, columns}} />
    }
  }
}
