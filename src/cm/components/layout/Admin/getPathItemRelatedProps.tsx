import {PAGES} from 'src/non-common/path-title-constsnts'
import {identifyPathItem} from 'src/non-common/path-title-constsnts'

export function getPathItemRelatedProps({PagesMethod, useGlobalProps}) {
  const {roles, session, pathname, rootPath, query, dynamicRoutingParams} = useGlobalProps

  const pageGetterprops = {session, pathname, rootPath, query, dynamicRoutingParams, roles}
  const pages = PAGES[PagesMethod]?.(pageGetterprops)
  const {allPathsPattenrs} = pages ?? {}
  const matchedPathItem = identifyPathItem({allPathsPattenrs, pathname})
  const {navItems} = pages ?? {}

  return {matchedPathItem, navItems, pages}
}
