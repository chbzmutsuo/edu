import {anyObject} from '@cm/types/utility-types'
import {JSX} from 'react'
import {getScopes} from 'src/non-common/scope-lib/getScopes'
import {Advantage_PAGES} from 'src/non-common/getPages/getAdvantagePages'
import {aquapot_PAGES} from 'src/non-common/getPages/aquapot_PAGES'
import {tbm_PAGES} from 'src/non-common/getPages/getTbm_PAGES'
import {sohken_PAGES} from 'src/non-common/getPages/sohken_PAGES'
import {shinsei_PAGES} from 'src/non-common/getPages/shinsei_PAGES'
import {apex_PAGES} from 'src/non-common/getPages/apex_PAGES'
import {Grouping_PAGES} from 'src/non-common/getPages/Grouping_PAGES'
import {KM_PAGES} from 'src/non-common/getPages/KM_PAGES'
import {stock_PAGES} from 'src/non-common/getPages/stock_PAGES'
import {colabo_PAGES} from 'src/non-common/getPages/CoLab_PAGES'

export const PAGES: any = {
  apex_PAGES,
  Grouping_PAGES,
  colabo_PAGES,
  Advantage_PAGES,
  tbm_PAGES,
  KM_PAGES,
  sohken_PAGES,
  aquapot_PAGES,
  shinsei_PAGES,
  stock_PAGES,
  keihi_PAGES: (props: PageGetterType) => {
    const {roles, query, session, rootPath, pathname} = props

    const {login, admin} = getScopes(session, {query, roles})

    const loginPaths = [
      {
        tabId: '',
        label: '経費管理',
        children: [
          {tabId: '/', label: '一覧', ROOT: [rootPath]},
          {tabId: 'new', label: '新規登録', ROOT: [rootPath]},
          {tabId: 'new/bulk', label: '一括登録', ROOT: [rootPath]},
        ],
      },
      {
        tabId: '',
        label: 'マスタ管理',
        children: [{tabId: 'master', label: 'マスタ設定', ROOT: [rootPath]}],
      },
    ].map((item, i) => {
      return {
        ...item,
        ROOT: [rootPath],
        exclusiveTo: !!login,
      }
    })

    // const adminPaths = [
    //   {
    //     tabId: '',
    //     label: '管理者メニュー',
    //     children: [{tabId: 'admin', label: '管理者設定', ROOT: [rootPath]}],
    //   },
    // ].map((item, i) => {
    //   return {
    //     ...item,
    //     ROOT: [rootPath],
    //     exclusiveTo: true,
    //   }
    // })

    const pathSource: pathItemType[] = [...loginPaths]

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
  },
  health_PAGES: (props: PageGetterType) => {
    const {roles, query, session, rootPath, pathname} = props

    const {login, admin} = getScopes(session, {query, roles})
    const loginPaths = [
      {tabId: 'daily', label: '日別ページ', ROOT: [rootPath]},
      {tabId: 'monthly', label: '月別ページ', ROOT: [rootPath]},
      {tabId: 'journal', label: '日誌', ROOT: [rootPath]},
      {tabId: 'task', label: 'タスク管理', ROOT: [rootPath]},
      {tabId: 'medicine', label: '薬マスタ', ROOT: [rootPath]},
    ].map((item, i) => {
      return {
        ...item,
        ROOT: [rootPath],
        exclusiveTo: !!login,
      }
    })

    const adminPaths = [
      {
        tabId: '管理者メニュー',
        label: '管理者メニュー',
        children: [
          {tabId: 'user', label: 'ユーザー'},
          {tabId: 'dashboard', label: 'ダッシュボード'},
        ],
      },
    ].map((item, i) => {
      return {
        ...item,
        ROOT: [rootPath],
        exclusiveTo: !!admin,
      }
    })

    const pathSource: pathItemType[] = [...loginPaths, ...adminPaths]

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
  },
  task_PAGES: (props: PageGetterType) => {
    const {roles, query, session, rootPath, pathname} = props

    const {login, admin} = getScopes(session, {query, roles})

    const loginPaths = [
      {
        tabId: '',
        label: 'タスク管理',
        children: [{tabId: '', label: 'タスク一覧', ROOT: [rootPath]}],
      },
    ].map((item, i) => {
      return {
        ...item,
        ROOT: [rootPath],
        exclusiveTo: !!login,
      }
    })

    const pathSource: pathItemType[] = [...loginPaths]

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
  },

  sbm_PAGES: (props: PageGetterType) => {
    const {roles, query, session, rootPath, pathname} = props

    const {login, admin} = getScopes(session, {query, roles})

    const loginPaths = [
      {tabId: 'dashboard', label: 'ダッシュボード', ROOT: [rootPath]},
      {tabId: 'reservations', label: '予約管理', ROOT: [rootPath]},

      {tabId: 'delivery-route', label: '配達ルート管理', ROOT: [rootPath]},
      {tabId: 'invoices', label: '伝票印刷', ROOT: [rootPath]},
      {tabId: 'rfm', label: 'RFM分析', ROOT: [rootPath]},

      {
        tabId: '',
        label: '管理',
        ROOT: [rootPath],
        children: [
          {tabId: 'customers', label: '顧客マスタ', ROOT: [rootPath]},
          {tabId: 'products', label: '商品マスタ', ROOT: [rootPath]},
          {tabId: 'users', label: 'ユーザーマスタ', ROOT: [rootPath]},
          {tabId: 'seed', label: 'データ管理・シード', ROOT: [rootPath]},
        ],
      },
    ].map((item, i) => {
      return {...item, ROOT: [rootPath], exclusiveTo: !!login}
    })

    const pathSource: pathItemType[] = [...loginPaths]

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
  },
}

