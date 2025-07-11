import IconLetter from '@components/styles/common-components/IconLetter'
import {Calculator, JapaneseYenIcon, Map, Check, FileText, Truck, ListIcon} from 'lucide-react'

import {CleansePathSource} from 'src/non-common/path-title-constsnts'
import {PageGetterType} from 'src/non-common/path-title-constsnts'
import {getScopes} from 'src/non-common/scope-lib/getScopes'

export const tbm_PAGES = (props: PageGetterType) => {
  const {roles = []} = props

  const {session, rootPath, pathname, query} = props

  const scopes = getScopes(session, {query, roles})

  const publicPaths = []
  const loginPath = [
    {
      tabId: '',
      label: 'メインメニュー',
      children: [
        //

        {
          tabId: 'eigyoshoSettei',
          label: <IconLetter {...{Icon: Map}}>営業所設定</IconLetter>,
        },
        {
          tabId: 'haisha',
          label: <IconLetter {...{Icon: Map}}>配車設定</IconLetter>,
        },
      ],
    },

    {
      tabId: '',
      label: <IconLetter {...{Icon: ListIcon}}>各種レポート等</IconLetter>,
      children: [
        //
        {tabId: 'unkomeisai', label: <IconLetter {...{Icon: ListIcon}}>運行明細</IconLetter>},
        {tabId: 'nempiKanri', label: <IconLetter {...{Icon: JapaneseYenIcon}}>燃費管理</IconLetter>},
        {tabId: 'ruiseki', label: <IconLetter {...{Icon: Calculator}}>累積距離記帳</IconLetter>},
        {tabId: 'eigyosho', label: <IconLetter {...{Icon: JapaneseYenIcon}}>営業所別売上</IconLetter>},
        {tabId: 'etc', label: <IconLetter {...{Icon: JapaneseYenIcon}}>ETC明細連携</IconLetter>},
        {tabId: 'kyuyo', label: <IconLetter {...{Icon: JapaneseYenIcon}}>給与</IconLetter>},
        {tabId: 'simpleDriveHistory', label: <IconLetter {...{Icon: FileText}}>簡易走行記録（PDF）</IconLetter>},
      ],
    },

    {
      tabId: '',
      label: 'マイページ',
      children: [
        //
        {tabId: 'driveInput', label: <IconLetter {...{Icon: Truck}}>運行入力</IconLetter>},
        {tabId: 'myPage', label: <IconLetter {...{Icon: Check}}>実績確認</IconLetter>},
      ],
    },
    // {tabId: 'tbmOperation', label: '運行履歴'},

    {
      tabId: '',
      label: 'マスタ設定',
      children: [
        {tabId: 'calendar', label: 'カレンダー'},
        {tabId: 'tbmBase', label: '営業所'},
        {tabId: 'user', label: '従業員'},
        {tabId: 'tbmVehicle', label: '車両'},
        // {tabId: 'user', label: 'ドライバー'},
        // {tabId: 'tbmProduct', label: '商品'},
        // {tabId: 'tbmVehicle', label: '車両'},
        // {tabId: 'tbmBillingAddress', label: '請求先支社'},

        // {tabId: 'tbmRouteGroup', label: 'ルートグループ'},
        // {tabId: 'tbmRoute', label: 'ルート'},
      ],
    },
    {
      tabId: '',
      label: '履歴',
      children: [
        //

        // {tabId: 'tbmDriveSchedule', label: '走行履歴'},
        {tabId: 'tbmVehicle', label: '全車両一覧'},
        {tabId: 'tbmRefuelHistory', label: '給油履歴'},
        {tabId: 'tbmCarWashHistory', label: '洗車履歴'},
      ],
    },
  ].map(item => ({...item, exclusiveTo: scopes.login, ROOT: [rootPath]}))

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
