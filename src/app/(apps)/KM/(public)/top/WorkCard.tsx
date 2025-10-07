'use client'
import {Kaizen} from '@app/(apps)/KM/class/Kaizen'
import {PartnerBasicInfo} from '@app/(apps)/KM/components/Partner'
import SlateEditor from '@cm/components/SlateEditor/SlateEditor'

import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'

import BasicCarousel from '@cm/components/utils/Carousel/BasicCarousel'
import ContentPlayer from '@cm/components/utils/ContentPlayer'
import PlaceHolder from '@cm/components/utils/loader/PlaceHolder'
import {MessageCircleIcon, MonitorIcon, ThumbsUpIcon, StarIcon, BuildingIcon} from 'lucide-react'

import useWindowSize from '@cm/hooks/useWindowSize'
import {cl} from '@cm/lib/methods/common'

import {useEffect, useState} from 'react'
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
        <div className="relative bg-gradient-to-r from-blue-800 via-blue-900 to-blue-950 p-4 sm:p-6 h-28">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <R_Stack className={` flex-nowrap justify-between w-full`}>
              <div>
                <h2 className="mb-1 text-xl font-bold leading-tight text-white sm:text-lg">{title}</h2>
                {subtitle && <p className="text-sm text-blue-100 ">{subtitle}</p>}
              </div>
              {allowShowClient && KaizenClient?.iconUrl && (
                <div className="w-fit rounded-lg bg-white p-1 shadow-md">
                  <ContentPlayer
                    {...{
                      styles: {thumbnail: {width: isMobile ? 40 : 50, height: isMobile ? 40 : 50}},
                      src: KaizenClient?.iconUrl,
                    }}
                  />
                </div>
              )}
            </R_Stack>
          </div>

          {/* クライアント情報（モバイル用） */}
          {/* {allowShowClient && KaizenClient && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 backdrop-blur-sm">
              <BuildingIcon className="h-4 w-4 text-blue-200" />
              <div className="flex-1 text-xs text-white">
                <PartnerBasicInfo {...{KaizenClient, showWebsite: false}} />
              </div>
            </div>
          )} */}
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
            {/* <ShadModal Trigger={<Description {...{maxHeightClass: 'h-full', description, points, impression, reply}} />}> */}
            <Description {...{maxHeightClass: '', description, points, impression, reply}} />
            {/* </ShadModal> */}
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

const Description = ({description, points, impression, reply, maxHeightClass}) => {
  const [activeTab, setActiveTab] = useState('description')

  const tabs = [
    {
      id: 'description',
      label: '概要',
      icon: MonitorIcon,
      content: description,
      available: !!description,
      color: 'blue',
    },
    {
      id: 'points',
      label: 'ポイント',
      icon: ThumbsUpIcon,
      content: points,
      available: !!points,
      color: 'purple',
    },
    {
      id: 'impression',
      label: '評価',
      icon: MessageCircleIcon,
      content: impression,
      available: !!impression,
      color: 'orange',
    },
  ]

  const availableTabs = tabs.filter(tab => tab.available)

  // デフォルトで最初の利用可能なタブを選択
  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.find(tab => tab.id === activeTab)) {
      setActiveTab(availableTabs[0].id)
    }
  }, [availableTabs, activeTab])

  if (availableTabs.length === 0) return null

  const activeTabData = availableTabs.find(tab => tab.id === activeTab)

  return (
    <div className="overflow-hidden rounded-xl border-2 border-gray-200 bg-white shadow-sm">
      {/* タブヘッダー */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="flex">
          {availableTabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            const colorClasses = {
              blue: isActive
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-transparent text-gray-600 hover:text-blue-600',
              purple: isActive
                ? 'border-purple-500 bg-purple-50 text-purple-700'
                : 'border-transparent text-gray-600 hover:text-purple-600',
              orange: isActive
                ? 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-transparent text-gray-600 hover:text-orange-600',
            }

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cl(
                  'flex flex-1 items-center justify-center gap-1.5 border-b-2 px-2 py-2.5 text-xs font-medium transition-all duration-200 sm:gap-2 sm:px-3 sm:text-sm',
                  colorClasses[tab.color]
                )}
              >
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split('')[0]}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* タブコンテンツ */}
      <div className={` overflow-y-auto p-3 ${maxHeightClass}  sm:p-4`}>
        {activeTabData && (
          <motion.div
            key={activeTab}
            initial={{opacity: 0, y: 10}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.2}}
            className="h-full"
          >
            <div className="text-sm leading-relaxed text-gray-700 sm:text-base">
              <SlateEditor {...{readOnly: true}}>{activeTabData.content}</SlateEditor>
            </div>

            {/* 改善マニアの返信（impressionタブの場合のみ） */}
            {activeTab === 'impression' && reply && (
              <div className="mt-3 rounded-lg border-l-4 border-orange-400 bg-orange-50 p-2 sm:p-3">
                <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-orange-700 sm:text-sm">
                  <MessageCircleIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  改善マニアより
                </div>
                <div className="text-xs leading-relaxed text-gray-700 sm:text-sm">
                  <SlateEditor {...{readOnly: true}}>{reply}</SlateEditor>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* タブインジケーター（モバイル用） */}
      <div className="flex justify-center border-t border-gray-100 bg-gray-50 py-1 sm:hidden">
        {availableTabs.map((tab, index) => (
          <div
            key={tab.id}
            className={cl(
              'mx-0.5 h-1.5 w-6 rounded-full transition-all duration-200',
              activeTab === tab.id ? 'bg-blue-500' : 'bg-gray-300'
            )}
          />
        ))}
      </div>
    </div>
  )
}
