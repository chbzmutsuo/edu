'use client'

import React from 'react'

import {R_Stack} from 'src/cm/components/styles/common-components/common-components'

import {EasySearchObject} from '@class/builders/QueryBuilderVariables'

import MyPopover from '@components/utils/popover/MyPopover'
import {EsButton} from '@components/DataLogic/TFs/MyTable/components/EasySearcher/EsButton'
import {Paper} from '@components/styles/common-components/paper'
import {twMerge} from 'tailwind-merge'

export default function EsGroupClient(props: {
  groupNameAlign?: string
  EsGroupClientProp: EsGroupClientPropType
  createNextQuery
}) {
  const {createNextQuery, EsGroupClientProp, groupNameAlign} = props
  const {groupName, searchBtnDataSources} = EsGroupClientProp

  const {isRefreshTarget, isLastBtn} = EsGroupClientProp
  const stackClass = groupNameAlign === 'left' ? `row-stack gap-1` : `col-stack gap-0`

  return (
    <section className={`  relative    text-sm `}>
      <div className={` ${stackClass}   `}>
        <small className={`text-start leading-3`}>{groupName}</small>
        <R_Stack className={twMerge(`items-stretch gap-2   rounded-md    text-sm text-gray-700`, `p-0`, `sm:p-0.5 sm:px-1.5`)}>
          {searchBtnDataSources.map((d, j) => {
            const {count, isUrgend, isActive, dataSource, conditionMatched} = d

            const IsSingleItemGroup = searchBtnDataSources.length === 1

            return (
              <div key={j}>
                <MyPopover
                  positionFree
                  button={<EsButton {...{IsSingleItemGroup, createNextQuery, conditionMatched, isActive, dataSource, count}} />}
                >
                  {dataSource.description && <Paper className={`leading-7 max-w-[300px] `}>{dataSource.description}</Paper>}
                </MyPopover>
              </div>
            )
          })}
        </R_Stack>
      </div>
    </section>
  )
}

export type EsGroupClientPropType = {
  groupName: string
  searchBtnDataSources: searchBtnDataSourceType[]
  isRefreshTarget: boolean
  isLastBtn: boolean
}

export type searchBtnDataSourceType = {
  count: number
  isUrgend: boolean
  isActive: boolean
  conditionMatched: boolean
  dataSource: EasySearchObject
}
