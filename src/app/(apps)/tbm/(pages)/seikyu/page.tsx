import InvoiceViewer from '@app/(apps)/tbm/(components)/InvoiceViewer'
import CustomerSelector from '@app/(apps)/tbm/(components)/CustomerSelector'
import {getInvoiceData} from '@app/(apps)/tbm/(server-actions)/getInvoiceData'
import {getMidnight} from '@cm/class/Days/date-utils/calculations'
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

  console.log(whereQuery) //////logs

  // 顧客IDをクエリパラメータから取得（オプション）
  const customerId = query.customerId ? parseInt(query.customerId) : undefined

  // 顧客一覧を取得
  const customers = await prisma.tbmCustomer.findMany({
    where: {tbmBaseId},
    orderBy: {name: 'asc'},
    select: {id: true, name: true},
  })

  try {
    const invoiceData = await getInvoiceData({
      whereQuery,
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
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-semibold">エラーが発生しました</h3>
          <p className="text-red-600 mt-2">請求書データの取得に失敗しました。データの設定を確認してください。</p>
        </div>
      </FitMargin>
    )
  }
}
