'use client'

import React, {useState, useEffect, useMemo} from 'react'
import {
  Search,
  PlusCircle,
  Trash2,
  Edit,
  CheckSquare,
  Square,
  MapPin,
  Map,
  ShoppingCart,
  TrendingUp,
  Users,
  Package,
  DollarSign,
  Settings,
} from 'lucide-react'
import {formatPhoneNumber} from '../../utils/phoneUtils'

import {
  getReservations,
  getAllCustomers,
  getVisibleProducts,
  upsertReservation,
  deleteReservation,
} from '../../(builders)/serverActions'
import {Reservation, Customer, Product, ReservationFilter} from '../../types'
import {
  ORDER_CHANNEL_OPTIONS,
  PURPOSE_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  PICKUP_LOCATION_OPTIONS,
} from '../../(constants)'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import useModal from '@cm/components/utils/modal/useModal'
import {Padding, R_Stack} from '@cm/components/styles/common-components/common-components'
import {cn} from '@cm/shadcn/lib/utils'
import ReservationMapModal from '../../components/ReservationMapModal'
import {ReservationModal} from '@app/(apps)/sbm/(pages)/reservations/ReservationModal'
import {PhoneNumberTemp} from '@app/(apps)/sbm/components/CustomerPhoneManager'

export default function ReservationPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const [filters, setFilters] = useState<ReservationFilter>({
    startDate: formatDate(new Date()),
    endDate: formatDate(new Date()),
    keyword: '',
    pickupLocation: undefined,
    orderChannel: undefined,
    purpose: undefined,
    paymentMethod: undefined,
    deliveryCompleted: undefined,
    recoveryCompleted: undefined,
  })

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  // 地図モーダル関連
  const [showMapModal, setShowMapModal] = useState(false)
  const [selectedReservationForMap, setSelectedReservationForMap] = useState<Reservation | null>(null)

  // 列表示設定
  const [columnVisibility, setColumnVisibility] = useState({
    deliveryDate: true,
    customerInfo: true,
    contact: true,
    address: true,
    pickupLocation: true,
    purpose: true,
    paymentMethod: true,
    orderChannel: true,
    productDetails: true,
    priceDetails: true,
    staff: true,
    progress: true,
    notes: true,
    timestamps: true,
  })

  const EditReservationModalReturn = useModal()
  const DeleteReservationModalReturn = useModal()

  // 統計情報を計算
  const statistics = useMemo(() => {
    const totalReservations = reservations.length
    const totalAmount = reservations.reduce((sum, r) => sum + (r.totalAmount || 0), 0)
    const totalFinalAmount = reservations.reduce((sum, r) => sum + (r.finalAmount || 0), 0)
    const totalPointsUsed = reservations.reduce((sum, r) => sum + (r.pointsUsed || 0), 0)

    const deliveryCompleted = reservations.filter(
      r => r.deliveryCompleted || r.tasks?.some(task => task.taskType === 'delivery' && task.isCompleted)
    ).length

    const recoveryCompleted = reservations.filter(
      r => r.recoveryCompleted || r.tasks?.some(task => task.taskType === 'recovery' && task.isCompleted)
    ).length

    const uniqueCustomers = new Set(reservations.map(r => r.customerName)).size
    const totalItems = reservations.reduce(
      (sum, r) => sum + (r.items?.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0) || 0),
      0
    )

    // 受取方法別の統計
    const pickupStats = reservations.reduce(
      (stats, r) => {
        const location = r.pickupLocation || 'その他'
        stats[location] = (stats[location] || 0) + 1
        return stats
      },
      {} as Record<string, number>
    )

    // 用途別の統計
    const purposeStats = reservations.reduce(
      (stats, r) => {
        const purpose = r.purpose || 'その他'
        stats[purpose] = (stats[purpose] || 0) + 1
        return stats
      },
      {} as Record<string, number>
    )

    // 支払方法別の統計
    const paymentStats = reservations.reduce(
      (stats, r) => {
        const method = r.paymentMethod || 'その他'
        stats[method] = (stats[method] || 0) + 1
        return stats
      },
      {} as Record<string, number>
    )

    return {
      totalReservations,
      totalAmount,
      totalFinalAmount,
      totalPointsUsed,
      deliveryCompleted,
      recoveryCompleted,
      deliveryRate: totalReservations > 0 ? Math.round((deliveryCompleted / totalReservations) * 100) : 0,
      recoveryRate: totalReservations > 0 ? Math.round((recoveryCompleted / totalReservations) * 100) : 0,
      uniqueCustomers,
      totalItems,
      averageOrderValue: totalReservations > 0 ? Math.round(totalFinalAmount / totalReservations) : 0,
      pickupStats,
      purposeStats,
      paymentStats,
    }
  }, [reservations])

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    loadReservations()
  }, [filters])

  const loadData = async () => {
    try {
      const [customersData, productsData] = await Promise.all([getAllCustomers(), getVisibleProducts()])
      setCustomers(customersData)
      setProducts(productsData)
      await loadReservations()
    } catch (error) {
      console.error('データの読み込みに失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadReservations = async () => {
    try {
      const data = await getReservations(filters)
      setReservations(data as Reservation[])
    } catch (error) {
      console.error('予約データの読み込みに失敗しました:', error)
    }
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {name, value, type} = e.target
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value === '' ? undefined : value,
    }))
  }

  const handleClearFilters = () => {
    setFilters({
      startDate: formatDate(new Date()),
      endDate: formatDate(new Date()),
      keyword: '',
      pickupLocation: undefined,
      orderChannel: undefined,
      purpose: undefined,
      paymentMethod: undefined,
      deliveryCompleted: undefined,
      recoveryCompleted: undefined,
    })
  }

  const handleSave = async (reservationData: Partial<Reservation & {phones: PhoneNumberTemp[]}>) => {
    try {
      // 既存の予約を編集する場合はIDを設定
      if (EditReservationModalReturn.open?.reservation) {
        reservationData.id = EditReservationModalReturn.open.reservation.id
      }

      // 統合されたupsertReservation関数を使用
      await upsertReservation(reservationData)

      await loadReservations()
      EditReservationModalReturn.handleClose()
    } catch (error) {
      console.error('保存に失敗しました:', error)
    }
  }

  const handleDelete = async () => {
    if (DeleteReservationModalReturn.open?.reservation) {
      try {
        await deleteReservation(Number(DeleteReservationModalReturn.open.reservation.id))
        await loadReservations()
        DeleteReservationModalReturn.handleClose()
      } catch (error) {
        console.error('削除に失敗しました:', error)
      }
    }
  }

  // 地図関連の処理
  const handleShowSingleMap = (reservation: Reservation) => {
    setSelectedReservationForMap(reservation)
    setShowMapModal(true)
  }

  const handleShowMultipleMap = () => {
    setSelectedReservationForMap(null)
    setShowMapModal(true)
  }

  const handleCloseMap = () => {
    setShowMapModal(false)
    setSelectedReservationForMap(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">予約管理</h1>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleShowMultipleMap}
            disabled={reservations.length === 0}
            className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Map size={20} className="mr-2" />
            地図表示
          </button>
          <button
            onClick={() => EditReservationModalReturn.handleOpen({reservation: null})}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors"
          >
            <PlusCircle size={20} className="mr-2" />
            新規予約
          </button>
        </div>
      </div>

      {/* フィルター */}
      <div className="bg-white p-4 rounded-lg shadow">
        {/* 基本フィルター */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">開始日</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">終了日</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">キーワード検索</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                name="keyword"
                placeholder="顧客名、担当者名、備考で検索..."
                value={filters.keyword}
                onChange={handleFilterChange}
                className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* 詳細フィルター */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">受取方法</label>
              <select
                name="pickupLocation"
                value={filters.pickupLocation || ''}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">すべて</option>
                {PICKUP_LOCATION_OPTIONS.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">用途</label>
              <select
                name="purpose"
                value={filters.purpose || ''}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">すべて</option>
                {PURPOSE_OPTIONS.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">支払方法</label>
              <select
                name="paymentMethod"
                value={filters.paymentMethod || ''}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">すべて</option>
                {PAYMENT_METHOD_OPTIONS.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">注文経路</label>
              <select
                name="orderChannel"
                value={filters.orderChannel || ''}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">すべて</option>
                {ORDER_CHANNEL_OPTIONS.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">配達状況</label>
              <select
                name="deliveryCompleted"
                value={filters.deliveryCompleted === undefined ? '' : filters.deliveryCompleted.toString()}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">すべて</option>
                <option value="true">配達済み</option>
                <option value="false">未配達</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">回収状況</label>
              <select
                name="recoveryCompleted"
                value={filters.recoveryCompleted === undefined ? '' : filters.recoveryCompleted.toString()}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">すべて</option>
                <option value="true">回収済み</option>
                <option value="false">未回収</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 予約一覧 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table
            className={cn(
              //
              'w-full text-sm text-left text-gray-500',
              '[&_td]:p-2'
            )}
          >
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                {columnVisibility.deliveryDate && <th className="px-3 py-3 min-w-[120px]">納品日時</th>}
                {columnVisibility.customerInfo && <th className="px-3 py-3 min-w-[150px]">顧客情報</th>}
                {/* {columnVisibility.contact && <th className="px-3 py-3 min-w-[120px]"></th>} */}
                {columnVisibility.address && <th className="px-3 py-3 min-w-[200px]">連絡先/配送先</th>}
                {columnVisibility.pickupLocation && <th className="px-3 py-3 min-w-[80px]">受取方法</th>}
                {columnVisibility.purpose && <th className="px-3 py-3 min-w-[80px]">用途</th>}
                {columnVisibility.paymentMethod && <th className="px-3 py-3 min-w-[100px]">支払方法</th>}
                {columnVisibility.orderChannel && <th className="px-3 py-3 min-w-[80px]">注文経路</th>}
                {columnVisibility.productDetails && <th className="px-3 py-3 min-w-[200px]">商品詳細</th>}
                {columnVisibility.priceDetails && <th className="px-3 py-3 min-w-[120px]">金額詳細</th>}
                {columnVisibility.staff && <th className="px-3 py-3 min-w-[80px]">担当者</th>}
                {columnVisibility.progress && <th className="px-3 py-3 min-w-[80px]">進捗</th>}
                {columnVisibility.notes && <th className="px-3 py-3 min-w-[150px]">備考</th>}
                {columnVisibility.timestamps && <th className="px-3 py-3 min-w-[120px]">登録・更新</th>}
                <th className="px-3 py-3 min-w-[80px]">操作</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map(reservation => (
                <tr key={reservation.id} className="bg-white border-b hover:bg-gray-50">
                  {/* 納品日時 */}
                  <td>
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{formatDate(reservation.deliveryDate, 'MM/DD')}</div>
                      <div className="text-gray-500">{formatDate(reservation.deliveryDate, 'HH:mm')}</div>
                    </div>
                  </td>

                  {/* 顧客情報 */}
                  <td>
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{reservation.customerName}</div>
                      {reservation.contactName && <div className="text-gray-500">担当: {reservation.contactName}</div>}
                    </div>
                  </td>

                  {/* 配送先 */}
                  <td>
                    <div className="text-sm text-gray-900">
                      <div>
                        {reservation.postalCode && <div>〒{reservation.postalCode}</div>}
                        <div>
                          {reservation.prefecture}
                          {reservation.city}
                          {reservation.street}
                        </div>
                        {reservation.building && <div className="text-gray-500">{reservation.building}</div>}
                      </div>
                      <div className=" text-gray-700 text-xs">{formatPhoneNumber(reservation.phoneNumber || '')}</div>
                    </div>
                  </td>

                  {/* 受取方法 */}
                  <td>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        reservation.pickupLocation === '配達' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {reservation.pickupLocation}
                    </span>
                  </td>

                  {/* 用途 */}
                  <td>
                    <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">{reservation.purpose}</span>
                  </td>

                  {/* 支払方法 */}
                  <td>
                    <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                      {reservation.paymentMethod}
                    </span>
                  </td>

                  {/* 注文経路 */}
                  <td>
                    <span className="px-2 py-1 text-xs bg-teal-100 text-teal-800 rounded-full">{reservation.orderChannel}</span>
                  </td>

                  {/* 商品詳細 */}
                  <td>
                    <div className="text-sm ">
                      {reservation.items?.map((item, index) => (
                        <R_Stack key={index} className="mb-1 flex-nowrap justify-between">
                          <div className="font-medium text-gray-900 ">
                            ・{item.productName} x{item.quantity}
                          </div>
                          {/* <div className="text-gray-500 text-xs ml-4 ">
                            ¥{item.unitPrice?.toLocaleString()} × {item.quantity} = ¥{item.totalPrice?.toLocaleString()}
                          </div> */}
                        </R_Stack>
                      ))}
                    </div>
                  </td>

                  {/* 金額詳細 */}
                  <td>
                    <div className="text-sm">
                      <div className="font-semibold text-gray-900">合計: ¥{reservation.totalAmount?.toLocaleString()}</div>
                      {(reservation.pointsUsed || 0) > 0 && (
                        <div className="text-red-600">ポイント: -¥{reservation.pointsUsed?.toLocaleString()}</div>
                      )}
                      <div className="font-semibold text-blue-600">支払: ¥{reservation.finalAmount?.toLocaleString()}</div>
                    </div>
                  </td>

                  {/* 担当者 */}
                  <td className="px-3 py-4 text-sm text-gray-900">{reservation.orderStaff}</td>

                  {/* 進捗 */}
                  <td>
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-1">
                        {reservation.deliveryCompleted ||
                        reservation.tasks?.some(task => task.taskType === 'delivery' && task.isCompleted) ? (
                          <CheckSquare size={16} className="text-green-500" />
                        ) : (
                          <Square size={16} className="text-gray-300" />
                        )}
                        <span className="text-xs text-gray-600">配達</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {reservation.recoveryCompleted ||
                        reservation.tasks?.some(task => task.taskType === 'recovery' && task.isCompleted) ? (
                          <CheckSquare size={16} className="text-green-500" />
                        ) : (
                          <Square size={16} className="text-gray-300" />
                        )}
                        <span className="text-xs text-gray-600">回収</span>
                      </div>
                    </div>
                  </td>

                  {/* 備考 */}
                  <td>
                    <div className="text-sm text-gray-600 max-w-xs">
                      {reservation.notes && (
                        <div className="truncate" title={reservation.notes}>
                          {reservation.notes}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* 登録・更新 */}
                  <td>
                    <div className="text-xs text-gray-500">
                      <div>登録: {formatDate(reservation.createdAt, 'MM/dd HH:mm')}</div>
                      <div>更新: {formatDate(reservation.updatedAt, 'MM/dd HH:mm')}</div>
                    </div>
                  </td>

                  {/* 操作 */}
                  <td>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleShowSingleMap(reservation)}
                        className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                        title="地図表示"
                        disabled={!reservation.prefecture || !reservation.city}
                      >
                        <MapPin size={16} />
                      </button>
                      <button
                        onClick={() => EditReservationModalReturn.handleOpen({reservation})}
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                        title="編集"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => DeleteReservationModalReturn.handleOpen({reservation})}
                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                        title="削除"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {reservations.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">条件に一致する予約がありません</p>
          </div>
        )}
      </div>

      {/* 予約フォームモーダル */}
      <EditReservationModalReturn.Modal>
        <ReservationModal
          reservation={EditReservationModalReturn.open?.reservation}
          customers={customers}
          products={products}
          handleSave={handleSave}
          onClose={EditReservationModalReturn.handleClose}
        />
      </EditReservationModalReturn.Modal>

      {/* 削除確認モーダル */}
      <DeleteReservationModalReturn.Modal>
        <Padding>
          <ConfirmModal
            title="予約の削除"
            message="この予約を完全に削除します。この操作は元に戻せません。"
            onConfirm={handleDelete}
            onClose={() => DeleteReservationModalReturn.handleClose()}
          />
        </Padding>
      </DeleteReservationModalReturn.Modal>

      {/* 地図モーダル */}
      <ReservationMapModal
        reservations={reservations}
        isOpen={showMapModal}
        onClose={handleCloseMap}
        selectedReservation={selectedReservationForMap}
      />
    </div>
  )
}

// 確認モーダル
const ConfirmModal = ({
  title,
  message,
  onConfirm,
  onClose,
}: {
  title: string
  message: string
  onConfirm: () => void
  onClose: () => void
}) => (
  <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{message}</p>
      <div className="flex justify-end space-x-4">
        <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
          キャンセル
        </button>
        <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
          削除
        </button>
      </div>
    </div>
  </div>
)

const Statistics = ({statistics}: {statistics: any}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      基本統計
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">総予約数</dt>
              <dd className="text-lg font-medium text-gray-900">{statistics.totalReservations}件</dd>
            </dl>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <div>
            配達完了: {statistics.deliveryCompleted}件 ({statistics.deliveryRate}%)
          </div>
          <div>
            回収完了: {statistics.recoveryCompleted}件 ({statistics.recoveryRate}%)
          </div>
        </div>
      </div>
      {/* 顧客・商品統計 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Users className="h-8 w-8 text-green-600" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">ユニーク顧客</dt>
              <dd className="text-lg font-medium text-gray-900">{statistics.uniqueCustomers}社</dd>
            </dl>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <div className="flex items-center">
            <Package className="h-4 w-4 mr-1" />
            総商品数: {statistics.totalItems}個
          </div>
        </div>
      </div>
      {/* 金額統計 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <DollarSign className="h-8 w-8 text-yellow-600" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">総売上</dt>
              <dd className="text-lg font-medium text-gray-900">¥{statistics.totalFinalAmount.toLocaleString()}</dd>
            </dl>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <div>平均単価: ¥{statistics.averageOrderValue.toLocaleString()}</div>
          <div>ポイント使用: ¥{statistics.totalPointsUsed.toLocaleString()}</div>
        </div>
      </div>
      {/* カテゴリー別統計 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <ShoppingCart className="h-8 w-8 text-purple-600" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">分類別</dt>
            </dl>
          </div>
        </div>
        <div className="space-y-2 text-sm text-gray-600">
          <div>
            <div className="font-medium text-gray-700 mb-1">受取方法</div>
            {Object.entries(statistics.pickupStats).map(([key, value]: [string, number]) => (
              <div key={key} className="flex justify-between">
                <span>{key}:</span>
                <span>{value}件</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-2">
            <div className="font-medium text-gray-700 mb-1">用途</div>
            {Object.entries(statistics.purposeStats)
              .slice(0, 3)
              .map(([key, value]: [string, number]) => (
                <div key={key} className="flex justify-between">
                  <span>{key}:</span>
                  <span>{value}件</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const TableConfig = ({
  showAdvancedFilters,
  setShowAdvancedFilters,
  showColumnSettings,
  setShowColumnSettings,
  columnVisibility,
  toggleColumnVisibility,
  columnLabels,
}: {
  showAdvancedFilters: boolean
  setShowAdvancedFilters: (show: boolean) => void
  showColumnSettings: boolean
  setShowColumnSettings: (show: boolean) => void
  columnVisibility: any
  toggleColumnVisibility: (key: string) => void
  columnLabels: any
}) => {
  return (
    <div className="flex items-center justify-between border-t pt-4">
      <div className="flex items-center space-x-4">
        <button
          type="button"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          <span>{showAdvancedFilters ? '詳細フィルターを隠す' : '詳細フィルターを表示'}</span>
          <svg
            className={`ml-1 h-4 w-4 transform transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* 列設定ボタン */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowColumnSettings(!showColumnSettings)}
            className="flex items-center text-sm text-purple-600 hover:text-purple-800"
          >
            <Settings size={16} className="mr-1" />
            <span>表示設定</span>
          </button>

          {/* 列設定ドロップダウン */}
          {showColumnSettings && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-10">
              <div className="p-3">
                <div className="text-sm font-medium text-gray-700 mb-3">表示する列を選択</div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(columnLabels).map(([key, label]) => (
                    <label key={key} className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={columnVisibility[key as keyof typeof columnVisibility]}
                        onChange={() => toggleColumnVisibility(key as string)}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="truncate">{label as string}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowColumnSettings(false)}
                    className="w-full text-sm text-center text-gray-600 hover:text-gray-800"
                  >
                    閉じる
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