export const CleansePathSource = (props: anyObject) => {
  const {rootPath, pathname, query, session, dynamicRoutingParams, roles} = props
  const {login} = getScopes(session, {query, roles})
  const {pathSource} = props

  const navItems: pathItemType[] = []
  const breads: any[] = []
  const allPathsPattenrs: object[] = []

  Object.keys(pathSource).forEach(key => {
    const item = pathSource[key]
    type roopCleansingProps = {
      parent: pathItemType
      item: pathItemType
      key?: string
    }
    /**exclusiveToによるデータクレンジング */
    const roopCleansing = (props: roopCleansingProps) => {
      const {parent, item, key} = props
      const {children} = parent
      if (children && children?.length > 0) {
        children.forEach(child => {
          roopCleansing({parent: item, item: child})
        })
      }
    }
    roopCleansing({parent: pathSource, item, key})
  })

  type constructItemProps = {
    item: pathItemType
    CURRENT_ROOT?: any[]
  }

  const constructItem = (props: constructItemProps) => {
    let {item} = props

    const {CURRENT_ROOT} = props
    const {tabId, link = {query: {}}, label, children, ROOT} = item

    const thisRoot = ROOT ? ROOT : (CURRENT_ROOT ?? [])
    let href: string | undefined = item?.href ?? undefined
    if (href === undefined) {
      if (thisRoot?.join('/').length > 0) {
        href = link
          ? '/' + thisRoot?.join('/') + '/' + tabId
          : // + addQuerySentence(query)
            undefined
      } else {
        href = link
          ? '/' + tabId
          : // + addQuerySentence(query)
            undefined
      }
    }

    item = {...item, href}

    /**bread crumbようの処理 */
    const pathObject: pathItemType = {
      ...item,
      href: `/${[...thisRoot, tabId].join('/')}`,
      joinedPath: [...(thisRoot ?? []), tabId].join('/'),
    }
    allPathsPattenrs.push(pathObject)

    if (item.children) {
      item.children.forEach((item, i) => {
        const newRoot = [...thisRoot, tabId]
        constructItem({item, CURRENT_ROOT: newRoot})
      })
    }

    return item
  }
  /**nav itemsを作る ( 部分的にbreadsの前処理を含む) */
  pathSource?.forEach((item: pathItemType) => {
    const recursive = (props: {item: pathItemType; result: pathItemType[]}) => {
      let {item} = props
      const {result} = props
      const {ROOT} = item
      item = {
        ...constructItem({item: item, CURRENT_ROOT: ROOT}),
        children: item.children?.map(child => {
          if (child?.exclusiveTo === undefined) {
            child.exclusiveTo = item.exclusiveTo
          }
          return constructItem({
            item: child,
            CURRENT_ROOT: ROOT,
          })
        }),
      }

      if (item.exclusiveTo !== false) {
        result.push(item)
        return result
      }
    }
    recursive({item, result: navItems})
  })

  /**breadsを作る */
  const pathnameSplit: string[] = String(pathname).split('/')

  const curr: any = []

  for (let i = 0; i < pathnameSplit.length; i++) {
    curr.push(pathnameSplit[i])
    const A = curr.join('/') //現在のパス

    const matched = allPathsPattenrs.find((path: {joinedPath: string}) => {
      const B = `/${path.joinedPath}` //ループ対象パス
      const isHit = A === B

      return isHit
    })
    if (matched) {
      breads.push(matched)
    }
  }

  return {cleansedPathSource: pathSource, navItems, breads, allPathsPattenrs}
}

export const identifyPathItem = ({allPathsPattenrs, pathname}) => {
  const pathnameSplitArr = String(pathname).split('/')
  const matchedPathItem = allPathsPattenrs.find(item => {
    const itemHrefArray = item?.href?.split('/')

    const check = itemHrefArray.reduce((acc, cur, i) => {
      const pathSegmentMatched = pathnameSplitArr[i] === cur
      return pathSegmentMatched ? (acc += 1) : acc
    }, 0)

    return check === pathnameSplitArr.length && pathnameSplitArr.length === itemHrefArray.length
  })

  return matchedPathItem as pathItemType
}

export type pathItemType = {
  tabId?: string | RegExp
  label?: string | JSX.Element
  icon?: string
  href?: string
  target?: `_blank` | undefined
  ROOT?: string[]
  hide?: boolean
  exclusiveTo?: boolean | 'always'
  children?: pathItemType[]
  link?: {
    query?: object
  }
  joinedPath?: any
}

export type breadType = {
  href: string
  label: string
  joinedPath: string
} & pathItemType

export type PageGetterType = {
  session: anyObject
  rootPath: string
  pathname: string
  query: anyObject
  dynamicRoutingParams: anyObject
  roles: any[]
}
