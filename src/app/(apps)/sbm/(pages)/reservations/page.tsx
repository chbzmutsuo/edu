'use client'

import React, {useState, useEffect, useMemo} from 'react'
import {Search, PlusCircle, Trash2, Edit, CheckSquare, Square, X} from 'lucide-react'
import {
  getReservations,
  getAllCustomers,
  getAllProducts,
  createReservation,
  updateReservation,
  deleteReservation,
  lookupCustomerByPhone,
  lookupAddressByPostalCode,
} from '../../(builders)/serverActions'
import {Reservation, Customer, Product, ReservationFilter} from '../../types'
import {
  ORDER_CHANNEL_OPTIONS,
  PURPOSE_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  PICKUP_LOCATION_OPTIONS,
  DEFAULT_RESERVATION_STATE,
} from '../../(constants)'
import {formatDate, formatDateTime, formatTime} from '@cm/class/Days/date-utils/formatters'
import {useIsMobile} from '@cm/shadcn/hooks/use-mobile'

export default function ReservationPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [filters, setFilters] = useState<ReservationFilter>({
    startDate: formatDate(new Date()),
    endDate: formatDate(new Date()),
    keyword: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    loadReservations()
  }, [filters])

  const loadData = async () => {
    try {
      const [customersData, productsData] = await Promise.all([getAllCustomers(), getAllProducts()])
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
      setReservations(data)
    } catch (error) {
      console.error('予約データの読み込みに失敗しました:', error)
    }
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({...prev, [e.target.name]: e.target.value}))
  }

  const openModal = (reservation: Reservation | null = null) => {
    setEditingReservation(reservation)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingReservation(null)
  }

  const handleSave = async (reservationData: Partial<Reservation>) => {
    try {
      if (editingReservation) {
        await updateReservation(editingReservation.id, reservationData)
      } else {
        await createReservation(reservationData as any)
      }
      await loadReservations()
      closeModal()
    } catch (error) {
      console.error('保存に失敗しました:', error)
    }
  }

  const handleDelete = async () => {
    if (deletingId) {
      try {
        await deleteReservation(deletingId)
        await loadReservations()
        setDeletingId(null)
      } catch (error) {
        console.error('削除に失敗しました:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">予約管理</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors"
        >
          <PlusCircle size={20} className="mr-2" />
          新規予約
        </button>
      </div>

      {/* フィルター */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">キーワード検索</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                name="keyword"
                placeholder="顧客名、担当者名で検索..."
                value={filters.keyword}
                onChange={handleFilterChange}
                className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 予約一覧 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">納品日時</th>
                <th className="px-6 py-3">顧客名</th>
                <th className="px-6 py-3">受取方法</th>
                <th className="px-6 py-3">合計金額</th>
                <th className="px-6 py-3">担当者</th>
                <th className="px-6 py-3">タスク</th>
                <th className="px-6 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map(reservation => (
                <tr key={reservation.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{formatDateTime(reservation.deliveryDate)}</td>
                  <td className="px-6 py-4 font-medium">{reservation.customerName}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        reservation.pickupLocation === '配達' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {reservation.pickupLocation}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold">¥{reservation.totalAmount.toLocaleString()}</td>
                  <td className="px-6 py-4">{reservation.orderStaff}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {reservation.tasks.delivered ? (
                        <CheckSquare size={18} className="text-green-500" />
                      ) : (
                        <Square size={18} className="text-gray-300" />
                      )}
                      {reservation.tasks.collected ? (
                        <CheckSquare size={18} className="text-green-500" />
                      ) : (
                        <Square size={18} className="text-gray-300" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <button onClick={() => openModal(reservation)} className="text-blue-600 hover:text-blue-800" title="編集">
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => setDeletingId(reservation.id)}
                        className="text-red-600 hover:text-red-800"
                        title="削除"
                      >
                        <Trash2 size={18} />
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
      {isModalOpen && (
        <ReservationModal
          reservation={editingReservation}
          customers={customers}
          products={products}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}

      {/* 削除確認モーダル */}
      {deletingId && (
        <ConfirmModal
          title="予約の削除"
          message="この予約を完全に削除します。この操作は元に戻せません。"
          onConfirm={handleDelete}
          onClose={() => setDeletingId(null)}
        />
      )}
    </div>
  )
}

// 予約フォームモーダル
const ReservationModal = ({
  reservation,
  customers,
  products,
  onSave,
  onClose,
}: {
  reservation: Reservation | null
  customers: Customer[]
  products: Product[]
  onSave: (data: Partial<Reservation>) => void
  onClose: () => void
}) => {
  const isMobile = useIsMobile()
  const [formData, setFormData] = useState<any>(() => {
    if (reservation) {
      return {
        ...reservation,
        deliveryDate: formatDate(reservation.deliveryDate),
        deliveryTime: formatTime(reservation.deliveryDate),
      }
    }
    return {
      ...DEFAULT_RESERVATION_STATE,
      deliveryDate: formatDate(new Date()),
      deliveryTime: '12:00',
    }
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const {name, value, type} = e.target
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // 日付と時間を結合
    const deliveryDateTime = new Date(`${formData.deliveryDate}T${formData.deliveryTime}`)

    const saveData = {
      ...formData,
      deliveryDate: deliveryDateTime,
    }

    onSave(saveData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">{reservation ? '予約編集' : '新規予約'}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 顧客情報 */}
            <fieldset className="p-4 border rounded-lg">
              <legend className="px-2 font-semibold text-gray-900">顧客情報</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">会社・団体名 *</label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">担当者名</label>
                  <input
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">配達先住所</label>
                  <input
                    type="text"
                    name="deliveryAddress"
                    value={formData.deliveryAddress}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </fieldset>

            {/* 予約詳細 */}
            <fieldset className="p-4 border rounded-lg">
              <legend className="px-2 font-semibold text-gray-900">予約詳細</legend>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">納品日 *</label>
                  <input
                    type="date"
                    name="deliveryDate"
                    value={formData.deliveryDate}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">納品時間 *</label>
                  <input
                    type="time"
                    name="deliveryTime"
                    value={formData.deliveryTime}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">受取方法</label>
                  <select
                    name="pickupLocation"
                    value={formData.pickupLocation}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
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
                    value={formData.purpose}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
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
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
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
                    value={formData.orderChannel}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {ORDER_CHANNEL_OPTIONS.map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">担当者</label>
                  <input
                    type="text"
                    name="orderStaff"
                    value={formData.orderStaff}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ポイント使用</label>
                  <input
                    type="number"
                    name="pointUsage"
                    value={formData.pointUsage}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </fieldset>

            {/* アクションボタン */}
            <div className="flex justify-end space-x-4 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                キャンセル
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                保存
              </button>
            </div>
          </form>
        </div>
      </div>
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
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            キャンセル
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
            削除
          </button>
        </div>
      </div>
    </div>
  </div>
)
