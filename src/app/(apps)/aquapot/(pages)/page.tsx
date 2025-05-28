import {TextRed} from '@components/styles/common-components/Alert'
import {Absolute, C_Stack, CenterScreen, R_Stack} from '@components/styles/common-components/common-components'
import {T_LINK} from '@components/styles/common-components/links'
import {doStandardPrisma} from '@lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {addQuerySentence, HREF} from '@lib/methods/urls'
import Link from 'next/link'
import React from 'react'

import {initServerComopnent} from 'src/non-common/serverSideFunction'

export default async function Page(props) {
  const query = await props.searchParams
  const params = await props.params
  const {session, scopes} = await initServerComopnent({query})
  const {aqCustomerId, isUser} = scopes.getAquepotScopes()

  if (!isUser) {
    return (
      <Absolute>
        <T_LINK className={` text-2xl`} href={HREF(`/aquapot/myPage`, {}, query)}>
          お客様マイページへ
        </T_LINK>
      </Absolute>
    )
  }

  const {result} = await doStandardPrisma(`aqCustomerRecord`, `aggregate`, {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    select: {_count: true},
    where: {status: `対応中`},
  })

  return (
    <CenterScreen>
      <C_Stack className={` items-center gap-8`}>
        <h1>メニューを選択してください</h1>

        <Link href={`/aquapot/aqCustomerRecord` + addQuerySentence({customerStatus: '対応中'})}>
          <R_Stack className={`gap-1`}>
            <span>対応中の顧客記録が</span>
            <TextRed>{result?._count.id}</TextRed>
            <span>件あります。</span>
          </R_Stack>
        </Link>
      </C_Stack>
    </CenterScreen>
  )
}
