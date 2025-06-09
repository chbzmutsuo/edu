'use client'

import {useState, useEffect} from 'react'
import {motion, AnimatePresence} from 'framer-motion'
import Confetti from 'react-confetti'
import {FaStar, FaCheck, FaClock, FaTimes, FaSignOutAlt, FaCalendar, FaMedal, FaHeart} from 'react-icons/fa'

// モックデータ
const mockEvaluationItems = [
  {
    id: '1',
    title: '歯磨き',
    description: 'きれいに歯を磨こう',
    order: 1,
    scores: [
      {
        id: '1',
        score: 1,
        title: 'やった',
        description: '歯を磨いた',
        iconUrl: '🦷',
        achievementImgUrl: '/stars/bronze.png',
        animationLevel: 'light',
      },
      {
        id: '2',
        score: 2,
        title: 'しっかり',
        description: '3分以上磨いた',
        iconUrl: '✨',
        achievementImgUrl: '/stars/silver.png',
        animationLevel: 'medium',
      },
      {
        id: '3',
        score: 3,
        title: 'ぴかぴか',
        description: '完璧に磨いた',
        iconUrl: '💎',
        achievementImgUrl: '/stars/gold.png',
        animationLevel: 'heavy',
      },
    ],
    todayRequest: null,
  },
  {
    id: '2',
    title: 'お片付け',
    description: 'おもちゃをきれいに片付けよう',
    order: 2,
    scores: [
      {
        id: '4',
        score: 1,
        title: 'やった',
        description: 'おもちゃを片付けた',
        iconUrl: '📦',
        achievementImgUrl: '/stars/bronze.png',
        animationLevel: 'light',
      },
      {
        id: '5',
        score: 2,
        title: 'きれいに',
        description: 'きちんと整理した',
        iconUrl: '✨',
        achievementImgUrl: '/stars/silver.png',
        animationLevel: 'medium',
      },
      {
        id: '6',
        score: 3,
        title: '完璧',
        description: '完璧に整理整頓',
        iconUrl: '🌟',
        achievementImgUrl: '/stars/gold.png',
        animationLevel: 'heavy',
      },
    ],
    todayRequest: {
      id: 'req1',
      status: 'approved',
      scoreTitle: 'きれいに',
      approvedAt: '2024-01-20 20:30',
      openedByChild: false,
    },
  },
  {
    id: '3',
    title: 'お手伝い',
    description: 'お家のお手伝いをしよう',
    order: 3,
    scores: [
      {
        id: '7',
        score: 1,
        title: 'やった',
        description: 'お手伝いした',
        iconUrl: '👏',
        achievementImgUrl: '/stars/bronze.png',
        animationLevel: 'light',
      },
      {
        id: '8',
        score: 2,
        title: 'がんばった',
        description: 'しっかりお手伝い',
        iconUrl: '💪',
        achievementImgUrl: '/stars/silver.png',
        animationLevel: 'medium',
      },
      {
        id: '9',
        score: 3,
        title: 'すごい',
        description: '完璧なお手伝い',
        iconUrl: '🏆',
        achievementImgUrl: '/stars/gold.png',
        animationLevel: 'heavy',
      },
    ],
    todayRequest: {
      id: 'req2',
      status: 'pending',
      scoreTitle: 'がんばった',
      requestedAt: '2024-01-20 19:45',
    },
  },
]

const mockChild = {
  id: '1',
  name: 'はなこ',
  avatar: '🌸',
  todayStamps: 2,
  totalStamps: 45,
}

