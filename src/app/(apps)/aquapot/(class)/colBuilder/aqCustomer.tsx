'use client'

import {AQ_CONST} from '@app/(apps)/aquapot/(constants)/options'
import {defaultMultipleSelectFormat} from '@class/Fields/lib/defaultFormat'
import {obj__objectToArray} from '@class/ObjHandler/transformers'

import {Fields} from '@cm/class/Fields/Fields'
import {forSelectConfig} from '@cm/types/select-types'
import {columnGetterType} from '@cm/types/types'

import {CsvTable} from '@components/styles/common-components/CsvTable/CsvTable'

const defaultSummaryInTdArgs = {
  hideUndefinedValue: false,
  labelWidthPx: 70,
  wrapperWidthPx: 170,
}
export const aqCustomer = (props: columnGetterType) => {
  const alignTdWidth = () => ({
    td: {
      withLabel: true,
      style: {maxWidth: 240, minWidth: 100},
    },
  })

  return new Fields([
    ...new Fields([
      ...new Fields([
        // {id: 'id', label: `ID`},
        {id: 'customerNumber', label: '顧客番号', type: 'string', form: {}, search: {}},
        {id: 'name', label: '氏名', type: 'string', form: {}, search: {}},
        {id: 'companyName', label: '会社名', type: 'string', form: {}, search: {}},
        {id: 'jobTitle', label: '役職', type: 'string', form: {}},
      ])
        .customAttributes(alignTdWidth)
        .showSummaryInTd(defaultSummaryInTdArgs).plain,

      ...new Fields([
        {id: 'email', label: 'メール', type: 'string', form: {}},
        {id: 'fax', label: 'FAX', type: 'string', form: {}, search: {}},
        {id: 'tel', label: '電話番号1', type: 'string', form: {}, search: {}},
        {id: 'tel2', label: '電話番号2', type: 'string', form: {}, search: {}},
        {id: 'invoiceNumber', label: '適格事業者番号', type: 'string', form: {}, search: {}},
      ])
        .customAttributes(alignTdWidth)
        .showSummaryInTd(defaultSummaryInTdArgs).plain,
    ]).buildFormGroup({groupName: `基本情報①`}).plain,
    ...new Fields([
      ...new Fields([
        {
          id: 'defaultPaymentMethod',
          label: '支払方法',
          forSelect: {
            optionsOrOptionFetcher: AQ_CONST.PAYMENT_METHOD_LIST,
          },
        },
        {
          id: 'furikomisakiCD',
          label: '振込先',
          forSelect: {
            optionsOrOptionFetcher: obj__objectToArray(AQ_CONST.BANK_LIST).map(d => {
              const op = {id: d.key, name: d.value.abbriviation}
              return op
            }),
          },
        },
        {id: `firstVisitDate`, label: `サービス開始`, type: `date`, form: {}},
        {id: `lastVisitDate`, label: `サービス終了`, type: `date`, form: {}},
      ])
        .customAttributes(alignTdWidth)
        .showSummaryInTd(defaultSummaryInTdArgs).plain,
      ...new Fields([
        {
          id: `maintananceYear`,
          label: `メンテ年`,
          type: `number`,
          form: {},
          search: {},
          inputProps: {},
        },
        {
          id: `maintananceMonth`,
          label: `メンテ月`,
          type: `number`,
          form: {},
          search: {},
          inputProps: {max: 12},
        },
        {
          id: `status`,
          label: `ステータス`,
          form: {defaultValue: `継続`},
          forSelect: {
            optionsOrOptionFetcher: AQ_CONST.CUSTOMER.AQCUSTOMER_STATUS_LIST,
          },
        },
      ])
        .customAttributes(alignTdWidth)
        .showSummaryInTd(defaultSummaryInTdArgs).plain,
    ]).buildFormGroup({groupName: `基本情報②`}).plain,

    ...new Fields([
      ...new Fields([
        // {id: 'domestic', label: '国内', type: 'boolean', form: {}},
        {id: 'postal', label: '郵便番号', type: 'string', form: {}},
        {id: 'state', label: '都道府県', type: 'string', form: {}},
        {id: 'city', label: '市区町村', type: 'string', form: {}},
        {id: 'street', label: '町名', type: 'string', form: {}},
        {id: 'building', label: '建物名', type: 'string', form: {}},
      ])
        .customAttributes(alignTdWidth)
        .showSummaryInTd(defaultSummaryInTdArgs).plain,
    ]).buildFormGroup({groupName: `住所`}).plain,

    ...new Fields([
      ...new Fields([
        {
          id: `aqCustomerServiceTypeMidTable`,
          label: `ご利用サービス`,
          multipleSelect: {
            models: {
              parent: `aqCustomer`,
              mid: `aqCustomerServiceTypeMidTable`,
              option: `aqServiecTypeMaster`,
              uniqueWhereKey: `unique_aqCustomerId_aqServiecTypeMasterId`,
            },
          },
          format: defaultMultipleSelectFormat,
          form: {},
        },
        {
          id: `aqCustomerDealerMidTable`,
          label: `担当販売店`,
          multipleSelect: {
            models: {
              parent: `aqCustomer`,
              mid: `aqCustomerDealerMidTable`,
              option: `aqDealerMaster`,
              uniqueWhereKey: `unique_aqCustomerId_aqDealerMasterId`,
            },
          },
          format: defaultMultipleSelectFormat,
          form: {},
        },
        {
          id: `aqCustomerDeviceMidTable`,
          label: `ご利用機種`,
          multipleSelect: {
            models: {
              parent: `aqCustomer`,
              mid: `aqCustomerDeviceMidTable`,
              option: `aqDeviceMaster`,
              uniqueWhereKey: `unique_aqCustomerId_aqDeviceMasterId`,
            },
          },
          format: defaultMultipleSelectFormat,
          form: {},
        },
      ])
        .customAttributes(({col}) => ({
          ...col,
          td: {...col.td, style: {width: 120}},
          form: {...col.form, style: {width: 500}},
        }))
        .showSummaryInTd(defaultSummaryInTdArgs).plain,
      ...new Fields([
        {
          id: 'remarks',
          label: '備考',
          type: 'textarea',
          form: {
            style: {minWidth: 480, margin: 'auto'},
          },
          td: {style: {minWidth: 250}},
          search: {},
        },
        {
          id: `AqCustomerPriceOption`,
          label: `設定価格一覧`,
          form: {hidden: true},
          format: (value, row) => {
            return CsvTable({
              records: row.AqCustomerPriceOption.map(d => {
                const {AqProduct, AqPriceOption} = d ?? {}
                const truncate = `truncate w-[60px] text-xs`
                return {
                  csvTableRow: [AqProduct?.name, AqPriceOption?.name, AqPriceOption?.price].map(d => ({
                    label: '',
                    cellValue: <div {...{className: truncate}}>{d}</div>,
                  })),
                }
              }),
            }).WithWrapper({...{className: `max-h-[200px]`}})
          },
        },
      ]).showSummaryInTd({...defaultSummaryInTdArgs, labelWidthPx: 80, wrapperWidthPx: 300}).plain,
    ]).buildFormGroup({groupName: `その他`}).plain,
  ]).transposeColumns()
}

export const aqCustomerForSelectConfig: forSelectConfig = {
  select: {
    name: `text`,
    companyName: `text`,
    jobTitle: `text`,
  },
  nameChanger: op => {
    const name = op ? [op.companyName, op.jobTitle, op.name].filter(Boolean).join(` / `) : ''
    return {...op, name}
  },
}
