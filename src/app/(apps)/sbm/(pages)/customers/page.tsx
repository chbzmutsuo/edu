'use client'

import React, {useState, useEffect} from 'react'
import {Search, PlusCircle, Edit, Trash2, X, Users} from 'lucide-react'
import {getAllCustomers, createCustomer, updateCustomer, deleteCustomer} from '../../(builders)/serverActions'
import {Customer} from '../../types'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    setLoading(true)
    try {
      const data = await getAllCustomers()
      setCustomers(data)
    } catch (error) {
      console.error('顧客データの取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value)
  }

  const filteredCustomers = customers.filter(customer => {
    const keyword = searchKeyword.toLowerCase()
    return (
      customer.companyName?.toLowerCase().includes(keyword) ||
      customer.contactName?.toLowerCase().includes(keyword) ||
      customer.phoneNumber?.toLowerCase().includes(keyword) ||
      customer.email?.toLowerCase().includes(keyword)
    )
  })

  const openModal = (customer: Customer | null = null) => {
    setEditingCustomer(customer)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingCustomer(null)
  }

  const handleSave = async (customerData: Partial<Customer>) => {
    try {
      if (editingCustomer) {
        const result = await updateCustomer(editingCustomer.id!, customerData)
        if (result.success) {
          await loadCustomers()
          closeModal()
        } else {
          alert(result.error || '更新に失敗しました')
        }
      } else {
        const result = await createCustomer(customerData as Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>)
        if (result.success) {
          await loadCustomers()
          closeModal()
        } else {
          alert(result.error || '作成に失敗しました')
        }
      }
    } catch (error) {
      console.error('保存エラー:', error)
      alert('保存中にエラーが発生しました')
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return

    try {
      const result = await deleteCustomer(deletingId)
      if (result.success) {
        await loadCustomers()
        setDeletingId(null)
      } else {
        alert(result.error || '削除に失敗しました')
      }
    } catch (error) {
      console.error('削除エラー:', error)
      alert('削除中にエラーが発生しました')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">データを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <Users className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">顧客マスタ</h1>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusCircle size={20} />
            <span>新規顧客追加</span>
          </button>
        </div>

        {/* 検索フィルター */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">検索</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={handleSearchChange}
                  placeholder="会社名、担当者名、電話番号、メールアドレスで検索..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 顧客一覧 */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">顧客一覧 ({filteredCustomers.length}件)</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">会社名</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">担当者</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">電話番号</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    メールアドレス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">配達先住所</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ポイント</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">登録日</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map(customer => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{customer.companyName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">{customer.contactName || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">{customer.phoneNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">{customer.email || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{customer.deliveryAddress}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-blue-600 font-semibold">{customer.availablePoints?.toLocaleString()}pt</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {customer.createdAt ? formatDate(customer.createdAt) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <button onClick={() => openModal(customer)} className="text-blue-600 hover:text-blue-800" title="編集">
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => setDeletingId(customer.id!)}
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

          {filteredCustomers.length === 0 && (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">
                {searchKeyword ? '検索条件に一致する顧客が見つかりません' : '顧客データがありません'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 顧客フォームモーダル */}
      {isModalOpen && <CustomerModal customer={editingCustomer} onSave={handleSave} onClose={closeModal} />}

      {/* 削除確認モーダル */}
      {deletingId && (
        <ConfirmModal
          title="顧客削除確認"
          message="この顧客を削除してもよろしいですか？この操作は元に戻せません。"
          onConfirm={handleDelete}
          onClose={() => setDeletingId(null)}
        />
      )}
    </div>
  )
}

// 顧客フォームモーダル
const CustomerModal = ({
  customer,
  onSave,
  onClose,
}: {
  customer: Customer | null
  onSave: (customerData: Partial<Customer>) => void
  onClose: () => void
}) => {
  const [formData, setFormData] = useState<Partial<Customer>>({
    companyName: customer?.companyName || '',
    contactName: customer?.contactName || '',
    phoneNumber: customer?.phoneNumber || '',
    email: customer?.email || '',
    deliveryAddress: customer?.deliveryAddress || '',
    postalCode: customer?.postalCode || '',
    availablePoints: customer?.availablePoints || 0,
    notes: customer?.notes || '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {name, value, type} = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // バリデーション
    if (!formData.companyName || !formData.phoneNumber || !formData.deliveryAddress) {
      alert('会社名、電話番号、配達先住所は必須です')
      return
    }

    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{customer ? '顧客編集' : '新規顧客登録'}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">会社名 *</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName || ''}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">担当者名</label>
              <input
                type="text"
                name="contactName"
                value={formData.contactName || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">電話番号 *</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber || ''}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">郵便番号</label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode || ''}
                onChange={handleInputChange}
                placeholder="1234567"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">配達先住所 *</label>
              <input
                type="text"
                name="deliveryAddress"
                value={formData.deliveryAddress || ''}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">利用可能ポイント</label>
              <input
                type="number"
                name="availablePoints"
                value={formData.availablePoints || 0}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
              <textarea
                name="notes"
                value={formData.notes || ''}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
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
  <div className="fixed inset-0 bg-black/50 bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
      <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
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
