import {Metadata} from 'next'
import Image from 'next/image'

import {Zen_Old_Mincho} from 'next/font/google'

import {isDev} from '@cm/lib/methods/common'
import Admin from '@cm/components/layout/Admin/Admin'

const font = Zen_Old_Mincho({
  weight: ['400', '500', '600', '700', '900'],
  style: 'normal',
  subsets: ['latin', 'latin-ext'],
})

const AppName = `改善マニア`
const Logo = <Image className={`rounded-full`} src={'/image/KM/logo.png'} width={40} height={40} alt="" />
export const metadata: Metadata = {title: AppName}

export default async function AppLayout({children}) {
  if (process.env.NEXT_PUBLIC_ROOTPATH !== 'KM' && !isDev) {
    return <div>このページへはアクセスできません。</div>
  }
  return (
    <div className={font.className}>
      {/* <GreetingLayer> */}
      <Admin
        {...{
          AppName: AppName,
          Logo,
          PagesMethod: 'KM_PAGES',
        }}
      >
        <div className={` text-sub-main `}>
          <div>{children}</div>
        </div>
      </Admin>
      {/*
        <footer className={`  fixed bottom-0  w-full  px-2 text-right `}>
          <div>&copy; 2024 改善マニア All rights reserved.</div>
        </footer> */}
      {/* </GreetingLayer> */}
    </div>
  )
}
