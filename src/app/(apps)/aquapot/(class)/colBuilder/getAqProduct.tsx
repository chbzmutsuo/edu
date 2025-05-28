'use client'

import {aqCustomerForSelectConfig} from '@app/(apps)/aquapot/(class)/colBuilder/aqCustomer'
import {ColBuilder} from '@app/(apps)/aquapot/(class)/colBuilder/ColBuilder'
import {AQ_CONST} from '@app/(apps)/aquapot/(constants)/options'

import {defaultRegister} from '@class/builders/ColBuilderVariables'

import {formatDate} from '@class/Days/date-utils/formatters'

import {Fields} from '@cm/class/Fields/Fields'
import {columnGetterType} from '@cm/types/types'
import ChildCreator from '@components/DataLogic/RTs/ChildCreator/ChildCreator'

import {C_Stack, R_Stack} from '@components/styles/common-components/common-components'
import {Paper} from '@components/styles/common-components/paper'

import GlobalModal from '@components/utils/modal/GlobalModal'
import MyPopover from '@components/utils/popover/MyPopover'

export const getAqProduct = (props: columnGetterType) => {
  return new Fields([
    ...new Fields([
      {id: 'productCode', label: '商品No', form: {}},
      {id: 'name', label: '商品名', form: {...defaultRegister}, search: {}},
      {id: 'aqProductCategoryMasterId', label: '商品カテゴリ', forSelect: {}, form: {}},
      {id: 'cost', label: '原価（税別）', type: `number`, form: {}},
      {
        id: 'taxRate',
        label: '消費税（％）',
        type: `float`,
        forSelect: {optionsOrOptionFetcher: AQ_CONST.TAX_TYPE},

        form: {defaultValue: 10},
      },
      {
        id: 'aqDefaultShiireAqCustomerId',
        label: '仕入れ先',
        type: `float`,
        forSelect: {
          config: {
            ...aqCustomerForSelectConfig,
            modelName: `aqCustomer`,
          },
        },
        form: {},
        format: (value, aqProduct) => {
          const {name, companyName} = aqProduct.AqDefaultShiireAqCustomer ?? {}
          return [companyName, name].filter(Boolean).join(` / `)
        },
      },
      {
        id: `inInventoryManagement`,
        label: '在庫管理',
        type: `boolean`,
        form: {},
      },
    ]).buildFormGroup({groupName: `基本情報`}).plain,

    // {id: `targetStore`, label: `対象店舗`},
    {
      id: `AqPriceOption`,
      label: `価格オプション`,
      format: (value, aqProduct) => {
        return (
          <R_Stack className={`items-center`}>
            <GlobalModal id={`aqProductPriceOptionModal` + aqProduct.id} btnComponent={<div className={`t-link`}>編集</div>}>
              <ChildCreator
                {...{
                  ParentData: aqProduct,
                  models: {
                    parent: `aqProduct`,
                    children: `aqPriceOption`,
                  },
                  columns: ColBuilder.aqPriceOption(props),
                  useGlobalProps: props.useGlobalProps,
                  additional: {
                    toggleLoadFunc: async cb => {
                      const res = await cb()
                      props.useGlobalProps.router.refresh()
                      return res
                    },
                  },
                }}
              />
            </GlobalModal>
            <MyPopover
              {...{
                button: (
                  <div className={`small`}>
                    <div>
                      <span>{aqProduct.AqPriceOption.length}</span>
                      <span>個</span>
                    </div>
                  </div>
                ),
              }}
            >
              <Paper>
                <C_Stack className={`gap-1`}>
                  {aqProduct.AqPriceOption.map(d => {
                    const {name, price} = d
                    return (
                      <small key={d.id}>
                        {name}:{price}
                      </small>
                    )
                  })}
                </C_Stack>
              </Paper>
            </MyPopover>
          </R_Stack>
        )
      },
    },

    {
      id: `AqInventory`,
      label: `在庫`,
      td: {style: {minWidth: 220}},
      format: (value, aqProduct) => {
        const {AqInventoryRegister, AqSaleRecord} = aqProduct

        const totalPurchaseQuantity = AqInventoryRegister.reduce((acc, curr) => acc + curr.quantity, 0)
        const totalSaleQuantity = AqSaleRecord.reduce((acc, curr) => acc + curr.quantity, 0)

        const saleRecords = AqSaleRecord.map(d => {
          const {quantity, AqCustomer, date} = d
          const name = [AqCustomer?.companyName, AqCustomer?.name].join(`/`)
          return [formatDate(date, 'short'), quantity, name].join(`    `)
        })

        //
        return (
          <R_Stack className={`justify-between gap-0.5 text-center `}>
            <span className={`w-[60px] font-bold text-red-700 `}>{totalPurchaseQuantity}</span>
            <span className={`w-[10px]`}>-</span>
            <span className={`w-[60px] font-bold text-green-600 `}>{totalSaleQuantity}</span>
            <span className={`w-[10px]`}>=</span>
            <span className={`w-[60px] font-bold `}>{Number(totalPurchaseQuantity - totalSaleQuantity)}</span>

            {/* <KeyValue label={`仕入れ合計`}>{totalPurchaseQuantity || '-'}</KeyValue>
            <KeyValue label={`販売`}>{totalSaleQuantity || '-'}</KeyValue>
            <KeyValue label={`在庫`}>{Number(totalPurchaseQuantity - totalSaleQuantity) || '-'}</KeyValue> */}
          </R_Stack>
        )
      },
    },
  ]).transposeColumns()
}
