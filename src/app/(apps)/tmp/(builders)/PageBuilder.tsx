'use client'

import {ColBuilder} from '../(builders)/ColBuilder'
import {DetailPagePropType} from '@cm/types/types'
import ChildCreator from '@components/DataLogic/RTs/ChildCreator/ChildCreator'
import MyForm from '@components/DataLogic/TFs/MyForm/MyForm'
import {R_Stack} from '@components/styles/common-components/common-components'
import Accordion from '@components/utils/Accordions/Accordion'

export class PageBuilder {
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
}
