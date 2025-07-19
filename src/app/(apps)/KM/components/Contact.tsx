'use client'

import useDoStandardPrisma from '@cm/hooks/useDoStandardPrisma'
import SlateEditor from '@cm/components/SlateEditor/SlateEditor'
import useWindowSize from '@cm/hooks/useWindowSize'
import {MyContainer, R_Stack} from '@cm/components/styles/common-components/common-components'

export const Contact = () => {
  const {width} = useWindowSize()
  const {data: kaizenCMS} = useDoStandardPrisma('kaizenCMS', 'findFirst', {orderBy: [{id: 'desc'}]}, {deps: []})
  if (!kaizenCMS) return <></>

  return (
    <>
      <MyContainer className={`p-2`}>
        <div>
          <R_Stack className={`items-stretch  gap-4   `}>
            <div className={`w-full xl:w-1/2`}>
              <SlateEditor
                {...{
                  initialValue: JSON.parse(kaizenCMS?.contactPageMsg ?? ''),
                  readOnly: true,
                }}
              />
            </div>

            <div color="blue">
              <iframe
                src="https://docs.google.com/forms/d/e/1FAIpQLSejumStkkME2f5sdC1dtBO1nbq0mntWxcfxuZvjTyD2NPPUeA/viewform?embedded=true"
                style={{
                  margin: 'auto',
                  height: 2000,
                  width: Math.min(600, width),
                  maxWidth: '90vw',
                }}
              >
                読み込んでいます…
              </iframe>
            </div>
          </R_Stack>
        </div>
      </MyContainer>
    </>
  )
}
