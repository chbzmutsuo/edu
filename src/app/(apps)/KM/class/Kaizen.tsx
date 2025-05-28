import {R_Stack} from '@components/styles/common-components/common-components'
import {IconBtn} from '@components/styles/common-components/IconBtn'

import Image from 'next/image'
import {twMerge} from 'tailwind-merge'

export const KM = {
  tagBadge: ({color = 'cool', children}) => {
    const className = ` bg-kaizen-${color}-light text-kaizen-${color}-main border-kaizen-${color}-main`
    if (!children) return <></>
    return (
      <IconBtn color={`blue`} className={twMerge(className, `font-bold`)} style={{}}>
        {children}
      </IconBtn>
    )
  },
  WarmStrong: ({children, ...rest}) => {
    return (
      <span {...rest} className={`${rest.className}  text-kaizen-warm-main mx-2 font-bold`}>
        {children}
      </span>
    )
  },
  CoolStrong: ({children, ...rest}) => {
    return (
      <span {...rest} className={`${rest.className}  text-kaizen-cool-main mx-2 font-bold`}>
        {children}
      </span>
    )
  },
}

export class Kaizen {
  static const = {
    getFonts: ({width}) => {
      return {
        fontBig: width > 1300 ? 'text-3xl' : width > 600 ? 'text-2xl' : 'text-lg',
        fontSm: width > 1300 ? 'text-2xl' : width > 600 ? 'text-xl' : 'text-base',
      }
    },
    // gradient: {
    //   warmLight: createGradient({
    //     direction: 'to left',
    //     colors: [tailProps.colors.kaizen.warm.main + '60', tailProps.colors.kaizen.warm.light],
    //   }),
    //   coolMain: createGradient({
    //     direction: 'to right',
    //     colors: [tailProps.colors.kaizen.cool.main, tailProps.colors.kaizen.cool.main + '80'],
    //   }),
    //   coolMiddle: createGradient({
    //     direction: 'to right',
    //     colors: [tailProps.colors.kaizen.cool.main + 'CC', tailProps.colors.kaizen.cool.main + '50'],
    //   }),
    //   coolLight: createGradient({
    //     direction: 'to left',
    //     colors: [tailProps.colors.kaizen.cool.main + '40', tailProps.colors.kaizen.cool.light],
    //   }),
    // },
    coconara: {
      icon: 'https://coconala.co.jp/wp-content/themes/coconala/images/press/presskit/logo_yoko.jpg',
      myPage: 'https://coconala.com/users/3079575',
    },
    lancers: {
      icon: 'https://s3-ap-northeast-1.amazonaws.com/wp.lancers.jp/magazine/wp-content/uploads/2012/06/lancersjpe794a8e38393e38383e382b0e794bbe5838f.jpg',
      myPage: 'https://www.lancers.jp/profile/kaizen_mania_co?ref=header_menu',
    },
  }
  static KaizenManiaIcon = (
    <R_Stack>
      <Image className={`rounded-full`} src={'/image/KM/logo.png'} width={50} height={50} alt="" />
      <h1 className={`text-kaizen-cool-main text-[30px]`}>改善マニア</h1>
    </R_Stack>
  )
  static KaizenWork = {
    parseTags: tag => {
      return String(tag).split(/,|、/)
    },
  }
}
