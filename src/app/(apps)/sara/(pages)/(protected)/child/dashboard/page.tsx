'use client'

import {useState, useEffect} from 'react'
import {motion, AnimatePresence} from 'framer-motion'
import Confetti from 'react-confetti'
import {FaStar, FaCheck, FaClock, FaTimes, FaSignOutAlt, FaMedal, FaHeart} from 'react-icons/fa'
import {signOut} from 'next-auth/react'

import Link from 'next/link'
import useGlobal from '@hooks/globalHooks/useGlobal'
import {activity__getAll, request__getAll} from 'src/app/(apps)/sara/(lib)/nextauth-api'
import {request__create} from 'src/app/(apps)/sara/(lib)/nextauth-api'
import {request__markAsOpened} from 'src/app/(apps)/sara/(lib)/nextauth-api'

export default function ChildDashboard() {
  const {session, status} = useGlobal()
  const [evaluationItems, setEvaluationItems] = useState<any[]>([])
  const [todayRequests, setTodayRequests] = useState<any[]>([])
  const [showCelebration, setShowCelebration] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [selectedScore, setSelectedScore] = useState<any>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'authenticated' && session?.type === 'child') {
      loadDashboardData()
    }
  }, [status, session])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)

      // 評価項目を取得
      const itemsData = await activity__getAll()
      setEvaluationItems(itemsData.data || [])

      // 今日の申請を取得
      const today = new Date().toISOString().split('T')[0]
      const requestsData = await request__getAll({
        childId: session?.id,
        date: today,
        status: 'approved',
      })
      setTodayRequests(requestsData.data || [])

      // 承認済みで未開封の申請があるかチェック
      const unopenedApproved = requestsData.data?.find((req: any) => req.status === 'approved' && !req.openedByChild)
      if (unopenedApproved) {
        handleOpenCelebration(unopenedApproved)
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleScoreSelect = async (item: any, score: any) => {
    // 既に今日申請済みかチェック
    const existingRequest = todayRequests.find(req => req.evaluationItemId === item.id)
    if (existingRequest) return

    try {
      await request__create({
        activityId: item.id,
        activityScoreId: score.id,
      })

      // 申請リストを更新
      await loadDashboardData()
    } catch (error) {
      console.error('Failed to submit request:', error)
    }
  }

  const handleOpenCelebration = async (request: any) => {
    if (request.status === 'approved' && !request.openedByChild) {
      const item = evaluationItems.find(i => i.id === request.evaluationItemId)
      const score = item?.scores?.find((s: any) => s.id === request.evaluationScoreId)

      setSelectedItem(item)
      setSelectedScore(score)
      setShowCelebration(true)
      setShowConfetti(true)

      // 開封状態を更新
      try {
        await request__markAsOpened(request.id)
      } catch (error) {
        console.error('Failed to mark as opened:', error)
      }

      setTimeout(() => {
        setShowConfetti(false)
      }, 3000)
    }
  }

  const handleLogout = async () => {
    await signOut()
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'おはよう'
    if (hour < 18) return 'こんにちは'
    return 'おつかれさま'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'rejected':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <FaCheck />
      case 'pending':
        return <FaClock />
      case 'rejected':
        return <FaTimes />
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'やったね！'
      case 'pending':
        return 'まってるよ'
      case 'rejected':
        return 'もういちど'
      default:
        return ''
    }
  }

  const getTodayRequestForItem = (itemId: string) => {
    return todayRequests.find(req => req.evaluationItemId === itemId)
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-yellow-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated' || session?.type !== 'child') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-yellow-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">子どもとしてログインしてください</p>
          <Link href="/sara/auth/child/login" className="text-pink-600 hover:text-pink-800">
            ログインページへ
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-yellow-100">
      {showConfetti && <Confetti />}

      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl">{session.avatar || '👶'}</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  {getGreeting()}、{session.name}ちゃん！
                </h1>
                <p className="text-sm text-gray-600">きょうも がんばろうね ✨</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FaStar className="text-yellow-500" />
                <span className="font-bold text-gray-800">{todayRequests.filter(req => req.status === 'approved').length}</span>
                <span className="text-sm text-gray-600">きょう</span>
              </div>
              <button onClick={handleLogout}>
                <FaSignOutAlt className="text-gray-600 hover:text-red-600 cursor-pointer" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* 今日の成果 */}
        <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <FaMedal className="text-yellow-500 mr-2" />
            きょうの せいか
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
              <FaCheck className="text-3xl text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">{todayRequests.filter(req => req.status === 'approved').length}</p>
              <p className="text-sm text-gray-600">できたこと</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
              <FaClock className="text-3xl text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-600">{todayRequests.filter(req => req.status === 'pending').length}</p>
              <p className="text-sm text-gray-600">まってるよ</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <FaHeart className="text-3xl text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-600">{evaluationItems.length - todayRequests.length}</p>
              <p className="text-sm text-gray-600">まだできるよ</p>
            </div>
          </div>
        </motion.div>

        {/* 評価項目一覧 */}
        <div className="grid gap-6">
          {evaluationItems.map((item, index) => {
            const todayRequest = getTodayRequestForItem(item.id)

            return (
              <motion.div
                key={item.id}
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: index * 0.1}}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                    {todayRequest && (
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1 ${getStatusColor(todayRequest.status)}`}
                      >
                        {getStatusIcon(todayRequest.status)}
                        <span>{getStatusText(todayRequest.status)}</span>
                      </div>
                    )}
                  </div>

                  {todayRequest ? (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-600 text-center">
                        {todayRequest.status === 'approved' && '✨ やったね！すごいよ！ ✨'}
                        {todayRequest.status === 'pending' && '⏰ おとうさんかおかあさんが みてくれるよ'}
                        {todayRequest.status === 'rejected' && '💪 もういちど がんばってみよう！'}
                      </p>
                      {todayRequest.status === 'approved' && !todayRequest.openedByChild && (
                        <motion.button
                          whileHover={{scale: 1.05}}
                          whileTap={{scale: 0.95}}
                          onClick={() => handleOpenCelebration(todayRequest)}
                          className="w-full mt-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-3 px-4 rounded-lg"
                        >
                          🎉 おめでとう！タップしてね 🎉
                        </motion.button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {item.scores?.map((score: any) => (
                        <motion.button
                          key={score.id}
                          whileHover={{scale: 1.02}}
                          whileTap={{scale: 0.98}}
                          onClick={() => handleScoreSelect(item, score)}
                          className="p-4 border-2 border-gray-200 rounded-lg hover:border-pink-300 hover:bg-pink-50 transition-all"
                        >
                          <div className="text-center">
                            <div className="text-3xl mb-2">{score.iconUrl}</div>
                            <p className="font-semibold text-gray-800">{score.title}</p>
                            <p className="text-sm text-gray-600">{score.description}</p>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* 承認演出モーダル */}
      <AnimatePresence>
        {showCelebration && selectedItem && selectedScore && (
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowCelebration(false)}
          >
            <motion.div
              initial={{scale: 0.5, opacity: 0}}
              animate={{scale: 1, opacity: 1}}
              exit={{scale: 0.5, opacity: 0}}
              className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center"
              onClick={e => e.stopPropagation()}
            >
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.1, 1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
                className="text-6xl mb-4"
              >
                {selectedScore.iconUrl}
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">やったね！</h2>
              <p className="text-lg text-gray-600 mb-4">
                {selectedItem.title} - {selectedScore.title}
              </p>
              <p className="text-gray-600 mb-6">すごいね！がんばったね！✨</p>
              <motion.button
                whileHover={{scale: 1.05}}
                whileTap={{scale: 0.95}}
                onClick={() => setShowCelebration(false)}
                className="bg-gradient-to-r from-pink-400 to-purple-500 text-white font-bold py-3 px-6 rounded-lg"
              >
                ありがとう！
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
