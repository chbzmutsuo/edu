'use client'

import {doStandardPrisma} from '@lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {medicineSeeds} from '../seed/medicine'
import React from 'react'
import {Button} from '@components/styles/common-components/Button'
export default function Template({children}) {
  return (
    <div>
      {/* <Button onClick={seedMedicines}>SEED</Button> */}
      {children}
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
