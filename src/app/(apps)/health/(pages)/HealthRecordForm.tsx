'use client'

import {useState, useEffect} from 'react'
import {
  HEALTH_CATEGORIES,
  HEALTH_CATEGORY_LABELS,
  HEALTH_CATEGORY_COLORS,
  HEALTH_CATEGORY_BG_COLORS,
  WALKING_TYPE_LABELS,
  HealthCategory,
  HealthRecordFormData,
} from '../(constants)/types'
import {StrHandler} from '@class/StrHandler'

interface Medicine {
  id: number
  name: string
  requireUnit: boolean
}

interface HealthRecordFormProps {
  onSubmit: (data: HealthRecordFormData) => void
  initialData?: Partial<HealthRecordFormData>
  isEditing?: boolean
}

export default function HealthRecordForm({onSubmit, initialData, isEditing}: HealthRecordFormProps) {
  const [formData, setFormData] = useState<HealthRecordFormData>({
    category: HEALTH_CATEGORIES.BLOOD_SUGAR,
    recordDate: new Date().toISOString().split('T')[0],
    recordTime: new Date().toTimeString().slice(0, 5),
    ...initialData,
  })

  const [medicines, setMedicines] = useState<Medicine[]>([])

  // 薬マスタを取得
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await fetch('/health/api/medicines')
        if (response.ok) {
          const data = await response.json()
          setMedicines(data)
        }
      } catch (error) {
        console.error('薬マスタ取得エラー:', error)
      }
    }

    fetchMedicines()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleInputChange = (field: keyof HealthRecordFormData, value: any) => {
    setFormData(prev => ({...prev, [field]: value}))
  }

  const selectedMedicine = medicines.find(m => m.id === formData.medicineId)

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-3 w-[400px] max-w-[80vw]  bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold text-gray-800">{isEditing ? '健康記録を編集' : '健康記録を登録'}</h2>

      {/* 日付選択 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">日付</label>
        <input
          type="date"
          value={formData.recordDate}
          onChange={e => handleInputChange('recordDate', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* 時刻選択 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">時刻</label>
        <input
          type="time"
          value={formData.recordTime}
          onChange={e => handleInputChange('recordTime', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* カテゴリ選択（ボタン形式） */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">カテゴリ</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.entries(HEALTH_CATEGORY_LABELS).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleInputChange('category', key as HealthCategory)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                formData.category === key ? 'border-2 scale-105 shadow-md' : 'border-gray-200 hover:border-gray-300'
              }`}
              style={{
                backgroundColor: formData.category === key ? HEALTH_CATEGORY_BG_COLORS[key as HealthCategory] : '#f9fafb',
                borderColor: formData.category === key ? HEALTH_CATEGORY_COLORS[key as HealthCategory] : undefined,
                color: formData.category === key ? HEALTH_CATEGORY_COLORS[key as HealthCategory] : '#374151',
              }}
            >
              <div className="font-medium text-sm">{label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* カテゴリ別の入力フィールド */}
      {formData.category === HEALTH_CATEGORIES.BLOOD_SUGAR && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">血糖値</label>
          <input
            type="number"
            value={formData.bloodSugarValue || ''}
            onChange={e => handleInputChange('bloodSugarValue', parseInt(e.target.value) || undefined)}
            placeholder="血糖値を入力"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      )}

      {formData.category === HEALTH_CATEGORIES.MEDICINE && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">薬名</label>
            <select
              value={formData.medicineId || ''}
              onChange={e => handleInputChange('medicineId', parseInt(e.target.value) || undefined)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">薬を選択してください</option>
              {medicines.map(medicine => (
                <option key={medicine.id} value={medicine.id}>
                  {medicine.name}
                </option>
              ))}
            </select>
          </div>

          {selectedMedicine?.requireUnit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">単位</label>
              <input
                type="number"
                step="0.1"
                value={formData.medicineUnit || ''}
                onChange={e => handleInputChange('medicineUnit', parseFloat(e.target.value) || undefined)}
                placeholder="単位を入力"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}
        </>
      )}

      {formData.category === HEALTH_CATEGORIES.WALKING && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800">歩行ポイント入力</h3>

          {Object.entries(WALKING_TYPE_LABELS).map(([key, label]) => {
            const [first = '', second = ''] = key.split('_')

            const dataKey = [
              //
              'walking',
              StrHandler.capitalizeFirstLetter(first),
              StrHandler.capitalizeFirstLetter(second),
            ].join('') as keyof HealthRecordFormData

            return (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                <select
                  value={formData[dataKey] || ''}
                  onChange={e => {
                    handleInputChange(dataKey, parseFloat(e.target.value) || 0)
                  }}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">選択してください</option>
                  {Array.from({length: 50}, (_, i) => i).map(value => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            )
          })}
        </div>
      )}

      {/* メモ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">メモ（任意）</label>
        <textarea
          value={formData.memo || ''}
          onChange={e => handleInputChange('memo', e.target.value)}
          placeholder="メモを入力"
          rows={3}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* 送信ボタン */}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
      >
        {isEditing ? '更新する' : '登録する'}
      </button>
    </form>
  )
}
