'use client'

import {Kaizen} from '@app/(apps)/KM/class/Kaizen'
import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
import {ImageLabel} from '@cm/components/styles/common-components/ImageLabel'
import {T_LINK} from '@cm/components/styles/common-components/links'
import Image from 'next/image'

export const Developer = () => {
  return (
    <C_Stack>
      <R_Stack className={` justify-center mx-auto w-fit gap-8 w-fit gap-4 font-normal`}>
        <T_LINK target={'_blank'} href={Kaizen.const.coconara.myPage}>
          <Image src={Kaizen.const.coconara.icon} width={120} height={40} alt="" />
        </T_LINK>

        <T_LINK target={'_blank'} href={Kaizen.const.lancers.myPage}>
          <Image src={Kaizen.const.lancers.icon} width={120} height={40} alt="" />
          {/* <ImageLabel
            {...{
              src: Kaizen.const.lancers.icon,
              label: '改善マニア@Lancers',
            }}
          /> */}
        </T_LINK>
      </R_Stack>
    </C_Stack>
  )
}
