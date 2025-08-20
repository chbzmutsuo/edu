import {CleansePathSource, PageGetterType} from '../path-title-constsnts'
import {getScopes} from '../scope-lib/getScopes'

export const training_PAGES = (props: PageGetterType) => {
  const {roles, query, session, rootPath, pathname} = props

  const {login} = getScopes(session, {query, roles})

  const loginPaths = [
    {tabId: '/', label: 'カレンダ/入力'},
    {
      tabId: 'workoutLog',
      label: '記録一覧',
    },
    {
      tabId: '',
      label: '分析',
      children: [
        {tabId: 'analysis', label: '月間ダッシュボード'},
        {tabId: 'exercise', label: '種目別分析'},
      ],
    },
    {
      tabId: '',
      label: '設定',
      children: [{tabId: 'master', label: '種目マスタ'}],
    },
  ].map((item, i) => {
    return {
      ...item,
      ROOT: [rootPath],
      // exclusiveTo: !!login,
    }
  })

  const pathSource = [...loginPaths]

  const {cleansedPathSource, navItems, breads, allPathsPattenrs} = CleansePathSource({
    rootPath,
    pathSource,
    pathname,
    session,
  })

  return {
    allPathsPattenrs,
    pathSource: cleansedPathSource,
    navItems,
    breads,
  }
}
