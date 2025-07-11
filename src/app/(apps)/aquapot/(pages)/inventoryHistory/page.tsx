import {Days} from '@class/Days/Days'

import {FitMargin, Padding} from '@components/styles/common-components/common-components'
import {CsvTable} from '@components/styles/common-components/CsvTable/CsvTable'
import NewDateSwitcher from '@components/utils/dates/DateSwitcher/NewDateSwitcher'
import Redirector from '@components/utils/Redirector'
import {dateSwitcherTemplate} from '@lib/methods/redirect-method'

import {initServerComopnent} from 'src/non-common/serverSideFunction'
import {getMidnight, toUtc} from '@class/Days/date-utils/calculations'
import {formatDate} from '@class/Days/date-utils/formatters'
import prisma from 'src/lib/prisma'

export default async function Page(props) {
  const query = await props.searchParams
  const params = await props.params
  const {session, scopes} = await initServerComopnent({query})
  const {whereQuery, redirectPath} = await dateSwitcherTemplate({query})
  if (redirectPath) {
    return <Redirector {...{redirectPath}} />
  }

  const theYear = query.from ? toUtc(query.from) : getMidnight()

  const {firstDateOfYear, lastDateOfYear, getSpecifiedMonthOnThisYear} = Days.year.getYearDatum(theYear.getFullYear())

  const months = Days.month.getMonthsBetweenDates(firstDateOfYear, lastDateOfYear)

  const productList = await prisma.aqProduct.findMany({
    where: {inInventoryManagement: true},
    include: {
      AqInventoryByMonth: {
        where: {yearMonth: {gte: firstDateOfYear, lte: lastDateOfYear}},
      },
    },
    orderBy: [{productCode: `asc`}],
  })

  return (
    <Padding>
      <FitMargin>
        <NewDateSwitcher {...{yearOnly: true}} />
        <div>
          {CsvTable({
            records: [
              ...productList.map(product => {
                return {
                  csvTableRow: [
                    {label: `コード`, cellValue: product.productCode},
                    {label: `商品名`, cellValue: product.name},
                    ...months.map(months => {
                      const monthStr = formatDate(months, 'YY-MM')
                      return {
                        label: monthStr,
                        cellValue:
                          product.AqInventoryByMonth.find(d => Days.validate.isSameMonth(d.yearMonth, months))?.count ?? 0,
                        style: {minWidth: 70},
                      }
                    }),
                  ],
                }
              }),
            ],
          }).WithWrapper({className: `max-w-[90vw]  max-h-[85vh] t-paper`})}
        </div>
      </FitMargin>
    </Padding>
  )
}
