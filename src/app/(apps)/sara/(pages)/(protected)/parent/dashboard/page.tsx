'use client'

import {useState, useEffect} from 'react'
import Link from 'next/link'
import {motion} from 'framer-motion'
import {FaBell, FaCheck, FaTimes, FaStar, FaPlus, FaCog, FaCalendar, FaChild, FaChartBar, FaSignOutAlt} from 'react-icons/fa'

// モックデータ
const mockPendingRequests = [
  {
    id: '1',
    childName: 'はなこ',
    childAvatar: '🌸',
    itemTitle: '歯磨き',
    scoreTitle: 'ぴかぴか',
    requestTime: '2024-01-20 19:30',
    date: '2024-01-20',
  },
  {
    id: '2',
    childName: 'たろう',
    childAvatar: '🦁',
    itemTitle: 'お片付け',
    scoreTitle: 'きれいに完璧',
    requestTime: '2024-01-20 20:15',
    date: '2024-01-20',
  },
]

const mockChildren = [
  {
    id: '1',
    name: 'はなこ',
    avatar: '🌸',
    todayStamps: 3,
    totalStamps: 45,
    lastActivity: '歯磨き (19:30)',
  },
  {
    id: '2',
    name: 'たろう',
    avatar: '🦁',
    todayStamps: 2,
    totalStamps: 38,
    lastActivity: 'お片付け (20:15)',
  },
]

export default function ParentDashboard() {
  const [pendingRequests, setPendingRequests] = useState(mockPendingRequests)
  const [children, setChildren] = useState(mockChildren)
  const [selectedFilter, setSelectedFilter] = useState('all')

  const handleApproveRequest = async (requestId: string) => {
    // TODO: API実装
    console.log('Approving request:', requestId)
    setPendingRequests(prev => prev.filter(req => req.id !== requestId))
  }

  const handleRejectRequest = async (requestId: string) => {
    // TODO: API実装
    console.log('Rejecting request:', requestId)
    setPendingRequests(prev => prev.filter(req => req.id !== requestId))
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'おはようございます'
    if (hour < 18) return 'こんにちは'
    return 'お疲れさまです'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">👨‍👩‍👧‍👦</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">親ダッシュボード</h1>
                <p className="text-sm text-gray-600">{getGreeting()}！</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <FaBell className="text-gray-600 hover:text-blue-600 cursor-pointer" />
                {pendingRequests.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {pendingRequests.length}
                  </span>
                )}
              </div>
              <Link href="/sara/parent/settings">
                <FaCog className="text-gray-600 hover:text-blue-600 cursor-pointer" />
              </Link>
              <Link href="/sara">
                <FaSignOutAlt className="text-gray-600 hover:text-red-600 cursor-pointer" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* 統計カード */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: 0.1}}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">承認待ち</p>
                <p className="text-2xl font-bold text-orange-600">{pendingRequests.length}</p>
              </div>
              <FaBell className="text-3xl text-orange-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: 0.2}}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">今日のスタンプ</p>
                <p className="text-2xl font-bold text-green-600">{children.reduce((sum, child) => sum + child.todayStamps, 0)}</p>
              </div>
              <FaStar className="text-3xl text-green-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: 0.3}}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">お子様数</p>
                <p className="text-2xl font-bold text-blue-600">{children.length}</p>
              </div>
              <FaChild className="text-3xl text-blue-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: 0.4}}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">総スタンプ</p>
                <p className="text-2xl font-bold text-purple-600">
                  {children.reduce((sum, child) => sum + child.totalStamps, 0)}
                </p>
              </div>
              <FaChartBar className="text-3xl text-purple-500" />
            </div>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* 承認待ち一覧 */}
          <motion.div
            initial={{opacity: 0, x: -20}}
            animate={{opacity: 1, x: 0}}
            transition={{delay: 0.5}}
            className="bg-white rounded-xl shadow-sm"
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">承認待ち</h2>
                <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-semibold">
                  {pendingRequests.length}件
                </span>
              </div>
            </div>
            <div className="p-6">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FaCheck className="text-4xl text-gray-300 mx-auto mb-4" />
                  <p>承認待ちの申請はありません</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map(request => (
                    <motion.div
                      key={request.id}
                      initial={{opacity: 0, scale: 0.95}}
                      animate={{opacity: 1, scale: 1}}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{request.childAvatar}</span>
                          <div>
                            <h3 className="font-semibold text-gray-800">
                              {request.childName} - {request.itemTitle}
                            </h3>
                            <p className="text-sm text-gray-600">レベル: {request.scoreTitle}</p>
                            <p className="text-xs text-gray-500">{request.requestTime}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <motion.button
                            whileHover={{scale: 1.05}}
                            whileTap={{scale: 0.95}}
                            onClick={() => handleApproveRequest(request.id)}
                            className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg"
                          >
                            <FaCheck />
                          </motion.button>
                          <motion.button
                            whileHover={{scale: 1.05}}
                            whileTap={{scale: 0.95}}
                            onClick={() => handleRejectRequest(request.id)}
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg"
                          >
                            <FaTimes />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* 子どもたちの状況 */}
          <motion.div
            initial={{opacity: 0, x: 20}}
            animate={{opacity: 1, x: 0}}
            transition={{delay: 0.6}}
            className="bg-white rounded-xl shadow-sm"
          >
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">子どもたちの状況</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {children.map(child => (
                  <div key={child.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{child.avatar}</span>
                        <div>
                          <h3 className="font-semibold text-gray-800">{child.name}</h3>
                          <p className="text-sm text-gray-600">最後の活動: {child.lastActivity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-1">
                          <FaStar className="text-yellow-500" />
                          <span className="font-bold text-gray-800">{child.todayStamps}</span>
                          <span className="text-sm text-gray-600">今日</span>
                        </div>
                        <p className="text-xs text-gray-500">合計: {child.totalStamps}個</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* クイックアクション */}
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{delay: 0.7}}
          className="mt-8 bg-white rounded-xl shadow-sm p-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-6">クイックアクション</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <Link href="/sara/parent/evaluation-items">
              <motion.div
                whileHover={{scale: 1.02}}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
              >
                <FaPlus className="text-blue-500 text-2xl mb-2" />
                <h3 className="font-semibold text-gray-800">評価項目管理</h3>
                <p className="text-sm text-gray-600">新しい習慣を追加</p>
              </motion.div>
            </Link>

            <Link href="/sara/parent/statistics">
              <motion.div
                whileHover={{scale: 1.02}}
                className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
              >
                <FaChartBar className="text-green-500 text-2xl mb-2" />
                <h3 className="font-semibold text-gray-800">統計・レポート</h3>
                <p className="text-sm text-gray-600">成長の記録を確認</p>
              </motion.div>
            </Link>

            <Link href="/sara/parent/calendar">
              <motion.div
                whileHover={{scale: 1.02}}
                className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
              >
                <FaCalendar className="text-purple-500 text-2xl mb-2" />
                <h3 className="font-semibold text-gray-800">カレンダー</h3>
                <p className="text-sm text-gray-600">月間の記録を確認</p>
              </motion.div>
            </Link>

            <Link href="/sara/parent/children">
              <motion.div
                whileHover={{scale: 1.02}}
                className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
              >
                <FaChild className="text-orange-500 text-2xl mb-2" />
                <h3 className="font-semibold text-gray-800">子ども管理</h3>
                <p className="text-sm text-gray-600">アカウントや設定</p>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
