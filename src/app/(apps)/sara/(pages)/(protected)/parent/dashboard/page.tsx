'use client'

import {useState, useEffect} from 'react'
import Link from 'next/link'
import {motion} from 'framer-motion'
import {FaBell, FaCheck, FaTimes, FaStar, FaPlus, FaCog, FaCalendar, FaChild, FaChartBar, FaSignOutAlt} from 'react-icons/fa'
import {signOut} from 'next-auth/react'
import {evaluationRequestsActions, dashboardActions} from '../../../../(lib)/nextauth-api'
import useGlobal from '@hooks/globalHooks/useGlobal'

export default function ParentDashboard() {
  // const useSessionReturn = useSession()
  const {session: user, status} = useGlobal()

  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [children, setChildren] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user?.type === 'parent') {
      loadDashboardData()
    }
  }, [status, user])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)

      // 承認待ちの申請を取得
      const pendingData = await evaluationRequestsActions.getAll({session: user, status: 'pending'})
      setPendingRequests(pendingData.data || [])

      // 統計データを取得
      const statsData = await dashboardActions.getStats(user)
      setStats(statsData)

      // 子どもリストを取得（セッションから）
      if (user?.Child) {
        setChildren(user.Child)
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveRequest = async (requestId: number) => {
    try {
      await evaluationRequestsActions.update(user, {
        id: requestId,
        status: 'approved',
        comment: '承認しました！',
      })

      // リストから削除
      setPendingRequests(prev => prev.filter(req => req.id !== requestId))

      // 統計データを再読み込み
      const statsData = await dashboardActions.getStats(user)
      setStats(statsData)
    } catch (error) {
      console.error('Failed to approve request:', error)
    }
  }

  const handleRejectRequest = async (requestId: number) => {
    try {
      await evaluationRequestsActions.update(user, {
        id: requestId,
        status: 'rejected',
        comment: 'もう一度がんばってみてね',
      })

      // リストから削除
      setPendingRequests(prev => prev.filter(req => req.id !== requestId))
    } catch (error) {
      console.error('Failed to reject request:', error)
    }
  }

  const handleLogout = async () => {
    await signOut()
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'おはようございます'
    if (hour < 18) return 'こんにちは'
    return 'お疲れさまです'
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

  if (status === 'unauthenticated' || user?.type !== 'parent') {
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
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">👨‍👩‍👧‍👦</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">親ダッシュボード</h1>
                <p className="text-sm text-gray-600">
                  {getGreeting()}、{user.name}さん！
                </p>
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
              <Link href="/sara/parent/evaluation-items">
                <FaCog className="text-gray-600 hover:text-blue-600 cursor-pointer" />
              </Link>
              <button onClick={handleLogout}>
                <FaSignOutAlt className="text-gray-600 hover:text-red-600 cursor-pointer" />
              </button>
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
                <p className="text-2xl font-bold text-green-600">{stats.todayStamps || 0}</p>
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
                <p className="text-2xl font-bold text-purple-600">{stats.totalStamps || 0}</p>
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
                      initial={{opacity: 0, y: 10}}
                      animate={{opacity: 1, y: 0}}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{request.child?.avatar || '👶'}</span>
                          <div>
                            <p className="font-semibold text-gray-800">{request.child?.name}</p>
                            <p className="text-sm text-gray-600">{request.evaluationItem?.title}</p>
                            <p className="text-xs text-gray-500">{request.evaluationScore?.title}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproveRequest(request.id)}
                            className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors"
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request.id)}
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* 子ども一覧 */}
          <motion.div
            initial={{opacity: 0, x: 20}}
            animate={{opacity: 1, x: 0}}
            transition={{delay: 0.6}}
            className="bg-white rounded-xl shadow-sm"
          >
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">お子様の状況</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {children.map(child => (
                  <div key={child.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{child.avatar}</span>
                        <div>
                          <p className="font-semibold text-gray-800">{child.name}</p>
                          <p className="text-sm text-gray-600">今日: {stats.childStats?.[child.id]?.todayStamps || 0}スタンプ</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-purple-600">{stats.childStats?.[child.id]?.totalStamps || 0}</p>
                        <p className="text-xs text-gray-500">総スタンプ</p>
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
          <h2 className="text-xl font-bold text-gray-800 mb-4">クイックアクション</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/sara/parent/evaluation-items"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FaPlus className="text-blue-500" />
              <span className="font-medium">評価項目を管理</span>
            </Link>
            <Link
              href="/sara/parent/calendar"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FaCalendar className="text-green-500" />
              <span className="font-medium">カレンダーを見る</span>
            </Link>
            <Link
              href="/sara/parent/reports"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FaChartBar className="text-purple-500" />
              <span className="font-medium">レポートを見る</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
