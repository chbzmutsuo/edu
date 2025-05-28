'use client'

import {DetailPagePropType} from '@cm/types/types'
import MyForm from '@components/DataLogic/TFs/MyForm/MyForm'
import BasicTabs from '@cm/components/utils/tabs/BasicTabs'

import ChildCreator from '@cm/components/DataLogic/RTs/ChildCreator/ChildCreator'
import {ColBuilder} from '@app/(apps)/KM/class/ColBuilder'

export class PageBuilder {
  static kaizenWork = {
    form: (props: DetailPagePropType) => {
      const {useGlobalProps} = props
      const {toggleLoad} = useGlobalProps

      return (
        <BasicTabs
          {...{
            id: 'kaizenWork',
            showAll: false,
            TabComponentArray: [
              {label: '基本情報', component: <MyForm {...props} />},
              {
                label: '画像',
                component: (
                  <ChildCreator
                    {...{
                      useGlobalProps,
                      columns: ColBuilder.kaizenWorkImage({useGlobalProps}),
                      ParentData: props.formData ?? {},
                      models: {
                        parent: 'kaizenWork',
                        children: 'kaizenWorkImage',
                      },
                    }}
                  />
                ),
              },
            ],
          }}
        ></BasicTabs>
      )
    },
  }
}
