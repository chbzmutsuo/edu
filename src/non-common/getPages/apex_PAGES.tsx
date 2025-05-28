import {CleansePathSource, PageGetterType} from 'src/non-common/path-title-constsnts'

export const apex_PAGES = (props: PageGetterType) => {
  const {roles, query, session, rootPath, pathname} = props

  const pathSource = []

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
