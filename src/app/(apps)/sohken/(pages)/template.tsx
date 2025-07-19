'use client'

import {useGenbaDayBasicEditor} from '@app/(apps)/sohken/hooks/useGenbaDayBasicEditor'
import {useGenbaDayCardEditorModalGMF} from '@app/(apps)/sohken/hooks/useGenbaDayCardEditorModalGMF'
import {useGenbaDetailModal} from '@app/(apps)/sohken/hooks/useGenbaDetailModal'
import {useGenbaSearchModal} from '@app/(apps)/sohken/hooks/useGenbaSearchModal'
import {useShiftEditFormModal} from '@app/(apps)/sohken/hooks/useShiftEditFormModal'

import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {useGlobalShortcut} from '@cm/hooks/useGlobalShortcut'
import {sleep} from '@cm/lib/methods/common'

import React from 'react'
import {toast} from 'react-toastify'

export default function template({children}) {
  const {pathname, router, getHref, query} = useGlobal()
  const GenbaDayCardEditModal_HK = useGenbaDayCardEditorModalGMF()
  const ShiftEditFormModal_HK = useShiftEditFormModal()
  const GenbaDayBasicEditor_HK = useGenbaDayBasicEditor()
  const GenbaDetailModal_HK = useGenbaDetailModal()
  const GenbaSearchModal_HK = useGenbaSearchModal()

  const {accessScopes, toggleLoad} = useGlobal()
  const {admin} = accessScopes()
  useGlobalShortcut({key: 'b', ctrlKey: true}, async () => {
    router.push(getHref(`/sohken/calendar`))
    await sleep(500)
    toast.info(`日付選択ショートカット`)
  })
  useGlobalShortcut({key: 'j', ctrlKey: true}, async () => {
    toast.info(`現場一覧検索ショートカット`)
    GenbaSearchModal_HK.setGMF_OPEN(true)
  })

  // if (isDev && !query.g_userId) {
  //   return <Redirector {...{redirectPath: getHref(pathname, {g_userId: 159})}} />
  // }

  return (
    <div>
      <GenbaDayCardEditModal_HK.Modal />
      <ShiftEditFormModal_HK.Modal />
      <GenbaDayBasicEditor_HK.Modal />
      <GenbaDetailModal_HK.Modal />
      <GenbaSearchModal_HK.Modal />
      {children}
      {/* {admin && (
        <R_Stack className={` sticky bottom-1 px-2`}>
          <CalenderRefresher />
          {admin && (
            <Button
              onClick={async () => {
                if (!confirm(`リセットしますか？`)) {
                  return
                }
                toggleLoad(async () => {
                  const {result: genbaList} = await doStandardPrisma(`genba`, 'findMany', {})
                  for (const genba of genbaList) {
                    const res = await doStandardPrisma(`genbaDay`, `updateMany`, {
                      where: {genbaId: genba.id},
                      data: {
                        finished: false,
                        active: true,
                        status: null,
                      },
                    })
                    await chain_sohken_genbaDayUpdateChain({genbaId: genba.id})
                    await sleep(300)
                  }
                })
              }}
            >
              PLAY
            </Button>
          )}
        </R_Stack>
      )} */}
    </div>
  )
}

