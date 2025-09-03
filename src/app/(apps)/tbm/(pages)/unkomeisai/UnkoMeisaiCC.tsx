'use client'

import UnkomeisaiDetailModal from '@app/(apps)/tbm/(pages)/unkomeisai/[id]/UnkomeisaiDetailModal'
import {MonthlyTbmDriveData} from '@app/(apps)/tbm/(server-actions)/getMonthlyTbmDriveData'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {CsvTable} from '@cm/components/styles/common-components/CsvTable/CsvTable'
import PlaceHolder from '@cm/components/utils/loader/PlaceHolder'
import useModal from '@cm/components/utils/modal/useModal'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

export default function UnkoMeisaiCC({monthlyTbmDriveList}: {monthlyTbmDriveList: MonthlyTbmDriveData[]}) {
  const {toastIfFailed} = useGlobal()

  const UnkoMeisaiModalReturn = useModal<{id: number}>()

  return (
    <>
      <UnkoMeisaiModalReturn.Modal>
        <UnkomeisaiDetailModal {...{id: UnkoMeisaiModalReturn.open?.id}} />
      </UnkoMeisaiModalReturn.Modal>
      <div className={` relative`}>
        {monthlyTbmDriveList.length === 0 && <PlaceHolder>表示するデータがありません</PlaceHolder>}
        {CsvTable({
          records: monthlyTbmDriveList.map((row, rowIdx) => {
            const {keyValue, schedule} = row

            const cols = Object.entries(keyValue).filter(([dataKey, item]) => !String(item.label).includes(`CD`))

            return {
              csvTableRow: [
                {
                  //
                  label: 'ID',
                  cellValue: schedule.id,
                  className: 't-link cursor-pointer',
                  onClick: () => UnkoMeisaiModalReturn.handleOpen({id: schedule.id}),
                },
                ...cols.map((props: any, colIdx) => {
                  const [dataKey, item] = props

                  let value
                  if (item.type === `date`) {
                    value = formatDate(item.cellValue, 'short')
                  } else if ([`M_postalHighwayFee`, `O_generalHighwayFee`].includes(dataKey)) {
                    value = (
                      <input
                        {...{
                          defaultValue: schedule[dataKey],
                          type: 'number',
                          className: `border-b bg-gray-100/70 w-[70px] px-1 text-xs`,
                          onBlur: async (e: any) => {
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
                    value = item.cellValue
                  }

                  const baseWidth = 80
                  const width = item?.style?.minWidth ?? baseWidth

                  const style = {
                    fontSize: 13,
                    color: typeof value === 'number' && value < 0 ? 'red' : undefined,
                    ...item.style,
                    minWidth: width,
                  }

                  return {
                    label: <div className="text-xs">{item.label}</div>,
                    style,
                    cellValue: value,
                  }
                }),
              ],
            }
          }),
        }).WithWrapper({
          className: `w-[calc(95vw)] `,
        })}
      </div>
    </>
  )
}
