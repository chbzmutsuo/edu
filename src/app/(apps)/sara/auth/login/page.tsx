'use client'

import {useState} from 'react'
import {useRouter} from 'next/navigation'
import Link from 'next/link'
import {FaHome, FaUser, FaLock, FaEye, FaEyeSlash, FaChild} from 'react-icons/fa'
import {signIn} from 'next-auth/react'
import useGlobal from '@hooks/globalHooks/useGlobal'
import {toast} from 'react-toastify'
// import {auth__parentLogin, auth__getChildren, auth__childLogin} from '../../(lib)/auth-actions'
// import {createSession} from '../../(lib)/session'

interface Child {
  id: number
  name: string
  avatar: string | null
}

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<'select' | 'parent' | 'child'>('select')
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 親ログインフォーム
  const [parentEmail, setParentEmail] = useState('')
  const [parentPassword, setParentPassword] = useState('')

  // 子どもログインフォーム
  const [childPassword, setChildPassword] = useState('')

  // 親ログインハンドラー
  const handleParentLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email: parentEmail,
        password: parentPassword,
        redirect: false,
      })

      router.push('/sara/parent/dashboard')
    } catch (error) {
      setError('ログインに失敗しました')
    } finally {
      toast.success('ログインしました')
      setLoading(false)
    }
  }

  // 子ども選択ハンドラー
  const handleChildSelect = async (child: Child) => {
    setSelectedChild(child)
    setStep('child')
  }

  // 子どもログインハンドラー
  const handleChildLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedChild) return

    setLoading(true)
    setError('')

    try {
      // const result = await auth__childLogin(selectedChild.id, childPassword || undefined)
      // if (result.success && result.data) {
      //   // await createSession(result.data.user)
      //   router.push('/sara/dashboard')
      // } else {
      //   setError(result.error || 'ログインに失敗しました')
      // }
    } catch (error) {
      setError('ログインに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  // 子ども選択準備
  const handleSelectChild = async () => {
    setLoading(true)
    setError('')

    try {
      // デモ用：家族IDは実際には親ログインから取得
      // const result = await auth__getChildren(1) // 仮の家族ID
      // if (result.success && result.data) {
      //   setChildren(result.data)
      //   setStep('child')
      // } else {
      //   setError('子どもリストの取得に失敗しました')
      // }
    } catch (error) {
      setError('子どもリストの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <Link href="/sara" className="inline-flex items-center space-x-2 text-pink-500 hover:text-pink-600 mb-4">
            <FaHome className="text-xl" />
            <span className="font-semibold">おうちスタンプラリー</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">ログイン</h1>
        </div>

        {/* エラーメッセージ */}
        {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">{error}</div>}

        {/* ステップ選択 */}
        {step === 'select' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">ログイン方法を選択</h2>
            <div className="space-y-4">
              <button
                onClick={() => setStep('parent')}
                className="w-full flex items-center justify-center space-x-3 bg-pink-500 hover:bg-pink-600 text-white py-4 rounded-lg font-semibold transition-colors"
              >
                <FaUser className="text-xl" />
                <span>親としてログイン</span>
              </button>
              <button
                onClick={handleSelectChild}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-3 bg-purple-500 hover:bg-purple-600 text-white py-4 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                <FaChild className="text-xl" />
                <span>{loading ? '読み込み中...' : '子どもとしてログイン'}</span>
              </button>
            </div>
            <div className="mt-6 text-center">
              <Link href="/sara/auth/register" className="text-pink-500 hover:text-pink-600 font-semibold">
                家族登録がお済みでない方はこちら
              </Link>
            </div>
          </div>
        )}

        {/* 親ログインフォーム */}
        {step === 'parent' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">親ログイン</h2>
              <button onClick={() => setStep('select')} className="text-gray-500 hover:text-gray-700">
                戻る
              </button>
            </div>
            <form onSubmit={handleParentLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={parentEmail}
                    onChange={e => setParentEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="parent@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={parentPassword}
                    onChange={e => setParentPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="パスワードを入力"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? 'ログイン中...' : 'ログイン'}
              </button>
            </form>
          </div>
        )}

        {/* 子どもログインフォーム */}
        {step === 'child' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">子どもログイン</h2>
              <button onClick={() => setStep('select')} className="text-gray-500 hover:text-gray-700">
                戻る
              </button>
            </div>

            {!selectedChild ? (
              <div>
                <p className="text-gray-600 mb-4">お名前を選んでください</p>
                <div className="grid grid-cols-2 gap-3">
                  {children.map(child => (
                    <button
                      key={child.id}
                      onClick={() => handleChildSelect(child)}
                      className="flex flex-col items-center p-4 border-2 border-gray-200 hover:border-purple-500 rounded-lg transition-colors"
                    >
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                        {child.avatar ? (
                          <img src={child.avatar} alt={child.name} className="w-12 h-12 rounded-full" />
                        ) : (
                          <FaChild className="text-purple-500 text-2xl" />
                        )}
                      </div>
                      <span className="font-semibold text-gray-800">{child.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <form onSubmit={handleChildLogin} className="space-y-4">
                <div className="text-center mb-4">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    {selectedChild.avatar ? (
                      <img src={selectedChild.avatar} alt={selectedChild.name} className="w-16 h-16 rounded-full" />
                    ) : (
                      <FaChild className="text-purple-500 text-3xl" />
                    )}
                  </div>
                  <p className="text-lg font-semibold text-gray-800">{selectedChild.name}さん</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">パスワード（設定している場合）</label>
                  <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={childPassword}
                      onChange={e => setChildPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="パスワード（任意）"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setSelectedChild(null)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors"
                  >
                    戻る
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    {loading ? 'ログイン中...' : 'ログイン'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
