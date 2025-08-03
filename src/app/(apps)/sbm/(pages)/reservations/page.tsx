'use client'

import React, {useState, useEffect} from 'react'
import {Search, PlusCircle, Trash2, Edit, CheckSquare, Square, Phone, MapPin, ShoppingCart, AlertCircle} from 'lucide-react'
import {
  getReservations,
  getAllCustomers,
  getAllProducts,
  createReservation,
  updateReservation,
  deleteReservation,
  getCustomerByPhone,
  createOrUpdateCustomer,
} from '../../(builders)/serverActions'
import {Reservation, Customer, Product, ReservationFilter, ReservationItem} from '../../types'
import {
  ORDER_CHANNEL_OPTIONS,
  PURPOSE_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  PICKUP_LOCATION_OPTIONS,
  DEFAULT_RESERVATION_STATE,
} from '../../(constants)'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {useIsMobile} from '@cm/shadcn/hooks/use-mobile'
import useModal from '@cm/components/utils/modal/useModal'
import {Padding} from '@cm/components/styles/common-components/common-components'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'

export default function ReservationPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const [filters, setFilters] = useState<ReservationFilter>({
    startDate: formatDate(new Date()),
    endDate: formatDate(new Date()),
    keyword: '',
  })

  const EditReservationModalReturn = useModal()
  const DeleteReservationModalReturn = useModal()

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
      setReservations(data as Reservation[])
    } catch (error) {
      console.error('予約データの読み込みに失敗しました:', error)
    }
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({...prev, [e.target.name]: e.target.value}))
  }

  const handleSave = async (reservationData: Partial<Reservation>) => {
    try {
      if (EditReservationModalReturn.open?.reservation) {
        await updateReservation(Number(EditReservationModalReturn.open.reservation.id), reservationData)
      } else {
        await createReservation(reservationData as any)
      }
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
          onClick={() => EditReservationModalReturn.handleOpen({reservation: null})}
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
                  <td className="px-6 py-4">{formatDate(reservation.deliveryDate)}</td>
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
                  <td className="px-6 py-4 font-semibold">¥{reservation.totalAmount?.toLocaleString()}</td>
                  <td className="px-6 py-4">{reservation.orderStaff}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {reservation.tasks?.some(task => task.taskType === 'delivery' && task.isCompleted) ? (
                        <CheckSquare size={18} className="text-green-500" />
                      ) : (
                        <Square size={18} className="text-gray-300" />
                      )}
                      {reservation.tasks?.some(task => task.taskType === 'recovery' && task.isCompleted) ? (
                        <CheckSquare size={18} className="text-green-500" />
                      ) : (
                        <Square size={18} className="text-gray-300" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => EditReservationModalReturn.handleOpen({reservation})}
                        className="text-blue-600 hover:text-blue-800"
                        title="編集"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => DeleteReservationModalReturn.handleOpen({reservation})}
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
      <EditReservationModalReturn.Modal>
        <ReservationModal
          reservation={EditReservationModalReturn.open?.reservation}
          customers={customers}
          products={products}
          onSave={handleSave}
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
  const {session} = useGlobal()
  const isMobile = useIsMobile()
  const [formData, setFormData] = useState<any>(() => {
    if (reservation) {
      return {
        ...reservation,
        deliveryDate: formatDate(reservation.deliveryDate),
        deliveryTime: formatDate(reservation.deliveryDate, 'HH:mm'),
        selectedItems: reservation.items || [],
      }
    }
    return {
      ...DEFAULT_RESERVATION_STATE,
      deliveryDate: formatDate(new Date()),
      deliveryTime: '12:00',
      selectedItems: [],
    }
  })

  const [isLoadingCustomer, setIsLoadingCustomer] = useState(false)
  const [customerFound, setCustomerFound] = useState<Customer | null>(null)
  const [showCustomerUpdateDialog, setShowCustomerUpdateDialog] = useState(false)
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([])

  // 電話番号から顧客情報を取得
  const handlePhoneNumberLookup = async () => {
    if (!formData.phoneNumber) {
      alert('電話番号を入力してください')
      return
    }

    setIsLoadingCustomer(true)
    try {
      const customer = await getCustomerByPhone(formData.phoneNumber)
      if (customer) {
        setCustomerFound(customer)
        setFormData((prev: any) => ({
          ...prev,
          sbmCustomerId: customer.id,
          customerName: customer.companyName,
          contactName: customer.contactName,
          postalCode: customer.postalCode,
          prefecture: customer.prefecture,
          city: customer.city,
          street: customer.street,
          building: customer.building,
        }))
        alert('顧客情報を取得しました')
      } else {
        alert('該当する顧客が見つかりませんでした')
        setCustomerFound(null)
      }
    } catch (error) {
      console.error('顧客検索エラー:', error)
      alert('顧客情報の取得に失敗しました')
    } finally {
      setIsLoadingCustomer(false)
    }
  }

  // 郵便番号から住所を取得（簡易実装）
  const handlePostalCodeLookup = async () => {
    if (!formData.postalCode || formData.postalCode.length !== 7) {
      alert('正しい郵便番号（7桁）を入力してください')
      return
    }

    try {
      // 実際の実装では郵便番号APIを使用
      // ここではダミーデータで実装
      const dummyAddresses = [
        {postalCode: '1000001', prefecture: '東京都', city: '千代田区', street: '千代田'},
        {postalCode: '5410041', prefecture: '大阪府', city: '大阪市中央区', street: '北浜'},
        {postalCode: '2310006', prefecture: '神奈川県', city: '横浜市中区', street: '南仲通'},
      ]

      const found = dummyAddresses.find(addr => addr.postalCode === formData.postalCode)
      if (found) {
        setFormData((prev: any) => ({
          ...prev,
          prefecture: found.prefecture,
          city: found.city,
          street: found.street,
        }))
        alert('住所を取得しました')
      } else {
        alert('該当する住所が見つかりませんでした')
      }
    } catch (error) {
      console.error('住所検索エラー:', error)
      alert('住所の取得に失敗しました')
    }
  }

  // 商品を選択リストに追加
  const addProductToOrder = (product: Product) => {
    const existingItem = formData.selectedItems.find((item: ReservationItem) => item.sbmProductId === product.id)

    if (existingItem) {
      setFormData((prev: any) => ({
        ...prev,
        selectedItems: prev.selectedItems.map((item: ReservationItem) =>
          item.sbmProductId === product.id
            ? {...item, quantity: (item.quantity || 0) + 1, totalPrice: ((item.quantity || 0) + 1) * (item.unitPrice || 0)}
            : item
        ),
      }))
    } else {
      const newItem: ReservationItem = {
        sbmProductId: product.id!,
        productName: product.name!,
        quantity: 1,
        unitPrice: product.currentPrice!,
        unitCost: product.currentCost!,
        totalPrice: product.currentPrice!,
      }
      setFormData((prev: any) => ({
        ...prev,
        selectedItems: [...prev.selectedItems, newItem],
      }))
    }
    calculateTotals()
  }

  // 商品数量を更新
  const updateItemQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItemFromOrder(productId)
      return
    }

    setFormData((prev: any) => ({
      ...prev,
      selectedItems: prev.selectedItems.map((item: ReservationItem) =>
        item.sbmProductId === productId ? {...item, quantity, totalPrice: quantity * (item.unitPrice || 0)} : item
      ),
    }))
    calculateTotals()
  }

  // 商品を注文から削除
  const removeItemFromOrder = (productId: number) => {
    setFormData((prev: any) => ({
      ...prev,
      selectedItems: prev.selectedItems.filter((item: ReservationItem) => item.sbmProductId !== productId),
    }))
    calculateTotals()
  }

  // 合計金額を計算
  const calculateTotals = () => {
    setTimeout(() => {
      setFormData((prev: any) => {
        const totalAmount = prev.selectedItems.reduce((sum: number, item: ReservationItem) => sum + (item.totalPrice || 0), 0)
        const pointsUsed = Math.min(prev.pointsUsed || 0, totalAmount)
        const finalAmount = totalAmount - pointsUsed

        return {
          ...prev,
          totalAmount,
          finalAmount,
        }
      })
    }, 0)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const {name, value, type} = e.target
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }))

    if (name === 'pointsUsed') {
      calculateTotals()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // バリデーション
    if (!formData.customerName || !formData.phoneNumber) {
      alert('顧客名、電話番号は必須です')
      return
    }

    if (!formData.prefecture || !formData.city || !formData.street) {
      alert('都道府県、市区町村、町名番地は必須です')
      return
    }

    if (formData.selectedItems.length === 0) {
      alert('商品を1つ以上選択してください')
      return
    }

    // 顧客情報更新確認
    if (!reservation && !customerFound) {
      setShowCustomerUpdateDialog(true)
      return
    }

    await saveReservation()
  }

  const saveReservation = async () => {
    try {
      // 顧客情報をUPSERT
      if (showCustomerUpdateDialog || (!reservation && !customerFound)) {
        const customerData: Partial<Customer> = {
          companyName: formData.customerName,
          contactName: formData.contactName,
          phoneNumber: formData.phoneNumber,
          postalCode: formData.postalCode,
          prefecture: formData.prefecture,
          city: formData.city,
          street: formData.street,
          building: formData.building,
        }

        await createOrUpdateCustomer(customerData)
      }

      // 日付と時間を結合
      const deliveryDateTime = new Date(`${formData.deliveryDate}T${formData.deliveryTime}`)

      const saveData = {
        ...formData,
        deliveryDate: deliveryDateTime,
        items: formData.selectedItems,
        sbmCustomerId: formData.sbmCustomerId,
        userId: session?.id,
      }

      onSave(saveData)
      setShowCustomerUpdateDialog(false)
    } catch (error) {
      console.error('保存エラー:', error)
      alert('保存に失敗しました')
    }
  }

  return (
    <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 顧客情報 */}
        <fieldset className="p-4 border rounded-lg">
          <legend className="px-2 font-semibold text-gray-900 flex items-center">
            <Phone className="mr-2" size={18} />
            顧客情報
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">電話番号 *</label>
              <div className="flex space-x-2">
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber || ''}
                  onChange={handleInputChange}
                  placeholder="090-1234-5678"
                  required
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handlePhoneNumberLookup}
                  disabled={isLoadingCustomer}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm flex items-center"
                >
                  {isLoadingCustomer ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Phone size={16} className="mr-1" />
                      連携
                    </>
                  )}
                </button>
              </div>
              {customerFound && <p className="text-sm text-green-600 mt-1">✓ 顧客情報を取得済み</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">会社・団体名 *</label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName || ''}
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
                value={formData.contactName || ''}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">郵便番号</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode || ''}
                  onChange={handleInputChange}
                  placeholder="1234567"
                  maxLength={7}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handlePostalCodeLookup}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm flex items-center"
                >
                  <MapPin size={16} className="mr-1" />
                  住所取得
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">都道府県</label>
              <input
                type="text"
                name="prefecture"
                value={formData.prefecture || ''}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">市区町村</label>
              <input
                type="text"
                name="city"
                value={formData.city || ''}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">町名・番地</label>
              <input
                type="text"
                name="street"
                value={formData.street || ''}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">その他（建物名等）</label>
              <input
                type="text"
                name="building"
                value={formData.building || ''}
                onChange={handleInputChange}
                placeholder="ビル名、部屋番号等"
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
                name="pointsUsed"
                value={formData.pointsUsed || 0}
                onChange={handleInputChange}
                min="0"
                max={formData.totalAmount || 0}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
              <textarea
                name="notes"
                value={formData.notes || ''}
                onChange={handleInputChange}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </fieldset>

        {/* 商品選択 */}
        <fieldset className="p-4 border rounded-lg">
          <legend className="px-2 font-semibold text-gray-900 flex items-center">
            <ShoppingCart className="mr-2" size={18} />
            商品選択
          </legend>

          {/* 商品リスト */}
          <div className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {products
                .filter(p => p.isActive)
                .map(product => (
                  <div key={product.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900">{product.name}</h4>
                      <span className="text-sm text-blue-600 font-semibold">¥{product.currentPrice?.toLocaleString()}</span>
                    </div>
                    {product.description && <p className="text-sm text-gray-600 mb-3">{product.description}</p>}
                    <button
                      type="button"
                      onClick={() => addProductToOrder(product)}
                      className="w-full bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-sm"
                    >
                      追加
                    </button>
                  </div>
                ))}
            </div>
          </div>

          {/* 選択済み商品 */}
          {formData.selectedItems.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-3">選択済み商品</h4>
              <div className="space-y-3">
                {formData.selectedItems.map((item: ReservationItem, index: number) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                    <div className="flex-1">
                      <span className="font-medium">{item.productName}</span>
                      <span className="text-sm text-gray-600 ml-2">@¥{item.unitPrice?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => updateItemQuantity(item.sbmProductId!, (item.quantity || 0) - 1)}
                          className="w-8 h-8 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                        >
                          -
                        </button>
                        <span className="w-12 text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateItemQuantity(item.sbmProductId!, (item.quantity || 0) + 1)}
                          className="w-8 h-8 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          +
                        </button>
                      </div>
                      <span className="w-20 text-right font-semibold">¥{item.totalPrice?.toLocaleString()}</span>
                      <button
                        type="button"
                        onClick={() => removeItemFromOrder(item.sbmProductId!)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </fieldset>

        {/* 金額計算 */}
        <fieldset className="p-4 border rounded-lg bg-gray-50">
          <legend className="px-2 font-semibold text-gray-900">金額計算</legend>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <span>小計:</span>
              <span className="font-semibold">¥{(formData.totalAmount || 0).toLocaleString()}</span>
            </div>
            {(formData.pointsUsed || 0) > 0 && (
              <div className="flex justify-between text-red-600">
                <span>ポイント使用:</span>
                <span className="font-semibold">-¥{(formData.pointsUsed || 0).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>合計:</span>
              <span>¥{(formData.finalAmount || 0).toLocaleString()}</span>
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

      {/* 顧客情報更新確認ダイアログ */}
      {showCustomerUpdateDialog && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <AlertCircle className="text-yellow-500 mr-3" size={24} />
                <h3 className="text-lg font-semibold text-gray-900">顧客情報の更新</h3>
              </div>
              <p className="text-gray-600 mb-6">
                入力された顧客情報をマスタに登録（更新）しますか？
                <br />
                <small className="text-gray-500">今後同じ電話番号で検索できるようになります。</small>
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCustomerUpdateDialog(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={saveReservation}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  更新して保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
