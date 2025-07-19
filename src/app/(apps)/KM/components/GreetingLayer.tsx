'use client'

import React, {useState} from 'react'
import {Kaizen} from '@app/(apps)/KM/class/Kaizen'

import useWindowSize from '@cm/hooks/useWindowSize'
import {Z_INDEX} from '@cm/lib/constants/constants'
import {cl} from '@cm/lib/methods/common'

import GradualTextGroup from '@cm/components/utils/texts/GradualTextGroup'
import BackGroundImage from '@cm/components/utils/BackGroundImage'
import {C_Stack} from '@cm/components/styles/common-components/common-components'
import {Button} from '@cm/components/styles/common-components/Button'

export const GreetingLayer = ({children}) => {
  const [showGreeting, setshowGreeting] = useState<any>(true)
  const enter = () => {
    setshowGreeting(false)
  }

  return (
    <>
      {
        <div
          style={{zIndex: Z_INDEX.modal}}
          className={cl(`animate-fade-in   absolute  z-50 min-h-screen w-full  cursor-pointer`, showGreeting ? '' : 'hidden')}
          onClick={enter}
        >
          <Greeting {...{enter}} />
        </div>
      }

      {!showGreeting && <>{children}</>}
    </>
  )
}

const Greeting = ({enter}) => {
  const {width} = useWindowSize()
  const {fontBig, fontSm} = Kaizen.const.getFonts({width})

  const textGroups = [
    {content: ['# 改善マニア', '# ~マイデスクからの業務改善~']},
    {
      content: [
        '不満、苦悩はあるが、まだアイデアはない。',
        '構想がないから、開発会社に頼めない。',
        '何百万とかかる開発。全く手が届かない。',
      ],
    },
    {
      content: [
        'DX・システム開発は人の時間に余白を作り、心を解放するためのもの。',
        'それを、巨額の予算、巨額の人材を投資ができる大企業だけのものにしたくありません。',
      ],
    },
    {
      content: [
        'かつて過酷な労働現場で「改善マニア」を自称し、',
        '1人で始めた「マイデスクDX」',
        '気づけば多くの方々から助けを求めていただくようになりました。',
      ],
    },
    {
      content: [
        '「自分のために」始めた開発だからこそ、',
        '誰よりも使う人のことを想い、',
        '「開発すること」ではなく「改善効果」を大切にしたい',
        '残業に苦しんだ、かつての自分自身への弔い合戦。',
      ],
    },
    {
      content: [
        '要件が決まってなくても良い。',
        '理想形がコロコロと彷徨っていても',
        '毎日違うアイデアに変わったとしても',
        '「よくしたい」という想いをシェアし、育てたい。',
      ],
    },
    {
      content: ['アイデアの壁打ちから、', 'マイデスクから、', '「改善」させていただけませんか'],
    },
  ]

  return (
    <BackGroundImage url={'/image/KM/intro-bg.png'}>
      <C_Stack className={cl(fontSm, 'gap-[80px] p-[20px]  text-center font-bold leading-[45px] text-white lg:leading-[60px]')}>
        <GradualTextGroup {...{textGroups}} />
        <div className={` justify-center`}>
          <Button className={`p-2 px-4  text-center text-2xl `} onClick={enter}>
            Enter
          </Button>
        </div>
      </C_Stack>
    </BackGroundImage>
  )
}
