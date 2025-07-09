'use client'

import {doStandardPrisma} from '@lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {medicineSeeds} from '../seed/medicine'
import React from 'react'
import {T_LINK} from '@components/styles/common-components/links'
export default function Template({children}) {
  return (
    <div>
      {/* <Button onClick={seedMedicines}>SEED</Button> */}
      <div className={`pb-10 min-h-screen`}>{children}</div>
      <div className="sticky bottom-0 left-0 right-0 bg-gray-100 backdrop-blur-sm border-t border-gray-200 shadow-lg p-3 sm:p-4 ">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            <T_LINK
              simple
              href="/health/monthly"
              className="flex-1 min-w-[80px] sm:flex-none px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm sm:text-base font-medium rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-md hover:shadow-lg text-center"
            >
              月別画面
            </T_LINK>
            <T_LINK
              simple
              href="/health/daily"
              className="flex-1 min-w-[80px] sm:flex-none px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm sm:text-base font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg text-center"
            >
              日別画面
            </T_LINK>
            <T_LINK
              simple
              href="/health/journal"
              className="flex-1 min-w-[80px] sm:flex-none px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-orange-600 to-orange-700 text-white text-sm sm:text-base font-medium rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all duration-200 shadow-md hover:shadow-lg text-center"
            >
              日誌画面
            </T_LINK>
            <T_LINK
              simple
              href="/health/task"
              className="flex-1 min-w-[80px] sm:flex-none px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 text-white text-sm sm:text-base font-medium rounded-lg hover:from-rose-700 hover:to-rose-800 transition-all duration-200 shadow-md hover:shadow-lg text-center"
            >
              タスク画面
            </T_LINK>
          </div>
        </div>
      </div>
    </div>
  )
}

export async function seedMedicines() {
  try {
    // 新しいデータを挿入
    for (const medicine of medicineSeeds) {
      await doStandardPrisma('medicine', 'upsert', {
        where: {
          name: medicine?.name ?? '',
        },
        create: medicine,
        update: medicine,
      })
    }

    console.log('薬マスタのシードが完了しました')
  } catch (error) {
    console.error('薬マスタのシード中にエラーが発生しました:', error)
    throw error
  }
}
