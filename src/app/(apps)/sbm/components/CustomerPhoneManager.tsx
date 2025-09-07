'use client'

import React, {useState, useEffect} from 'react'
import {Phone, Plus, Edit, Trash2, X} from 'lucide-react'
import {getCustomerPhones, createCustomerPhone, updateCustomerPhone, deleteCustomerPhone} from '../(builders)/serverActions'
import {CustomerPhone, PhoneLabel} from '../types'
import useModal from '@cm/components/utils/modal/useModal'
import {C_Stack} from '@cm/components/styles/common-components/common-components'

type CustomerPhoneManagerProps = {
  customerId: number
  customerName: string
}

const PHONE_LABELS: PhoneLabel[] = ['自宅', '携帯', '職場', 'FAX', 'その他']

/**
 * 電話番号をフォーマットする
 * 桁数に応じて適切なハイフン区切りを行う
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return ''

  // 数字のみ抽出
  const numbers = phone.replace(/[^0-9]/g, '')

  // 086-251-1356（市外局番3桁、市内局番3桁、加入者番号4桁）や
  // 080-1914-5919（携帯: 3-4-4）などに対応
  if (numbers.length === 11) {
    // 携帯電話: 090-1234-5678, 080-1914-5919
    return numbers.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
  } else if (numbers.length === 10) {
    // 固定電話（市外局番3桁 or 2桁）
    // 例: 086-251-1356, 03-1234-5678
    // 市外局番3桁（0[1-9]0, 0[1-9][1-9] など）を優先
    if (/^0\d{2}/.test(numbers)) {
      // 3-3-4
      return numbers.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
    } else {
      // 2-4-4
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3')
    }
  } else if (numbers.length === 9) {
    // 固定電話（市外局番2桁 or 1桁）
    // 例: 099-12-3456, 0-1234-5678
    // 3-2-4
    if (/^0\d{2}/.test(numbers)) {
      return numbers.replace(/(\d{3})(\d{2})(\d{4})/, '$1-$2-$3')
    } else {
      // 1-4-4
      return numbers.replace(/(\d{1})(\d{4})(\d{4})/, '$1-$2-$3')
    }
  }

  // その他の桁数はそのまま返す
  return numbers
}

/**
 * 顧客の電話番号管理コンポーネント
 */
const CustomerPhoneManager: React.FC<CustomerPhoneManagerProps> = ({customerId, customerName}) => {
  const [phones, setPhones] = useState<CustomerPhone[]>([])
  const [loading, setLoading] = useState(true)

  const PhoneModalReturn = useModal()
  const DeletePhoneModalReturn = useModal()

  useEffect(() => {
    if (customerId) {
      loadPhones()
    }
  }, [customerId])

  const loadPhones = async () => {
    setLoading(true)
    try {
      const data = await getCustomerPhones(customerId)
      setPhones(data)
    } catch (error) {
      console.error('電話番号データの取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSavePhone = async (phoneData: Partial<CustomerPhone>) => {
    try {
      let result
      if (phoneData.id) {
        // 更新
        result = await updateCustomerPhone(phoneData.id, phoneData)
      } else {
        // 新規作成
        result = await createCustomerPhone({
          sbmCustomerId: customerId,
          label: phoneData.label!,
          phoneNumber: phoneData.phoneNumber!,
        })
      }

      if (result.success) {
        await loadPhones()
        PhoneModalReturn.handleClose()
      } else {
        alert(result.error || '保存に失敗しました')
      }
    } catch (error) {
      console.error('保存エラー:', error)
      alert('保存中にエラーが発生しました')
    }
  }

  const handleDeletePhone = async () => {
    const phoneId = DeletePhoneModalReturn.open?.phone?.id
    if (!phoneId) return

    try {
      const result = await deleteCustomerPhone(phoneId)
      if (result.success) {
        await loadPhones()
        DeletePhoneModalReturn.handleClose()
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
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">電話番号を読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <C_Stack>
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Phone className="mr-2" size={20} />
          電話番号管理 - {customerName}
        </h3>

        <div className={`flex justify-end`}>
          <button
            onClick={() => PhoneModalReturn.handleOpen({phone: null})}
            className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-sm"
          >
            <Plus size={16} />
            <span>電話番号追加</span>
          </button>
        </div>
      </C_Stack>

      {phones.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <Phone size={48} className="text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">登録された電話番号がありません</p>
          <button
            onClick={() => PhoneModalReturn.handleOpen({phone: null})}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
          >
            最初の電話番号を追加
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {phones.map(phone => (
            <div key={phone.id}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-lg">{formatPhoneNumber(phone.phoneNumber)}</span>
                      <span className={`px-2 py-1 text-xs rounded-full `}>{phone.label}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => PhoneModalReturn.handleOpen({phone})}
                    className="text-blue-600 hover:text-blue-800"
                    title="編集"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => DeletePhoneModalReturn.handleOpen({phone})}
                    className="text-red-600 hover:text-red-800"
                    title="削除"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 電話番号編集モーダル */}
      <PhoneModalReturn.Modal>
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          <PhoneModal
            phone={PhoneModalReturn.open?.phone || null}
            onSave={handleSavePhone}
            onClose={PhoneModalReturn.handleClose}
          />
        </div>
      </PhoneModalReturn.Modal>

      {/* 削除確認モーダル */}
      <DeletePhoneModalReturn.Modal>
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">電話番号の削除</h3>
            <p className="text-gray-600 mb-6">
              以下の電話番号を削除してもよろしいですか？
              <br />
              <strong className="font-mono">{formatPhoneNumber(DeletePhoneModalReturn.open?.phone?.phoneNumber || '')}</strong>
              <span className="ml-2 text-sm">({DeletePhoneModalReturn.open?.phone?.label})</span>
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={DeletePhoneModalReturn.handleClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                キャンセル
              </button>
              <button onClick={handleDeletePhone} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                削除
              </button>
            </div>
          </div>
        </div>
      </DeletePhoneModalReturn.Modal>
    </div>
  )
}

// 電話番号編集モーダル
const PhoneModal = ({
  phone,
  onSave,
  onClose,
}: {
  phone: CustomerPhone | null
  onSave: (data: Partial<CustomerPhone>) => void
  onClose: () => void
}) => {
  const [formData, setFormData] = useState({
    label: phone?.label || '携帯',
    phoneNumber: phone?.phoneNumber || '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {name, value, type} = e.target

    // 電話番号の場合は数字のみ許可
    if (name === 'phoneNumber') {
      const numbersOnly = value.replace(/[^0-9]/g, '')
      setFormData(prev => ({
        ...prev,
        [name]: numbersOnly,
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.phoneNumber.trim()) {
      alert('電話番号を入力してください')
      return
    }
    if (!formData.label) {
      alert('種別を選択してください')
      return
    }

    onSave({
      id: phone?.id,
      label: formData.label as PhoneLabel,
      phoneNumber: formData.phoneNumber.trim(),
    })
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{phone ? '電話番号編集' : '電話番号追加'}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">電話番号 *</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            placeholder="09012345678"
            inputMode="numeric"
            pattern="[0-9]*"
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">種別 *</label>
          <select
            name="label"
            value={formData.label}
            onChange={handleInputChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {PHONE_LABELS.map(label => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
            キャンセル
          </button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            保存
          </button>
        </div>
      </form>
    </div>
  )
}

export default CustomerPhoneManager
