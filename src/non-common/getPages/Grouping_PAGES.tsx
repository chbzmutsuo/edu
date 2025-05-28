import {CleansePathSource, PageGetterType, pathItemType} from 'src/non-common/path-title-constsnts'
import {getScopes} from 'src/non-common/scope-lib/getScopes'

export const Grouping_PAGES = (props: PageGetterType) => {
  const {roles, session, rootPath, query, pathname, dynamicRoutingParams} = props

  const scopes = getScopes(session, {query, roles})

  const {admin} = scopes
  const {isSchoolLeader} = scopes.getGroupieScopes()

  const configROOTS = [rootPath]

  const pathSource: pathItemType[] = [
    {ROOT: [rootPath], tabId: '', label: 'TOP', exclusiveTo: 'always'},
    {
      ROOT: configROOTS,
      tabId: '',
      label: '各種設定',
      exclusiveTo: isSchoolLeader,
      children: [
        {tabId: 'school', label: '学校', link: {}, exclusiveTo: admin},
        {tabId: 'teacher', label: '教員', link: {}, exclusiveTo: isSchoolLeader},
        {tabId: 'classroom', label: 'クラス', link: {}, exclusiveTo: isSchoolLeader},
        {tabId: 'student', label: '児童・生徒', link: {}, exclusiveTo: isSchoolLeader},
        {tabId: 'subjectNameMaster', label: '教科', link: {}, exclusiveTo: isSchoolLeader},
        {tabId: 'csv-import', label: 'CSV取り込み', link: {}, exclusiveTo: isSchoolLeader},
      ],
    },
    {ROOT: [rootPath], tabId: 'public', label: '公開ページ', children: [{tabId: 'enter', label: '児童・生徒用', link: {}}]},
    {ROOT: [rootPath, `admin`], tabId: 'dataManagement', label: 'データ抽出（管理者用）', exclusiveTo: admin},
  ]
  const {cleansedPathSource, navItems, breads, allPathsPattenrs} = CleansePathSource({
    rootPath,
    pathSource,
    pathname,
    query,
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
