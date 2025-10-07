'use client'
import {Kaizen, KM} from '@app/(apps)/KM/class/Kaizen'
import {PartnerBasicInfo} from '@app/(apps)/KM/components/Partner'
import SlateEditor from '@cm/components/SlateEditor/SlateEditor'

import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'

import TextAccordion from '@cm/components/utils/Accordions/TextAccordiong./TextAccordion'
import BasicCarousel from '@cm/components/utils/Carousel/BasicCarousel'
import ContentPlayer from '@cm/components/utils/ContentPlayer'
import PlaceHolder from '@cm/components/utils/loader/PlaceHolder'
import {MessageCircleIcon, MonitorIcon, ThumbsUpIcon, StarIcon, BuildingIcon} from 'lucide-react'

import useWindowSize from '@cm/hooks/useWindowSize'
import {cl} from '@cm/lib/methods/common'

import {useEffect, useState} from 'react'
import {Paper} from '@cm/components/styles/common-components/paper'
import {twMerge} from 'tailwind-merge'
import {motion} from 'framer-motion'
import {useInView} from 'react-intersection-observer'

export const WorkCard = ({work}) => {
  const {device, width, height} = useWindowSize()
  const {ref, inView} = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const {
    date = new Date(),
    title,
    KaizenClient,
    subtitle,
    allowShowClient,
    description,
    points,
    impression,
    reply,
    KaizenWorkImage,
    dealPoint,
    toolPoint,
  } = work

  const [ready, setready] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      setready(true)
    }, 300)
  }, [])
  if (!ready) return <PlaceHolder></PlaceHolder>

  const isMobile = width < 640

  return (
    <motion.div
      ref={ref}
      initial={{opacity: 0, y: 30}}
      animate={inView ? {opacity: 1, y: 0} : {}}
      transition={{duration: 0.5}}
      className="w-full"
    >
      <div className="group overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-lg transition-all duration-300 hover:border-blue-300 hover:shadow-xl">
        {/* ヘッダー */}
        <div className="relative bg-gradient-to-r from-blue-800 via-blue-900 to-blue-950 p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <h2 className="mb-1 text-xl font-bold leading-tight text-white sm:text-2xl lg:text-3xl">{title}</h2>
              {subtitle && <p className="text-sm text-blue-100 sm:text-base">{subtitle}</p>}
            </div>

            {allowShowClient && KaizenClient?.iconUrl && (
              <div className="flex-shrink-0">
                <div className="overflow-hidden rounded-lg bg-white p-1 shadow-md">
                  <ContentPlayer
                    {...{
                      styles: {thumbnail: {width: isMobile ? 50 : 70, height: isMobile ? 50 : 70}},
                      src: KaizenClient?.iconUrl,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* クライアント情報（モバイル用） */}
          {isMobile && allowShowClient && KaizenClient && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 backdrop-blur-sm">
              <BuildingIcon className="h-4 w-4 text-blue-200" />
              <div className="flex-1 text-xs text-white">
                <PartnerBasicInfo {...{KaizenClient, showWebsite: false}} />
              </div>
            </div>
          )}
        </div>

        {/* メインコンテンツ */}
        <div className="animate-fade-in">
          {/* デスクトップ用クライアント情報 */}
          {!isMobile && <BasicInfo {...{work}} />}

          {/* 画像カルーセル */}
          {KaizenWorkImage.length > 0 && (
            <div className="border-b border-gray-100 bg-gray-50 p-2 sm:p-3">
              <BasicCarousel
                {...{
                  imgStyle: {},
                  Images: KaizenWorkImage?.map(obj => ({imageUrl: obj.url})),
                }}
              />
            </div>
          )}

          {/* 説明セクション */}
          <div className="p-3 sm:p-4">
            <Description
              {...{
                description,
                points,
                impression,
                reply,
              }}
            />
          </div>
        </div>

        {/* フッター：タグとレビュー */}
        <div className="border-t border-gray-100 bg-gradient-to-r from-blue-50 to-blue-100/50 p-3 sm:p-4">
          <C_Stack className={` items-center`}>
            <Tags {...{work}} />
            <ReviewScore {...{dealPoint, toolPoint}} />
          </C_Stack>
        </div>
      </div>
    </motion.div>
  )
}

const Tags = ({work}) => {
  const jobTags = Kaizen.KaizenWork.parseTags(work.jobCategory).flat()
  const systemTags = Kaizen.KaizenWork.parseTags(work.systemCategory).flat()
  const toolTags = Kaizen.KaizenWork.parseTags(work.collaborationTool).flat()

  return (
    <div className="flex flex-wrap gap-1.5 sm:gap-2">
      {jobTags.map((tag, idx) => (
        <span
          key={`job-${idx}`}
          className="inline-flex items-center rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 shadow-sm transition-all hover:scale-105 hover:shadow-md sm:text-sm"
        >
          @{tag}
        </span>
      ))}
      {systemTags.map((tag, idx) => (
        <span
          key={`sys-${idx}`}
          className="inline-flex items-center rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700 shadow-sm transition-all hover:scale-105 hover:shadow-md sm:text-sm"
        >
          {tag}
        </span>
      ))}
      {toolTags.map((tag, idx) => (
        <span
          key={`tool-${idx}`}
          className="inline-flex items-center rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 shadow-sm transition-all hover:scale-105 hover:shadow-md sm:text-sm"
        >
          {tag}
        </span>
      ))}
    </div>
  )
}

const ReviewScore = ({dealPoint, toolPoint}) => {
  if (!dealPoint && !toolPoint) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-xs text-gray-600 sm:text-sm">
        <StarIcon className="h-4 w-4 text-gray-400" />
        <span>レビュー投稿待ち</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
      {dealPoint && (
        <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 px-3 py-2 shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-gray-600 sm:text-xs">取引評価</span>
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold text-amber-600 sm:text-xl">{dealPoint}</span>
              <div className="flex">
                {Array.from({length: 5}, (_, i) => (
                  <StarIcon
                    key={i}
                    className={cl(
                      'h-3 w-3 sm:h-4 sm:w-4',
                      i < Math.ceil(dealPoint) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {toolPoint && (
        <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 px-3 py-2 shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-gray-600 sm:text-xs">成果物評価</span>
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold text-amber-600 sm:text-xl">{toolPoint}</span>
              <div className="flex">
                {Array.from({length: 5}, (_, i) => (
                  <StarIcon
                    key={i}
                    className={cl(
                      'h-3 w-3 sm:h-4 sm:w-4',
                      i < Math.ceil(toolPoint) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const BasicInfo = ({work}) => {
  const {title, subtitle, date, KaizenClient, dealPoint, toolPoint} = work

  return (
    <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
      <div className="flex items-center justify-end">
        {work.allowShowClient && KaizenClient ? (
          <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm">
            <BuildingIcon className="h-4 w-4 text-blue-600" />
            <div className="text-sm">
              <PartnerBasicInfo {...{KaizenClient, showWebsite: false}} />
            </div>
          </div>
        ) : (
          <div className="rounded-lg bg-white px-3 py-2 text-sm text-gray-500 shadow-sm">
            <span>匿名クライアント様</span>
          </div>
        )}
      </div>
    </div>
  )
}

const Description = ({description, points, impression, reply}) => {
  return (
    <C_Stack className="gap-3 sm:gap-4">
      {description && (
        <section>
          <div className="overflow-hidden rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50/50 via-white to-blue-50/30 shadow-sm">
            <div className="border-b border-blue-200 bg-gradient-to-r from-blue-100 to-blue-50 px-3 py-2 sm:px-4 sm:py-3">
              <h3 className="flex items-center gap-2 text-sm font-bold text-blue-800 sm:text-base">
                <MonitorIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                こんなツール
              </h3>
            </div>
            <div className="p-3 sm:p-4">
              <div className="text-sm leading-relaxed text-gray-700 sm:text-base">
                <SlateEditor {...{readOnly: true}}>{description}</SlateEditor>
              </div>

              {points && (
                <div className="mt-3 rounded-lg border-2 border-blue-300 bg-white p-3 shadow-sm sm:mt-4">
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-blue-700 sm:text-base">
                    <ThumbsUpIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    ポイント
                  </h4>
                  <div className="text-sm leading-relaxed text-gray-700 sm:text-base">
                    <SlateEditor {...{readOnly: true}}>{points}</SlateEditor>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {impression && (
        <section>
          <div className="overflow-hidden rounded-xl border-2 border-orange-200 bg-gradient-to-br from-orange-50/50 via-white to-orange-50/30 shadow-sm">
            <div className="border-b border-orange-200 bg-gradient-to-r from-orange-100 to-orange-50 px-3 py-2 sm:px-4 sm:py-3">
              <h3 className="flex items-center gap-2 text-sm font-bold text-orange-800 sm:text-base">
                <MessageCircleIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                ご依頼者様のコメント
              </h3>
            </div>
            <div className="p-3 sm:p-4">
              <div className="text-sm leading-relaxed text-gray-700 sm:text-base">
                <SlateEditor {...{readOnly: true}}>{impression}</SlateEditor>
              </div>

              {reply && (
                <div className="ml-auto mt-3 w-full rounded-lg border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-white p-3 shadow-md sm:mt-4 sm:w-11/12 sm:p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-bold text-orange-700 sm:text-base">
                    <MessageCircleIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    ひとこと解説
                  </div>

                  <div className="text-sm leading-relaxed text-gray-700 sm:text-base">
                    <SlateEditor {...{readOnly: true}}>{reply}</SlateEditor>
                  </div>

                  <div className="mt-2 text-right text-xs font-semibold text-orange-600 sm:text-sm">改善マニア</div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </C_Stack>
  )
}
