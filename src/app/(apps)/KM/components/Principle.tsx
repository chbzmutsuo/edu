'use client'

import useDoStandardPrisma from '@hooks/useDoStandardPrisma'
import SlateEditor from '@cm/components/SlateEditor/SlateEditor'
import {Kaizen} from '@app/(apps)/KM/class/Kaizen'

export const Principle = () => {
  const {data: kaizenCMS} = useDoStandardPrisma(
    'kaizenCMS',
    'findFirst',
    {
      orderBy: [{id: 'desc'}],
    },
    {deps: []}
  )

  if (!kaizenCMS) return <></>

  return (
    <>
      <div
        style={{
          backgroundImage: `url(/image/KM/greeting-bg.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: 'rgba(242, 242, 242, 0.9)',
          backgroundBlendMode: 'lighten',
          backgroundAttachment: 'fixed',
          width: '100%',
          height: '100%',
          minHeight: '100vh',
          margin: 'auto',
        }}
      >
        <div className={`mx-auto max-w-lg py-[100px] text-[18px] lg:text-[24px]`}>
          <SlateEditor
            {...{
              initialValue: JSON.parse(kaizenCMS?.principlePageMsg ?? {}),
              readOnly: true,
            }}
          />
        </div>
        <div className={` flex justify-end p-2`}> {Kaizen.KaizenManiaIcon}</div>
      </div>
    </>
  )
}
