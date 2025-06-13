'use client'

import {useState, useEffect} from 'react'
import Link from 'next/link'
import {motion, AnimatePresence} from 'framer-motion'
import {FaArrowLeft, FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaGripVertical, FaStar} from 'react-icons/fa'
import {useSession} from 'next-auth/react'
import {activity__getAll} from 'src/app/(apps)/sara/(lib)/activity-actions'
import {activity__delete} from 'src/app/(apps)/sara/(lib)/activity-actions'
import {activity__update} from 'src/app/(apps)/sara/(lib)/activity-actions'
import {activity__create} from 'src/app/(apps)/sara/(lib)/activity-actions'

// モックデータ
const mockEvaluationItems = [
  {
    id: '1',
    title: '歯磨き',
    description: 'きれいに歯を磨こう',
    order: 1,
    active: true,
    scores: [
      {id: '1', score: 1, title: 'やった', description: '歯を磨いた', iconUrl: '🦷', animationLevel: 'light'},
      {id: '2', score: 2, title: 'しっかり', description: '3分以上磨いた', iconUrl: '✨', animationLevel: 'medium'},
      {id: '3', score: 3, title: 'ぴかぴか', description: '完璧に磨いた', iconUrl: '💎', animationLevel: 'heavy'},
    ],
  },
  {
    id: '2',
    title: 'お片付け',
    description: 'おもちゃをきれいに片付けよう',
    order: 2,
    active: true,
    scores: [
      {id: '4', score: 1, title: 'やった', description: 'おもちゃを片付けた', iconUrl: '📦', animationLevel: 'light'},
      {id: '5', score: 2, title: 'きれいに', description: 'きちんと整理した', iconUrl: '✨', animationLevel: 'medium'},
      {id: '6', score: 3, title: '完璧', description: '完璧に整理整頓', iconUrl: '🌟', animationLevel: 'heavy'},
    ],
  },
]

const animationLevels = [
  {value: 'light', label: 'ライト', description: '軽い演出'},
  {value: 'medium', label: 'ミディアム', description: '普通の演出'},
  {value: 'heavy', label: 'ヘビー', description: '派手な演出'},
]

const iconOptions = ['🦷', '✨', '💎', '📦', '🌟', '👏', '💪', '🏆', '🎯', '🎨', '📚', '🍎', '🌸', '⭐', '💖']

