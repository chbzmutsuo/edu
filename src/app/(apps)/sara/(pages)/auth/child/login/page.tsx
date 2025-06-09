'use client'

import {useState, useEffect} from 'react'
import {useRouter} from 'next/navigation'
import Link from 'next/link'
import {motion} from 'framer-motion'
import {FaArrowLeft, FaStar} from 'react-icons/fa'

// モックデータ（後でAPIから取得）
const mockChildren = [
  {id: '1', name: 'はなこ', avatar: '🌸'},
  {id: '2', name: 'たろう', avatar: '🦁'},
  {id: '3', name: 'みお', avatar: '🐱'},
]

export default function ChildLoginPage() {
  const router = useRouter()
  const [selectedChild, setSelectedChild] = useState<string>('')
  const [password, setPassword] = useState('')
  const [children, setChildren] = useState(mockChildren)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedChild) {
      setError('お名前を選んでね！')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // TODO: API実装後に置き換え
      const response = await fetch('/sara/api/auth/child/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childId: selectedChild,
          password: password,
        }),
      })

      if (response.ok) {
        router.push('/sara/child/dashboard')
      } else {
        setError('ログインできませんでした。おとうさんかおかあさんにきいてね！')
      }
    } catch (error) {
      setError('ログインできませんでした。もういちどやってみてね！')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-yellow-100">
      <div className="container mx-auto px-4 py-8">
        {/* 戻るボタン */}
        <motion.div initial={{opacity: 0, x: -20}} animate={{opacity: 1, x: 0}} transition={{duration: 0.5}} className="mb-8">
          <Link href="/sara" className="inline-flex items-center text-pink-600 hover:text-pink-800 transition-colors text-lg">
            <FaArrowLeft className="mr-2" />
            もどる
          </Link>
        </motion.div>

        <div className="max-w-md mx-auto">
          {/* ヘッダー */}
          <motion.div
            initial={{opacity: 0, y: -20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.6}}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full mb-6">
              <FaStar className="text-white text-3xl" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">こんにちは！</h1>
            <p className="text-gray-600 text-xl">きょうもがんばろうね！✨</p>
          </motion.div>

          {/* ログインフォーム */}
          <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.6, delay: 0.2}}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-4 text-center">だれかな？お名前をえらんでね</label>
                <div className="grid grid-cols-1 gap-3">
                  {children.map(child => (
                    <motion.button
                      key={child.id}
                      type="button"
                      onClick={() => setSelectedChild(child.id)}
                      whileHover={{scale: 1.02}}
                      whileTap={{scale: 0.98}}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedChild === child.id
                          ? 'border-pink-400 bg-pink-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-pink-200'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-3">
                        <span className="text-3xl">{child.avatar}</span>
                        <span className="text-xl font-semibold text-gray-700">{child.name}</span>
                        {selectedChild === child.id && <span className="text-pink-500">✓</span>}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-lg font-medium text-gray-700 mb-2 text-center">
                  あいことば（なくてもOK）
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent text-center text-lg"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <motion.div
                  initial={{opacity: 0, scale: 0.95}}
                  animate={{opacity: 1, scale: 1}}
                  className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl text-center"
                >
                  {error}
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={isLoading || !selectedChild}
                whileHover={{scale: 1.02}}
                whileTap={{scale: 0.98}}
                className={`w-full py-4 px-4 rounded-xl font-semibold text-white text-lg transition-colors ${
                  isLoading || !selectedChild
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600'
                }`}
              >
                {isLoading ? 'まってね...' : 'はじめる！🎉'}
              </motion.button>
            </form>
          </motion.div>

          {/* 楽しいメッセージ */}
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{duration: 0.6, delay: 0.8}}
            className="text-center mt-8"
          >
            <p className="text-gray-600 text-lg">きょうは どんなことを がんばる？ 🌟</p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
