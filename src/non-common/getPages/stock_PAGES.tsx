import {CleansePathSource, PageGetterType, pathItemType} from 'src/non-common/path-title-constsnts'
export const stock_PAGES = (props: PageGetterType) => {
  const {roles, query, session, rootPath, pathname} = props
  const pathSource: pathItemType[] = [
    //
    {
      tabId: '',
      label: '設定',
      ROOT: [rootPath],
      children: [
        {tabId: 'batch', label: 'バッチ'},
        {tabId: 'stockConfig', label: '閾値等'},
        {tabId: 'import-rakuten', label: '楽天証券'},
      ],
    },
    {
      tabId: 'stock',
      label: '銘柄一覧',
      ROOT: [rootPath],
      link: {
        query: {
          last_renzokuJosho: true,
          last_recentCrash: true,
        },
      },
    },
    {tabId: 'stockHistory', label: '銘柄履歴', ROOT: [rootPath]},
  ]

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
