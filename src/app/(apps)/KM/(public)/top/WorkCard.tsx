'use client'
import {Kaizen, KM} from '@app/(apps)/KM/class/Kaizen'
import {PartnerBasicInfo} from '@app/(apps)/KM/components/Partner'
import {formatDate} from '@class/Days/date-utils/formatters'
import SlateEditor from '@cm/components/SlateEditor/SlateEditor'

import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'

import TextAccordion from '@cm/components/utils/Accordions/TextAccordiong./TextAccordion'
import BasicCarousel from '@cm/components/utils/Carousel/BasicCarousel'
import ContentPlayer from '@cm/components/utils/ContentPlayer'
import PlaceHolder from '@cm/components/utils/loader/PlaceHolder'
import {
  ChatBubbleLeftEllipsisIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  ComputerDesktopIcon,
  HandThumbUpIcon,
} from '@heroicons/react/20/solid'
import useWindowSize from '@cm/hooks/useWindowSize'
import {cl} from '@cm/lib/methods/common'

import {useEffect, useState} from 'react'
import {Paper} from '@components/styles/common-components/paper'
import {twMerge} from 'tailwind-merge'

export const WorkCard = ({work}) => {
  const {device, width, height} = useWindowSize()

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

  const scalingClass = `  cursor-pointer    duration-500   `

  const sectionClassName = `p-1 rounded-md shadow-md` + scalingClass

  const cardWidth = Math.min(480, width * 0.95) - 10
  const imageWidth = Math.max(260, cardWidth - 200)
  const [ready, setready] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      setready(true)
    }, 500)
  }, [])
  if (!ready) return <PlaceHolder></PlaceHolder>

  const headerHeight = 70

  const titleClass = `w-[calc(100%-${headerHeight + 30}px)]  `

  return (
    <div style={{width: cardWidth}} className={`bg-white`}>
      <div
        className={twMerge(
          //
          `shadow-kaizen-cool-main ring-kaizen-cool-main  hover:bg-kaizen-cool-light/50
            hover:ring-2   `,
          `rounded-t-lg  rounded-b-lg shadow-lg `
        )}
      >
        <TextAccordion minHeight={480} maxHeight={550}>
          <div
            className={twMerge(
              ` bg-kaizen-cool-main  rounded-t-lg  p-2 `,
              'bg-gradient-to-r from-kaizen-cool-main to-kaizen-cool-main/50'
            )}
          >
            <C_Stack className={` items-center`}>
              <R_Stack className={`w-full justify-between`}>
                <div className={titleClass}>
                  <h2 className={` text-start text-[24px] font-bold text-white    `}>{title}</h2>
                  {subtitle && <small className={`text-sm text-gray-100`}>{subtitle}</small>}
                </div>

                {allowShowClient && KaizenClient?.iconUrl && (
                  <div>
                    <ContentPlayer
                      {...{
                        className: `shadow-md  rounded-md`,
                        styles: {thumbnail: {width: headerHeight, height: headerHeight}},
                        src: KaizenClient?.iconUrl,
                      }}
                    />
                  </div>
                )}
              </R_Stack>
            </C_Stack>
          </div>

          <div className={` animate-fade-in`} style={{width: cardWidth}}>
            <BasicInfo {...{work}} />

            <div className={``}>
              {KaizenWorkImage.length > 0 && (
                <Paper className={` `}>
                  <div>
                    <BasicCarousel
                      {...{
                        imgStyle: {
                          width: imageWidth,
                          height: imageWidth * 0.7,
                        },
                        Images: KaizenWorkImage?.map(obj => ({imageUrl: obj.url})),
                      }}
                    />
                  </div>
                </Paper>
              )}
            </div>
            <div className={` rounded-md  p-0 `}>
              <div className={`flex flex-col`}>
                <C_Stack className={`p-2`}>
                  <Description
                    {...{
                      sectionClassName,
                      description,
                      points,
                      impression,
                      reply,
                    }}
                  />
                </C_Stack>
              </div>
            </div>
          </div>
        </TextAccordion>
        <div className={twMerge(`p-2`, 'bg-gradient-to-r from-kaizen-cool-light to-kaizen-cool-light/50')}>
          <R_Stack>
            <Tags {...{work}} />
            <ReviewScore {...{dealPoint, toolPoint}} />
          </R_Stack>
        </div>
      </div>
    </div>
  )
}

const Tags = ({work}) => {
  return (
    <R_Stack className={` w-full justify-start`}>
      {Kaizen.KaizenWork.parseTags(work.jobCategory)
        .flat()
        .map((tag, idx) => {
          return (
            <KM.tagBadge {...{color: 'cool'}} key={idx}>
              @{tag}
            </KM.tagBadge>
          )
        })}
      {Kaizen.KaizenWork.parseTags(work.systemCategory)
        .flat()
        .map((tag, idx) => {
          return (
            <KM.tagBadge {...{color: ''}} key={idx}>
              {tag}
            </KM.tagBadge>
          )
        })}
      {Kaizen.KaizenWork.parseTags(work.collaborationTool)
        .flat()
        .map((tag, idx) => {
          return (
            <KM.tagBadge {...{color: 'green'}} key={idx}>
              {tag}
            </KM.tagBadge>
          )
        })}
    </R_Stack>
  )
}

