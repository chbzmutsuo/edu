import InvoiceViewer from '@app/(apps)/tbm/(components)/InvoiceViewer'
import CustomerSelector from '@app/(apps)/tbm/(components)/CustomerSelector'
import {getInvoiceData} from '@app/(apps)/tbm/(server-actions)/getInvoiceData'
import {FitMargin} from '@cm/components/styles/common-components/common-components'
import NewDateSwitcher from '@cm/components/utils/dates/DateSwitcher/NewDateSwitcher'
import Redirector from '@cm/components/utils/Redirector'
import {dateSwitcherTemplate} from '@cm/lib/methods/redirect-method'
import {initServerComopnent} from 'src/non-common/serverSideFunction'
import prisma from 'src/lib/prisma'

export default async function Page(props) {
  const query = await props.searchParams
  const {session, scopes} = await initServerComopnent({query})
  const {tbmBaseId} = scopes.getTbmScopes()
  const {redirectPath, whereQuery} = await dateSwitcherTemplate({query})
  if (redirectPath) return <Redirector {...{redirectPath}} />

  // 顧客IDをクエリパラメータから取得（必須）
  const customerId = query.customerId ? parseInt(query.customerId) : undefined

  // 顧客一覧を取得（便設定経由で関連する顧客を取得）
  const customersFromRoutes = await prisma.mid_TbmRouteGroup_TbmCustomer.findMany({
    where: {
      TbmRouteGroup: {
        tbmBaseId: tbmBaseId,
      },
    },
    select: {
      TbmCustomer: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    distinct: ['tbmCustomerId'],
  })

  // 重複を除去して顧客リストを作成
  const customers = customersFromRoutes
    .map(item => item.TbmCustomer)
    .filter(customer => customer.name) // nameが存在するもののみ
    .sort((a, b) => a.name.localeCompare(b.name))

  // 顧客データが存在しない場合の処理
  if (customers.length === 0) {
    return (
      <FitMargin className="pt-4">
        <div className="mb-4">
          <NewDateSwitcher monthOnly={true} />
        </div>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-yellow-800 font-semibold">顧客データが見つかりません</h3>
          <p className="text-yellow-600 mt-2">
            この営業所に紐づく顧客データが登録されていません。営業所設定で顧客マスタを登録してください。
          </p>
        </div>
      </FitMargin>
    )
  }

  // 顧客が選択されていない場合は選択画面を表示
  if (!customerId) {
    return (
      <FitMargin className="pt-4">
        <div className="mb-4">
          <NewDateSwitcher monthOnly={true} />
        </div>
        <CustomerSelector customers={customers} currentCustomerId={customerId} />
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-blue-800 font-semibold">顧客を選択してください</h3>
          <p className="text-blue-600 mt-2">請求書を作成する顧客を上記のドロップダウンから選択してください。</p>
        </div>
      </FitMargin>
    )
  }

  // whereQueryの型安全性を確保
  if (!whereQuery?.gte || !whereQuery?.lte) {
    throw new Error('日付の設定が不正です')
  }

  try {
    const invoiceData = await getInvoiceData({
      whereQuery: {gte: whereQuery.gte, lte: whereQuery.lte},
      tbmBaseId,
      customerId,
    })

    return (
      <FitMargin className="pt-4">
        <div className="mb-4">
          <NewDateSwitcher monthOnly={true} />
        </div>

        <CustomerSelector customers={customers} currentCustomerId={customerId} />

        <InvoiceViewer invoiceData={invoiceData} />
      </FitMargin>
    )
  } catch (error) {
    console.error('請求書データの取得に失敗しました:', error)
    return (
      <FitMargin className="pt-4">
        <div className="mb-4">
          <NewDateSwitcher monthOnly={true} />
        </div>
        <CustomerSelector customers={customers} currentCustomerId={customerId} />
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-semibold">エラーが発生しました</h3>
          <p className="text-red-600 mt-2">
            {error instanceof Error ? error.message : '請求書データの取得に失敗しました。データの設定を確認してください。'}
          </p>
        </div>
      </FitMargin>
    )
  }
}
