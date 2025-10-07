'use client'
import {Kaizen, KM} from '@app/(apps)/KM/class/Kaizen'
import TextAccordion from '@cm/components/utils/Accordions/TextAccordiong./TextAccordion'
import Loader from '@cm/components/utils/loader/Loader'
import useDoStandardPrisma from '@cm/hooks/useDoStandardPrisma'
import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
export const Category = () => {
  const master = [
    {
      colId: 'jobCategory',
      title: '業界・職種を問わず',
    },
    {
      colId: 'systemCategory',
      title: 'スプレッドシート・WEBアプリなど、各種媒体に対応',
    },
    {
      colId: 'collaborationTool',
      title: '外部サービス・API連携も',
    },
  ]
  return (
    <>
      <C_Stack className={`gap-6 text-base `}>
        {master.map((m, i) => {
          return (
            <div key={i} className={`border-kaizen-cool-main rounded-lg border-2 p-2 shadow-sm `}>
              <KM.CoolStrong className={` text-lg`}>{m.title}</KM.CoolStrong>

              <div>
                <CategoryTags {...{categoryColName: m.colId}} />
              </div>
            </div>
          )
        })}
      </C_Stack>
    </>
  )
}

export const CategoryTags = props => {
  const {categoryColName = 'jobCategory'} = props

  const {data: categories} = useDoStandardPrisma('kaizenWork', 'findMany', {distinct: [categoryColName]}, {deps: []})

  if (!categories) {
    return <Loader />
  }
  const tags = categories
    .map(c => c?.[categoryColName])
    .filter(c => {
      return c
    })
    .map(c => Kaizen.KaizenWork.parseTags(c))
    .flat()

  return (
    <div>
      <div>
        <div className={`max-w-lg`}>
          <R_Stack className={`pb-2`}>
            {tags?.map((value, index) => {
              return <div key={index}>{<KM.tagBadge>{value}</KM.tagBadge>}</div>
            })}
          </R_Stack>
        </div>
      </div>
    </div>
  )
}
