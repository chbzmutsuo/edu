'use client'
import {Days} from '@cm/class/Days/Days'
import {getMidnight} from '@cm/class/Days/date-utils/calculations'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
import {CsvTable} from '@cm/components/styles/common-components/CsvTable/CsvTable'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'

import React from 'react'
import {TextGray} from '@cm/components/styles/common-components/Alert'
import {showPdf} from '@app/(apps)/aquapot/(pages)/myPage/[id]/pdf/[month]/showPdf'
import {NumHandler} from '@cm/class/NumHandler'

export default function MyPageCC(props: {customer: any; salesByMonth: any}) {
  const {toggleLoad, router} = useGlobal()
  const {customer, salesByMonth} = props

  const {defaultPaymentMethod, furikomisakiCD} = customer ?? {}

  return (
    <C_Stack>
      <R_Stack className={` items-start`}>
        <div>{[customer?.companyName, customer?.name].filter(Boolean).join(` / `)} 様</div>
      </R_Stack>
      {/* <div>{customerData?.defaultPaymentMethod}</div> */}
      {!!Object.keys(salesByMonth).length &&
        CsvTable({
          records: Object.keys(salesByMonth)
            .sort((a, b) => {
              return a.localeCompare(b)
            })
            .map((monthStr, idx) => {
              const sales = salesByMonth[monthStr]
              const total = sales.reduce((acc, sale) => acc + (sale.taxedPrice ?? 0), 0)

              const show = true

              const monthData = Days.month.getMonthDatum(new Date(monthStr + `-01`))

              const data = sales
                .sort((a, b) => {
                  return -(a.date.getTime() - b.date.getTime())
                })
                .map(sale => {
                  const {price, taxedPrice, AqProduct, quantity, remarks, date} = sale

                  const unitPrice = price / quantity

                  const {name, taxRate} = AqProduct ?? {}
                  const data = {
                    date,
                    name,
                    quantity,
                    unitPrice,
                    ratio: taxRate,
                    totalPrice: taxedPrice,
                    remarks,
                  }

                  return data
                })

              const rechedEndOmMonth = getMidnight() > monthData.lastDayOfMonth

              return {
                csvTableRow: [
                  //
                  // {label: `請求先名`, cellValue: `請求先名`},
                  {label: `対象年月`, cellValue: formatDate(monthData.lastDayOfMonth, `.YY/MM`)},
                  {label: `発行日`, cellValue: formatDate(monthData.lastDayOfMonth, `short`)},
                  {label: `合計`, cellValue: rechedEndOmMonth ? NumHandler.toPrice(total) + '円' : <TextGray>月末発行</TextGray>},
                  {
                    label: `請求書`,
                    cellValue: rechedEndOmMonth ? (
                      <button
                        className={`t-link`}
                        onClick={async () => {
                          toggleLoad(async () => {
                            await showPdf({router, customer, monthStr, data, defaultPaymentMethod, furikomisakiCD})
                          })
                        }}
                      >
                        PDF
                      </button>
                    ) : (
                      <TextGray>月末発行</TextGray>
                    ),
                    // <Link href={`/aquapot/myPage/${params.id}/pdf/${monthStr}`}>
                    //   <R_Stack>
                    //     <Button>PDFダウンロード</Button>
                    //   </R_Stack>
                    // </Link>
                  },
                ],
              }
            }),
        }).WithWrapper({size: `lg`})}
    </C_Stack>
  )
}
