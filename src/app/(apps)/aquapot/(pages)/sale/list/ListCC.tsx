'use client'
import useGlobalSaleEditor from '@app/(apps)/aquapot/(pages)/(template)/useGlobalSaleEditor'

import {R_Stack} from '@components/styles/common-components/common-components'

import {CircledIcon} from '@components/styles/common-components/IconBtn'

import {SquarePen, Trash2} from 'lucide-react'

import useGlobal from '@hooks/globalHooks/useGlobal'
import {doStandardPrisma} from '@lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import React from 'react'

export const Cell = ({rec}) => {
  const {toggleLoad, session} = useGlobal()
  const {HK_SaleEditor} = useGlobalSaleEditor()
  return (
    <R_Stack {...{className: `justify-around  min-w-[50px] gap-1`}}>
      <CircledIcon
        {...{
          onClick: () => HK_SaleEditor.setGMF_OPEN({saleRecordId: rec.sale_record_id}),
          icon: <SquarePen className={`onHover`} />,
        }}
      />
      <CircledIcon
        {...{
          onClick: async () => {
            if (confirm(`この購入を削除しますか？`)) {
              await toggleLoad(async () => {
                const saleCart = await doStandardPrisma(`aqSaleCart`, `delete`, {
                  where: {id: rec.sale_cart_id ?? 0},
                })

                // const saleRecord = await doStandardPrisma(`aqSaleRecord`, `delete`, {
                //   where: {id: rec.sale_record_id ?? 0},
                // })
              })
            }
          },
          icon: <Trash2 className={`onHover`} />,
        }}
      />
    </R_Stack>
  )
}
