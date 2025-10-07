'use client'

import {cl} from '@cm/lib/methods/common'
import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
import {ImageLabel} from '@cm/components/styles/common-components/ImageLabel'
import Link from 'next/link'
import {Fragment} from 'react'
import AutoGridContainer from '@cm/components/utils/AutoGridContainer'
import {motion} from 'framer-motion'
import {useInView} from 'react-intersection-observer'

export const Partners = ({kaizenClient}) => {
  const {ref, inView} = useInView({
    triggerOnce: true,
    threshold: 0.05,
  })

  return (
    <div ref={ref}>
      <C_Stack className="gap-3">
        {/* グリッドレイアウト */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {kaizenClient.map((p, index) => {
            return (
              <motion.div
                key={index}
                initial={{opacity: 0, y: 20}}
                animate={inView ? {opacity: 1, y: 0} : {}}
                transition={{duration: 0.4, delay: index * 0.05}}
              >
                <Partner {...{p, index}} />
              </motion.div>
            )
          })}
        </div>
      </C_Stack>
    </div>
  )
}

export const PartnerBasicInfo = (props: {KaizenClient: any; showWebsite?: boolean}) => {
  const {KaizenClient, showWebsite = true} = props
  const {name, organization, website} = KaizenClient ?? {}
  return (
    <C_Stack className="gap-0.5 leading-tight">
      {organization && <div className="truncate text-xs font-medium ">{organization}</div>}
      <div className="flex items-baseline gap-1">
        {name && <span className="truncate text-sm font-bold ">{name}</span>}
        <div className="flex-shrink-0 text-xs ">様</div>
      </div>
      {showWebsite && website && (
        <Link className="truncate text-xs text-blue-600 hover:underline" target="_blank" href={website}>
          {website}
        </Link>
      )}
    </C_Stack>
  )
}

export const Partner = ({p, index}) => {
  const hasIcon = p?.iconUrl && p?.iconUrl !== ''

  return (
    <div
      className={cl(
        'group relative h-full overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:border-blue-300 hover:shadow-md'
      )}
      key={index}
    >
      {/* 左側装飾 */}
      <div
        className={cl(
          'absolute left-0 top-0 h-full w-1',
          index % 3 === 0 ? 'bg-blue-600' : index % 3 === 1 ? 'bg-purple-600' : 'bg-emerald-600'
        )}
      ></div>

      <div className="flex items-center gap-3 pl-1">
        {/* アイコン */}
        {hasIcon ? (
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
            <ImageLabel
              {...{
                style: {width: 48, height: 48, objectFit: 'cover'},
                src: p?.iconUrl,
              }}
            />
          </div>
        ) : (
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-blue-200">
            <span className="text-lg font-bold text-blue-700">{p?.name?.substring(0, 1) || '?'}</span>
          </div>
        )}

        {/* 情報 */}
        <div className="flex-1 overflow-hidden">
          <PartnerBasicInfo {...{KaizenClient: p, showWebsite: false}} />
        </div>
      </div>

      {/* Webサイトリンク（ホバー時表示） */}
      {p?.website && (
        <div className="mt-2 opacity-0 transition-opacity group-hover:opacity-100">
          <Link
            className="block truncate text-xs text-blue-600 hover:text-blue-800 hover:underline"
            target="_blank"
            href={p.website}
          >
            {p.website}
          </Link>
        </div>
      )}
    </div>
  )
}
