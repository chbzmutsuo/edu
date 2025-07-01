'use client'

import {DetailPagePropType} from '@cm/types/types'
import MyForm from '@components/DataLogic/TFs/MyForm/MyForm'
import {R_Stack} from '@components/styles/common-components/common-components'
import MyAccordion from '@components/utils/Accordions/MyAccordion'

export class PageBuilder {
  static masterKeyClient = {
    form: (props: DetailPagePropType) => {
      return (
        <R_Stack className={`max-w-xl items-stretch`}>
          <div className={`w-full`}>
            <MyAccordion {...{label: `基本情報`, defaultOpen: true, closable: true}}>
              <MyForm {...{...props}} />
            </MyAccordion>
          </div>

          <div className={`w-full`}></div>
        </R_Stack>
      )
    },
  }
}
