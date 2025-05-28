import {CleansePathSource, PageGetterType} from 'src/non-common/path-title-constsnts'
import {getScopes} from 'src/non-common/scope-lib/getScopes'
import {pathItemType} from 'src/non-common/path-title-constsnts'

export const Advantage_PAGES = (props: PageGetterType) => {
  const {roles, query, session, rootPath, pathname, dynamicRoutingParams} = props
  const scopes = getScopes(session, {query, roles})
  const {admin} = scopes
  const {isCoach, isStudent} = scopes.getAdvantageProps()

  const pathSource: pathItemType[] = [
    {tabId: ``, label: 'TOP', hide: true, ROOT: [rootPath]},
    {
      ROOT: [rootPath],
      tabId: '',
      label: '管理者設定ページ',
      exclusiveTo: isCoach,
      children: [
        {tabId: 'coach', label: 'コーチ 一覧'},
        {tabId: 'student', label: '生徒 一覧'},
        {tabId: 'category-management', label: 'レッスン設定'},
        {tabId: 'lessonLog', label: '受講履歴'},
        {tabId: 'ticket', label: 'チケット'},
        {tabId: 'systemChatRoom', label: 'チャット一覧'},
        {tabId: 'bulkNotification', label: '一斉通知'},
        {tabId: 'category-management', label: 'カテゴリ管理', exclusiveTo: admin},
      ],
    },
    {
      exclusiveTo: isStudent,
      ROOT: [rootPath],
      tabId: `lesson-view`,
      label: 'レッスン',
      link: {},
    },
    {
      exclusiveTo: isStudent,
      ROOT: [rootPath],
      tabId: `user-chat`,
      label: 'チャット',
      link: {},
    },
  ]

  const {cleansedPathSource, navItems, breads, allPathsPattenrs} = CleansePathSource({
    rootPath,
    pathSource,
    pathname,
    session,
    dynamicRoutingParams,
  })

  return {
    allPathsPattenrs,
    pathSource: cleansedPathSource,
    navItems,
    breads,
  }
}
