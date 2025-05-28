import {CleansePathSource, PageGetterType, pathItemType} from 'src/non-common/path-title-constsnts'
import {getScopes} from 'src/non-common/scope-lib/getScopes'

export const CoLab_PAGES = (props: PageGetterType) => {
  const {roles, session, rootPath, query, pathname, dynamicRoutingParams} = props

  const scopes = getScopes(session, {query, roles})

  const {admin} = scopes

  const configROOTS = [rootPath]

  const pathSource: pathItemType[] = [
    {ROOT: [rootPath], tabId: '', label: 'TOP', exclusiveTo: 'always'},
    {
      ROOT: configROOTS,
      tabId: '',
      label: '各種設定',
      children: [],
    },
    {ROOT: configROOTS, tabId: 'slide', label: 'スライド作成'},
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
