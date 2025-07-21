import IconLetter from '@cm/components/styles/common-components/IconLetter'
import {Calculator, JapaneseYenIcon, FileText, Truck, ListIcon, Settings, Calendar, Building, User} from 'lucide-react'

import {CleansePathSource} from 'src/non-common/path-title-constsnts'
import {PageGetterType} from 'src/non-common/path-title-constsnts'
import {getScopes} from 'src/non-common/scope-lib/getScopes'

export const tbm_PAGES = (props: PageGetterType) => {
  const {roles = []} = props

  const {session, rootPath, pathname, query} = props

  const scopes = getScopes(session, {query, roles})

  const {isSystemAdmin} = scopes.getTbmScopes()

  const onlyAdmin = scopes.admin || isSystemAdmin

  const publicPaths = []
  const loginPath = [
    {
      tabId: '',
      label: <IconLetter {...{Icon: ListIcon}}>メイン</IconLetter>,
      children: [
        //

        {
          tabId: 'eigyoshoSettei',
          label: <IconLetter {...{Icon: Settings}}>営業所設定</IconLetter>,
        },
        {
          tabId: 'haisha',
          label: <IconLetter {...{Icon: Truck}}>配車設定</IconLetter>,
          exclusiveTo: onlyAdmin,
        },

        {
          tabId: 'driveInput',
          label: <IconLetter {...{Icon: Truck}}>運行入力</IconLetter>,
          exclusiveTo: onlyAdmin,
        },
      ],
    },

    {
      tabId: '',
      label: <IconLetter {...{Icon: FileText}}>各種レポート等</IconLetter>,
      children: [
        //
        {tabId: 'unkomeisai', label: <IconLetter {...{Icon: ListIcon}}>運行明細</IconLetter>},
        {tabId: 'nempiKanri', label: <IconLetter {...{Icon: JapaneseYenIcon}}>燃費管理</IconLetter>},
        {tabId: 'ruiseki', label: <IconLetter {...{Icon: Calculator}}>累積距離記帳</IconLetter>},
        {tabId: 'eigyosho', label: <IconLetter {...{Icon: JapaneseYenIcon}}>営業所別売上</IconLetter>},
        {tabId: 'etc', label: <IconLetter {...{Icon: JapaneseYenIcon}}>ETC明細連携</IconLetter>},
        {tabId: 'simpleDriveHistory', label: <IconLetter {...{Icon: FileText}}>簡易走行記録（PDF）</IconLetter>},
        {tabId: 'kyuyo', label: <IconLetter {...{Icon: JapaneseYenIcon}}>給与</IconLetter>},
        {tabId: 'attendance', label: <IconLetter {...{Icon: ListIcon}}>出退勤管理</IconLetter>},
      ],
      exclusiveTo: onlyAdmin,
    },

    {
      tabId: '',
      label: <IconLetter {...{Icon: ListIcon}}>共通設定</IconLetter>,
      children: [
        //
        {
          tabId: 'tbmBase',
          label: <IconLetter {...{Icon: Building}}>営業所</IconLetter>,
          exclusiveTo: onlyAdmin,
        },
        {
          tabId: 'user',
          label: <IconLetter {...{Icon: User}}>ユーザー</IconLetter>,
          exclusiveTo: onlyAdmin,
        },
        {
          tabId: 'tbmCustomer',
          label: <IconLetter {...{Icon: Building}}>荷主</IconLetter>,
        },
        {
          tabId: 'calendar',
          label: <IconLetter {...{Icon: Calendar}}>カレンダー</IconLetter>,
        },
        {
          tabId: `roleMaster`,
          label: <IconLetter {...{Icon: Settings}}>権限管理</IconLetter>,
          exclusiveTo: onlyAdmin,
        },
      ],
    },
  ].map(item => ({
    ...item,
    exclusiveTo: item.exclusiveTo ?? scopes.login,
    ROOT: [rootPath],
  }))

  const pathSource = [{tabId: 'top', label: 'トップ', hide: true, ROOT: [rootPath]}, ...publicPaths, ...loginPath]

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
