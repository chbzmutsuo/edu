import {getScopes} from 'src/non-common/scope-lib/getScopes'

import {Days} from '@cm/class/Days/Days'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {getMidnight} from '@cm/class/Days/date-utils/calculations'
import {CleansePathSource, PageGetterType, pathItemType} from 'src/non-common/path-title-constsnts'

export const sohken_PAGES = (props: PageGetterType) => {
  const {session, query, rootPath, pathname, roles} = props

  const {login} = getScopes(session, {query, roles})
  const systemAdmin = roles.find(r => r.name === `管理者`)

  const pathSource: pathItemType[] = [
    {tabId: rootPath, label: 'TOP', ROOT: [], hide: true},

    {
      tabId: 'genbaDay',
      label: 'マイページ',
      ROOT: [rootPath],
      link: {
        query: {
          from: formatDate(Days.day.add(getMidnight(), 1)),
          myPage: true,
        },
      },
      exclusiveTo: !!login,
    },
    {
      tabId: `schedule`,
      label: `スケジュール`,
      children: [{tabId: 'calendar', label: '日付選択', ROOT: [rootPath]}],
      exclusiveTo: !!login,
    },
    {
      tabId: `daily-summary`,
      label: `日報`,
      children: [{tabId: 'daily-summary', label: '日報', ROOT: [rootPath]}],
      exclusiveTo: !!login,
    },

    {
      tabId: '',
      label: '設定',
      ROOT: [rootPath],
      children: [
        {
          tabId: 'genba',
          label: '現場一覧',
          link: {
            query: {
              g_notArchived: true,
            },
          },
        },
        {tabId: 'user', label: '社員一覧'},
        {tabId: 'sohkenCar', label: '車両一覧'},
        {tabId: 'genbaTaskMaster', label: '共通タスクマスタ'},
        {tabId: 'prefCity', label: '市区町村一覧'},
        {tabId: `roleMaster`, label: '権限管理'},
        {tabId: `forcedWorkDay`, label: '出勤日強制指定'},
      ],
      exclusiveTo: !!systemAdmin,
    },
  ]

  return {
    ...CleansePathSource({
      rootPath,
      pathSource,
      pathname,
      session,
    }),
  }
}
