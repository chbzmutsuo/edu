'use client'

import {Kaizen, KM} from '@app/(apps)/KM/class/Kaizen'

import BackGroundImage from '@cm/components/utils/BackGroundImage'
import useWindowSize from '@cm/hooks/useWindowSize'
import {C_Stack} from '@cm/components/styles/common-components/common-components'
import {useEffect} from 'react'

export const Introducation = () => {
  const {width} = useWindowSize()
  const {fontBig, fontSm} = Kaizen.const.getFonts({width})
  useEffect(() => {
    setTimeout(() => {
      const target = document.getElementById('introduction')
      if (!target) return
      target.scrollIntoView({block: 'center'})
    }, 50)
  }, [])
  const bgUrl = '/image/KM/intro-bg.png'
  const Message = () => {
    return (
      <div className={`${fontBig}  rounded-md  p-1   font-bold  `}>
        <div>
          <C_Stack className={`mx-auto w-fit items-center gap-6 rounded-md bg-white/70 px-2 py-4 shadow-md`}>
            <div className={` text-center`}>
              <div>
                <strong>{Kaizen.KaizenManiaIcon}</strong>
              </div>
            </div>

            <C_Stack className={`text-center  ${fontSm}`}>
              <div>業務改善・自動化に特化したツール開発で</div>
              <div>中小企業、事業主様の業務改善を担います。 </div>
            </C_Stack>

            <C_Stack className={`${fontBig}  p-1 text-center `}>
              <KM.CoolStrong className={` text-center`}>無駄な業務の撲滅を。</KM.CoolStrong>
              <KM.WarmStrong className={` text-end`}>ヒトの時間に余白を。</KM.WarmStrong>
            </C_Stack>

            <C_Stack className={`text-center ${fontSm}`}>
              <div>をモットーとし、</div>
              <div>
                <KM.CoolStrong>揺るぎない信念</KM.CoolStrong>
                <KM.CoolStrong>確固たる意志</KM.CoolStrong>
              </div>
              <div>で、本気の業務改善を行います。</div>
            </C_Stack>
            <C_Stack className={`text-center ${fontSm}`}>
              <div>エンジニア・マネージャとしての開発経験。</div>
              <div>
                エージェント実績280件超。
                <small>(ココナラ・ランサーズ)</small>
              </div>
              <div>
                <KM.CoolStrong>誰よりも「めんどくさがり」</KM.CoolStrong>
                だからこそ、
              </div>

              <div>
                <KM.WarmStrong>誰よりも使い手の利便性</KM.WarmStrong>にこだわり、
              </div>
              <div>あなたの業務を改善します。</div>
              <div>
                <KM.CoolStrong className={fontBig}>~マイデスクから始める業務改善~</KM.CoolStrong>
              </div>
              <div>を一緒にやりませんか？</div>
            </C_Stack>
            <p></p>
          </C_Stack>
        </div>
      </div>
    )
  }
  return (
    <section id="introduction">
      <div style={{}} className={`relative h-full w-full`}>
        <BackGroundImage {...{url: bgUrl}}></BackGroundImage>

        <div className={`sticky `}>
          <Message />
        </div>
        {/* <div>
          <Image
            src={bgUrl}
            {...{
              style: {margin: `auto`},

              width: 2000,
              height: 800,
              alt: '',
            }}
          />
          <Absolute>
            <Message />
          </Absolute>
        </div> */}
      </div>
    </section>
  )
}
