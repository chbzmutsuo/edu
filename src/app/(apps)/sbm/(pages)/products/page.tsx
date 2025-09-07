'use client'

import React, {useState, useEffect} from 'react'
import {Search, PlusCircle, Edit, Trash2, X, Package, History} from 'lucide-react'
import {getAllProducts, createProduct, updateProduct, deleteProduct} from '../../(builders)/serverActions'
import {Product} from '../../types'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import useModal from '@cm/components/utils/modal/useModal'
import {Padding} from '@cm/components/styles/common-components/common-components'
import {cn} from '@cm/shadcn/lib/utils'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  // const [isModalOpen, setIsModalOpen] = useState(false)
  // const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  // const [deletingId, setDeletingId] = useState<number | null>(null)
  // const [showPriceHistory, setShowPriceHistory] = useState<number | null>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const data = await getAllProducts()
      setProducts(data)
    } catch (error) {
      console.error('商品データの取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value)
  }

  const handleCategoryFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(e.target.value)
  }

  const filteredProducts = products.filter(product => {
    const keyword = searchKeyword.toLowerCase()
    const matchesKeyword =
      product.name?.toLowerCase().includes(keyword) ||
      product.description?.toLowerCase().includes(keyword) ||
      product.category?.toLowerCase().includes(keyword)

    const matchesCategory = !categoryFilter || product.category === categoryFilter

    return matchesKeyword && matchesCategory
  })

  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)))

  const EditProductModalReturn = useModal()
  const DeleteProductModalReturn = useModal()
  const PriceHistoryModalReturn = useModal()

  const handleSave = async (productData: Partial<Product>) => {
    try {
      const editingProduct = EditProductModalReturn?.open?.product

      if (editingProduct) {
        const result = await updateProduct(editingProduct.id!, productData)
        if (result.success) {
          await loadProducts()
          EditProductModalReturn.handleClose()
        } else {
          alert(result.error || '更新に失敗しました')
        }
      } else {
        const result = await createProduct(productData as Omit<Product, 'id' | 'priceHistory' | 'createdAt' | 'updatedAt'>)
        if (result.success) {
          await loadProducts()
          EditProductModalReturn.handleClose()
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
    if (confirm('この商品を削除してもよろしいですか？')) {
      const deletingId = DeleteProductModalReturn?.open?.product?.id

      if (!deletingId) return

      try {
        const result = await deleteProduct(deletingId)
        if (result.success) {
          await loadProducts()
          DeleteProductModalReturn.handleClose()
        } else {
          alert(result.error || '削除に失敗しました')
        }
      } catch (error) {
        console.error('削除エラー:', error)
        alert('削除中にエラーが発生しました')
      }
    }
  }

  // // 表示/非表示切り替え
  // const toggleVisibility = async (product: Product) => {
  //   if (!product.id) return

  //   try {
  //     const result = await updateProduct(Number(product.id), {
  //       isActive: !product.isActive,
  //     })
  //     if (result.success) {
  //       await loadProducts()
  //     } else {
  //       alert(result.error || '更新に失敗しました')
  //     }
  //   } catch (error) {
  //     console.error('表示切り替えエラー:', error)
  //     alert('更新中にエラーが発生しました')
  //   }
  // }

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
            <Package className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">商品マスタ</h1>
          </div>
          <button
            onClick={() => EditProductModalReturn.handleOpen({product: undefined})}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusCircle size={20} />
            <span>新規商品追加</span>
          </button>
        </div>

        {/* 検索・フィルター */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">検索</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={handleSearchChange}
                  placeholder="商品名、説明、カテゴリで検索..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
              <select
                value={categoryFilter}
                onChange={handleCategoryFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">すべてのカテゴリ</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 商品一覧 */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">商品一覧 ({filteredProducts.length}件)</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">商品名</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">カテゴリ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">現在価格</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">現在原価</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">利益率</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">登録日</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map(product => {
                  const profitRate =
                    product.currentPrice && product.currentCost
                      ? ((product.currentPrice - product.currentCost) / product.currentPrice) * 100
                      : 0

                  const isHidden = !product.isActive

                  return (
                    <tr key={product.id} className={cn(isHidden ? 'bg-gray-500' : 'bg-gray-100 hover:bg-gray-50')}>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{product.name}</div>
                          {product.description && (
                            <div className="text-sm text-gray-500 max-w-xs truncate">{product.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                        ¥{product.currentPrice?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">¥{product.currentCost?.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`font-semibold ${profitRate >= 30 ? 'text-green-600' : profitRate >= 20 ? 'text-yellow-600' : 'text-red-600'}`}
                        >
                          {profitRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              product.isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {product.isActive ? '表示中' : '非表示'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {product.createdAt ? formatDate(product.createdAt) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {/* <button
                            onClick={() => toggleVisibility(product)}
                            className={`${
                              product.isActive ? 'text-blue-600 hover:text-blue-800' : 'text-gray-400 hover:text-gray-600'
                            }`}
                            title={product.isActive ? '非表示にする' : '表示する'}
                          >
                            {product.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                          </button> */}
                          <button
                            onClick={() => PriceHistoryModalReturn.handleOpen({product})}
                            className="text-green-600 hover:text-green-800"
                            title="価格履歴"
                          >
                            <History size={16} />
                          </button>
                          <button
                            onClick={() => EditProductModalReturn.handleOpen({product})}
                            className="text-blue-600 hover:text-blue-800"
                            title="編集"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => DeleteProductModalReturn.handleOpen({product})}
                            className="text-red-600 hover:text-red-800"
                            title="削除"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">
                {searchKeyword || categoryFilter ? '検索条件に一致する商品が見つかりません' : '商品データがありません'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 商品フォームモーダル */}
      <EditProductModalReturn.Modal>
        <Padding>
          <ProductModal
            product={EditProductModalReturn?.open?.product}
            onSave={handleSave}
            onClose={EditProductModalReturn.handleClose}
          />
        </Padding>
      </EditProductModalReturn.Modal>

      {/* 価格履歴モーダル */}
      <PriceHistoryModalReturn.Modal>
        <Padding>
          <PriceHistoryModal
            product={PriceHistoryModalReturn?.open?.product}
            onClose={() => PriceHistoryModalReturn.handleClose()}
          />
        </Padding>
      </PriceHistoryModalReturn.Modal>

      {/* 削除確認モーダル */}
      <DeleteProductModalReturn.Modal>
        <Padding>
          <ConfirmModal
            title="商品削除確認"
            message="この商品を削除してもよろしいですか？この操作は元に戻せません。"
            onConfirm={handleDelete}
            onClose={() => DeleteProductModalReturn.handleClose()}
          />
        </Padding>
      </DeleteProductModalReturn.Modal>
    </div>
  )
}

// 商品フォームモーダル
const ProductModal = ({
  product,
  onSave,
  onClose,
}: {
  product: Product | null
  onSave: (productData: Partial<Product>) => void
  onClose: () => void
}) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: product?.name || '',
    description: product?.description || '',
    currentPrice: product?.currentPrice || 0,
    currentCost: product?.currentCost || 0,
    category: product?.category || '',
    isActive: product?.isActive ?? true,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const {name, value, type} = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // バリデーション
    if (!formData.name || !formData.category || !formData.currentPrice || !formData.currentCost) {
      alert('商品名、カテゴリ、価格、原価は必須です')
      return
    }

    if (formData.currentPrice! < formData.currentCost!) {
      if (!confirm('価格が原価を下回っています。このまま保存しますか？')) {
        return
      }
    }

    onSave(formData)
  }

  const profitRate =
    formData.currentPrice && formData.currentCost
      ? ((formData.currentPrice - formData.currentCost) / formData.currentPrice) * 100
      : 0

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">商品名 *</label>
        <input
          type="text"
          name="name"
          value={formData.name || ''}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ *</label>
        <select
          name="category"
          value={formData.category || ''}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">カテゴリを選択</option>
          <option value="和食">和食</option>
          <option value="洋食">洋食</option>
          <option value="中華">中華</option>
          <option value="その他">その他</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">販売価格（円） *</label>
          <input
            type="number"
            name="currentPrice"
            value={formData.currentPrice || ''}
            onChange={handleInputChange}
            required
            min="0"
            step="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">原価（円） *</label>
          <input
            type="number"
            name="currentCost"
            value={formData.currentCost || ''}
            onChange={handleInputChange}
            required
            min="0"
            step="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {formData.currentPrice && formData.currentCost && (
        <div className="bg-gray-50 p-3 rounded-md">
          <span className="text-sm text-gray-600">利益率: </span>
          <span
            className={`font-semibold ${profitRate >= 30 ? 'text-green-600' : profitRate >= 20 ? 'text-yellow-600' : 'text-red-600'}`}
          >
            {profitRate.toFixed(1)}%
          </span>
          <span className="text-sm text-gray-600 ml-2">
            (利益: ¥{(formData.currentPrice - formData.currentCost).toLocaleString()})
          </span>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">商品説明</label>
        <textarea
          name="description"
          value={formData.description || ''}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive ?? true}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700">予約登録時に表示</label>
        </div>
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
  )
}

// 価格履歴モーダル
const PriceHistoryModal = ({product, onClose}: {product: Product | null; onClose: () => void}) => {
  if (!product) return null

  return (
    <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">価格履歴 - {product.name}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">適用日</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">販売価格</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">原価</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">利益率</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {product.priceHistory && product.priceHistory.length > 0 ? (
              product.priceHistory.map((history, index) => {
                const profitRate = ((history.price! - history.cost!) / history.price!) * 100
                return (
                  <tr key={history.id || index}>
                    <td className="px-4 py-3 text-sm text-gray-900">{formatDate(history.effectiveDate!)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">¥{history.price?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">¥{history.cost?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`font-semibold ${profitRate >= 30 ? 'text-green-600' : profitRate >= 20 ? 'text-yellow-600' : 'text-red-600'}`}
                      >
                        {profitRate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  価格履歴がありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-end">
        <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
          閉じる
        </button>
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
  <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
    <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
    <p className="text-gray-600 mb-6">{message}</p>
    <div className="flex justify-end space-x-3">
      <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">
        キャンセル
      </button>
      <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
        削除
      </button>
    </div>
  </div>
)
