import IconLetter from '@cm/components/styles/common-components/IconLetter'
import {Calculator, JapaneseYenIcon, FileText, Truck, ListIcon, Settings, Calendar, Building, User} from 'lucide-react'

import {CleansePathSource} from 'src/non-common/path-title-constsnts'
import {PageGetterType} from 'src/non-common/path-title-constsnts'
import {getScopes} from 'src/non-common/scope-lib/getScopes'

export const tbm_PAGES = (props: PageGetterType) => {
  const {roles = []} = props

  const {session, rootPath, pathname, query} = props

  const scopes = getScopes(session, {query, roles})
  const {login} = scopes
  const admin = scopes.admin
  const isSystemAdmin = scopes.getTbmScopes().isSystemAdmin

  const onlyAdmin = admin || isSystemAdmin

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
          exclusiveTo: login,
        },
      ],
    },
    {
      tabId: 'driver',
      label: <IconLetter {...{Icon: Truck}}>ドライバ</IconLetter>,
      children: [
        {tabId: 'driveInput', label: <IconLetter {...{Icon: Truck}}>運行入力</IconLetter>},
        {tabId: 'monthly-schedule', label: <IconLetter {...{Icon: Calendar}}>月間予定</IconLetter>},
      ],
      exclusiveTo: login,
      ROOT: [rootPath, 'driver'],
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
        {tabId: 'simpleDriveHistory', label: <IconLetter {...{Icon: FileText}}>簡易走行記録（PDF）</IconLetter>},
        {tabId: 'kyuyo', label: <IconLetter {...{Icon: JapaneseYenIcon}}>給与</IconLetter>},
        {tabId: 'attendance', label: <IconLetter {...{Icon: ListIcon}}>出退勤管理</IconLetter>},
      ],
      exclusiveTo: login,
    },
    {
      tabId: '',
      label: 'その他',
      children: [
        //
        {tabId: 'etc', label: 'ETC連携'},
      ],
      exclusiveTo: login,
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
          tabId: 'tbmVehicle',
          label: <IconLetter {...{Icon: Truck}}>車両</IconLetter>,
          exclusiveTo: admin,
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
    ROOT: item.ROOT ?? [rootPath],
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
