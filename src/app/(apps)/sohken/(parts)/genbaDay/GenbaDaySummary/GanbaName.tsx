'use client'
import {R_Stack} from '@cm/components/styles/common-components/common-components'

import {T_LINK} from '@components/styles/common-components/links'

import {GenbaCl} from '@app/(apps)/sohken/class/GenbaCl'
import React from 'react'
import {useGenbaDetailModal} from '@app/(apps)/sohken/hooks/useGenbaDetailModal'
import {formatDate} from '@class/Days/date-utils/formatters'
import {HREF} from '@lib/methods/urls'
import useMyNavigation from '@hooks/globalHooks/useMyNavigation'

export default function GanbaName({GenbaDay, editable}) {
  const {query} = useMyNavigation()
  const allShift = GenbaDay.GenbaDayShift

  const {Genba} = GenbaDay
  const {floorThisPlay} = new GenbaCl(GenbaDay.Genba)
  const defaultStartTime =
    formatDate(GenbaDay.date, 'ddd') === '土' && Genba.defaultStartTime === '早出' ? '通常' : Genba.defaultStartTime

  const forceNormalCon1 = allShift.some(s => {
    return !s.from
  })

  const forceNormal = forceNormalCon1
  const {setGMF_OPEN} = useGenbaDetailModal()

  const LinkComponent = editable
    ? T_LINK
    : ({children}) => (
        <div className={`onHover t-link`} {...{onClick: () => setGMF_OPEN({Genba})}}>
          {children}
        </div>
      )

  return (
    <div>
      <R_Stack className={`items-start gap-x-2 gap-y-0 leading-6 md:flex-row `}>
        <span>
          {!forceNormal ? (
            <>---</>
          ) : (
            <span className={' font-bold ' + (defaultStartTime === '通常' ? 'text-blue-600' : ' text-pink-600')}>
              {defaultStartTime}
              {/* {displayNormal ? '通常' : defaultStartTime} */}
            </span>
          )}
        </span>
        <span>{Genba?.PrefCity?.city}</span>

        <LinkComponent {...{href: HREF(`/sohken/genba/${Genba.id}`, {from: formatDate(GenbaDay.date)}, query)}}>
          <span>{Genba.name}</span>
          <span>{`(${floorThisPlay})`}</span>
        </LinkComponent>
        <small>{Genba.construction}</small>
      </R_Stack>
    </div>
  )
}
