import {CleansePathSource, PageGetterType, pathItemType} from 'src/non-common/path-title-constsnts'
import {getScopes} from 'src/non-common/scope-lib/getScopes'

export const colabo_PAGES = (props: PageGetterType) => {
  const {roles, session, rootPath, query, pathname, dynamicRoutingParams} = props

  const scopes = getScopes(session, {query, roles})
  const {isSchoolLeader} = scopes.getGroupieScopes()

  const {admin} = scopes
  const configROOTS = [rootPath]

  const normalPaths: pathItemType[] = [
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
  ]

  const adminPaths: pathItemType[] = [
    {
      tabId: 'admin',
      label: 'デバッグメニュー',
      link: {},
      exclusiveTo: true,
      children: [
        {tabId: 'game', label: '授業', link: {}, exclusiveTo: true},
        {tabId: 'slide', label: 'スライド', link: {}, exclusiveTo: true},
      ],
    },
  ].map(item => {
    return {
      ...item,
      ROOT: configROOTS,
      exclusiveTo: admin,
    }
  })

  const pathSource = [...normalPaths, ...adminPaths] as pathItemType[]

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
