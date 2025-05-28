'use client'

import {Category} from '@app/(apps)/KM/components/Category'
import {Contact} from '@app/(apps)/KM/components/Contact'

import {Developer} from '@app/(apps)/KM/components/Developer'
import {Partners} from '@app/(apps)/KM/components/Partner'
import {Services} from '@app/(apps)/KM/components/Services'
import {Works} from '@app/(apps)/KM/components/Works'

import ContentPlayer from '@cm/components/utils/ContentPlayer'

import useWindowSize from '@cm/hooks/useWindowSize'
import {cl} from '@cm/lib/methods/common'
import {Button} from '@components/styles/common-components/Button'
import {C_Stack, R_Stack} from '@components/styles/common-components/common-components'
import {useCallback, useState} from 'react'

export const EasyProfile = ({kaizenClient, works}) => {
  return (
    <C_Stack id="EasyProfile" className={`mx-auto  items-center gap-[80px] `}>
      <div className={`w-full`}>
        {getFirstLayerMenus({
          kaizenClient,
          works,
        }).map((fMenu, i) => {
          return (
            <div id={fMenu.id} key={i} className={`  relative pb-[240px] shadow-md `}>
              <h2 className={`bg-primary-main sticky top-0 z-20 m-0 p-2 text-2xl text-white`}>{fMenu.label}</h2>
              <div className={``}> {fMenu.component}</div>
            </div>
          )
        })}
      </div>

      <TableOfContents
        {...{
          firstLayerMenus: getFirstLayerMenus({
            kaizenClient,
            works,
          }),
        }}
      />
    </C_Stack>
  )
}

export const getFirstLayerMenus = ({kaizenClient, works}) => {
  return [
    {
      id: 'mainActivity',
      label: 'お仕事',
      component: <Services {...{kaizenClient}} />,
      kaizenClient,
      works,
      secondLayerMenus: getSecondLayerMenus({kaizenClient}),
    },
    {id: 'works', label: '実績・制作物', component: <Works works={works} />},
    {id: 'works', label: 'お問い合わせ', component: <Contact />},
  ]
}

export const getSecondLayerMenus = ({kaizenClient}) => [
  {
    id: 'manager',
    label: '企業DX・ITシステム開発',
    value: (
      <C_Stack className={`gap-6`}>
        <C_Stack>
          <h3 className={`text-xl`}>ココナラ、Lancers等のフリーランスマッチングサイトにて、200件以上の実績</h3>
          <Developer />
          <hr />
        </C_Stack>

        <C_Stack>
          <h3 className={`text-xl`}>
            <div>開発実績</div>
            <div className={`text-base text-gray-600`}>多様な事業者様向けに システム開発・業務改善をサポート</div>
          </h3>

          <Category />
          <hr />
        </C_Stack>

        <C_Stack>
          <h3 className={`text-xl`}>様々な企業、大学、個人事業主様など、実績多数</h3>
          <Partners {...{kaizenClient}} />
          <hr />
        </C_Stack>
      </C_Stack>
    ),
  },
  {
    id: 'collaborationWithUniversity',
    label: '大学研究室との共同プロジェクト',
    value: <p>心理学の専門知を応用した学習アプリ【Grouping】の共同開発プロジェクト</p>,
  },
  {
    id: 'coach',
    label: '講師 /コーチング ',
    value: (
      <R_Stack className={` items-start`}>
        <C_Stack className={`gap-4`}>
          <section>
            <p>エンジニア、事業主向けのITコーチング</p>
            <small>
              <ul className={` ml-4 leading-5`}>
                <li>JavaScript / React / Next JS WEB開発コーチング</li>
                <li>Google Work Space / Google Apps Scriptコーチング</li>
              </ul>
            </small>
          </section>
          <section>
            <p>プログラミング教室オンライン講師</p>
            <small>
              <ul className={` ml-4 leading-5`}>
                <li>JavaScript基礎学習</li>
              </ul>
            </small>
          </section>
        </C_Stack>
        <ContentPlayer
          {...{
            className: 'shadow-md rounded-md',
            styles: {thumbnail: {width: 200, height: 200}},
            src: '/image/KM/coaching-programs.png',
          }}
        />
      </R_Stack>
    ),
  },
]

export const TableOfContents = ({firstLayerMenus}) => {
  const [showMenuInSP, setshowMenuInSP] = useState(false)
  const {device} = useWindowSize()

  const scrollToElement = useCallback(id => {
    const element = document?.getElementById(id)
    element?.scrollIntoView?.({behavior: 'smooth'})
  }, [])

  const renderContents = () => {
    return (
      <section className={`bg-kaizen-cool-light z-100 rounded-md p-4  shadow-md   `}>
        <div>
          <h3>Contents</h3>
          <div onClick={() => scrollToElement('introduction')} className={` underline underline-offset-2`}>
            <R_Stack className={` items-start`}>
              <span>{'改善マニアとは？'}</span>
            </R_Stack>
          </div>
          <C_Stack>
            {firstLayerMenus.map((fisrtLayerMenu, i) => {
              return (
                <div key={i}>
                  <div
                    onClick={() => scrollToElement(fisrtLayerMenu.id)}
                    // href={`#${fisrtLayerMenu.id}`}
                    className={` underline underline-offset-2`}
                  >
                    <R_Stack className={` items-start`}>
                      <span>{i + 1}.</span>
                      <span>{fisrtLayerMenu.label}</span>
                    </R_Stack>
                  </div>
                  <div className={`ml-4`}>
                    {fisrtLayerMenu?.secondLayerMenus?.map((secondLayerMenu, j) => {
                      return (
                        <div
                          key={j}
                          onClick={() => scrollToElement(secondLayerMenu.id)}
                          // href={`#${secondLayerMenu.id}`}
                          className={` underline underline-offset-2`}
                        >
                          <R_Stack className={` items-start`}>
                            <span>{j + 1}.</span>
                            <span>{secondLayerMenu.label}</span>
                          </R_Stack>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </C_Stack>
        </div>
      </section>
    )
  }

  if (device.SP) {
    return (
      <div className={`z-50`}>
        <Button onClick={() => setshowMenuInSP(prev => !prev)} className={cl(`fixed bottom-6 right-2 z-10 p-1 `)}>
          メニュー
        </Button>
        {showMenuInSP && (
          <>
            <div className={` overlay`} onClick={() => setshowMenuInSP(prev => !prev)}></div>
            <div className={`  center-x fixed top-[100px]  z-100  w-[90vw]    opacity-100 `}>
              <div>{renderContents()}</div>
            </div>
          </>
        )}
      </div>
    )
  } else {
    return (
      <div className={`fixed bottom-[50px] right-[30px] z-50 opacity-60    duration-300 hover:opacity-100`}>
        {renderContents()}
      </div>
    )
  }
}