export default function ChildDashboard() {
  const [evaluationItems, setEvaluationItems] = useState(mockEvaluationItems)
  const [child, setChild] = useState(mockChild)
  const [showCelebration, setShowCelebration] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [selectedScore, setSelectedScore] = useState<any>(null)
  const [showConfetti, setShowConfetti] = useState(false)

  const handleScoreSelect = async (item: any, score: any) => {
    if (item.todayRequest) return // 既に申請済み

    try {
      // TODO: API実装
      console.log('Submitting request:', {itemId: item.id, scoreId: score.id})

      // 申請状態を更新
      setEvaluationItems(prev =>
        prev.map(i =>
          i.id === item.id
            ? {
                ...i,
                todayRequest: {
                  id: `req_${Date.now()}`,
                  status: 'pending',
                  scoreTitle: score.title,
                  requestedAt: new Date().toLocaleString(),
                },
              }
            : i
        )
      )
    } catch (error) {
      console.error('Failed to submit request:', error)
    }
  }

  const handleOpenCelebration = (request: any) => {
    if (request.status === 'approved' && !request.openedByChild) {
      const item = evaluationItems.find(i => i.todayRequest?.id === request.id)
      const score = item?.scores.find(s => s.title === request.scoreTitle)

      setSelectedItem(item)
      setSelectedScore(score)
      setShowCelebration(true)
      setShowConfetti(true)

      // TODO: API call to mark as opened
      setTimeout(() => {
        setShowConfetti(false)
      }, 3000)
    }
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
        return 'text-green-600'
      case 'pending':
        return 'text-yellow-600'
      case 'rejected':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <FaCheck className="text-green-500" />
      case 'pending':
        return <FaClock className="text-yellow-500" />
      case 'rejected':
        return <FaTimes className="text-red-500" />
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'けっていしたよ！'
      case 'pending':
        return 'まってるよ...'
      case 'rejected':
        return 'もういちど がんばろう'
      default:
        return ''
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-yellow-100">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} numberOfPieces={200} recycle={false} />}

      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-4xl">{child.avatar}</span>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {getGreeting()}、{child.name}ちゃん！
                </h1>
                <p className="text-gray-600">きょうも がんばろうね！✨</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-yellow-100 px-4 py-2 rounded-full">
                <FaStar className="text-yellow-500" />
                <span className="font-bold text-yellow-700">{child.todayStamps}</span>
                <span className="text-yellow-600 text-sm">きょう</span>
              </div>
              <a href="/sara" className="text-gray-600 hover:text-red-600 cursor-pointer">
                <FaSignOutAlt />
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* スタンプ統計 */}
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">きょうの せいか 🏆</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <FaStar className="text-3xl text-yellow-500" />
              </div>
              <p className="font-bold text-2xl text-gray-800">{child.todayStamps}</p>
              <p className="text-gray-600">きょうの スタンプ</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <FaMedal className="text-3xl text-purple-500" />
              </div>
              <p className="font-bold text-2xl text-gray-800">{child.totalStamps}</p>
              <p className="text-gray-600">ぜんぶの スタンプ</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <FaHeart className="text-3xl text-pink-500" />
              </div>
              <p className="font-bold text-2xl text-gray-800">
                {evaluationItems.filter(item => item.todayRequest?.status === 'approved').length}
              </p>
              <p className="text-gray-600">けっていした</p>
            </div>
          </div>
        </motion.div>

        {/* 今日の習慣項目 */}
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{delay: 0.2}}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">きょうの おやくそく 📝</h2>

          <div className="space-y-6">
            {evaluationItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{opacity: 0, x: -20}}
                animate={{opacity: 1, x: 0}}
                transition={{delay: 0.1 * index}}
                className={`border-2 rounded-2xl p-6 ${
                  item.todayRequest
                    ? 'border-gray-300 bg-gray-50'
                    : 'border-dashed border-gray-300 hover:border-pink-300 cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">{item.title}</h3>
                  {item.todayRequest && (
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(item.todayRequest.status)}
                      <span className={`font-semibold ${getStatusColor(item.todayRequest.status)}`}>
                        {getStatusText(item.todayRequest.status)}
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-gray-600 mb-4">{item.description}</p>

                {item.todayRequest ? (
                  <div className="bg-white rounded-xl p-4 border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800">せんたく: {item.todayRequest.scoreTitle}</p>
                        <p className="text-sm text-gray-600">
                          {item.todayRequest.status === 'pending'
                            ? `しんせい: ${item.todayRequest.requestedAt}`
                            : `けってい: ${item.todayRequest.approvedAt}`}
                        </p>
                      </div>
                      {item.todayRequest.status === 'approved' && !item.todayRequest.openedByChild && (
                        <motion.button
                          whileHover={{scale: 1.05}}
                          whileTap={{scale: 0.95}}
                          onClick={() => handleOpenCelebration(item.todayRequest)}
                          className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-xl font-bold text-lg"
                        >
                          スタンプを みる！✨
                        </motion.button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-semibold text-gray-700 mb-3">どのくらい がんばった？</p>
                    <div className="grid grid-cols-1 gap-3">
                      {item.scores.map(score => (
                        <motion.button
                          key={score.id}
                          whileHover={{scale: 1.02}}
                          whileTap={{scale: 0.98}}
                          onClick={() => handleScoreSelect(item, score)}
                          className="bg-gradient-to-r from-pink-100 to-purple-100 hover:from-pink-200 hover:to-purple-200 border border-pink-200 rounded-xl p-4 text-left transition-all"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-3xl">{score.iconUrl}</span>
                            <div>
                              <p className="font-bold text-lg text-gray-800">{score.title}</p>
                              <p className="text-gray-600">{score.description}</p>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
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
              initial={{scale: 0, rotate: -180}}
              animate={{scale: 1, rotate: 0}}
              exit={{scale: 0, rotate: 180}}
              transition={{type: 'spring', duration: 0.8}}
              className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-3xl p-8 max-w-md mx-4 text-center"
              onClick={e => e.stopPropagation()}
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 360, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="text-8xl mb-4"
              >
                {selectedScore.iconUrl}
              </motion.div>

              <h2 className="text-3xl font-bold text-gray-800 mb-2">すごいね！ 🎉</h2>

              <p className="text-xl text-gray-700 mb-4">
                「{selectedItem.title}」で
                <br />「{selectedScore.title}」を がんばったね！
              </p>

              <div className="flex items-center justify-center space-x-2 mb-6">
                <FaStar className="text-yellow-500 text-2xl" />
                <span className="text-2xl font-bold text-gray-800">スタンプ ゲット！</span>
                <FaStar className="text-yellow-500 text-2xl" />
              </div>

              <motion.button
                whileHover={{scale: 1.05}}
                whileTap={{scale: 0.95}}
                onClick={() => {
                  setShowCelebration(false)
                  // TODO: Mark as opened in API
                }}
                className="bg-gradient-to-r from-pink-400 to-purple-500 text-white px-8 py-3 rounded-xl font-bold text-lg"
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
