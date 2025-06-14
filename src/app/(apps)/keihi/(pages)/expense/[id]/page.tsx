'use client'

import {useState, useEffect} from 'react'
import {useParams, useRouter} from 'next/navigation'
import Link from 'next/link'
import {toast} from 'react-toastify'
import {getExpenseById, deleteExpense} from '../../../actions/expense-actions'
import {T_LINK} from '@components/styles/common-components/links'

interface ExpenseDetail {
  id: string
  createdAt: Date
  updatedAt: Date
  date: Date
  amount: number
  subject: string
  location?: string
  counterpartyName?: string
  counterpartyIndustry?: string
  conversationPurpose?: string
  keywords: string[]
  conversationSummary?: string
  learningDepth?: number
  // 税務調査対応項目
  counterpartyContact?: string
  followUpPlan?: string
  businessOpportunity?: string
  competitorInfo?: string
  businessInsightDetail?: string
  businessInsightSummary?: string
  techInsightDetail?: string
  techInsightSummary?: string
  autoTags: string[]
  mfSubject?: string
  mfSubAccount?: string
  mfTaxCategory?: string
  mfDepartment?: string
  mfMemo?: string
  KeihiAttachment: Array<{
    id: string
    filename: string
    originalName: string
    mimeType: string
    size: number
    url: string
  }>
}

