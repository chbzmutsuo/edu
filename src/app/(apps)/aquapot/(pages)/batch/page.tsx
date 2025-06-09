'use client'
import {Absolute} from '@components/styles/common-components/common-components'
import {MarkDownDisplay} from '@components/utils/texts/MarkdownDisplay'
import useGlobal from '@hooks/globalHooks/useGlobal'
import {fetchAlt} from '@lib/http/fetch-client'

import {basePath, cl} from '@lib/methods/common'
import React from 'react'
import {twMerge} from 'tailwind-merge'

export default function Page() {
  const {toggleLoad, query, addQuery} = useGlobal()

  const btnClass = cl(`  font-bold`)

  const actions = [
    {
      label: `棚卸しバッチ`,
      description: ``,
      purpose: ``,
      onClick: async () => {
        const res = await fetchAlt(`${basePath}/aquapot/api/cron/createInventoryByMonth`, {}, {method: `GET`})

        console.debug(res)
      },
    },
    {
      label: `定期契約バッチ`,
      description: ``,
      purpose: ``,
      onClick: async () => {
        const res = await fetchAlt(`${basePath}/aquapot/api/cron/createAqCustomerSubscriptionSaleRecord`, {}, {method: `GET`})

        console.debug(res)
      },
    },
  ]

  return (
    <Absolute>
      <div className={`t-paper `}>
        <table className={twMerge(`[&_td]:p-1! `, `[&_th]:p-1! `, `w-[1000px]`)}>
          <thead>
            <tr>
              <th>バッチ処理</th>
              <th>詳細</th>
              <th>用途</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {actions.map((action, idx) => {
              return (
                <tr key={idx} className={`  `}>
                  <td className={btnClass}>{action.label}</td>
                  <td className={``}>
                    <MarkDownDisplay>{action.description}</MarkDownDisplay>
                  </td>
                  <td className={``}>
                    <MarkDownDisplay>{action.purpose}</MarkDownDisplay>
                  </td>
                  <td>
                    <button
                      className={`t-link w-[100px] text-2xl`}
                      onClick={async () => {
                        toggleLoad(async () => await action?.onClick?.())
                      }}
                    >
                      実行
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Absolute>
  )
}
