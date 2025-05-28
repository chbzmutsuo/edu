'use client'

import {ColBuilder} from '@app/(apps)/shinsei/(builders)/ColBuilder'
import {roleMaster} from '@class/builders/PageBuilderVariables'
import {Fields} from '@class/Fields/Fields'
import {DetailPagePropType} from '@cm/types/types'
import ChildCreator from '@components/DataLogic/RTs/ChildCreator/ChildCreator'
import GlobalIdSelector from '@components/GlobalIdSelector/GlobalIdSelector'
import MyForm from '@components/DataLogic/TFs/MyForm/MyForm'
import {R_Stack} from '@components/styles/common-components/common-components'
import Accordion from '@components/utils/Accordions/Accordion'
import useGlobal from '@hooks/globalHooks/useGlobal'

export class PageBuilder {
  static roleMaster = roleMaster
  static masterKeyClient = {
    form: (props: DetailPagePropType) => {
      return (
        <R_Stack className={`max-w-xl items-stretch`}>
          <div className={`w-full`}>
            <Accordion {...{label: `基本情報`, defaultOpen: true, closable: true}}>
              <MyForm {...{...props}} />
            </Accordion>
          </div>

          <div className={`w-full`}>
            <Accordion {...{label: `ユーザー`, defaultOpen: true, closable: true}}>
              <ChildCreator
                {...{
                  ParentData: props.formData ?? {},
                  models: {
                    parent: props.dataModelName,
                    children: `user`,
                  },
                  columns: ColBuilder.user(props),
                  useGlobalProps: props.useGlobalProps,
                }}
              />
            </Accordion>
          </div>
        </R_Stack>
      )
    },
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
              where: {apps: {has: `shinsei`}},
            },
          },
          form: {},
        },
      ])

      return <GlobalIdSelector {...{useGlobalProps, columns}} />
    }
  }
}
