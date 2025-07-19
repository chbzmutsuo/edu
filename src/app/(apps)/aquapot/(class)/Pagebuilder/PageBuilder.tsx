'use client'

import {aqCustomerForSelectConfig} from '@app/(apps)/aquapot/(class)/colBuilder/aqCustomer'
import {ColBuilder} from '@app/(apps)/aquapot/(class)/colBuilder/ColBuilder'
import useAqCustomerFilter from '@app/(apps)/aquapot/(class)/Pagebuilder/useAqCustomerFilter'
import useAqCustomerRecordFilter from '@app/(apps)/aquapot/(class)/Pagebuilder/useAqCustomerRecordFilter'
import {QueryBuilder} from '@app/(apps)/aquapot/(class)/QueryBuilder'
import {DataModelBuilder, roleMaster} from '@cm/class/builders/PageBuilderVariables'

import {Fields} from '@cm/class/Fields/Fields'
import {DetailPagePropType} from '@cm/types/types'
import ChildCreator from '@cm/components/DataLogic/RTs/ChildCreator/ChildCreator'
import MyForm from '@cm/components/DataLogic/TFs/MyForm/MyForm'
import GlobalIdSelector from '@cm/components/GlobalIdSelector/GlobalIdSelector'
import {C_Stack} from '@cm/components/styles/common-components/common-components'
import {T_LINK} from '@cm/components/styles/common-components/links'
import {Wrapper} from '@cm/components/styles/common-components/paper'
import BasicTabs from '@cm/components/utils/tabs/BasicTabs'
import {useGlobalPropType} from '@cm/hooks/globalHooks/useGlobal'

import {Prisma} from '@prisma/client'

export class PageBuilder {
  static roleMaster: DataModelBuilder = roleMaster
  static aqCustomerRecord: DataModelBuilder = {
    top: props => {
      const {Filter} = useAqCustomerRecordFilter()
      return <Wrapper className={``}>{Filter}</Wrapper>
    },

    form: props => {
      const {query, router} = props.useGlobalProps
      return (
        <div>
          <T_LINK href="#" onClick={() => router.back()}>
            一覧に戻る
          </T_LINK>
          <MyForm {...{...props}} />
        </div>
      )
    },
  }
  static aqCustomer: DataModelBuilder = {
    top: props => {
      const {Filter} = useAqCustomerFilter()
      return <Wrapper className={``}>{Filter}</Wrapper>
    },
    form: (props: DetailPagePropType) => {
      const {query, router} = props.useGlobalProps

      const TabComponentArray = [{label: `基本情報`, component: <MyForm {...{...props}} />}]

      if (props?.formData?.id > 0) {
        TabComponentArray.push({
          label: `商品-価格設定`,
          component: (
            <ChildCreator
              {...{
                ParentData: props.formData ?? {},
                models: {
                  parent: props.dataModelName,
                  children: `aqCustomerPriceOption`,
                },
                columns: ColBuilder.aqCustomerPriceOption(props),
                additional: {
                  include: QueryBuilder.getInclude({}).aqCustomerPriceOption?.include,
                  payload: {aqCustomerId: undefined},
                },
                useGlobalProps: props.useGlobalProps,
              }}
            />
          ),
        })

        TabComponentArray.push({
          label: `支援ボトル設定`,
          component: (
            <ChildCreator
              {...{
                ParentData: props.formData ?? {},
                models: {parent: props.dataModelName, children: `aqCustomerSupportGroupMidTable`},
                columns: ColBuilder.aqCustomerSupportGroupMidTable(props),
                useGlobalProps: props.useGlobalProps,
                additional: {
                  include: QueryBuilder.getInclude({}).aqCustomerSupportGroupMidTable?.include,
                },
                toggleLoadFunc: () => {
                  router.refresh()
                },
              }}
            />
          ),
        })

        TabComponentArray.push({
          label: `対応履歴・契約・FAX等`,
          component: (
            <ChildCreator
              {...{
                editType: {
                  type: `page`,
                  pathnameBuilder: prop => {
                    return `/${prop.rootPath}/aqCustomerRecord/${prop.record.id}`
                  },
                },
                ParentData: props.formData ?? {},
                models: {parent: props.dataModelName, children: `aqCustomerRecord`},
                columns: ColBuilder.aqCustomerRecord({
                  ...props,
                  ColBuilderExtraProps: {
                    aqCustomerId: props.formData?.id,
                  },
                }),
                useGlobalProps: props.useGlobalProps,
                additional: {
                  include: QueryBuilder.getInclude({}).aqCustomerRecord?.include,
                },
              }}
            />
          ),
        })

        TabComponentArray.push({
          label: `売上履歴`,
          component: (
            <ChildCreator
              {...{
                myTable: {create: false, delete: false, update: false, header: true},
                ParentData: props.formData ?? {},
                models: {parent: props.dataModelName, children: `aqSaleRecord`},
                columns: ColBuilder.aqSaleRecord({...props}),
                useGlobalProps: props.useGlobalProps,

                additional: {
                  orderBy: [{date: `desc`}],
                  include: QueryBuilder.getInclude({}).aqSaleRecord?.include,
                },

                easySearchExtraProps: {
                  AqCustomerSupportGroupMidTable: props?.formData?.AqCustomerSupportGroupMidTable,
                },
              }}
            />
          ),
        })

        TabComponentArray.push({
          label: `定期契約`,
          component: (
            <ChildCreator
              {...{
                myTable: {},
                ParentData: props.formData ?? {},
                models: {parent: props.dataModelName, children: `aqCustomerSubscription`},
                columns: ColBuilder.aqCustomerSubscription({
                  ...props,
                  ColBuilderExtraProps: {aqCustomerId: props.formData?.id},
                }),
                useGlobalProps: props.useGlobalProps,
                additional: {
                  include: QueryBuilder.getInclude({})?.aqCustomerSubscription?.include,
                  orderBy: [
                    {
                      AqProduct: {productCode: `asc`},
                    },
                  ] as Prisma.AqCustomerSubscriptionOrderByWithRelationInput[],
                },
              }}
            />
          ),
        })
      }

      return (
        <C_Stack>
          <T_LINK href="#" onClick={() => router.back()}>
            一覧に戻る
          </T_LINK>

          <BasicTabs
            {...{
              id: `aqCustomerDetailPage`,
              TabComponentArray: TabComponentArray,
              showAll: false,
              style: {width: 1500, margin: `auto`},
            }}
          />
        </C_Stack>
      )
    },
  }

  static getGlobalIdSelector = (props: {useGlobalProps: useGlobalPropType}) => {
    const {useGlobalProps} = props
    const {admin} = useGlobalProps.session.scopes
    if (!admin) return

    return () => {
      const columns = Fields.transposeColumns([
        {
          id: 'g_userId',
          label: '',
          form: {},
          forSelect: {config: {modelName: `user`, select: {id: `number`, name: 'text'}}},
        },
        {
          id: 'g_aqCustomerId',
          label: '顧客',
          form: {},
          forSelect: {config: {...aqCustomerForSelectConfig}},
        },
      ])
      return (
        <>
          <GlobalIdSelector {...{useGlobalProps, columns}} />
        </>
      )
    }
  }
}
