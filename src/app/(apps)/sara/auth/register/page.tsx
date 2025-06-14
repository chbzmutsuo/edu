'use client'

import {useState} from 'react'
import {useRouter} from 'next/navigation'
import Link from 'next/link'
import {FaHome, FaUser, FaLock, FaEye, FaEyeSlash, FaPlus, FaTrash} from 'react-icons/fa'
import {auth__register} from 'src/app/(apps)/sara/(lib)/nextauth-api'

interface Child {
  name: string
  avatar: string
  password?: string
}

const AVATAR_OPTIONS = [
  '😊',
  '😃',
  '😄',
  '😁',
  '🤗',
  '🥰',
  '😎',
  '🤓',
  '🐶',
  '🐱',
  '🐭',
  '🐹',
  '🐰',
  '🦊',
  '🐻',
  '🐼',
  '🌟',
  '⭐',
  '✨',
  '🌈',
  '🎈',
  '🎪',
  '🎨',
  '🎭',
]

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // フォームデータ
  const [familyName, setFamilyName] = useState('')
  const [parentName, setParentName] = useState('')
  const [parentEmail, setParentEmail] = useState('')
  const [parentPassword, setParentPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [children, setChildren] = useState<Child[]>([{name: '', avatar: '😊', password: ''}])

  // 子ども追加
  const addChild = () => {
    if (children.length < 5) {
      setChildren([...children, {name: '', avatar: '😊', password: ''}])
    }
  }

  // 子ども削除
  const removeChild = (index: number) => {
    if (children.length > 1) {
      setChildren(children.filter((_, i) => i !== index))
    }
  }

  // 子ども情報更新
  const updateChild = (index: number, field: keyof Child, value: string) => {
    const updatedChildren = children.map((child, i) => (i === index ? {...child, [field]: value} : child))
    setChildren(updatedChildren)
  }

  // 登録処理
  const handleRegister = async () => {
    setLoading(true)
    setError('')

    try {
      const result = await auth__register({
        familyName,
        parent: {
          name: parentName,
          email: parentEmail,
          password: parentPassword,
        },
        children: children.map(child => ({
          name: child.name,
          avatar: child.avatar,
          password: child.password || undefined,
        })),
      })

      if (result.success && result.data?.parent) {
        router.push('/sara/dashboard')
      } else {
        setError(result.error || '家族登録に失敗しました')
      }
    } catch (error) {
      setError('家族登録に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  // ステップ1バリデーション
  const isStep1Valid =
    familyName.trim() &&
    parentName.trim() &&
    parentEmail.trim() &&
    parentPassword.length >= 6 &&
    parentPassword === confirmPassword

  // ステップ2バリデーション
  const isStep2Valid = children.every(child => child.name.trim())

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <Link href="/sara" className="inline-flex items-center space-x-2 text-pink-500 hover:text-pink-600 mb-4">
            <FaHome className="text-xl" />
            <span className="font-semibold">おうちスタンプラリー</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">家族登録</h1>
          <p className="text-gray-600 mt-2">家族みんなで習慣づくりを始めましょう</p>
        </div>

        {/* プログレスバー */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= 1 ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-400'
              }`}
            >
              1
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-pink-500' : 'bg-gray-200'}`} />
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= 2 ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-400'
              }`}
            >
              2
            </div>
            <div className={`w-16 h-1 ${step >= 3 ? 'bg-pink-500' : 'bg-gray-200'}`} />
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= 3 ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-400'
              }`}
            >
              3
            </div>
          </div>

          <div className="flex items-center justify-center space-x-4 mt-2 text-xs text-gray-600">
            <span className="w-16 text-center">家族情報</span>
            <span className="w-16"></span>
            <span className="w-16 text-center">子ども情報</span>
            <span className="w-16"></span>
            <span className="w-16 text-center">確認</span>
          </div>
        </div>

        {/* エラーメッセージ */}
        {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">{error}</div>}

        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* ステップ1: 家族・親情報 */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6">家族・親の情報</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">家族名 *</label>
                  <input
                    type="text"
                    required
                    value={familyName}
                    onChange={e => setFamilyName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="田中家"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">親の名前 *</label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={parentName}
                      onChange={e => setParentName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="田中太郎"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス *</label>
                  <input
                    type="email"
                    required
                    value={parentEmail}
                    onChange={e => setParentEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="parent@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">パスワード * (6文字以上)</label>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">パスワード確認 *</label>
                  <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="パスワードを再入力"
                    />
                  </div>
                  {confirmPassword && parentPassword !== confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">パスワードが一致しません</p>
                  )}
                </div>
              </div>
              <div className="flex justify-between mt-8">
                <Link
                  href="/sara/auth/login"
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ログインページへ
                </Link>
                <button
                  onClick={() => setStep(2)}
                  disabled={!isStep1Valid}
                  className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  次へ
                </button>
              </div>
            </div>
          )}

          {/* ステップ2: 子ども情報 */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6">子どもの情報</h2>
              <div className="space-y-4">
                {children.map((child, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-800">子ども {index + 1}</h3>
                      {children.length > 1 && (
                        <button onClick={() => removeChild(index)} className="text-red-500 hover:text-red-600">
                          <FaTrash />
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">名前 *</label>
                        <input
                          type="text"
                          required
                          value={child.name}
                          onChange={e => updateChild(index, 'name', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="花子"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">アバター *</label>
                        <div className="grid grid-cols-8 gap-2">
                          {AVATAR_OPTIONS.map(avatar => (
                            <button
                              key={avatar}
                              type="button"
                              onClick={() => updateChild(index, 'avatar', avatar)}
                              className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-lg transition-colors ${
                                child.avatar === avatar
                                  ? 'border-purple-500 bg-purple-50'
                                  : 'border-gray-200 hover:border-purple-300'
                              }`}
                            >
                              {avatar}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">パスワード（任意）</label>
                        <input
                          type="password"
                          value={child.password || ''}
                          onChange={e => updateChild(index, 'password', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="設定しない場合は空欄"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {children.length < 5 && (
                  <button
                    onClick={addChild}
                    className="w-full border-2 border-dashed border-gray-300 hover:border-purple-500 text-gray-600 hover:text-purple-600 py-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <FaPlus />
                    <span>子どもを追加</span>
                  </button>
                )}
              </div>
              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  戻る
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!isStep2Valid}
                  className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  次へ
                </button>
              </div>
            </div>
          )}

          {/* ステップ3: 確認 */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6">登録内容の確認</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">家族情報</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p>
                      <span className="font-medium">家族名:</span> {familyName}
                    </p>
                    <p>
                      <span className="font-medium">親の名前:</span> {parentName}
                    </p>
                    <p>
                      <span className="font-medium">メールアドレス:</span> {parentEmail}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">子ども情報</h3>
                  <div className="space-y-2">
                    {children.map((child, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white rounded-lg border flex items-center justify-center text-lg">
                          {child.avatar}
                        </div>
                        <div>
                          <p className="font-medium">{child.name}</p>
                          <p className="text-sm text-gray-600">パスワード: {child.password ? '設定済み' : '未設定'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  戻る
                </button>
                <button
                  onClick={handleRegister}
                  disabled={loading}
                  className="px-8 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '登録中...' : '家族登録'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
