'use client'
import React from 'react'

import {formatDate} from '@class/Days/date-utils/formatters'
import {NumHandler} from '@class/NumHandler'
import {R_Stack} from '@components/styles/common-components/common-components'
import {CsvTable} from '@components/styles/common-components/CsvTable/CsvTable'
import {KeyValue} from '@components/styles/common-components/ParameterCard'
import EmptyPlaceholder from '@components/utils/loader/EmptyPlaceHolder'

export default function NempiKanriCC({vehicleList, nenpiKanriDataListByCar, lastRefuelHistoryByCar}) {
  return (
    <R_Stack className={`w-full items-start gap-8`}>
      {vehicleList.map((vehicle, idx) => {
        const nenpiKanriData = nenpiKanriDataListByCar.find(data => data?.vehicle?.id === vehicle.id)

        const flexChild = `w-1/2 px-1`

        const prevRefuelHistory = [
          ...lastRefuelHistoryByCar
            .filter(v => v.id === vehicle.id)
            .map(v => v.TbmRefuelHistory)
            .flat(),
        ]
        prevRefuelHistory.sort((a, b) => {
          const sortByodometer = b.odometer - a.odometer
          const sortByDate = b.date.getTime() - a.date.getTime()
          if (sortByodometer === 0) {
            return sortByDate
          }
          return sortByodometer
        })

        return (
          <div key={idx} className={`t-paper w-[450px]  p-2`}>
            <div>
              <section>
                <R_Stack className={` text-lg font-bold`}>
                  <span>{vehicle?.vehicleNumber}</span>
                </R_Stack>
              </section>

              <section>
                <R_Stack className={`gap-0 text-lg`}>
                  <div className={flexChild}>
                    <KeyValue label="総走行距離">
                      <strong>{NumHandler.toPrice(nenpiKanriData?.totalSokoKyori)}</strong>
                    </KeyValue>
                  </div>
                  <div className={flexChild}>
                    <KeyValue label="総給油量">
                      <strong>{NumHandler.toPrice(nenpiKanriData?.totalKyuyu)}</strong>
                    </KeyValue>
                  </div>
                  <div className={flexChild}>
                    <KeyValue label="燃費">
                      <strong>{NumHandler.toPrice(nenpiKanriData?.avgNempi)}</strong>
                    </KeyValue>
                  </div>
                  <div className={flexChild}>
                    <KeyValue label="金額">
                      <strong>{NumHandler.toPrice(nenpiKanriData?.price)}</strong>
                    </KeyValue>
                  </div>
                </R_Stack>
              </section>

              <section>
                {vehicle.TbmRefuelHistory.length > 0 ? (
                  <>
                    {CsvTable({
                      records: (vehicle.TbmRefuelHistory ?? []).map((current, i) => {
                        const prev = vehicle.TbmRefuelHistory[i - 1] ?? prevRefuelHistory[0]

                        const kukanKyori = (current.odometer ?? 0) - (prev?.odometer ?? 0)

                        const kyuyuryo = current.amount
                        const nempi = kukanKyori / kyuyuryo

                        return {
                          csvTableRow: [
                            //
                            {label: '日付', cellValue: formatDate(current.date, 'short')},
                            {label: '給油時走行距離', cellValue: current.odometer},
                            {label: '区間距離', cellValue: kukanKyori},
                            {label: '給油量', cellValue: kyuyuryo},
                            {label: '燃費', cellValue: NumHandler.round(nempi, 1)},
                          ],
                        }
                      }),
                    }).WithWrapper({className: ''})}
                  </>
                ) : (
                  <EmptyPlaceholder>データがありません</EmptyPlaceholder>
                )}
              </section>
            </div>
          </div>
        )
      })}
    </R_Stack>
  )
}