export default function EvaluationItemsPage() {
  const {data: session, status} = useSession()
  const [items, setItems] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scores: [
      {id: 1, score: 1, title: '', description: '', iconUrl: '✨', animationLevel: 'light'},
      {id: 2, score: 2, title: '', description: '', iconUrl: '⭐', animationLevel: 'medium'},
      {id: 3, score: 3, title: '', description: '', iconUrl: '🏆', animationLevel: 'heavy'},
    ],
  })

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.type === 'parent') {
      loadItems()
    }
  }, [status, session])

  const loadItems = async () => {
    try {
      setIsLoading(true)
      const data = await activity__getAll()
      setItems(data.data || [])
    } catch (error) {
      console.error('Failed to load items:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddNew = () => {
    setEditingItem(null)
    setFormData({
      title: '',
      description: '',
      scores: [
        {id: 1, score: 1, title: '', description: '', iconUrl: '✨', animationLevel: 'light'},
        {id: 2, score: 2, title: '', description: '', iconUrl: '⭐', animationLevel: 'medium'},
        {id: 3, score: 3, title: '', description: '', iconUrl: '🏆', animationLevel: 'heavy'},
      ],
    })
    setShowModal(true)
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      description: item.description || '',
      scores: item.scores?.map((score: any) => ({
        score: score.score,
        title: score.title,
        description: score.description || '',
        iconUrl: score.iconUrl || '✨',
        animationLevel: score.animationLevel || 'light',
      })) || [
        {score: 1, title: '', description: '', iconUrl: '✨', animationLevel: 'light'},
        {score: 2, title: '', description: '', iconUrl: '⭐', animationLevel: 'medium'},
        {score: 3, title: '', description: '', iconUrl: '🏆', animationLevel: 'heavy'},
      ],
    })
    setShowModal(true)
  }

  const handleDelete = async (itemId: number) => {
    if (confirm('この評価項目を削除しますか？')) {
      try {
        await activity__delete(itemId)
        await loadItems()
      } catch (error) {
        console.error('Failed to delete item:', error)
      }
    }
  }

  const handleSave = async () => {
    try {
      if (editingItem) {
        // 編集
        await activity__update({
          id: editingItem.id,
          title: formData.title,
          description: formData.description,
          scores: formData.scores,
        })
      } else {
        // 新規追加
        await activity__create({
          title: formData.title,
          description: formData.description,
          scores: formData.scores,
        })
      }

      setShowModal(false)
      await loadItems()
    } catch (error) {
      console.error('Failed to save item:', error)
    }
  }

  const handleScoreChange = (scoreIndex: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      scores: prev.scores.map((score, index) => (index === scoreIndex ? {...score, [field]: value} : score)),
    }))
  }

  const canSave = () => {
    return (
      formData.title.trim() !== '' && formData.scores.every(score => score.title.trim() !== '' && score.description.trim() !== '')
    )
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated' || session?.user?.type !== 'parent') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">親としてログインしてください</p>
          <Link href="/sara/auth/parent/login" className="text-blue-600 hover:text-blue-800">
            ログインページへ
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/sara/parent/dashboard"
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <FaArrowLeft className="mr-2" />
                ダッシュボードに戻る
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">評価項目管理</h1>
            <div></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* 追加ボタン */}
        <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} className="mb-8">
          <motion.button
            whileHover={{scale: 1.02}}
            whileTap={{scale: 0.98}}
            onClick={handleAddNew}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 shadow-lg"
          >
            <FaPlus />
            <span>新しい習慣を追加</span>
          </motion.button>
        </motion.div>

        {/* 評価項目一覧 */}
        <div className="space-y-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">まだ評価項目がありません</p>
              <button onClick={handleAddNew} className="text-blue-600 hover:text-blue-800 font-semibold">
                最初の習慣を追加しましょう
              </button>
            </div>
          ) : (
            items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: index * 0.1}}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <FaGripVertical className="text-gray-400 cursor-move" />
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{scale: 1.05}}
                      whileTap={{scale: 0.95}}
                      onClick={() => handleEdit(item)}
                      className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors"
                    >
                      <FaEdit />
                    </motion.button>
                    <motion.button
                      whileHover={{scale: 1.05}}
                      whileTap={{scale: 0.95}}
                      onClick={() => handleDelete(item.id)}
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                    >
                      <FaTrash />
                    </motion.button>
                  </div>
                </div>

                {/* スコア一覧 */}
                <div className="grid md:grid-cols-3 gap-4">
                  {item.scores?.map((score: any) => (
                    <div key={score.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-2xl">{score.iconUrl}</span>
                        <div>
                          <p className="font-semibold text-gray-800">{score.title}</p>
                          <p className="text-sm text-gray-600">{score.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">スコア: {score.score}</span>
                        <span className="text-xs text-gray-500">{score.animationLevel}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* モーダル */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{scale: 0.9, opacity: 0}}
              animate={{scale: 1, opacity: 1}}
              exit={{scale: 0.9, opacity: 0}}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">{editingItem ? '評価項目を編集' : '新しい評価項目を追加'}</h2>
                  <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                    <FaTimes />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* 基本情報 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">習慣名</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={e => setFormData(prev => ({...prev, title: e.target.value}))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="例：歯磨き"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">説明</label>
                    <textarea
                      value={formData.description}
                      onChange={e => setFormData(prev => ({...prev, description: e.target.value}))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="例：きれいに歯を磨こう"
                    />
                  </div>

                  {/* スコア設定 */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">評価レベル設定</h3>
                    <div className="space-y-4">
                      {formData.scores.map((score, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center mb-3">
                            <FaStar className="text-yellow-500 mr-2" />
                            <span className="font-semibold">レベル {score.score}</span>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">タイトル</label>
                              <input
                                type="text"
                                value={score.title}
                                onChange={e => handleScoreChange(index, 'title', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="例：やった"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
                              <input
                                type="text"
                                value={score.description}
                                onChange={e => handleScoreChange(index, 'description', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="例：歯を磨いた"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">アイコン</label>
                              <div className="flex flex-wrap gap-2">
                                {iconOptions.map(icon => (
                                  <button
                                    key={icon}
                                    type="button"
                                    onClick={() => handleScoreChange(index, 'iconUrl', icon)}
                                    className={`p-2 rounded-lg border-2 transition-colors ${
                                      score.iconUrl === icon
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                  >
                                    <span className="text-xl">{icon}</span>
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">演出レベル</label>
                              <select
                                value={score.animationLevel}
                                onChange={e => handleScoreChange(index, 'animationLevel', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                {animationLevels.map(level => (
                                  <option key={level.value} value={level.value}>
                                    {level.label} - {level.description}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ボタン */}
                <div className="flex items-center justify-end space-x-4 mt-8">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    キャンセル
                  </button>
                  <motion.button
                    whileHover={{scale: 1.02}}
                    whileTap={{scale: 0.98}}
                    onClick={handleSave}
                    disabled={!canSave()}
                    className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                      canSave() ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <FaSave className="inline mr-2" />
                    {editingItem ? '更新' : '追加'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
