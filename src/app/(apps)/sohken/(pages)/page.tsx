import {Days} from '@class/Days/Days'

import {C_Stack, R_Stack} from '@components/styles/common-components/common-components'
import {Head2} from '@components/styles/common-components/heading'
import {Paper} from '@components/styles/common-components/paper'
import ContentPlayer from '@components/utils/ContentPlayer'
import NewDateSwitcher from '@components/utils/dates/DateSwitcher/NewDateSwitcher'
import BasicModal from '@components/utils/modal/BasicModal'
import Redirector from '@components/utils/Redirector'
import {MarkDownDisplay} from '@components/utils/texts/MarkdownDisplay'
import {addQuerySentence} from '@lib/methods/urls'
import {isDev} from '@lib/methods/common'

import prisma from '@lib/prisma'
import {getMidnight, toUtc} from '@class/Days/date-utils/calculations'
import {formatDate} from '@class/Days/date-utils/formatters'

const Top = async props => {
  const query = await props.searchParams

  const date = query.from ? toUtc(query.from) : undefined
  if (!date) {
    const tomorrow = Days.day.add(getMidnight(), 1)
    return <Redirector {...{redirectPath: `?from=${formatDate(tomorrow)}`}} />
  }
  if (isDev) {
    return (
      <Redirector
        {...{
          redirectPath:
            '/sohken/calendar/' +
            addQuerySentence({
              g_userId: '159',
              from: formatDate(Days.day.add(getMidnight(), 1)),
              myPage: true,
            }),
        }}
      />
    )
  }

  return (
    <Redirector
      {...{redirectPath: '/sohken/genbaDay' + addQuerySentence({from: formatDate(Days.day.add(getMidnight(), 1)), myPage: true})}}
    />
  )

  const dayRemarks = await prisma.dayRemarks.findMany({
    where: {date: date},
    orderBy: {date: 'asc'},
    include: {DayRemarksFile: {}},
    take: 1,
  })

  return (
    <div className={`p-4 container mx-auto  max-w-[95vw]  `}>
      <NewDateSwitcher {...{}} />
      <div className={`grid grid-cols-1  `}>
        {dayRemarks.map(data => {
          const {DayRemarksFile} = data

          const isImage = DayRemarksFile.some(file => file.url.includes(`image`))
          const isVideo = DayRemarksFile.some(file => file.url.includes(`video`))

          return (
            <Paper key={data.id} className={`p-4 max-w-xl mx-auto`}>
              <C_Stack className={`gap-8`}>
                <div>
                  <Head2>連絡事項</Head2>
                  <MarkDownDisplay>{data.shinseiGyomu ?? `特にありません`}</MarkDownDisplay>
                </div>

                <div className="mt-4">
                  <Head2>添付ファイル</Head2>
                  <div>
                    {DayRemarksFile.length === 0 && <div>添付ファイルはありません</div>}
                    {DayRemarksFile.map((file, index) => (
                      <div key={index}>
                        <Paper className={` p-2 rounded-sm`}>
                          <R_Stack className={`justify-between`}>
                            <span>{file.name}</span>
                            <div>
                              <BasicModal {...{btnComponent: <div className={`t-link`}>表示</div>}}>
                                <ContentPlayer
                                  {...{
                                    src: file.url,
                                    styles: {thumbnail: {width: 160, height: 120}},
                                    showOnlyMain: true,
                                  }}
                                />
                              </BasicModal>
                            </div>
                          </R_Stack>
                        </Paper>
                      </div>
                    ))}
                  </div>
                </div>
              </C_Stack>
            </Paper>
          )
        })}
      </div>
    </div>
  )
}

export default Top

const File = () => {
  return (
    <div className="border rounded-sm p-2 flex items-center">
      <span className="text-xs">ファイル名</span>
      <a href={`https://www.google.com`} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-500 hover:underline">
        表示
      </a>
    </div>
  )
}
