import {Cell} from '@app/(apps)/aquapot/(pages)/sale/list/ListCC'
import {Days} from '@class/Days/Days'
import {getMidnight, toUtc} from '@class/Days/date-utils/calculations'
import {formatDate} from '@class/Days/date-utils/formatters'

import {sql} from '@class/SqlBuilder/SqlBuilder'
import {useRawSql} from '@class/SqlBuilder/useRawSql'
import {FitMargin, Padding} from '@components/styles/common-components/common-components'
import {CsvTable} from '@components/styles/common-components/CsvTable/CsvTable'
import Redirector from '@components/utils/Redirector'
import {dateSwitcherTemplate} from '@lib/methods/redirect-method'
import React from 'react'

import {R_Stack} from '@components/styles/common-components/common-components'

import Filter from '@app/(apps)/aquapot/(pages)/sale/list/Filter'
import {NumHandler} from '@class/NumHandler'

export default async function Page(props) {
  const query = await props.searchParams
  const MONTH = Days.month.getMonthDatum(getMidnight())
  const {redirectPath, whereQuery} = await dateSwitcherTemplate({
    query,
    defaultWhere: {
      from: MONTH.firstDayOfMonth,
      to: MONTH.lastDayOfMonth,
    },
  })
  if (redirectPath) return <Redirector {...{redirectPath}} />

  let where = `sr.id IS NOT NULL`
  if (Object.keys(query).length > 0) {
    query.from ? (where += ` AND sr."date" >= '${toUtc(query.from).toISOString()}'`) : ``
    query.to ? (where += ` AND sr."date" <= '${toUtc(query.to).toISOString()}'`) : ``
    query.paymentMethod ? (where += ` AND sc."paymentMethod" = '${query.paymentMethod}'`) : ``
    const textContainKeys = [`customerNumber`, `companyName`, `jobTitle`, `name`]

    if (query.subsc === `定期契約`) {
      where += sql` AND (sr."aqCustomerSubscriptionId" IS NOT NULL )`
    } else if (query.subsc === `通常`) {
      where += sql` AND (sr."aqCustomerSubscriptionId" IS NULL )`
    } else if (query.subsc === `BASEインポート`) {
      where += sql` AND (sr."remarks" like '%BASE売上%' )`
    }

    textContainKeys.forEach(key => {
      if (query[key]) {
        where += sql` AND c."${key}" LIKE '%${query[key]}%'`
      }
    })

    if (query.AqSupportGroupMaster) {
      where += sql` AND (
      ("csgmt"."from" <= sr."date" AND "csgmt"."to" >= sr."date" AND "sgm"."id" = '${query.AqSupportGroupMaster}')
      OR
      ("csgmt"."from" <= sr."date" AND "csgmt"."to" IS NULL AND "sgm"."id" = '${query.AqSupportGroupMaster}')
    )`
    }
  }

  const sqlString = sql`
SELECT
"sc"."id" AS "sale_cart_id",
"sc"."createdAt" AS "createdAt",
"sc"."date" AS "date",
"c"."name" AS "name",
"c"."jobTitle" AS "jobTitle",
"c"."companyName" AS "companyName",
"U"."name" AS "userName",
"p"."productCode" AS "productCode",
"p"."name" AS "productName",
"po"."name" AS "priceOption_Name",
"po"."price" AS "priceOption_Price",
"sr"."id" AS "sale_record_id",
"sr"."quantity" AS "quantity",
"sr"."price" AS "price",
"sr"."taxRate" AS "taxRate",
"sr"."taxedPrice" AS "taxedPrice",
"sr"."remarks" AS "remarks",
"sr"."subscriptionYearMonth" AS "subscriptionYearMonth",
"sc"."paymentMethod" AS "paymentMethod",
"c"."id" AS "aqCustomerId",
  CASE
    WHEN "csgmt"."from" <= "sr"."date" AND "csgmt"."to" >= "sr"."date" THEN "sgm"."name"
    WHEN "csgmt"."from" <= "sr"."date" AND "csgmt"."to" IS NULL THEN "sgm"."name"
    ELSE NULL
  END AS "supportingGroup"
FROM
  "AqSaleCart" "sc"
LEFT  JOIN
  "AqSaleRecord" "sr" ON "sc"."id" = "sr"."aqSaleCartId"
LEFT JOIN
  "AqProduct" "p" ON "sr"."aqProductId" = "p"."id"
LEFT JOIN
  "AqCustomer" "c" ON "sr"."aqCustomerId" = "c"."id"
LEFT JOIN
  "AqCustomerSupportGroupMidTable" "csgmt" ON "c"."id" = "csgmt"."aqCustomerId"
LEFT JOIN
  "AqSupportGroupMaster" "sgm" ON "csgmt"."aqSupportGroupMasterId" = "sgm"."id"
LEFT JOIN "User" "U" ON "sc"."userId" = "U"."id"
LEFT JOIN "AqPriceOption" "po" ON "sr"."aqPriceOptionId" = "po"."id"
WHERE  1=1
    --AND  "paymentMethod"='BASE'
    AND  ${where}
order by
  "sc"."date" desc,
  "sc"."id" desc
`

  type record = {
    date: Date
    name: string

    jobTitle: string
    companyName: string
    sale_cart_id: number
    sale_cart_date: string
    paymentMethod: string
    sale_record_id: number
    sale_record_date: string
    taxedPrice: number
    quantity: number
    price: number
    product_name: string
    productCode: string
    email: string
    supportingGroup: string
    remarks: string
    priceOption_Name: string
    priceOption_Price: number
    userName: string
    productName: string
    taxRate: number

    aqCustomerId: number
  }

  const records: record[] = (await useRawSql({sql: sqlString})).rows

  const cachTotal = records.filter(rec => rec.paymentMethod === `現金`).reduce((acc, rec) => acc + rec.taxedPrice, 0)

  let nextColor = 'bg-gray-100'
  const TABLE = CsvTable({
    csvOutput: {fileTitle: `売上リスト`},

    records: records.map((rec, i) => {
      const prev = records[i - 1]
      const isDifferentCartId = rec.sale_cart_id !== prev?.sale_cart_id

      if (isDifferentCartId) {
        nextColor = nextColor === `bg-blue-100` ? `bg-gray-100 border-y-[2px] border-y-black ` : `bg-blue-100`
      }
      const rowColor = nextColor

      return {
        className: rowColor,
        csvTableRow: [
          {cellValue: i + 1, label: `#`},
          {cellValue: formatDate(rec.date, `YYYY/MM/DD(ddd)`), label: `購入日`},
          {
            cellValue: [rec.companyName, rec.jobTitle, rec.name].filter(Boolean).join(` / `),
            label: [`会社名`, `役職`, `顧客名`].filter(Boolean).join(` / `),
          },
          // {cellValue: rec.userName},
          // {cellValue: rec.companyName},
          // {cellValue: rec.jobTitle},
          // {cellValue: rec.userName},
          {cellValue: rec.productName, label: `商品名`},
          {
            cellValue: [
              //
              rec.priceOption_Name,
              rec.priceOption_Price && `(${NumHandler.toPrice(rec.priceOption_Price)}円)`,
            ]
              .filter(Boolean)
              .join(``),
            label: `価格オプション`,
          },
          {cellValue: rec.quantity, label: `数量`},
          {cellValue: rec.price, label: `価格`},
          {cellValue: rec.taxRate, label: `消費税率`},
          {cellValue: rec.taxedPrice, label: `税込価格`},
          {cellValue: rec.paymentMethod, label: `支払方法`},
          {cellValue: rec.remarks, label: `但し書き`},

          {
            cellValue: <Cell {...{rec}} />,
            cellValueRaw: '',
            label: `その他`,
          },
        ].map(d => ({...d, style: {fontSize: 12, maxWidth: 280}})),
      }
    }),
  })

  return (
    <Padding>
      <FitMargin>
        <div className={`!sticky  z-10`}>
          <Filter />
        </div>

        <R_Stack className={` justify-between`}>
          {TABLE.Downloader()}
          <R_Stack>
            <R_Stack>
              <span>合計件数: </span>
              <strong>{records.length}</strong>
            </R_Stack>
            <R_Stack>
              <span>現金合計: </span>
              <strong>{cachTotal}</strong>
              <span>円</span>
            </R_Stack>
          </R_Stack>
        </R_Stack>
        {/* < {...{className: `rounded-lg p-0`}}>{TABLE.WithWrapper({size: `lg`, className: ' t-paper '})}</
        div> */}
        <div>
          {TABLE.WithWrapper({
            size: `lg`,
            className: '  !shadow rounded-lg !p-0 [&_td]:!px-1  max-h-full max-w-full ',
          })}
        </div>
      </FitMargin>
    </Padding>
  )
}