const ReviewScore = ({dealPoint, toolPoint}) => {
  return (
    <div className={`text-sm`}>
      {dealPoint && toolPoint ? (
        <div>
          <R_Stack>
            <div className={` text-center leading-4`}>
              <div>
                取引評価:<strong className={` px-1 text-[20px]`}>{dealPoint}</strong>
              </div>
              <div>
                {Array.from({length: 5}, (_, i) => (
                  <span key={i} className={`text-[16px] text-yellow-400`}>
                    {i < Math.ceil(dealPoint) ? '★' : '☆'}
                  </span>
                ))}
              </div>
            </div>
            <div className={` text-center leading-4`}>
              <div>
                成果物評価: <strong className={` px-1 text-[20px]`}>{toolPoint}</strong>
              </div>
              <div>
                {Array.from({length: 5}, (_, i) => (
                  <span key={i} className={`text-[16px] text-yellow-400`}>
                    {i < Math.ceil(toolPoint) ? '★' : '☆'}
                  </span>
                ))}
              </div>
            </div>
          </R_Stack>
        </div>
      ) : (
        <>レビュー投稿待ち・・・</>
      )}
    </div>
  )
}

const BasicInfo = ({work}) => {
  const {title, subtitle, date, KaizenClient, dealPoint, toolPoint} = work

  return (
    <div className={`p-1`}>
      <section>
        <small className={`w-full   text-base`}>
          <R_Stack className={`  w-full items-start justify-end`}>
            {/* {date && <p>{formatDate(new Date(date), 'YYYY年MM月')}</p>} */}

            {work.allowShowClient && KaizenClient ? (
              <div className={`flex  justify-end  px-4 text-sm leading-5`}>
                <PartnerBasicInfo {...{KaizenClient, showWebsite: false}} />
              </div>
            ) : (
              <span>匿名</span>
            )}
          </R_Stack>
        </small>
        {/* <div>クライアント告知情報</div> */}
      </section>
    </div>
  )
}

const Description = ({sectionClassName, description, points, impression, reply}) => {
  return (
    <C_Stack className={`gap-4`}>
      {description && (
        <section className={`text-[15px] leading-5`}>
          <div
            // style={{background: Kaizen.const.gradient.coolLight}}

            className={cl(
              sectionClassName,
              `text-kaizen-cool-main bg-kaizen-cool-light`,
              'bg-gradient-to-r from-kaizen-cool-light to-kaizen-cool-light/50'
            )}
          >
            <C_Stack className={`gap-4`}>
              <div>
                <h3 className={`row-stack`}>
                  <ComputerDesktopIcon className={`w-5`} />
                  こんなツール
                </h3>
                <SlateEditor {...{readOnly: true}}>{description}</SlateEditor>
              </div>

              {points && (
                <div className={`border-kaizen-cool-main rounded-md border-2 p-1`}>
                  <h3 className={`row-stack text-kaizen-cool-main`}>
                    <HandThumbUpIcon className={` w-5`} />
                    ポイント
                  </h3>
                  <SlateEditor {...{readOnly: true}}>{points}</SlateEditor>
                </div>
              )}
            </C_Stack>
          </div>
        </section>
      )}

      {impression && (
        <section>
          <div
            className={cl(
              sectionClassName,
              `bg-kaizen-warm-light/50`,
              'bg-gradient-to-r from-kaizen-warm-light to-kaizen-warm-light/50'
            )}
          >
            <C_Stack>
              <h3 className={`row-stack text-kaizen-warm-main `}>
                <ChatBubbleOvalLeftEllipsisIcon className={`w-5`} />
                ご依頼者様のコメント
              </h3>

              <SlateEditor {...{readOnly: true}}>{impression}</SlateEditor>

              {reply && (
                <div
                  className={`
              border-kaizen-warm-main bg-kaizen-warm-light
               ml-auto w-11/12 rounded-md border-2 p-3 shadow-md`}
                >
                  <div className={` text-[15px]`}>
                    <div className={`row-stack text-start font-bold`}>
                      <ChatBubbleLeftEllipsisIcon className={`text-kaizen-warm-main w-5`} />
                      ひとこと解説
                    </div>

                    <SlateEditor {...{readOnly: true}}>{reply}</SlateEditor>

                    <div className={`text-right`}>改善マニア</div>
                  </div>
                </div>
              )}
            </C_Stack>
          </div>
        </section>
      )}
    </C_Stack>
  )
}
