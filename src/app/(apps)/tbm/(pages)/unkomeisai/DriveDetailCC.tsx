'use client'

import {MonthlyTbmDriveData} from '@app/(apps)/tbm/(server-actions)/getMonthlyTbmDriveData'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {CsvTable} from '@cm/components/styles/common-components/CsvTable/CsvTable'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

export default function DriveDetailCC({monthlyTbmDriveList}: {monthlyTbmDriveList: MonthlyTbmDriveData[]}) {
  const minWidth = 80
  const {toastIfFailed} = useGlobal()
  return (
    <div className={` relative`}>
      {monthlyTbmDriveList.length > 0 ? (
        CsvTable({
          records: monthlyTbmDriveList.map((row, rowIdx) => {
            const {keyValue, schedule} = row

            const cols = Object.entries(keyValue).filter(([dataKey, item]) => !item.label.includes(`CD`))

            return {
              csvTableRow: cols.map((props: any, colIdx) => {
                const [dataKey, item] = props

                let value
                if (item.type === `date`) {
                  value = formatDate(item.value, 'short')
                } else if ([`postalHighwayFee`, `generalHighwayFee`].includes(dataKey)) {
                  value = (
                    <input
                      {...{
                        defaultValue: schedule[dataKey],
                        type: 'number',
                        className: `border-b bg-gray-100/70 w-[70px] px-1 text-xs`,
                        onChange: async (e: any) => {
                          const res = await doStandardPrisma('tbmDriveSchedule', 'update', {
                            where: {id: schedule.id ?? 0},
                            data: {
                              [dataKey]: Number(e.target.value),
                            },
                          })

                          toastIfFailed(res)
                        },
                      }}
                    />
                  )
                } else {
                  value = item.value
                }

                const baseWidth = 80
                const width = item?.style?.minWidth ?? baseWidth

                const style = {
                  fontSize: 13,
                  color: typeof value === 'number' && value < 0 ? 'red' : undefined,
                  ...item.style,
                  minWidth: width,
                }

                const sticky = colIdx <= 1
                const totalLeft = sticky
                  ? cols.reduce((acc, [key, item], idx) => {
                      if (idx < colIdx) {
                        return acc + (item.style?.width ?? baseWidth)
                      }
                      return acc
                    }, 0)
                  : null

                return {
                  label: <div className="text-xs">{item.label}</div>,
                  style: {
                    position: sticky ? 'sticky' : undefined,
                    background: sticky ? `white` : `white`,

                    left: totalLeft,
                    zIndex: 9999,
                    ...style,
                  },
                  cellValue: <div>{value}</div>,
                }
              }),
            }
          }),
        }).WithWrapper({className: `max-w-[calc(95vw-50px)] `})
      ) : (
        <>データがありません</>
      )}
    </div>
  )
}
