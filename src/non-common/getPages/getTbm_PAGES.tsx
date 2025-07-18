import IconLetter from '@components/styles/common-components/IconLetter'
import {
  Calculator,
  JapaneseYenIcon,
  FileText,
  Truck,
  ListIcon,
  Settings,
  Calendar,
  Building,
  Users,
  Car,
  History,
  Fuel,
  Droplets,
} from 'lucide-react'

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
        {tabId: 'kyuyo', label: <IconLetter {...{Icon: JapaneseYenIcon}}>給与</IconLetter>},
        {tabId: 'simpleDriveHistory', label: <IconLetter {...{Icon: FileText}}>簡易走行記録（PDF）</IconLetter>},
      ],
    },

    {
      tabId: '',
      label: <IconLetter {...{Icon: Users}}>マイページ</IconLetter>,
      children: [
        //
        {tabId: 'driveInput', label: <IconLetter {...{Icon: Truck}}>運行入力</IconLetter>},
        // {tabId: 'myPage', label: <IconLetter {...{Icon: Check}}>実績確認</IconLetter>},
      ],
    },

    {
      tabId: '',
      label: <IconLetter {...{Icon: Settings}}>共通設定</IconLetter>,
      children: [{tabId: 'calendar', label: <IconLetter {...{Icon: Calendar}}>カレンダー</IconLetter>}],
    },
    {
      tabId: '',
      label: <IconLetter {...{Icon: ListIcon}}>一覧</IconLetter>,
      children: [
        //
        {tabId: 'tbmBase', label: <IconLetter {...{Icon: Building}}>営業所</IconLetter>},
        {tabId: 'user', label: <IconLetter {...{Icon: Users}}>従業員</IconLetter>},
        {tabId: 'tbmVehicle', label: <IconLetter {...{Icon: Car}}>車両</IconLetter>},
        {tabId: 'tbmDriveSchedule', label: <IconLetter {...{Icon: History}}>運行履歴</IconLetter>},
        {tabId: 'tbmRefuelHistory', label: <IconLetter {...{Icon: Fuel}}>給油履歴</IconLetter>},
        {tabId: 'tbmCarWashHistory', label: <IconLetter {...{Icon: Droplets}}>洗車履歴</IconLetter>},
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