const foo = [
  [
    {
      kind: 'calendar#event',
      etag: '"3488652990837182"',
      id: '7do0nfs5u3cactanujddkjkf9c',
      status: 'confirmed',
      htmlLink: 'https://www.google.com/calendar/event?eid=N2RvMG5mczV1M2NhY3RhbnVqZGRramtmOWMgc29oa2VuLnN1Z2F3YXJhQG0',
      created: '2025-04-10T23:08:15.000Z',
      updated: '2025-04-10T23:08:15.418Z',
      summary: 'SS石井(社内検査)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        date: '2025-04-19',
      },
      end: {
        date: '2025-04-20',
      },
      transparency: 'transparent',
      iCalUID: '7do0nfs5u3cactanujddkjkf9c@google.com',
      sequence: 0,
      reminders: {
        useDefault: false,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3488653067271998"',
      id: '19e16f1jqat9g5jo2eacqlfcp6',
      status: 'confirmed',
      htmlLink: 'https://www.google.com/calendar/event?eid=MTllMTZmMWpxYXQ5ZzVqbzJlYWNxbGZjcDYgc29oa2VuLnN1Z2F3YXJhQG0',
      created: '2025-04-10T23:08:23.000Z',
      updated: '2025-04-10T23:08:53.635Z',
      summary: 'SS石井(ｾｷｽｲ検査・社内検査残)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        date: '2025-04-21',
      },
      end: {
        date: '2025-04-22',
      },
      transparency: 'transparent',
      iCalUID: '19e16f1jqat9g5jo2eacqlfcp6@google.com',
      sequence: 0,
      reminders: {
        useDefault: false,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3488653080551390"',
      id: '45l6o1r57c91rmddhbtgloba55',
      status: 'confirmed',
      htmlLink: 'https://www.google.com/calendar/event?eid=NDVsNm8xcjU3Yzkxcm1kZGhidGdsb2JhNTUgc29oa2VuLnN1Z2F3YXJhQG0',
      created: '2025-04-10T23:07:35.000Z',
      updated: '2025-04-10T23:09:00.275Z',
      summary: 'SR伊藤(社内検査・局立会)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        date: '2025-04-16',
      },
      end: {
        date: '2025-04-17',
      },
      transparency: 'transparent',
      iCalUID: '45l6o1r57c91rmddhbtgloba55@google.com',
      sequence: 0,
      reminders: {
        useDefault: false,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3489723683533598"',
      id: '56a43uh4mmj8lq0ed6kvvvd27e',
      status: 'confirmed',
      htmlLink: 'https://www.google.com/calendar/event?eid=NTZhNDN1aDRtbWo4bHEwZWQ2a3Z2dmQyN2Ugc29oa2VuLnN1Z2F3YXJhQG0',
      created: '2025-04-10T23:08:02.000Z',
      updated: '2025-04-17T03:50:41.766Z',
      summary: 'SR東京東支店会議',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        date: '2025-04-18',
      },
      end: {
        date: '2025-04-19',
      },
      transparency: 'transparent',
      iCalUID: '56a43uh4mmj8lq0ed6kvvvd27e@google.com',
      sequence: 0,
      reminders: {
        useDefault: false,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3490416235114814"',
      id: 'clgjepho6sq3ib9m71i38b9k74ojcb9pcco62b9p69ijcc9lcdim6e9n64',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=Y2xnamVwaG82c3EzaWI5bTcxaTM4YjlrNzRvamNiOXBjY282MmI5cDY5aWpjYzlsY2RpbTZlOW42NCBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-04-21T04:01:57.000Z',
      updated: '2025-04-21T04:01:57.557Z',
      summary: 'SS中島(社内検査)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-04-24T08:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-04-24T16:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: 'clgjepho6sq3ib9m71i38b9k74ojcb9pcco62b9p69ijcc9lcdim6e9n64@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3490963590664062"',
      id: '6gq3coj3cdij4b9hcoojcb9kc8p3eb9o74s3cb9o6ooj4dr3c8qm2e366g',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NmdxM2NvajNjZGlqNGI5aGNvb2pjYjlrYzhwM2ViOW83NHMzY2I5bzZvb2o0ZHIzYzhxbTJlMzY2ZyBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-04-21T04:02:58.000Z',
      updated: '2025-04-24T08:03:15.332Z',
      summary: '(直行) SS中島(ｾｷｽｲ検査) 12:00 12:30',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-04-25T08:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-04-25T12:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      visibility: 'public',
      iCalUID: '6gq3coj3cdij4b9hcoojcb9kc8p3eb9o74s3cb9o6ooj4dr3c8qm2e366g@google.com',
      sequence: 1,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3491129192348798"',
      id: 'ccsm4e3275i6ab9l6oo62b9k6crjab9p69hj4b9h6hj6cphkc9j3gcpj6s',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=Y2NzbTRlMzI3NWk2YWI5bDZvbzYyYjlrNmNyamFiOXA2OWhqNGI5aDZoajZjcGhrYzlqM2djcGo2cyBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-04-24T04:00:17.000Z',
      updated: '2025-04-25T07:03:16.174Z',
      summary:
        '(直行) 浦)SS石坂(現場確認) 8:30→市)SS SGJ(梁確認) 9:30→市)SS泉澤(現場確認・ﾎｰｽﾍｯﾄﾞ取付◆) 10:30→市)SSｽﾌﾟﾗｳﾄ(現場確認) 11:15→市)SS小島(界壁貫通部材取付◆) 3:00 4:00',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        date: '2025-04-26',
      },
      end: {
        date: '2025-04-27',
      },
      transparency: 'transparent',
      iCalUID: 'ccsm4e3275i6ab9l6oo62b9k6crjab9p69hj4b9h6hj6cphkc9j3gcpj6s@google.com',
      sequence: 0,
      reminders: {
        useDefault: false,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3491617403918942"',
      id: 'clhjgc9j6soj4bb46gom4b9k6sq34b9o6srmab9j6goj2ohj6pj62c9h6k',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=Y2xoamdjOWo2c29qNGJiNDZnb200YjlrNnNxMzRiOW82c3JtYWI5ajZnb2oyb2hqNnBqNjJjOWg2ayBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-04-23T09:23:33.000Z',
      updated: '2025-04-28T02:51:41.959Z',
      summary: '(直行) 鎌)SS川村(社内検査・ｾｷｽｲ検査) 3:00 4:15',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-09T08:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-09T15:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      transparency: 'transparent',
      iCalUID: 'clhjgc9j6soj4bb46gom4b9k6sq34b9o6srmab9j6goj2ohj6pj62c9h6k@google.com',
      sequence: 1,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3491617965988510"',
      id: '64o36phk6kq36b9ncdh38b9kcco62bb270qjcb9o6gs38d1k60p30oj4c8',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NjRvMzZwaGs2a3EzNmI5bmNkaDM4YjlrY2NvNjJiYjI3MHFqY2I5bzZnczM4ZDFrNjBwMzBvajRjOCBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-04-24T23:35:49.000Z',
      updated: '2025-04-28T02:56:22.994Z',
      summary: 'SR大槻(社内検査・局立会)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-08T10:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-08T14:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      transparency: 'transparent',
      iCalUID: '64o36phk6kq36b9ncdh38b9kcco62bb270qjcb9o6gs38d1k60p30oj4c8@google.com',
      sequence: 1,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3491619881790526"',
      id: '68r3gcj174q6abb374r38b9k64sjib9o75i38b9g6gqj2ob26hijcopoc4',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NjhyM2djajE3NHE2YWJiMzc0cjM4YjlrNjRzamliOW83NWkzOGI5ZzZncWoyb2IyNmhpamNvcG9jNCBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-04-28T01:07:07.000Z',
      updated: '2025-04-28T03:12:20.895Z',
      summary: '直行)⑧',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-04-30T08:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-04-30T08:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '68r3gcj174q6abb374r38b9k64sjib9o75i38b9g6gqj2ob26hijcopoc4@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3491619899634206"',
      id: 'clj32e1jcdijcbb26tj36b9kcdhjcb9oc8qj2b9m64s3cor66gqjid1n6o',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=Y2xqMzJlMWpjZGlqY2JiMjZ0ajM2YjlrY2RoamNiOW9jOHFqMmI5bTY0czNjb3I2NmdxamlkMW42byBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-04-22T00:39:16.000Z',
      updated: '2025-04-28T03:12:29.817Z',
      summary: '浦)SSｴﾏｰﾄ(社内検査)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-04-30T09:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-04-30T16:45:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: 'clj32e1jcdijcbb26tj36b9kcdhjcb9oc8qj2b9m64s3cor66gqjid1n6o@google.com',
      sequence: 4,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3491975753074046"',
      id: '6hh32eb36sq62b9k6kr3ib9k6co3gbb168ojcbb361imcdj46dhm4dho6o',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NmhoMzJlYjM2c3E2MmI5azZrcjNpYjlrNmNvM2diYjE2OG9qY2JiMzYxaW1jZGo0NmRobTRkaG82byBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-04-22T00:39:51.000Z',
      updated: '2025-04-30T04:37:56.537Z',
      summary: '直行)浦)SSｴﾏｰﾄ(ｾｷｽｲ検査・社内検査残)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-01T08:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-01T15:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '6hh32eb36sq62b9k6kr3ib9k6co3gbb168ojcbb361imcdj46dhm4dho6o@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3491975851359006"',
      id: '65gm2p1lckq3ab9j6tijeb9k75hm2bb26ssjcb9p68sm2p9jcgrjid1mc8',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NjVnbTJwMWxja3EzYWI5ajZ0aWplYjlrNzVobTJiYjI2c3NqY2I5cDY4c20ycDlqY2dyamlkMW1jOCBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-04-30T04:38:45.000Z',
      updated: '2025-04-30T04:38:45.679Z',
      summary: '浦)SS田中(101配管振り・給水墨出し)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-01T15:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-01T16:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '65gm2p1lckq3ab9j6tijeb9k75hm2bb26ssjcb9p68sm2p9jcgrjid1mc8@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3492018120840606"',
      id: '6phm2pj2ccr64b9p6kqj6b9k69gm2bb169h38bb16lj6cp3168s66pb368',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NnBobTJwajJjY3I2NGI5cDZrcWo2YjlrNjlnbTJiYjE2OWgzOGJiMTZsajZjcDMxNjhzNjZwYjM2OCBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-04-30T10:30:28.000Z',
      updated: '2025-04-30T10:31:00.420Z',
      summary: '足)SR小川(公桝立会・現場確認)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-02T10:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-02T10:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      transparency: 'transparent',
      iCalUID: '6phm2pj2ccr64b9p6kqj6b9k69gm2bb169h38bb16lj6cp3168s66pb368@google.com',
      sequence: 1,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3492123897537758"',
      id: '69j6ao9gchj6cb9n65gjib9kc8r38b9ocphjcb9n69gmcp33cpi36p1p64',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NjlqNmFvOWdjaGo2Y2I5bjY1Z2ppYjlrYzhyMzhiOW9jcGhqY2I5bjY5Z21jcDMzY3BpMzZwMXA2NCBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-01T01:12:28.000Z',
      updated: '2025-05-01T01:12:28.768Z',
      summary: '江戸)SSｺｽﾒ(安全協議会)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-02T13:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-02T14:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '69j6ao9gchj6cb9n65gjib9kc8r38b9ocphjcb9n69gmcp33cpi36p1p64@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3492303607953758"',
      id: '462kpa5fl0312u6smvrn1pcis7',
      status: 'confirmed',
      htmlLink: 'https://www.google.com/calendar/event?eid=NDYya3BhNWZsMDMxMnU2c212cm4xcGNpczcgc29oa2VuLnN1Z2F3YXJhQG0',
      created: '2025-05-01T23:08:14.000Z',
      updated: '2025-05-02T02:10:03.976Z',
      summary:
        '市)SS大久保(ｱﾌﾀｰ)9:30→浦)SS浅石(現場確認) 10:15→市)SS南光園(現場確認) 11:15→市)SS椎名(現場確認) 11:45→市)SS岩佐(現場確認) 12:00→市)SS篠原(現場確認) 1:15→市)SSｽﾌﾟﾗｳﾄ(現場確認) 2:00→足)SR池辺(現調) 3:15 4:15',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        date: '2025-05-07',
      },
      end: {
        date: '2025-05-08',
      },
      transparency: 'transparent',
      iCalUID: '462kpa5fl0312u6smvrn1pcis7@google.com',
      sequence: 0,
      reminders: {
        useDefault: false,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3493356363005118"',
      id: 'ckp3ipj564s3ebb46hj68b9k60r30b9pclhjib9nc4p6ccb6chijeob16o',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=Y2twM2lwajU2NHMzZWJiNDZoajY4YjlrNjByMzBiOXBjbGhqaWI5bmM0cDZjY2I2Y2hpamVvYjE2byBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-04-28T09:36:07.000Z',
      updated: '2025-05-08T04:23:01.502Z',
      summary: '足)SR大類(仮設水道移設◆・ﾌﾞﾛｯｸﾍﾞｰｽ掘削調査)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-10T09:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-10T13:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: 'ckp3ipj564s3ebb46hj68b9k60r30b9pclhjib9nc4p6ccb6chijeob16o@google.com',
      sequence: 3,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3493356399346462"',
      id: '7lqf50t6t1lae4hafpmj1gkcb1',
      status: 'confirmed',
      htmlLink: 'https://www.google.com/calendar/event?eid=N2xxZjUwdDZ0MWxhZTRoYWZwbWoxZ2tjYjEgc29oa2VuLnN1Z2F3YXJhQG0',
      created: '2025-05-01T23:42:56.000Z',
      updated: '2025-05-08T04:23:19.673Z',
      summary: '直行)足)SR池辺(仮設水道・既設管掘削調査)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-10T14:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-10T17:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '7lqf50t6t1lae4hafpmj1gkcb1@google.com',
      sequence: 2,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3493356490744158"',
      id: 'cdijip9pcop32b9lc9im6b9k60r3abb2c4ojeb9n70rjge1kccpj0dj168',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=Y2RpamlwOXBjb3AzMmI5bGM5aW02YjlrNjByM2FiYjJjNG9qZWI5bjcwcmpnZTFrY2NwajBkajE2OCBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-08T04:24:05.000Z',
      updated: '2025-05-08T04:24:05.372Z',
      summary: '直行)SS泉澤(現場打合せ)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-10T08:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-10T08:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: 'cdijip9pcop32b9lc9im6b9k60r3abb2c4ojeb9n70rjge1kccpj0dj168@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3493502221598974"',
      id: 'coom8e1p6hj3ibb26gs3eb9kcdh3ibb16csjgb9lchim6dj3cksj8db2ck',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=Y29vbThlMXA2aGozaWJiMjZnczNlYjlrY2RoM2liYjE2Y3NqZ2I5bGNoaW02ZGozY2tzajhkYjJjayBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-09T00:38:30.000Z',
      updated: '2025-05-09T00:38:30.799Z',
      summary: '市)SS MSK(現場打合せ)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-15T09:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-15T10:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: 'coom8e1p6hj3ibb26gs3eb9kcdh3ibb16csjgb9lchim6dj3cksj8db2ck@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3493665042214078"',
      id: 'c9gjadb560omabb1c8p30b9k6ko34b9o64pjab9n6kr66ob5clj3eo9kck',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=YzlnamFkYjU2MG9tYWJiMWM4cDMwYjlrNmtvMzRiOW82NHBqYWI5bjZrcjY2b2I1Y2xqM2VvOWtjayBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-04-24T01:23:19.000Z',
      updated: '2025-05-09T23:15:21.107Z',
      summary: 'SS 柏)BeForest(社内検査)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-12T08:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-12T12:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      transparency: 'transparent',
      iCalUID: 'c9gjadb560omabb1c8p30b9k6ko34b9o64pjab9n6kr66ob5clj3eo9kck@google.com',
      sequence: 1,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3493665150191102"',
      id: '75gmap1mc5j68b9i71gj0b9k75hjcb9o60o62b9p64r36dj5cpi64cb6cc',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NzVnbWFwMW1jNWo2OGI5aTcxZ2owYjlrNzVoamNiOW82MG82MmI5cDY0cjM2ZGo1Y3BpNjRjYjZjYyBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-09T23:16:01.000Z',
      updated: '2025-05-09T23:16:15.095Z',
      summary: '市)SS石井(局立会・社内検査残)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-12T13:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-12T17:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '75gmap1mc5j68b9i71gj0b9k75hjcb9o60o62b9p64r36dj5cpi64cb6cc@google.com',
      sequence: 1,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3493665286540894"',
      id: 'ccrjgdj460sj4b9gclhj0b9k6di34bb1ccr62bb5c5hjie1nc8sj4d1icg',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=Y2NyamdkajQ2MHNqNGI5Z2NsaGowYjlrNmRpMzRiYjFjY3I2MmJiNWM1aGppZTFuYzhzajRkMWljZyBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-04-24T01:26:34.000Z',
      updated: '2025-05-09T23:17:23.270Z',
      summary: 'SS 柏)BeForest(ｾｷｽｲ検査・社内検査残)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-13T08:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-13T12:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: 'ccrjgdj460sj4b9gclhj0b9k6di34bb1ccr62bb5c5hjie1nc8sj4d1icg@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3493665540972798"',
      id: '74p3ecpn71hm6bb461im4b9kc9j3abb165gjcbb36csm4ohpc4sj8pb5cc',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NzRwM2VjcG43MWhtNmJiNDYxaW00YjlrYzlqM2FiYjE2NWdqY2JiMzZjc200b2hwYzRzajhwYjVjYyBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-09T23:17:12.000Z',
      updated: '2025-05-09T23:19:30.486Z',
      summary: '鎌)SS川村(ｾｷｽｲ検査)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-13T13:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-13T15:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '74p3ecpn71hm6bb461im4b9kc9j3abb165gjcbb36csm4ohpc4sj8pb5cc@google.com',
      sequence: 1,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3494096311962270"',
      id: 'c4s38ob66cp38b9j6crm4b9kc4rjab9p6oo3gb9o75ijceb4cop66ohpco',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=YzRzMzhvYjY2Y3AzOGI5ajZjcm00YjlrYzRyamFiOXA2b28zZ2I5bzc1aWpjZWI0Y29wNjZvaHBjbyBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-12T11:09:15.000Z',
      updated: '2025-05-12T11:09:15.981Z',
      summary: '市)SS東出(現場確認)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-14T10:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-14T10:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: 'c4s38ob66cp38b9j6crm4b9kc4rjab9p6oo3gb9o75ijceb4cop66ohpco@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3494096359073342"',
      id: 'cgpjiopm64s3ibb26som8b9k70pj6b9o6lh36b9nc4p6ce9i6hh64phi74',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=Y2dwamlvcG02NHMzaWJiMjZzb204YjlrNzBwajZiOW82bGgzNmI5bmM0cDZjZTlpNmhoNjRwaGk3NCBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-04-25T00:57:10.000Z',
      updated: '2025-05-12T11:09:39.536Z',
      summary: '葛)SS中島(社内検査残・局立会13:30～)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-14T11:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-14T18:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      transparency: 'transparent',
      iCalUID: 'cgpjiopm64s3ibb26som8b9k70pj6b9o6lh36b9nc4p6ce9i6hh64phi74@google.com',
      sequence: 5,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3494226189484190"',
      id: 'cop64cr4ckp3ebb668qj0b9k69gjabb1c4p64bb66gr6ap1l6ksj0d9hcc',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=Y29wNjRjcjRja3AzZWJiNjY4cWowYjlrNjlnamFiYjFjNHA2NGJiNjZncjZhcDFsNmtzajBkOWhjYyBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-12T11:08:22.000Z',
      updated: '2025-05-13T05:11:34.742Z',
      summary: '直行)市)SS石井(外構打合せ・桝嵩上げ)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-14T08:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-14T09:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: 'cop64cr4ckp3ebb668qj0b9k69gjabb1c4p64bb66gr6ap1l6ksj0d9hcc@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3494392092174078"',
      id: '71i3ip1h75h6cb9hcdgj4b9k61gmcbb2cks6cbb3cgs3ad1ocgpj0p9ncc',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NzFpM2lwMWg3NWg2Y2I5aGNkZ2o0YjlrNjFnbWNiYjJja3M2Y2JiM2NnczNhZDFvY2dwajBwOW5jYyBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-14T04:14:05.000Z',
      updated: '2025-05-14T04:14:06.087Z',
      summary: '葛)SS中島(雨樋高さ調整2ヶ所)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-15T11:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-15T11:15:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '71i3ip1h75h6cb9hcdgj4b9k61gmcbb2cks6cbb3cgs3ad1ocgpj0p9ncc@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3494392121595518"',
      id: 'ccojecpk60ojeb9kcosmcb9kchgm2bb1cpij0b9g6krj2p1i70o66e9h6c',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=Y2NvamVjcGs2MG9qZWI5a2Nvc21jYjlrY2hnbTJiYjFjcGlqMGI5ZzZrcmoycDFpNzBvNjZlOWg2YyBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-12T11:21:42.000Z',
      updated: '2025-05-14T04:14:20.797Z',
      summary: '足)SR池辺(公桝確認)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-15T12:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-15T13:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: 'ccojecpk60ojeb9kcosmcb9kchgm2bb1cpij0b9g6krj2p1i70o66e9h6c@google.com',
      sequence: 4,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3494392149655902"',
      id: '6opjiphj64omab9hcoom6b9kc8p36b9p6or34b9k6cp64e9hckqj8pj2ck',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=Nm9wamlwaGo2NG9tYWI5aGNvb202YjlrYzhwMzZiOXA2b3IzNGI5azZjcDY0ZTloY2txajhwajJjayBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-12T11:11:00.000Z',
      updated: '2025-05-14T04:14:34.827Z',
      summary: '足)SR鈴木(社内検査・散水栓1ヶ所?)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-15T13:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-15T18:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '6opjiphj64omab9hcoom6b9kc8p36b9p6or34b9k6cp64e9hckqj8pj2ck@google.com',
      sequence: 5,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3494698353311422"',
      id: '6gqjgp1o69gjabb3cdhj2b9kcdijeb9o6kq66bb1c9h3copo60qmad9k74',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NmdxamdwMW82OWdqYWJiM2NkaGoyYjlrY2RpamViOW82a3E2NmJiMWM5aDNjb3BvNjBxbWFkOWs3NCBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-04-28T02:59:23.000Z',
      updated: '2025-05-15T22:46:16.655Z',
      summary: '足)SR庄司(仮設水道移設◆・ﾌﾞﾛｯｸﾍﾞｰｽ掘削確認)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-17T16:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-17T18:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '6gqjgp1o69gjabb3cdhj2b9kcdijeb9o6kq66bb1c9h3copo60qmad9k74@google.com',
      sequence: 3,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3494699677603518"',
      id: 'cgsjeohpchh3ab9k6tj66b9k6gp68bb16csm2b9j6pj36eb46lgjgor6ck',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=Y2dzamVvaHBjaGgzYWI5azZ0ajY2YjlrNmdwNjhiYjE2Y3NtMmI5ajZwajM2ZWI0NmxnamdvcjZjayBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-13T05:12:42.000Z',
      updated: '2025-05-15T22:57:18.801Z',
      summary: '市)SS平松(現場打合せ)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-19T14:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-19T15:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: 'cgsjeohpchh3ab9k6tj66b9k6gp68bb16csm2b9j6pj36eb46lgjgor6ck@google.com',
      sequence: 1,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3494701153081118"',
      id: '6gq38oj364sj2bb66pij4b9k74ojibb26dh66b9j6gs66phj60q3eohock',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NmdxMzhvajM2NHNqMmJiNjZwaWo0YjlrNzRvamliYjI2ZGg2NmI5ajZnczY2cGhqNjBxM2VvaG9jayBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-15T23:02:04.000Z',
      updated: '2025-05-15T23:09:36.540Z',
      summary: '足)SR大槻(受電後社内検査残)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-20T09:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-20T11:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '6gq38oj364sj2bb66pij4b9k74ojibb26dh66b9j6gs66phj60q3eohock@google.com',
      sequence: 3,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3494701541936222"',
      id: '68ojaob5coq6cbb16oo3ab9k69gm2b9o68rmabb46hijgc1jcos6cp36ck',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NjhvamFvYjVjb3E2Y2JiMTZvbzNhYjlrNjlnbTJiOW82OHJtYWJiNDZoaWpnYzFqY29zNmNwMzZjayBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-15T00:41:49.000Z',
      updated: '2025-05-15T23:12:50.968Z',
      summary: '流)SS加藤(水道局検査)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-27T10:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-27T11:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '68ojaob5coq6cbb16oo3ab9k69gm2b9o68rmabb46hijgc1jcos6cp36ck@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3494701696346718"',
      id: 'c5h6aob66os68bb168r3ab9kc9gm4b9p6hj3abb5ccrj6d9o60om6p9mcg',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=YzVoNmFvYjY2b3M2OGJiMTY4cjNhYjlrYzlnbTRiOXA2aGozYWJiNWNjcmo2ZDlvNjBvbTZwOW1jZyBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-15T23:13:54.000Z',
      updated: '2025-05-15T23:14:08.173Z',
      summary: '松)SS飯嶋(現場確認)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-27T08:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-27T09:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: 'c5h6aob66os68bb168r3ab9kc9gm4b9p6hj3abb5ccrj6d9o60om6p9mcg@google.com',
      sequence: 1,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3494751960502206"',
      id: '6pj66p9o6th3cbb165h64b9k6co30b9p6os34bb66ssjge36coq30pb164',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NnBqNjZwOW82dGgzY2JiMTY1aDY0YjlrNmNvMzBiOXA2b3MzNGJiNjZzc2pnZTM2Y29xMzBwYjE2NCBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-04-28T02:58:24.000Z',
      updated: '2025-05-16T06:13:00.251Z',
      summary: '直行)流)SS加藤(ｾｷｽｲ検査・社内検査残)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-19T08:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-19T12:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '6pj66p9o6th3cbb165h64b9k6co30b9p6os34bb66ssjge36coq30pb164@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3494752085416158"',
      id: 'ccs6achnc8sjib9h69gjgb9kcphm8b9pckrjcbb1cdh62cj1coq30dpjcc',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=Y2NzNmFjaG5jOHNqaWI5aDY5Z2pnYjlrY3BobThiOXBja3JqY2JiMWNkaDYyY2oxY29xMzBkcGpjYyBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-16T06:14:02.000Z',
      updated: '2025-05-16T06:14:02.708Z',
      summary: '市)蜂須賀(現場確認)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-19T13:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-19T14:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: 'ccs6achnc8sjib9h69gjgb9kcphm8b9pckrjcbb1cdh62cj1coq30dpjcc@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3494787104983614"',
      id: '74s3ecpic5j3cb9g6opjeb9k6hj6cb9p6li3cb9hcgo3ec36c8o64oj36c',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NzRzM2VjcGljNWozY2I5ZzZvcGplYjlrNmhqNmNiOXA2bGkzY2I5aGNnbzNlYzM2YzhvNjRvajM2YyBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-04-28T09:31:47.000Z',
      updated: '2025-05-16T11:05:52.491Z',
      summary: '流)SS加藤(ﾒｰﾀｰ取付・社内検査)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-17T09:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-17T15:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '74s3ecpic5j3cb9g6opjeb9k6hj6cb9p6li3cb9hcgo3ec36c8o64oj36c@google.com',
      sequence: 2,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3494787152272286"',
      id: '6kr3idhic5ijeb9gc4o64b9kc5h34bb1c4pjibb364qj6p34cgs64pb560',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NmtyM2lkaGljNWlqZWI5Z2M0bzY0YjlrYzVoMzRiYjFjNHBqaWJiMzY0cWo2cDM0Y2dzNjRwYjU2MCBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-15T22:47:00.000Z',
      updated: '2025-05-16T11:06:16.136Z',
      summary: '直行)柏)SS ﾋﾞｰﾌｫﾚｽﾄ(現場確認)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-17T08:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-17T08:15:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '6kr3idhic5ijeb9gc4o64b9kc5h34bb1c4pjibb364qj6p34cgs64pb560@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3495204372829246"',
      id: '6so6cdhk6lim4b9n6op64b9kccq3gbb16cpmcb9l70p3ep9pc9gm8dr36c',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NnNvNmNkaGs2bGltNGI5bjZvcDY0YjlrY2NxM2diYjE2Y3BtY2I5bDcwcDNlcDlwYzlnbThkcjM2YyBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-17T10:58:14.000Z',
      updated: '2025-05-18T21:03:06.414Z',
      summary: '足)SR庄司(基礎貫通部材届け)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-20T11:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-20T11:45:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '6so6cdhk6lim4b9n6op64b9kccq3gbb16cpmcb9l70p3ep9pc9gm8dr36c@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3495237144290270"',
      id: 'c8q36ohkcks62b9i64o36b9k6oq32bb16co3ebb570sjipj26tj3ed9m64',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=YzhxMzZvaGtja3M2MmI5aTY0bzM2YjlrNm9xMzJiYjE2Y28zZWJiNTcwc2ppcGoyNnRqM2VkOW02NCBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-15T00:38:47.000Z',
      updated: '2025-05-19T01:36:12.145Z',
      summary: '浦)SSｴﾏｰﾄ(下水検査・社内検査残)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-20T13:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-20T18:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: 'c8q36ohkcks62b9i64o36b9k6oq32bb16co3ebb570sjipj26tj3ed9m64@google.com',
      sequence: 5,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3495237260074014"',
      id: 'climcopn69hj0bb6c4pjeb9k70sjeb9o6gr32b9o6ssj6phj70rm2e1h64',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=Y2xpbWNvcG42OWhqMGJiNmM0cGplYjlrNzBzamViOW82Z3IzMmI5bzZzc2o2cGhqNzBybTJlMWg2NCBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-19T01:36:56.000Z',
      updated: '2025-05-19T01:37:10.037Z',
      summary: '足)SR大類(基礎貫通部材届け)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-20T12:15:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-20T12:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: 'climcopn69hj0bb6c4pjeb9k70sjeb9o6gr32b9o6ssj6phj70rm2e1h64@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3495237321838430"',
      id: '6pi38ob26hi32b9k71ijcb9k6dh32bb1c8qj4b9h71i64d316kqm8chg6g',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NnBpMzhvYjI2aGkzMmI5azcxaWpjYjlrNmRoMzJiYjFjOHFqNGI5aDcxaTY0ZDMxNmtxbThjaGc2ZyBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-19T01:37:40.000Z',
      updated: '2025-05-19T01:37:40.919Z',
      summary: '休暇届',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        date: '2025-05-21',
      },
      end: {
        date: '2025-05-22',
      },
      transparency: 'transparent',
      iCalUID: '6pi38ob26hi32b9k71ijcb9k6dh32bb1c8qj4b9h71i64d316kqm8chg6g@google.com',
      sequence: 0,
      reminders: {
        useDefault: false,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3495271948622846"',
      id: 'corm6p9ocgpj2bb16kr62b9kc4r3ebb26gr30bb4cgq30p9jcpgmacb264',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=Y29ybTZwOW9jZ3BqMmJiMTZrcjYyYjlrYzRyM2ViYjI2Z3IzMGJiNGNncTMwcDlqY3BnbWFjYjI2NCBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-15T23:09:09.000Z',
      updated: '2025-05-19T06:26:14.311Z',
      summary: '直行)足)SR鈴木(現場確認)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-20T08:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-20T08:15:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: 'corm6p9ocgpj2bb16kr62b9kc4r3ebb26gr30bb4cgq30p9jcpgmacb264@google.com',
      sequence: 2,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3495335166698590"',
      id: '68p6ac33c8p64b9gc4p64b9k6tim8bb170s68b9o60rjephmccs3edho6c',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NjhwNmFjMzNjOHA2NGI5Z2M0cDY0YjlrNnRpbThiYjE3MHM2OGI5bzYwcmplcGhtY2NzM2VkaG82YyBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-19T15:13:03.000Z',
      updated: '2025-05-19T15:13:03.349Z',
      summary: '市)SS石井(現場打合せ)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-22T08:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-22T09:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '68p6ac33c8p64b9gc4p64b9k6tim8bb170s68b9o60rjephmccs3edho6c@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3495335363184510"',
      id: '68pj8ohh6go32b9j6hhj8b9k6koj4bb1cdgmcb9j70oj4dhocorjgdb460',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NjhwajhvaGg2Z28zMmI5ajZoaGo4YjlrNmtvajRiYjFjZGdtY2I5ajcwb2o0ZGhvY29yamdkYjQ2MCBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-19T15:13:30.000Z',
      updated: '2025-05-19T15:14:41.592Z',
      summary: '市)SS泉澤(現場確認)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-22T09:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-22T10:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '68pj8ohh6go32b9j6hhj8b9k6koj4bb1cdgmcb9j70oj4dhocorjgdb460@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3495335406352574"',
      id: 'c4om4p1o68sj6b9lc5i30b9k70pjgb9occr3ibb2chj30oj6cgp38c9g6k',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=YzRvbTRwMW82OHNqNmI5bGM1aTMwYjlrNzBwamdiOW9jY3IzaWJiMmNoajMwb2o2Y2dwMzhjOWc2ayBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-19T15:15:03.000Z',
      updated: '2025-05-19T15:15:03.176Z',
      summary: '市)SS椎名(現場確認)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-22T10:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-22T11:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: 'c4om4p1o68sj6b9lc5i30b9k70pjgb9occr3ibb2chj30oj6cgp38c9g6k@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3495418074443678"',
      id: '68sjccj26hj62b9jcdi30b9k6sqj8bb1c9gmab9oc4sjadj460p62ophcc',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NjhzamNjajI2aGo2MmI5amNkaTMwYjlrNnNxajhiYjFjOWdtYWI5b2M0c2phZGo0NjBwNjJvcGhjYyBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-20T02:43:57.000Z',
      updated: '2025-05-20T02:43:57.221Z',
      summary: '市)SS井上(安全協議会)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-23T13:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-23T14:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '68sjccj26hj62b9jcdi30b9k6sqj8bb1c9gmab9oc4sjadj460p62ophcc@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3495456549233214"',
      id: '71h64ohlccq66b9kclj68b9k6di3gb9p71hj6b9occpmcdb2cdh32oj16o',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NzFoNjRvaGxjY3E2NmI5a2NsajY4YjlrNmRpM2diOXA3MWhqNmI5b2NjcG1jZGIyY2RoMzJvajE2byBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-19T15:16:11.000Z',
      updated: '2025-05-20T08:04:34.616Z',
      summary: '足)SR鈴木(最終確認・桝蓋交換2ヶ所・散水栓1ヶ所・ﾄｲﾚﾘﾓｺﾝ1ヶ所)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-22T12:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-22T17:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '71h64ohlccq66b9kclj68b9k6di3gb9p71hj6b9occpmcdb2cdh32oj16o@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3495757644369150"',
      id: '70q3aoj370s34b9lcdh3gb9k6pim4b9p70r3ab9kckpm2phl6cpm8opj6c',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NzBxM2FvajM3MHMzNGI5bGNkaDNnYjlrNnBpbTRiOXA3MHIzYWI5a2NrcG0ycGhsNmNwbThvcGo2YyBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-22T01:53:42.000Z',
      updated: '2025-05-22T01:53:42.184Z',
      summary: '市)SSｴｲｱｲ(現場確認)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-23T11:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-23T12:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '70q3aoj370s34b9lcdh3gb9k6pim4b9p70r3ab9kckpm2phl6cpm8opj6c@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3495757678977822"',
      id: '6gsm8d1iccom4b9g60om2b9kcdh30b9p69i34b9oc8rjgob1c4smccr468',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NmdzbThkMWljY29tNGI5ZzYwb20yYjlrY2RoMzBiOXA2OWkzNGI5b2M4cmpnb2IxYzRzbWNjcjQ2OCBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-22T01:00:02.000Z',
      updated: '2025-05-22T01:53:59.488Z',
      summary: '市)SS南光園(現場確認)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-23T14:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-23T15:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '6gsm8d1iccom4b9g60om2b9kcdh30b9p69i34b9oc8rjgob1c4smccr468@google.com',
      sequence: 1,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3495757736458462"',
      id: 'cgq36pj2cdhjeb9j69hjib9k61h30b9o6gq66bb665gmadj4c4r3cc1kc8',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=Y2dxMzZwajJjZGhqZWI5ajY5aGppYjlrNjFoMzBiOW82Z3E2NmJiNjY1Z21hZGo0YzRyM2NjMWtjOCBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-22T01:54:28.000Z',
      updated: '2025-05-22T01:54:28.229Z',
      summary: '足)SR伊藤(最終確認)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-23T16:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-23T18:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: 'cgq36pj2cdhjeb9j69hjib9k61h30b9o6gq66bb665gmadj4c4r3cc1kc8@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3495793604494174"',
      id: '6kr6ae9n6di34b9j6go62b9k64omab9oc4o66bb66hhjcohi65i3icb3c8',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NmtyNmFlOW42ZGkzNGI5ajZnbzYyYjlrNjRvbWFiOW9jNG82NmJiNjZoaGpjb2hpNjVpM2ljYjNjOCBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-20T05:34:49.000Z',
      updated: '2025-05-22T06:53:22.247Z',
      summary: '鎌)SS川村(ﾒｰﾀｰ取付・混合水栓取付・350桝蓋交換2ヶ所・社内検査残)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-24T08:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-24T15:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '6kr6ae9n6di34b9j6go62b9k64omab9oc4o66bb66hhjcohi65i3icb3c8@google.com',
      sequence: 3,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3496130030021278"',
      id: 'chhm6e9p6cpjab9mcgs64b9kckoj0bb26gq3cb9k64s34d34cdijgcphc8',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=Y2hobTZlOXA2Y3BqYWI5bWNnczY0YjlrY2tvajBiYjI2Z3EzY2I5azY0czM0ZDM0Y2RpamdjcGhjOCBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-20T08:10:03.000Z',
      updated: '2025-05-24T05:36:55.010Z',
      summary: '市)SS東出(社内検査)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-26T13:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-26T19:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      transparency: 'transparent',
      iCalUID: 'chhm6e9p6cpjab9mcgs64b9kckoj0bb26gq3cb9k64s34d34cdijgcphc8@google.com',
      sequence: 4,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3496131630447998"',
      id: '60qjcopg6spmcb9gc9j38b9k75gj2b9o64r64b9i64s64or574qjed9j6c',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NjBxamNvcGc2c3BtY2I5Z2M5ajM4YjlrNzVnajJiOW82NHI2NGI5aTY0czY0b3I1NzRxamVkOWo2YyBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-24T05:36:37.000Z',
      updated: '2025-05-24T05:50:15.223Z',
      summary: '浦)SSｴﾏｰﾄ(社内検査残)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-26T08:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-26T12:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '60qjcopg6spmcb9gc9j38b9k75gj2b9o64r64b9i64s64or574qjed9j6c@google.com',
      sequence: 1,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3496432415181566"',
      id: '6dhm2ob1c9h32b9hclh38b9k71i64bb26di6ab9jcosj0c1m6opjae9mcg',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NmRobTJvYjFjOWgzMmI5aGNsaDM4YjlrNzFpNjRiYjI2ZGk2YWI5amNvc2owYzFtNm9wamFlOW1jZyBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-25T23:36:47.000Z',
      updated: '2025-05-25T23:36:47.590Z',
      summary: '柏)SSﾋﾞｰﾌｫﾚｽﾄ(桝嵩上げ)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-27T11:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-27T11:40:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '6dhm2ob1c9h32b9hclh38b9k71i64bb26di6ab9jcosj0c1m6opjae9mcg@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3496461753649214"',
      id: 'cgsm6o9n6srjib9gcgq36b9k6hhjgb9ockrm6b9i6pj36c1p61h36cb16s',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=Y2dzbTZvOW42c3JqaWI5Z2NncTM2YjlrNmhoamdiOW9ja3JtNmI5aTZwajM2YzFwNjFoMzZjYjE2cyBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-15T23:13:23.000Z',
      updated: '2025-05-26T03:41:16.824Z',
      summary: '市)SS篠原(社内検査・現場打合せ)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-27T13:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-27T18:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: 'cgsm6o9n6srjib9gcgq36b9k6hhjgb9ockrm6b9i6pj36c1p61h36cb16s@google.com',
      sequence: 1,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3496609282286014"',
      id: '6kom4p9o6srj2bb361ijcb9k6pgm8bb175j62b9lc8rm6eb5c4o36dpk68',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NmtvbTRwOW82c3JqMmJiMzYxaWpjYjlrNnBnbThiYjE3NWo2MmI5bGM4cm02ZWI1YzRvMzZkcGs2OCBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-27T00:10:25.000Z',
      updated: '2025-05-27T00:10:41.143Z',
      summary: '直行)足)SR伊藤(洗面化粧台点灯確認)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-28T08:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-28T08:15:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '6kom4p9o6srj2bb361ijcb9k6pgm8bb175j62b9lc8rm6eb5c4o36dpk68@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3496609344215934"',
      id: 'ccqjac1h69j3ib9j6gp36b9k6ko66bb1cdhj6b9i65hm4d9m65h66e9lc4',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=Y2NxamFjMWg2OWozaWI5ajZncDM2YjlrNmtvNjZiYjFjZGhqNmI5aTY1aG00ZDltNjVoNjZlOWxjNCBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-27T00:11:11.000Z',
      updated: '2025-05-27T00:11:12.107Z',
      summary: '足)SR長内(現場確認)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-28T08:45:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-28T09:15:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: 'ccqjac1h69j3ib9j6gp36b9k6ko66bb1cdhj6b9i65hm4d9m65h66e9lc4@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3496624796058878"',
      id: '6lh68dhjcksjgbb6c4s3cb9k6lj38b9p6kojgb9mclh34eb2cgs30pb464',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NmxoNjhkaGpja3NqZ2JiNmM0czNjYjlrNmxqMzhiOXA2a29qZ2I5bWNsaDM0ZWIyY2dzMzBwYjQ2NCBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-27T02:19:57.000Z',
      updated: '2025-05-27T02:19:58.029Z',
      summary: '足)SR池辺(公桝確認)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-28T09:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-28T10:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '6lh68dhjcksjgbb6c4s3cb9k6lj38b9p6kojgb9mclh34eb2cgs30pb464@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3496647967920190"',
      id: '6ssj4oph6hij4bb4clh3eb9k71i3eb9pc5i3gb9m64omap1lcopjaohkc8',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NnNzajRvcGg2aGlqNGJiNGNsaDNlYjlrNzFpM2ViOXBjNWkzZ2I5bTY0b21hcDFsY29wamFvaGtjOCBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-15T23:14:30.000Z',
      updated: '2025-05-27T05:33:03.960Z',
      summary: '市)SS椎名(社内検査・現場確認)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-28T13:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-28T18:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      transparency: 'transparent',
      iCalUID: '6ssj4oph6hij4bb4clh3eb9k71i3eb9pc5i3gb9m64omap1lcopjaohkc8@google.com',
      sequence: 6,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3496649181331646"',
      id: 'c8s3cd1l6tim4bb364q3cb9k61h38bb26ko64b9icor3id9n60s64c1occ',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=YzhzM2NkMWw2dGltNGJiMzY0cTNjYjlrNjFoMzhiYjI2a282NGI5aWNvcjNpZDluNjBzNjRjMW9jYyBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-27T00:12:14.000Z',
      updated: '2025-05-27T05:43:10.665Z',
      summary: '市)SS石井(現場打合せ・ﾌﾞﾛｯｸﾍﾞｰｽ逃げ配管?)(及部君同行)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-28T11:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-28T12:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: 'c8s3cd1l6tim4bb364q3cb9k61h38bb26ko64b9icor3id9n60s64c1occ@google.com',
      sequence: 2,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3496825861764830"',
      id: '6ph3gp9l60sj2bb26opmab9k64q30b9pc4sj8bb46grj2chgcooj2dpi6g',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NnBoM2dwOWw2MHNqMmJiMjZvcG1hYjlrNjRxMzBiOXBjNHNqOGJiNDZncmoyY2hnY29vajJkcGk2ZyBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-15T23:14:52.000Z',
      updated: '2025-05-28T06:15:30.882Z',
      summary: '・及部(直行直帰)　市)SS椎名(ｾｷｽｲ検査・社内検査残)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        date: '2025-05-29',
      },
      end: {
        date: '2025-05-30',
      },
      transparency: 'transparent',
      iCalUID: '6ph3gp9l60sj2bb26opmab9k64q30b9pc4sj8bb46grj2chgcooj2dpi6g@google.com',
      sequence: 0,
      reminders: {
        useDefault: false,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3496825907790078"',
      id: 'c4oj0p3668rj4bb36osjab9kckrmabb2ccp64bb5cco3goj26orm8e9n6o',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=YzRvajBwMzY2OHJqNGJiMzZvc2phYjlrY2tybWFiYjJjY3A2NGJiNWNjbzNnb2oyNm9ybThlOW42byBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-15T23:15:20.000Z',
      updated: '2025-05-28T06:15:53.895Z',
      summary: '市)SS篠原(ｾｷｽｲ検査・社内検査残)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-05-30T08:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-05-30T15:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: 'c4oj0p3668rj4bb36osjab9kckrmabb2ccp64bb5cco3goj26orm8e9n6o@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3497144212602398"',
      id: 'c9j3acr4cosj0b9l75h3gb9kc4o62bb161j62bb670o3ad1l6gq62p31co',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=YzlqM2FjcjRjb3NqMGI5bDc1aDNnYjlrYzRvNjJiYjE2MWo2MmJiNjcwbzNhZDFsNmdxNjJwMzFjbyBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-30T02:28:26.000Z',
      updated: '2025-05-30T02:28:26.301Z',
      summary: '千葉SHM支店(KOB打合せ)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-02T17:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-02T18:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: 'c9j3acr4cosj0b9l75h3gb9kc4o62bb161j62bb670o3ad1l6gq62p31co@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3498372542234014"',
      id: 'c8pjapb46lgmab9p75gjcb9k68rmabb1clgj8b9n75j62chmchhm4o9lc8',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=YzhwamFwYjQ2bGdtYWI5cDc1Z2pjYjlrNjhybWFiYjFjbGdqOGI5bjc1ajYyY2htY2hobTRvOWxjOCBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-06T05:04:30.000Z',
      updated: '2025-06-06T05:04:31.117Z',
      summary: '足)SR加賀(基礎貫通部材届け)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-07T12:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-07T12:45:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: 'c8pjapb46lgmab9p75gjcb9k68rmabb1clgj8b9n75j62chmchhm4o9lc8@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3498372614736574"',
      id: '6soj6dhp65i38bb360omcb9kclijcbb264q3eb9j6ks3gp346ss3icr5ck',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NnNvajZkaHA2NWkzOGJiMzYwb21jYjlrY2xpamNiYjI2NHEzZWI5ajZrczNncDM0NnNzM2ljcjVjayBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-06T05:05:07.000Z',
      updated: '2025-06-06T05:05:07.368Z',
      summary: '市)SS岩佐(現場確認)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-07T14:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-07T14:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '6soj6dhp65i38bb360omcb9kclijcbb264q3eb9j6ks3gp346ss3icr5ck@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3498536975865886"',
      id: '6gqjachj60s6cb9ic5hj6b9k68o3ebb168omcb9kcdh3ceb16gr6co9l6s',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NmdxamFjaGo2MHM2Y2I5aWM1aGo2YjlrNjhvM2ViYjE2OG9tY2I5a2NkaDNjZWIxNmdyNmNvOWw2cyBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-06T03:01:26.000Z',
      updated: '2025-06-07T03:54:47.932Z',
      summary: '市)SS椎名(桝変芯3ヶ所・是正)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-09T13:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-09T18:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '6gqjachj60s6cb9ic5hj6b9k68o3ebb168omcb9kcdh3ceb16gr6co9l6s@google.com',
      sequence: 4,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3498568118154526"',
      id: '6lgm8o9hcgo64b9h74o6cb9k6pj68b9o70r64bb175h62dr6c4rjepj2cc',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NmxnbThvOWhjZ282NGI5aDc0bzZjYjlrNnBqNjhiOW83MHI2NGJiMTc1aDYyZHI2YzRyamVwajJjYyBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-05T01:02:16.000Z',
      updated: '2025-06-07T08:14:19.077Z',
      summary: '市)SS石井(下水検査・最終確認)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-09T08:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-09T12:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '6lgm8o9hcgo64b9h74o6cb9k6pj68b9o70r64bb175h62dr6c4rjepj2cc@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3498896429801022"',
      id: '6hijgdppclgmab9o6hi6ab9kcos3ibb264r34bb6ckpjeopn6hgjapb46s',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NmhpamdkcHBjbGdtYWI5bzZoaTZhYjlrY29zM2liYjI2NHIzNGJiNmNrcGplb3BuNmhnamFwYjQ2cyBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-05T01:03:03.000Z',
      updated: '2025-06-09T05:50:14.900Z',
      summary: '流)SS加藤(最終確認・ﾏｽﾀｲﾄ施工)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-10T12:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-10T18:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '6hijgdppclgmab9o6hi6ab9kcos3ibb264r34bb6ckpjeopn6hgjapb46s@google.com',
      sequence: 4,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3498896485287902"',
      id: '64r62dhi6th62b9ockrmab9kc5im8b9p6lj6abb2clim8d31ccom4c9j70',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NjRyNjJkaGk2dGg2MmI5b2Nrcm1hYjlrYzVpbThiOXA2bGo2YWJiMmNsaW04ZDMxY2NvbTRjOWo3MCBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-09T05:50:42.000Z',
      updated: '2025-06-09T05:50:42.643Z',
      summary: '市)SS清水湯(下水検査)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-10T09:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-10T10:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '64r62dhi6th62b9ockrmab9kc5im8b9p6lj6abb2clim8d31ccom4c9j70@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3498896506975230"',
      id: 'c4p32db2c8pj4bb3cdj3ib9k68qjgbb2c4rj6b9i61gjecj2clh30d31ck',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=YzRwMzJkYjJjOHBqNGJiM2NkajNpYjlrNjhxamdiYjJjNHJqNmI5aTYxZ2plY2oyY2xoMzBkMzFjayBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-05T01:03:40.000Z',
      updated: '2025-06-09T05:50:53.487Z',
      summary: '柏)SSﾋﾞｰﾌｫﾚｽﾄ(ﾒｰﾀｰ器取付・通水確認)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-10T11:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-10T12:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: 'c4p32db2c8pj4bb3cdj3ib9k68qjgbb2c4rj6b9i61gjecj2clh30d31ck@google.com',
      sequence: 8,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3499053734290974"',
      id: '6srj8p1o70s64b9h75hjib9kchh6cbb2cli64b9pckrmachic8o66p1n74',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NnNyajhwMW83MHM2NGI5aDc1aGppYjlrY2hoNmNiYjJjbGk2NGI5cGNrcm1hY2hpYzhvNjZwMW43NCBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-06T05:35:29.000Z',
      updated: '2025-06-10T03:41:07.145Z',
      summary: '市)SS清水湯(局立会・条例検査・社内検査残)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-12T08:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-12T17:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '6srj8p1o70s64b9h75hjib9kchh6cbb2cli64b9pckrmachic8o66p1n74@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3499209989150622"',
      id: '6ko66d9o75hj6b9icpj3gb9k6srjibb2cph3ab9g6him2dr66co66phjck',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NmtvNjZkOW83NWhqNmI5aWNwajNnYjlrNnNyamliYjJjcGgzYWI5ZzZoaW0yZHI2NmNvNjZwaGpjayBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-11T01:22:57.000Z',
      updated: '2025-06-11T01:23:14.575Z',
      summary: 'SRｵﾝﾗｲﾝ会議',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-13T14:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-13T16:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '6ko66d9o75hj6b9icpj3gb9k6srjibb2cph3ab9g6him2dr66co66phjck@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3499210313392958"',
      id: '69ijcd36clgj4b9gcop68b9kcgs30bb16spjgb9gcdh64c1n6kojcpb5co',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NjlpamNkMzZjbGdqNGI5Z2NvcDY4YjlrY2dzMzBiYjE2c3BqZ2I5Z2NkaDY0YzFuNmtvamNwYjVjbyBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-11T01:25:56.000Z',
      updated: '2025-06-11T01:25:56.696Z',
      summary: 'SR池辺(凍結工事・仮設給水)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-14T08:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-14T12:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '69ijcd36clgj4b9gcop68b9kcgs30bb16spjgb9gcdh64c1n6kojcpb5co@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3499384141282974"',
      id: '6gqjgd3260sj8b9l75h6cb9kcdh30bb2ccsmcbb16cp6ce366krmccb2c8',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NmdxamdkMzI2MHNqOGI5bDc1aDZjYjlrY2RoMzBiYjJjY3NtY2JiMTZjcDZjZTM2NmtybWNjYjJjOCBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-10T03:41:56.000Z',
      updated: '2025-06-12T01:34:30.641Z',
      summary: '市)SS椎名(社内検査残・是正)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-13T09:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-13T18:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '6gqjgd3260sj8b9l75h6cb9kcdh30bb2ccsmcbb16cp6ce366krmccb2c8@google.com',
      sequence: 1,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3499384202728990"',
      id: '68o68dhk64oj0b9m6tijab9k75hm4bb2ckq32bb3cgpmadb4ckp3achh6g',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NjhvNjhkaGs2NG9qMGI5bTZ0aWphYjlrNzVobTRiYjJja3EzMmJiM2NncG1hZGI0Y2twM2FjaGg2ZyBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-12T01:35:01.000Z',
      updated: '2025-06-12T01:35:01.364Z',
      summary: '流)SS加藤(ﾏｽﾀｲﾄ施工・桝蓋交換)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-13T08:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-13T08:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '68o68dhk64oj0b9m6tijab9k75hm4bb2ckq32bb3cgpmadb4ckp3achh6g@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3499543692409758"',
      id: '68o66dj561i64bb260rjib9kcpij8b9o6th66b9m6kr3ior66cq3gdpmcg',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NjhvNjZkajU2MWk2NGJiMjYwcmppYjlrY3BpajhiOW82dGg2NmI5bTZrcjNpb3I2NmNxM2dkcG1jZyBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-12T01:35:53.000Z',
      updated: '2025-06-12T23:44:06.204Z',
      summary: 'SR加賀(現場確認)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-14T12:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-14T12:45:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '68o66dj561i64bb260rjib9kcpij8b9o6th66b9m6kr3ior66cq3gdpmcg@google.com',
      sequence: 1,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3499588510986750"',
      id: '64o66c9o6spjib9kcdijgb9k6os38bb2cpgm8bb274pj0c1lccsj8cpn6g',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NjRvNjZjOW82c3BqaWI5a2NkaWpnYjlrNm9zMzhiYjJjcGdtOGJiMjc0cGowYzFsY2NzajhjcG42ZyBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-12T23:45:20.000Z',
      updated: '2025-06-13T05:57:35.493Z',
      summary: 'SR大類(現場確認)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-14T13:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-14T14:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '64o66c9o6spjib9kcdijgb9k6os38bb2cpgm8bb274pj0c1lccsj8cpn6g@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3499723543762910"',
      id: '64q3gd9oc9h3abb575hm6b9k6ss6cbb1cop68bb474o3edj26sr3id9ncc',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NjRxM2dkOW9jOWgzYWJiNTc1aG02YjlrNnNzNmNiYjFjb3A2OGJiNDc0bzNlZGoyNnNyM2lkOW5jYyBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-12T03:37:42.000Z',
      updated: '2025-06-14T00:42:51.881Z',
      summary: '市)SS勝本(現場確認)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-16T09:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-16T09:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '64q3gd9oc9h3abb575hm6b9k6ss6cbb1cop68bb474o3edj26sr3id9ncc@google.com',
      sequence: 3,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3499723578717406"',
      id: '71j3gphn60p3cb9i6gom8b9kc8sjcb9ocoq36b9p6srj4dpj75gj0e3368',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NzFqM2dwaG42MHAzY2I5aTZnb204YjlrYzhzamNiOW9jb3EzNmI5cDZzcmo0ZHBqNzVnajBlMzM2OCBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-14T00:43:09.000Z',
      updated: '2025-06-14T00:43:09.358Z',
      summary: '市)SS井上(下水検査)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-16T10:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-16T11:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '71j3gphn60p3cb9i6gom8b9kc8sjcb9ocoq36b9p6srj4dpj75gj0e3368@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3499723623884254"',
      id: '6hj62c9i6cp3gb9lc4qjcb9k74p32bb1ckoj8b9nchj32chlc8qmaohn6g',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NmhqNjJjOWk2Y3AzZ2I5bGM0cWpjYjlrNzRwMzJiYjFja29qOGI5bmNoajMyY2hsYzhxbWFvaG42ZyBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-14T00:43:31.000Z',
      updated: '2025-06-14T00:43:31.942Z',
      summary: '市)SS小島(現場確認)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-16T11:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-16T12:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '6hj62c9i6cp3gb9lc4qjcb9k74p32bb1ckoj8b9nchj32chlc8qmaohn6g@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3499750638976222"',
      id: '6hh66pj664q3ab9ncgs66b9k6hj3cbb26dim6b9j70rj0db261gm2c1mc8',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NmhoNjZwajY2NHEzYWI5bmNnczY2YjlrNmhqM2NiYjI2ZGltNmI5ajcwcmowZGIyNjFnbTJjMW1jOCBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-14T04:28:39.000Z',
      updated: '2025-06-14T04:28:39.488Z',
      summary: '市)SS篠原(ﾒｰﾀｰ器取付・通水確認)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-19T16:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-19T18:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '6hh66pj664q3ab9ncgs66b9k6hj3cbb26dim6b9j70rj0db261gm2c1mc8@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3499750692432574"',
      id: 'chj30d31c9gj2b9l6hgm6b9k6kr66b9pcos6cb9occs6cp36c5j32c1j64',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=Y2hqMzBkMzFjOWdqMmI5bDZoZ202YjlrNmtyNjZiOXBjb3M2Y2I5b2NjczZjcDM2YzVqMzJjMWo2NCBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-12T03:35:11.000Z',
      updated: '2025-06-14T04:29:06.216Z',
      summary: '浦)SS齊藤(現場確認)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-16T17:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-16T18:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: 'chj30d31c9gj2b9l6hgm6b9k6kr66b9pcos6cb9occs6cp36c5j32c1j64@google.com',
      sequence: 4,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3499750710064670"',
      id: '60s3cp9mchhj4b9g6oq3ib9kcor36b9o68omcb9g6kp3ao9kcosjgob46k',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NjBzM2NwOW1jaGhqNGI5ZzZvcTNpYjlrY29yMzZiOW82OG9tY2I5ZzZrcDNhbzlrY29zamdvYjQ2ayBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-12T03:36:14.000Z',
      updated: '2025-06-14T04:29:15.032Z',
      summary: '浦)SS浅石(ｻﾔ管補修)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-16T16:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-16T17:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '60s3cp9mchhj4b9g6oq3ib9kcor36b9o68omcb9g6kp3ao9kcosjgob46k@google.com',
      sequence: 2,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3499750830512702"',
      id: 'chhj4dhp60s3eb9i6dj3eb9k6ks64bb168rj2bb569hm8p1l6gqj0cphck',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=Y2hoajRkaHA2MHMzZWI5aTZkajNlYjlrNmtzNjRiYjE2OHJqMmJiNTY5aG04cDFsNmdxajBjcGhjayBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-14T04:30:15.000Z',
      updated: '2025-06-14T04:30:15.256Z',
      summary: '市)SS椎名(雨樋接続・現場打合せ)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-16T13:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-16T15:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: 'chhj4dhp60s3eb9i6dj3eb9k6ks64bb168rj2bb569hm8p1l6gqj0cphck@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3499751030192926"',
      id: 'chi3ac9hccqm6bb56ti32b9kcgp3abb174om4bb474o3gphpckq6cc1j6k',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=Y2hpM2FjOWhjY3FtNmJiNTZ0aTMyYjlrY2dwM2FiYjE3NG9tNGJiNDc0bzNncGhwY2txNmNjMWo2ayBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-14T04:25:12.000Z',
      updated: '2025-06-14T04:31:55.096Z',
      summary: '市)SS井上(社内検査・ｾｷｽｲ検査)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-20T08:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-20T18:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      transparency: 'transparent',
      iCalUID: 'chi3ac9hccqm6bb56ti32b9kcgp3abb174om4bb474o3gphpckq6cc1j6k@google.com',
      sequence: 1,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3499751280930494"',
      id: 'c5gmacj26kp38bb470rj2b9k6phjgb9oc4r36bb474o6adr16or66c9o6c',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=YzVnbWFjajI2a3AzOGJiNDcwcmoyYjlrNnBoamdiOW9jNHIzNmJiNDc0bzZhZHIxNm9yNjZjOW82YyBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-14T04:34:00.000Z',
      updated: '2025-06-14T04:34:00.465Z',
      summary: '市)SS井上(増圧試運転立会・水道局検査・社内検査残)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-23T08:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-23T18:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: 'c5gmacj26kp38bb470rj2b9k6phjgb9oc4r36bb474o6adr16or66c9o6c@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3499769828696926"',
      id: '68ojed1nchimab9k6lgm4b9kclhm2b9o70o3gbb371i38cj5cko64e9kc8',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NjhvamVkMW5jaGltYWI5azZsZ200YjlrY2xobTJiOW83MG8zZ2JiMzcxaTM4Y2o1Y2tvNjRlOWtjOCBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-14T04:30:48.000Z',
      updated: '2025-06-14T07:08:34.348Z',
      summary: '市)SS MSK(社内検査)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-17T08:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-17T18:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '68ojed1nchimab9k6lgm4b9kclhm2b9o70o3gbb371i38cj5cko64e9kc8@google.com',
      sequence: 1,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3500278424954686"',
      id: 'ccsjcd1gcorjcb9j60p3gb9kcop6ab9pcko6abb26cr62o9i6dhj0db6cg',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=Y2NzamNkMWdjb3JqY2I5ajYwcDNnYjlrY29wNmFiOXBja282YWJiMjZjcjYybzlpNmRoajBkYjZjZyBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-17T03:08:49.000Z',
      updated: '2025-06-17T05:46:52.477Z',
      summary: '流)SS加藤(現場確認)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-18T09:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-18T09:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: 'ccsjcd1gcorjcb9j60p3gb9kcop6ab9pcko6abb26cr62o9i6dhj0db6cg@google.com',
      sequence: 1,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3500283375299486"',
      id: 'cgr3ac1m6co3cb9lclgj4b9k71h6cbb16oqjibb36gq64c3371j30ohn60',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=Y2dyM2FjMW02Y28zY2I5bGNsZ2o0YjlrNzFoNmNiYjE2b3FqaWJiMzZncTY0YzMzNzFqMzBvaG42MCBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-17T06:28:07.000Z',
      updated: '2025-06-17T06:28:07.649Z',
      summary: '足)SR伊藤(ﾒｰﾀｰBOX蓋交換◆)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-18T16:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-18T16:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: 'cgr3ac1m6co3cb9lclgj4b9k71h6cbb16oqjibb36gq64c3371j30ohn60@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3500283420934782"',
      id: 'cosm4e1kcdi38bb16cr30b9k6cqjab9ochgj8bb4c5i6cdpi74rjac9mck',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=Y29zbTRlMWtjZGkzOGJiMTZjcjMwYjlrNmNxamFiOW9jaGdqOGJiNGM1aTZjZHBpNzRyamFjOW1jayBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-15T00:37:41.000Z',
      updated: '2025-06-17T06:28:30.467Z',
      summary: '柏)SSﾋﾞｰﾌｫﾚｽﾄ(水道・下水検査・最終確認)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-18T10:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-18T15:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: 'cosm4e1kcdi38bb16cr30b9k6cqjab9ochgj8bb4c5i6cdpi74rjac9mck@google.com',
      sequence: 2,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3500283519293022"',
      id: 'ccp38e9oc9gj8bb2chh3eb9k6phm4bb164ojib9l6himcdpj65i66or26c',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=Y2NwMzhlOW9jOWdqOGJiMmNoaDNlYjlrNnBobTRiYjE2NG9qaWI5bDZoaW1jZHBqNjVpNjZvcjI2YyBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-17T06:29:13.000Z',
      updated: '2025-06-17T06:29:19.646Z',
      summary: '足)SR長内(現場確認)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-18T17:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-18T17:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: 'ccp38e9oc9gj8bb2chh3eb9k6phm4bb164ojib9l6himcdpj65i66or26c@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3500468041667102"',
      id: 'ckqjgor16koj4bb575h32b9kclh6abb1c4r3gb9gcgr30c3270pm2cj1ck',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=Y2txamdvcjE2a29qNGJiNTc1aDMyYjlrY2xoNmFiYjFjNHIzZ2I5Z2NncjMwYzMyNzBwbTJjajFjayBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-15T00:37:09.000Z',
      updated: '2025-06-18T08:07:00.833Z',
      summary: '市)SS MSK(ｾｷｽｲ検査・社内検査残)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-19T08:15:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-19T15:15:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: 'ckqjgor16koj4bb575h32b9kclh6abb1c4r3gb9gcgr30c3270pm2cj1ck@google.com',
      sequence: 1,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3500468087363742"',
      id: 'ckp6cc3365j6ab9nckomab9k6csj4b9ochhm8b9i70qj4cj1cgom8e366s',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=Y2twNmNjMzM2NWo2YWI5bmNrb21hYjlrNmNzajRiOW9jaGhtOGI5aTcwcWo0Y2oxY2dvbThlMzY2cyBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-18T08:07:23.000Z',
      updated: '2025-06-18T08:07:23.681Z',
      summary: '市)SS小島(現場確認)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-19T07:45:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-19T08:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: 'ckp6cc3365j6ab9nckomab9k6csj4b9ochhm8b9i70qj4cj1cgom8e366s@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3500476365775166"',
      id: '70r32e1hc9h6cbb4c4rm2b9k71i66bb26csj4b9l6kpm6phl6op3ad9kco',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NzByMzJlMWhjOWg2Y2JiNGM0cm0yYjlrNzFpNjZiYjI2Y3NqNGI5bDZrcG02cGhsNm9wM2FkOWtjbyBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-18T09:16:22.000Z',
      updated: '2025-06-18T09:16:22.887Z',
      summary: '市)SS平松(開発検査)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-07-03T10:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-07-03T11:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '70r32e1hc9h6cbb4c4rm2b9k71i66bb26csj4b9l6kpm6phl6op3ad9kco@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3500599232770238"',
      id: 'cosjic1j6cqjgb9n60r68b9kcks3ib9p6oojcbb6c4q62c3369ijip1lc8',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=Y29zamljMWo2Y3FqZ2I5bjYwcjY4YjlrY2tzM2liOXA2b29qY2JiNmM0cTYyYzMzNjlpamlwMWxjOCBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-19T02:20:16.000Z',
      updated: '2025-06-19T02:20:16.385Z',
      summary: '市)SS MSK(開発検査)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-07-17T13:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-07-17T14:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: 'cosjic1j6cqjgb9n60r68b9kcks3ib9p6oojcbb6c4q62c3369ijip1lc8@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3500619046553790"',
      id: '6kr68chpclh3abb1clh64b9kccom6bb1clh36bb66dhjcp9m65j3goj268',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NmtyNjhjaHBjbGgzYWJiMWNsaDY0YjlrY2NvbTZiYjFjbGgzNmJiNjZkaGpjcDltNjVqM2dvajI2OCBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-19T05:05:23.000Z',
      updated: '2025-06-19T05:05:23.276Z',
      summary: '市)SS南光園(安全協議会)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-27T13:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-27T14:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '6kr68chpclh3abb1clh64b9kccom6bb1clh36bb66dhjcp9m65j3goj268@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3500782187229886"',
      id: '60qj8e1h6crm2b9l75ij2b9k6orjeb9o6hj6ab9pcop3ap1pcoo38dpmck',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NjBxajhlMWg2Y3JtMmI5bDc1aWoyYjlrNm9yamViOW82aGo2YWI5cGNvcDNhcDFwY29vMzhkcG1jayBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-14T04:31:23.000Z',
      updated: '2025-06-20T03:44:53.614Z',
      summary: '足)SR大槻(棚手摺取付)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-21T09:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-21T10:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '60qj8e1h6crm2b9l75ij2b9k6orjeb9o6hj6ab9pcop3ap1pcoo38dpmck@google.com',
      sequence: 1,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3500782258867390"',
      id: 'ckr30c9hccsj2bb6c8p3gb9k6ph62b9o6osj2b9ocgp34ohoccr32e9g64',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=Y2tyMzBjOWhjY3NqMmJiNmM4cDNnYjlrNnBoNjJiOW82b3NqMmI5b2NncDM0b2hvY2NyMzJlOWc2NCBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-20T03:45:29.000Z',
      updated: '2025-06-20T03:45:29.433Z',
      summary: '足)SR長内(社内検査)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-21T10:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-21T14:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: 'ckr30c9hccsj2bb6c8p3gb9k6ph62b9o6osj2b9ocgp34ohoccr32e9g64@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3500782501029758"',
      id: 'c4o6ao9k71h66b9k6or3gb9k64s36bb1ckr3abb46gsjgdpp6limccph70',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=YzRvNmFvOWs3MWg2NmI5azZvcjNnYjlrNjRzMzZiYjFja3IzYWJiNDZnc2pnZHBwNmxpbWNjcGg3MCBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-20T03:47:30.000Z',
      updated: '2025-06-20T03:47:30.514Z',
      summary: '足)SR粟田(社内検査)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-21T14:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-21T18:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: 'c4o6ao9k71h66b9k6or3gb9k64s36bb1ckr3abb46gsjgdpp6limccph70@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3500790764458142"',
      id: '60r68d316lij8b9o74pjcb9k74q62bb26gom8b9g6kqj4c9i6hi32e1nc8',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NjByNjhkMzE2bGlqOGI5bzc0cGpjYjlrNzRxNjJiYjI2Z29tOGI5ZzZrcWo0YzlpNmhpMzJlMW5jOCBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-14T04:32:35.000Z',
      updated: '2025-06-20T04:56:22.229Z',
      summary: '市)SS篠原(増圧試運転立会・水道局検査・最終確認)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-25T08:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-25T18:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '60r68d316lij8b9o74pjcb9k74q62bb26gom8b9g6kqj4c9i6hi32e1nc8@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3500995054807070"',
      id: 'cdim8chi69hm4bb2c9h6ab9k65hjcb9o6sp6cb9oc8o30c3374o3ecpk74',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=Y2RpbThjaGk2OWhtNGJiMmM5aDZhYjlrNjVoamNiOW82c3A2Y2I5b2M4bzMwYzMzNzRvM2VjcGs3NCBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-18T07:35:05.000Z',
      updated: '2025-06-21T09:18:47.403Z',
      summary: '江戸)SS栄光(社内検査・ｾｷｽｲ検査)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-27T08:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-27T12:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: 'cdim8chi69hm4bb2c9h6ab9k65hjcb9o6sp6cb9oc8o30c3374o3ecpk74@google.com',
      sequence: 1,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3501639400547966"',
      id: 'cco32pb665h3eb9icopmab9k64q62b9ocpi3ibb264ojgc3371h3ep9nco',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=Y2NvMzJwYjY2NWgzZWI5aWNvcG1hYjlrNjRxNjJiOW9jcGkzaWJiMjY0b2pnYzMzNzFoM2VwOW5jbyBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-20T01:36:17.000Z',
      updated: '2025-06-25T02:48:20.273Z',
      summary: '市)SS井上(条例検査・社内検査残)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-26T08:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-26T17:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: 'cco32pb665h3eb9icopmab9k64q62b9ocpi3ibb264ojgc3371h3ep9nco@google.com',
      sequence: 1,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3501786408811166"',
      id: 'ckq38ohhcopmabb1cgp66b9kc5gjcbb1cgqmcbb6ckojec1p74s3cd1pcg',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=Y2txMzhvaGhjb3BtYWJiMWNncDY2YjlrYzVnamNiYjFjZ3FtY2JiNmNrb2plYzFwNzRzM2NkMXBjZyBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-19T05:06:07.000Z',
      updated: '2025-06-25T23:13:24.405Z',
      summary: '市)SS平松(社内検査)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-27T15:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-27T18:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: 'ckq38ohhcopmabb1cgp66b9kc5gjcbb1cgqmcbb6ckojec1p74s3cd1pcg@google.com',
      sequence: 1,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3501966350270270"',
      id: '71gj8c9pc5hj6b9g61i3ib9kc9h66b9o6ssj6b9h65ijgc31clim2pb6cg',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NzFnajhjOXBjNWhqNmI5ZzYxaTNpYjlrYzloNjZiOW82c3NqNmI5aDY1aWpnYzMxY2xpbTJwYjZjZyBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-07T01:12:47.000Z',
      updated: '2025-06-27T00:12:55.135Z',
      summary: '市)SS平松総業(社内検査残・局立会・下水検査)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-30T09:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-30T18:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '71gj8c9pc5hj6b9g61i3ib9kc9h66b9o6ssj6b9h65ijgc31clim2pb6cg@google.com',
      sequence: 1,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3501977571360478"',
      id: '60qjgoj6c8q68bb175h30b9k60p6cbb169ijeb9mcdj36e33c8rjepj2cg',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NjBxamdvajZjOHE2OGJiMTc1aDMwYjlrNjBwNmNiYjE2OWlqZWI5bWNkajM2ZTMzYzhyamVwajJjZyBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-01T22:01:31.000Z',
      updated: '2025-06-27T01:46:25.680Z',
      summary: '足)SR加賀(仮設給水・既設管掘削調査)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-04T10:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-04T14:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '60qjgoj6c8q68bb175h30b9k60p6cbb169ijeb9mcdj36e33c8rjepj2cg@google.com',
      sequence: 6,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3501977571360478"',
      id: '61gj2opn6oqjabb274s3ib9k6gs38b9o69hjeb9n6gr36cj2cco36p336g',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NjFnajJvcG42b3FqYWJiMjc0czNpYjlrNmdzMzhiOW82OWhqZWI5bjZncjM2Y2oyY2NvMzZwMzM2ZyBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-30T21:45:53.000Z',
      updated: '2025-06-27T01:46:25.680Z',
      summary: '欠勤',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        date: '2025-05-31',
      },
      end: {
        date: '2025-06-01',
      },
      transparency: 'transparent',
      iCalUID: '61gj2opn6oqjabb274s3ib9k6gs38b9o69hjeb9n6gr36cj2cco36p336g@google.com',
      sequence: 0,
      reminders: {
        useDefault: false,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3501977571360478"',
      id: '61i36ob26ko34b9jc8rj2b9k71h3ibb26coj8bb570o30dpkc8pm4cr56s',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NjFpMzZvYjI2a28zNGI5amM4cmoyYjlrNzFoM2liYjI2Y29qOGJiNTcwbzMwZHBrYzhwbTRjcjU2cyBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-05T02:16:57.000Z',
      updated: '2025-06-27T01:46:25.680Z',
      summary: '足)SR大槻(ﾐｽﾄｻｳﾅ配管追加◆)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-07T08:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-07T12:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '61i36ob26ko34b9jc8rj2b9k71h3ibb26coj8bb570o30dpkc8pm4cr56s@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3501977571360478"',
      id: '64sjedj66crjibb4ccqj6b9k68o3eb9o70q3gb9m64qj8ob3copjeo9o74',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NjRzamVkajY2Y3JqaWJiNGNjcWo2YjlrNjhvM2ViOW83MHEzZ2I5bTY0cWo4b2IzY29wamVvOW83NCBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-30T01:58:38.000Z',
      updated: '2025-06-27T01:46:25.680Z',
      summary: '市)SS清水湯(ｾｷｽｲ検査・社内検査残)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-05T08:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-05T13:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '64sjedj66crjibb4ccqj6b9k68o3eb9o70q3gb9m64qj8ob3copjeo9o74@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3501977571360478"',
      id: '6cq62d9k6sp32b9j6osjgb9k64o3ebb2cor64bb5c8sm8d1k6sr66cb2cc',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NmNxNjJkOWs2c3AzMmI5ajZvc2pnYjlrNjRvM2ViYjJjb3I2NGJiNWM4c204ZDFrNnNyNjZjYjJjYyBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-04T00:52:17.000Z',
      updated: '2025-06-27T01:46:25.680Z',
      summary: '市)SS平松(現場打合せ)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-05T16:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-05T17:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '6cq62d9k6sp32b9j6osjgb9k64o3ebb2cor64bb5c8sm8d1k6sr66cb2cc@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3501977571360478"',
      id: '6hj32or661j62b9n65i6ab9k6li36b9o6cq3gb9kc5hj6pb260qjiopl70',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NmhqMzJvcjY2MWo2MmI5bjY1aTZhYjlrNmxpMzZiOW82Y3EzZ2I5a2M1aGo2cGIyNjBxamlvcGw3MCBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-30T01:59:37.000Z',
      updated: '2025-06-27T01:46:25.680Z',
      summary: '直行)市)SS清水湯(社内検査)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-03T08:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-03T09:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      transparency: 'transparent',
      iCalUID: '6hj32or661j62b9n65i6ab9k6li36b9o6cq3gb9kc5hj6pb260qjiopl70@google.com',
      sequence: 2,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3501977571360478"',
      id: '6ks3ep1pc4s32b9p60s3ib9kc8r3eb9pckp3cb9kckrj4d9hcco64dj168',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NmtzM2VwMXBjNHMzMmI5cDYwczNpYjlrYzhyM2ViOXBja3AzY2I5a2Nrcmo0ZDloY2NvNjRkajE2OCBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-30T21:45:25.000Z',
      updated: '2025-06-27T01:46:25.680Z',
      summary: '市)SS椎名(社内検査残・是正)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-06T10:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-06T17:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '6ks3ep1pc4s32b9p60s3ib9kc8r3eb9pckp3cb9kckrj4d9hcco64dj168@google.com',
      sequence: 7,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3501977571360478"',
      id: '6lijipj4c8p36b9m64o38b9k6dgm4b9o6pj38b9k6dj62pb4c8o68e9kc4',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NmxpamlwajRjOHAzNmI5bTY0bzM4YjlrNmRnbTRiOW82cGozOGI5azZkajYycGI0YzhvNjhlOWtjNCBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-03T03:10:11.000Z',
      updated: '2025-06-27T01:46:25.680Z',
      summary: '直行)足)SR大類(現場確認)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-04T08:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-04T08:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '6lijipj4c8p36b9m64o38b9k6dgm4b9o6pj38b9k6dj62pb4c8o68e9kc4@google.com',
      sequence: 1,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3501977571360478"',
      id: '6oq64c9g68sj2b9kchhj4b9k6cq66b9ochi32bb5c4rj4eb2cormce9i60',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=Nm9xNjRjOWc2OHNqMmI5a2NoaGo0YjlrNmNxNjZiOW9jaGkzMmJiNWM0cmo0ZWIyY29ybWNlOWk2MCBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-30T02:27:38.000Z',
      updated: '2025-06-27T01:46:25.680Z',
      summary: '市)SS小島(現場打合せ)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-02T13:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-02T14:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '6oq64c9g68sj2b9kchhj4b9k6cq66b9ochi32bb5c4rj4eb2cormce9i60@google.com',
      sequence: 1,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3501977571360478"',
      id: '6thj0c9mc4s32b9p6kq34b9k74o6cbb26dhjib9i6cpmcohg65i64eb5c4',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NnRoajBjOW1jNHMzMmI5cDZrcTM0YjlrNzRvNmNiYjI2ZGhqaWI5aTZjcG1jb2hnNjVpNjRlYjVjNCBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-30T21:44:19.000Z',
      updated: '2025-06-27T01:46:25.680Z',
      summary: '市)SS東出(現場打合せ)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-02T10:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-02T11:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '6thj0c9mc4s32b9p6kq34b9k74o6cbb26dhjib9i6cpmcohg65i64eb5c4@google.com',
      sequence: 1,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3501977571360478"',
      id: '75i3gcb36hgjeb9k6sq6cb9k6th36bb271hm4b9j6hh3ec9jclj62dhj74',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=NzVpM2djYjM2aGdqZWI5azZzcTZjYjlrNnRoMzZiYjI3MWhtNGI5ajZoaDNlYzlqY2xqNjJkaGo3NCBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-02T07:30:51.000Z',
      updated: '2025-06-27T01:46:25.680Z',
      summary: '柏)SSﾋﾞｰﾌｫﾚｽﾄ(増圧立会・局立会・社内検査残)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-11T08:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-11T17:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: '75i3gcb36hgjeb9k6sq6cb9k6th36bb271hm4b9j6hh3ec9jclj62dhj74@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3501977571360478"',
      id: 'c4pjad1k6sp32b9nclhjcb9k6lh64bb26pi66b9mcoo68ob26komachh60',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=YzRwamFkMWs2c3AzMmI5bmNsaGpjYjlrNmxoNjRiYjI2cGk2NmI5bWNvbzY4b2IyNmtvbWFjaGg2MCBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-04T00:51:58.000Z',
      updated: '2025-06-27T01:46:25.680Z',
      summary: '浦・市)SS千葉SHM現場確認',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-05T14:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-05T16:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: 'c4pjad1k6sp32b9nclhjcb9k6lh64bb26pi66b9mcoo68ob26komachh60@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3501977571360478"',
      id: 'c4qjedhoc4r3cb9l61gm6b9k61ijgbb275hm8b9k6oo38e1o6csj4e9h6g',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=YzRxamVkaG9jNHIzY2I5bDYxZ202YjlrNjFpamdiYjI3NWhtOGI5azZvbzM4ZTFvNmNzajRlOWg2ZyBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-02T11:03:50.000Z',
      updated: '2025-06-27T01:46:25.680Z',
      summary: '市)SS兒嶋(解体打合せ)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-03T10:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-03T11:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: 'c4qjedhoc4r3cb9l61gm6b9k61ijgbb275hm8b9k6oo38e1o6csj4e9h6g@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3501977571360478"',
      id: 'c4rjcoj264qj4b9j6dijgb9kcgr3gb9pcgr3gb9h71h36c9n6gsjic366g',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=YzRyamNvajI2NHFqNGI5ajZkaWpnYjlrY2dyM2diOXBjZ3IzZ2I5aDcxaDM2YzluNmdzamljMzY2ZyBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-02T11:04:42.000Z',
      updated: '2025-06-27T01:46:25.680Z',
      summary: '市)SS清水湯(社内検査)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-03T11:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-03T18:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: 'c4rjcoj264qj4b9j6dijgb9kcgr3gb9pcgr3gb9h71h36c9n6gsjic366g@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3501977571360478"',
      id: 'c5i62dppcoom2b9gcgsj4b9k6krjeb9ocli3ebb1c9h3acj36spm8e1o74',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=YzVpNjJkcHBjb29tMmI5Z2Nnc2o0YjlrNmtyamViOW9jbGkzZWJiMWM5aDNhY2ozNnNwbThlMW83NCBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-02T00:18:10.000Z',
      updated: '2025-06-27T01:46:25.680Z',
      summary: '葛)SS中島(最終確認)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-04T14:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-04T16:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: 'c5i62dppcoom2b9gcgsj4b9k6krjeb9ocli3ebb1c9h3acj36spm8e1o74@google.com',
      sequence: 5,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3501977571360478"',
      id: 'c8s62dpl71h3eb9jchijcb9k6lhjibb274rmab9n6kp32or6cph3ichpcc',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=YzhzNjJkcGw3MWgzZWI5amNoaWpjYjlrNmxoamliYjI3NHJtYWI5bjZrcDMyb3I2Y3BoM2ljaHBjYyBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-05-30T21:46:39.000Z',
      updated: '2025-06-27T01:46:25.680Z',
      summary: '市)SS MSK(現場確認)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-02T14:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-02T15:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: 'c8s62dpl71h3eb9jchijcb9k6lhjibb274rmab9n6kp32or6cph3ichpcc@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3501977571360478"',
      id: 'cdhm8ob274pj0b9g68q6cb9k75h3eb9p61gj2bb3cphm4phlcoqm4phn60',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=Y2RobThvYjI3NHBqMGI5ZzY4cTZjYjlrNzVoM2ViOXA2MWdqMmJiM2NwaG00cGhsY29xbTRwaG42MCBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-03T03:09:35.000Z',
      updated: '2025-06-27T01:46:25.680Z',
      summary: '足)SR大槻(現場打合せ)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-04T09:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-04T09:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: 'cdhm8ob274pj0b9g68q6cb9k75h3eb9p61gj2bb3cphm4phlcoqm4phn60@google.com',
      sequence: 1,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3501977571360478"',
      id: 'cop66dr1cdi3ib9n65im4b9kckp6cb9p6gp32bb4cop3iphj74o6aphgc8',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=Y29wNjZkcjFjZGkzaWI5bjY1aW00YjlrY2twNmNiOXA2Z3AzMmJiNGNvcDNpcGhqNzRvNmFwaGdjOCBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-05T07:15:04.000Z',
      updated: '2025-06-27T01:46:25.680Z',
      summary: '直行)市)SS石井(桝の嵩上げ2ヶ所・仮設撤去)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-06T08:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-06T10:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: 'cop66dr1cdi3ib9n65im4b9kckp6cb9p6gp32bb4cop3iphj74o6aphgc8@google.com',
      sequence: 0,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
    {
      kind: 'calendar#event',
      etag: '"3501992218255422"',
      id: 'chi6cdhkclj3cbb6chgjcb9k70s34bb16lgjab9l6kr66ohl64qmcdr668',
      status: 'confirmed',
      htmlLink:
        'https://www.google.com/calendar/event?eid=Y2hpNmNkaGtjbGozY2JiNmNoZ2pjYjlrNzBzMzRiYjE2bGdqYWI5bDZrcjY2b2hsNjRxbWNkcjY2OCBzb2hrZW4uc3VnYXdhcmFAbQ',
      created: '2025-06-20T11:36:23.000Z',
      updated: '2025-06-27T03:48:29.127Z',
      summary: '市)SS MSK(ｺﾝ柱1ヶ所)',
      creator: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      organizer: {
        email: 'sohken.sugawara@gmail.com',
        self: true,
      },
      start: {
        dateTime: '2025-06-28T16:30:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: '2025-06-28T18:00:00+09:00',
        timeZone: 'Asia/Tokyo',
      },
      iCalUID: 'chi6cdhkclj3cbb6chgjcb9k70s34bb16lgjab9l6kr66ohl64qmcdr668@google.com',
      sequence: 6,
      reminders: {
        useDefault: true,
      },
      eventType: 'default',
    },
  ],
]
