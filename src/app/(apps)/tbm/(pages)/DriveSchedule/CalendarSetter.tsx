'use client'
import {Days} from '@class/Days/Days'
import {formatDate} from '@class/Days/date-utils/formatters'
import {Button} from '@components/styles/common-components/Button'
import {C_Stack, Center, R_Stack} from '@components/styles/common-components/common-components'
import {CsvTable} from '@components/styles/common-components/CsvTable/CsvTable'
import {Head2} from '@components/styles/common-components/heading'
import useDoStandardPrisma from '@hooks/useDoStandardPrisma'
import React, {useState} from 'react'

export default function CalendarSetter({days, defaultSelectedDays, onConfirm, months}) {
  const weekDays = [`月`, `火`, `水`, `木`, `金`, `土`, `日`, `祝`]
  const [selectedDays, setselectedDays] = useState<Date[]>(defaultSelectedDays)
  const {data: holidays = []} = useDoStandardPrisma(`calendar`, `findMany`, {
    where: {holidayType: `祝日`},
  })
  const setSelectedDays = async (selectedWeekDay: string, mode: 'on' | 'off') => {
    const daysToSetDisabled: Date[] = []
    const daysToSetActive: Date[] = []

    days.filter(day => {
      const shukujitsu = holidays.some(h => Days.validate.isSameDate(h.date, day))
      const hit = selectedWeekDay === `祝` ? shukujitsu : formatDate(day, 'ddd') === selectedWeekDay
      formatDate(day, 'ddd') === selectedWeekDay

      if (hit) {
        if (mode === 'on') {
          daysToSetActive.push(day)
        } else {
          daysToSetDisabled.push(day)
        }
      }
    })
    setselectedDays(prev => {
      const next = [...prev]
      daysToSetActive.forEach(item => {
        if (!next.some(d => Days.validate.isSameDate(d, item))) {
          next.push(item)
        }
      })

      daysToSetDisabled.forEach(item => {
        if (next.some(d => Days.validate.isSameDate(d, item))) {
          next.splice(
            next.findIndex(d => Days.validate.isSameDate(d, item)),
            1
          )
        }
      })

      return next
    })
  }

  return (
    <>
      <C_Stack className={` relative   `}>
        {/* 曜日選択 */}

        <div className={` absolute right-0 top-0 text-center`}></div>

        <section>
          <R_Stack className={` items-stretch flex-nowrap gap-12`}>
            <C_Stack className={` `}>
              <Head2 className={` text-center`}>一括設定</Head2>
              {CsvTable({
                SP: true,
                records: [
                  {
                    csvTableRow: [
                      ...weekDays.map(wd => ({
                        label: (
                          <Center>
                            <strong className={` text-center  `}>{wd}</strong>
                          </Center>
                        ),
                        cellValue: (
                          <div key={wd}>
                            <C_Stack className={` items-center `}>
                              <Button
                                {...{
                                  color: 'blue',
                                  className: `w-[55px] `,
                                  onClick: () => setSelectedDays(wd, 'on'),
                                }}
                              >
                                ON
                              </Button>
                              <Button
                                {...{
                                  color: 'gray',
                                  className: `w-[55px] `,
                                  onClick: () => setSelectedDays(wd, 'off'),
                                }}
                              >
                                OFF
                              </Button>
                            </C_Stack>
                          </div>
                        ),
                      })),
                    ],
                  },
                ],
              }).WithWrapper({className: `min-w-[160px] `})}
            </C_Stack>

            <C_Stack className={``}>
              <Head2>カレンダー</Head2>
              <R_Stack className={` relative items-start   gap-10  flex-nowrap  max-w-[80vw] max-h-[650px] overflow-auto`}>
                {months.map((month, i) => {
                  const daysOnMonth = days.filter(d => {
                    return Days.validate.isSameMonth(d, month)
                  })

                  return (
                    <div key={i}>
                      <h2
                        style={{position: `sticky`, top: 0, background: `white`}}
                        className={`text-center text-[20px] font-bold [&_td]:!p-0.5`}
                      >
                        {formatDate(month, 'YYYY年M月')}
                      </h2>
                      {CsvTable({
                        records: [
                          ...daysOnMonth.map(day => {
                            const isHoliday = Days.day.isHoliday(day, holidays)

                            const bgStyle = isHoliday?.style

                            return {
                              csvTableRow: [
                                {
                                  style: {fontSize: 14, width: 14, ...bgStyle},
                                  cellValue: <Center>{formatDate(day, 'D(ddd)')}</Center>,
                                },
                                {
                                  style: {fontSize: 14, width: 14},
                                  cellValue: (
                                    <Center>
                                      <input
                                        {...{
                                          type: 'checkbox',
                                          className: `h-[18px] w-[18px] onHover`,
                                          checked: selectedDays.some(d => Days.validate.isSameDate(d, day)),
                                          onChange: e => {
                                            setselectedDays(prev => {
                                              const nextData = [...prev]
                                              if (nextData.some(d => Days.validate.isSameDate(d, day))) {
                                                nextData.splice(
                                                  nextData.findIndex(d => Days.validate.isSameDate(d, day)),
                                                  1
                                                )
                                              } else {
                                                nextData.push(day)
                                              }
                                              return nextData
                                            })
                                          },
                                        }}
                                      />
                                    </Center>
                                  ),
                                },
                                // {
                                //   style: {fontSize: 20},
                                //   cellValue: <textarea {...{className: `h-6 w-6  w-full`}} />,
                                // },
                              ],
                            }
                          }),
                        ],
                      }).WithWrapper({className: `  min-w-[180px]  `})}
                    </div>
                  )
                })}
              </R_Stack>
              <C_Stack className={` gap- items-center`}>
                <R_Stack className={` justify-between w-full p-2`}>
                  <C_Stack className={`gap-0.5`}>
                    <small>選択した曜日を一括で、ON / OFFできます。その場合、個別に設定した値も上書きされます。 </small>
                    <small>一括反映後、個別で修正を実施することも可能です。</small>
                  </C_Stack>

                  <Button
                    {...{
                      size: `lg`,
                      color: `red`,
                      onClick: async () => await onConfirm({selectedDays}),
                    }}
                  >
                    変更を反映
                  </Button>
                </R_Stack>
              </C_Stack>
              {/* 日付選択 */}
            </C_Stack>
          </R_Stack>
        </section>
      </C_Stack>
    </>
  )
}