export default function ExpenseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [expense, setExpense] = useState<ExpenseDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const expenseId = params?.id as string

  useEffect(() => {
    const fetchExpense = async () => {
      setIsLoading(true)
      try {
        const result = await getExpenseById(expenseId)
        if (result.success) {
          setExpense(result.data as ExpenseDetail)
        } else {
          toast.error(result.error || '記録の取得に失敗しました')
          router.push('/keihi')
        }
      } catch (error) {
        console.error('詳細取得エラー:', error)
        toast.error('記録の取得に失敗しました')
        router.push('/keihi')
      } finally {
        setIsLoading(false)
      }
    }

    if (expenseId) {
      fetchExpense()
    }
  }, [expenseId, router])

  // 削除処理
  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteExpense(expenseId)
      if (result.success) {
        toast.success('記録を削除しました')
        router.push('/keihi')
      } else {
        toast.error(result.error || '削除に失敗しました')
      }
    } catch (error) {
      console.error('削除エラー:', error)
      toast.error('削除に失敗しました')
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  // 金額フォーマット
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ja-JP').format(amount)
  }

  // 日付フォーマット
  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleDateString('ja-JP')
  }

  // ファイルサイズフォーマット
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!expense) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">記録が見つかりません</p>
          <T_LINK href="/keihi" className="text-blue-600 hover:text-blue-800 underline">
            一覧に戻る
          </T_LINK>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md">
          {/* ヘッダー */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">経費記録詳細</h1>
              <div className="flex gap-3">
                <T_LINK
                  href={`/keihi/expense/${expense.id}/edit`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  編集
                </T_LINK>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  削除
                </button>
                <T_LINK href="/keihi" className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                  一覧に戻る
                </T_LINK>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* 基本情報 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">日付</label>
                  <p className="text-gray-900">{formatDate(expense.date)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">金額</label>
                  <p className="text-gray-900 text-lg font-semibold">¥{formatAmount(expense.amount)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">科目</label>
                  <p className="text-gray-900">{expense.subject}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">場所</label>
                  <p className="text-gray-900">{expense.location || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">相手名</label>
                  <p className="text-gray-900">{expense.counterpartyName || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">相手の職種・業種</label>
                  <p className="text-gray-900">{expense.counterpartyIndustry || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">会話の目的</label>
                  <p className="text-gray-900">{expense.conversationPurpose || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">学びの深さ・重要度</label>
                  <p className="text-gray-900">{expense.learningDepth ? `${expense.learningDepth}/5` : '-'}</p>
                </div>
              </div>
            </section>

            {/* キーワード */}
            {expense.keywords.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">キーワード</h2>
                <div className="flex flex-wrap gap-2">
                  {expense.keywords.map((keyword, index) => (
                    <span key={index} className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {keyword}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* 会話内容の要約 */}
            {expense.conversationSummary && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">会話内容の要約</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-900">{expense.conversationSummary}</p>
                </div>
              </section>
            )}

            {/* 税務調査対応情報 */}
            {(expense.counterpartyContact || expense.followUpPlan || expense.businessOpportunity || expense.competitorInfo) && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">📋 補足</h2>
                <div className="bg-orange-50 p-4 rounded-lg space-y-4">
                  {expense.counterpartyContact && (
                    <div>
                      <label className="block text-sm font-medium text-orange-800 mb-1">相手の連絡先</label>
                      <p className="text-orange-900">{expense.counterpartyContact}</p>
                    </div>
                  )}
                  {expense.followUpPlan && (
                    <div>
                      <label className="block text-sm font-medium text-orange-800 mb-1">フォローアップ予定</label>
                      <p className="text-orange-900">{expense.followUpPlan}</p>
                    </div>
                  )}
                  {expense.businessOpportunity && (
                    <div>
                      <label className="block text-sm font-medium text-orange-800 mb-1">ビジネス機会の評価</label>
                      <p className="text-orange-900">{expense.businessOpportunity}</p>
                    </div>
                  )}
                  {expense.competitorInfo && (
                    <div>
                      <label className="block text-sm font-medium text-orange-800 mb-1">競合・市場情報</label>
                      <p className="text-orange-900">{expense.competitorInfo}</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* AIインサイト */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">AIインサイト</h2>
              <div className="space-y-4">
                {/* 営業インサイト */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">営業・ビジネスインサイト</h3>
                  {expense.businessInsightSummary && (
                    <p className="text-sm text-blue-800 mb-2 font-medium">要約: {expense.businessInsightSummary}</p>
                  )}
                  {expense.businessInsightDetail && <p className="text-blue-900">{expense.businessInsightDetail}</p>}
                </div>

                {/* 技術インサイト */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">技術・開発インサイト</h3>
                  {expense.techInsightSummary && (
                    <p className="text-sm text-green-800 mb-2 font-medium">要約: {expense.techInsightSummary}</p>
                  )}
                  {expense.techInsightDetail && <p className="text-green-900">{expense.techInsightDetail}</p>}
                </div>
              </div>
            </section>

            {/* 自動生成タグ */}
            {expense.autoTags.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">自動生成タグ</h2>
                <div className="flex flex-wrap gap-2">
                  {expense.autoTags.map((tag, index) => (
                    <span key={index} className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm">
                      #{tag}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* MoneyForward用情報 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">MoneyForward用情報</h2>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-yellow-800 mb-1">科目</label>
                    <p className="text-yellow-900">{expense.mfSubject || expense.subject}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-yellow-800 mb-1">税区分</label>
                    <p className="text-yellow-900">{expense.mfTaxCategory || '課仕 10%'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-yellow-800 mb-1">摘要</label>
                    <p className="text-yellow-900">
                      {expense.mfMemo || expense.conversationSummary || `${expense.subject} ${expense.amount}円`}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 添付ファイル */}
            {expense.KeihiAttachment.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">添付ファイル</h2>
                <div className="space-y-2">
                  {expense.KeihiAttachment.map(attachment => {
                    return (
                      <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{attachment.originalName}</p>
                          <p className="text-sm text-gray-600">
                            {attachment.mimeType} • {formatFileSize(attachment.size)}
                          </p>
                        </div>
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          ダウンロード
                        </a>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* メタ情報 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">メタ情報</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">作成日時</label>
                    <p className="text-gray-900">{new Date(expense.createdAt).toLocaleString('ja-JP')}</p>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">更新日時</label>
                    <p className="text-gray-900">{new Date(expense.updatedAt).toLocaleString('ja-JP')}</p>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">記録ID</label>
                    <p className="text-gray-900 font-mono text-xs">{expense.id}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* 削除確認モーダル */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">記録を削除しますか？</h3>
            <div className="mb-4">
              <p className="text-gray-600 mb-2">以下の記録を削除します：</p>
              <div className="bg-gray-50 p-3 rounded border">
                <p className="font-medium">
                  {formatDate(expense.date)} - {expense.subject}
                </p>
                <p className="text-sm text-gray-600">¥{formatAmount(expense.amount)}</p>
                {expense.counterpartyName && <p className="text-sm text-gray-600">{expense.counterpartyName}</p>}
              </div>
              <p className="text-red-600 text-sm mt-2">⚠️ この操作は取り消せません。関連する添付ファイルも削除されます。</p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDeleting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                {isDeleting ? '削除中...' : '削除する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
