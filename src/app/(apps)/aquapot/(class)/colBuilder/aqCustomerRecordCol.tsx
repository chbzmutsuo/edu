import {ColBuilder} from '@app/(apps)/aquapot/(class)/colBuilder/ColBuilder'
import {AQ_CONST} from '@app/(apps)/aquapot/(constants)/options'
import {defaultRegister} from '@class/builders/ColBuilderVariables'
import {Fields} from '@class/Fields/Fields'
import {columnGetterType} from '@cm/types/types'
import ChildCreator from '@components/DataLogic/RTs/ChildCreator/ChildCreator'
import {C_Stack} from '@components/styles/common-components/common-components'

export const aqCustomerRecordCol = (props: columnGetterType) => {
  const {useGlobalProps} = props
  const {aqCustomerId} = props.ColBuilderExtraProps ?? {}

  const detailColProps = {
    width: 500,
    minHeight: 100,
  }
  return new Fields([
    ...new Fields([
      {
        id: `aqCustomerId`,
        label: `法人名/顧客名`,
        forSelect: {
          config: {
            select: {id: `number`, name: `text`, companyName: `text`},
            nameChanger: op => {
              const name = [op.companyName, op.name].filter(Boolean).join(`\n`)
              return {...op, name: name}
            },
          },
        },
        format: (value, row) => {
          return (
            <C_Stack className={`gap-0`}>
              <span>{row.AqCustomer.companyName}</span>
              <span>{row.AqCustomer.name}</span>
            </C_Stack>
          )
        },
        td: {style: {width: 320}},
        form: {defaultValue: aqCustomerId, disabled: aqCustomerId ? true : false},
      },
      {
        id: `date`,
        label: `受付時間`,
        form: {defaultValue: new Date()},
        td: {style: {width: 140}},
        type: `datetime`,
      },
      {
        id: `status`,
        label: `ステータス`,
        form: {},
        td: {style: {width: 80}},
        forSelect: {
          optionsOrOptionFetcher: AQ_CONST.CUSTOMER.AQCUSTOMER_RECORD_STATUS_LIST,
        },
      },
      {
        id: `type`,
        label: `区分`,
        form: {},
        td: {style: {width: 80}},
        forSelect: {
          optionsOrOptionFetcher: AQ_CONST.CUSTOMER.AQCUSTOMER_RECORD_TYPE_LIST,
        },
      },
      {
        id: `userId`,
        label: `対応者`,
        td: {style: {width: 80}},
        form: {
          ...defaultRegister,
          defaultValue: props.useGlobalProps.session.scopes.admin ? undefined : props.useGlobalProps.session?.id,
        },
        forSelect: {},
      },
    ]).buildFormGroup({groupName: `基本情報`}).plain,

    ...new Fields([
      {id: `content`, label: `問い合わせ/対応内容`, form: {}, td: {style: {minWidth: 250}}, type: `textarea`},
      {id: `remarks`, label: `備考`, form: {}, td: {style: {minWidth: 250}}, type: `textarea`},
      {
        id: `file`,
        label: `添付ファイル`,
        td: {style: {width: 150}},
        form: {
          editFormat: props => {
            const customerRecord = props.formData
            return (
              <ChildCreator
                {...{
                  ParentData: customerRecord,
                  models: {parent: `aqCustomerRecord`, children: `aqCustomerRecordAttachment`},
                  columns: ColBuilder.aqCustomerRecordAttachment({
                    useGlobalProps,
                  }),
                  myTable: {style: {width: detailColProps.width - 50}},
                  useGlobalProps,
                }}
              />
            )
          },
        },
        format: (value, row, col) => {
          return (
            <div>
              {(row.AqCustomerRecordAttachment ?? []).map((d, idx) => {
                return (
                  <a key={idx} className={`t-link`} href={d.url} target={`_blank`}>
                    {d.title ?? d.url}
                  </a>
                )
              })}
            </div>
          )
        },
      },
    ])
      .customAttributes(({col}) => {
        return {
          form: {
            ...col.form,
            style: {
              width: detailColProps.width,
              minHeight: detailColProps.minHeight,
            },
          },
        }
      })
      .buildFormGroup({groupName: `詳細情報`}).plain,
  ]).transposeColumns()
}
