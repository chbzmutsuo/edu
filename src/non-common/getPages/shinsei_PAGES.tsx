import {getScopes} from 'src/non-common/scope-lib/getScopes'
import {CleansePathSource, PageGetterType, pathItemType} from 'src/non-common/path-title-constsnts'
export const shinsei_PAGES = (props: PageGetterType) => {
  const {session, query, rootPath, pathname, roles} = props
  const {login, admin, getShinseiScopes} = getScopes(session, {query, roles})
  const {isKanrisha, isHacchuTanto, isKojocho, isTokatsu, isBucho, isYakuin, isNormalUser} = getShinseiScopes()

  const pathSource: pathItemType[] = [
    {tabId: rootPath, label: 'TOP', ROOT: [], hide: true},
    {
      tabId: '',
      label: '発注',

      ROOT: [rootPath],
      children: [
        {
          tabId: 'purchase/create',
          label: '新規発注',
          exclusiveTo: login,
        },
        {
          tabId: 'purchase/history',
          label: '発注履歴',
          exclusiveTo: login,
        },
        {
          tabId: 'purchase/result',
          label: '承認',
          exclusiveTo: isHacchuTanto || isKojocho || isKanrisha,
        },
        {
          tabId: 'purchase/admin-history',
          label: '管理者閲覧用',
          exclusiveTo: isKanrisha || isYakuin,
        },
      ],
    },
    {
      tabId: '',
      label: '休暇',
      ROOT: [rootPath],
      children: [
        {
          tabId: 'leave/create',
          label: '新規申請',
          exclusiveTo: login,
        },
        {
          tabId: 'leave/history',
          label: '申請履歴',
          exclusiveTo: login,
        },
        {
          tabId: 'leave/result',
          label: '承認',
          exclusiveTo: isTokatsu || isBucho || isKanrisha,
        },
        {
          tabId: 'leave/admin-history',
          label: '管理者閲覧用',
          exclusiveTo: isKanrisha || isYakuin,
        },
      ],
    },
    {
      tabId: '',
      label: '管理',
      ROOT: [rootPath],
      exclusiveTo: !!isKanrisha,
      children: [
        {tabId: 'department', label: '部署'},
        {tabId: 'user', label: 'ユーザー一覧'},
        {tabId: `roleMaster`, label: '権限管理'},
        {tabId: `shiireSaki`, label: '仕入れ先マスタ'},
        {tabId: `product`, label: '部品マスタ'},
      ],
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
