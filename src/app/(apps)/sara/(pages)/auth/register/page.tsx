'use client'

import {useState} from 'react'
import {useRouter} from 'next/navigation'
import Link from 'next/link'
import {motion, AnimatePresence} from 'framer-motion'
import {FaArrowLeft, FaArrowRight, FaPlus, FaTrash, FaEye, FaEyeSlash} from 'react-icons/fa'

interface FamilyData {
  familyName: string
  parent: {
    name: string
    email: string
    password: string
  }
  children: {
    name: string
    avatar: string
    password?: string
  }[]
}

const avatarOptions = ['🌸', '🦁', '🐱', '🐰', '🐻', '🦊', '🐧', '🦄', '🌟', '🎈']

export default function RegisterPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [familyData, setFamilyData] = useState<FamilyData>({
    familyName: '',
    parent: {
      name: '',
      email: '',
      password: '',
    },
    children: [{name: '', avatar: '🌸'}],
  })

  const handleFamilyNameChange = (value: string) => {
    setFamilyData(prev => ({
      ...prev,
      familyName: value,
    }))
  }

  const handleParentChange = (field: string, value: string) => {
    setFamilyData(prev => ({
      ...prev,
      parent: {
        ...prev.parent,
        [field]: value,
      },
    }))
  }

  const handleChildChange = (index: number, field: string, value: string) => {
    setFamilyData(prev => ({
      ...prev,
      children: prev.children.map((child, i) => (i === index ? {...child, [field]: value} : child)),
    }))
  }

  const addChild = () => {
    setFamilyData(prev => ({
      ...prev,
      children: [...prev.children, {name: '', avatar: avatarOptions[prev.children.length % avatarOptions.length]}],
    }))
  }

  const removeChild = (index: number) => {
    if (familyData.children.length > 1) {
      setFamilyData(prev => ({
        ...prev,
        children: prev.children.filter((_, i) => i !== index),
      }))
    }
  }

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError('')

    try {
      // TODO: API実装後に置き換え
      const response = await fetch('/sara/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(familyData),
      })

      if (response.ok) {
        router.push('/sara/auth/parent/login?registered=true')
      } else {
        setError('登録に失敗しました。もう一度お試しください。')
      }
    } catch (error) {
      setError('登録に失敗しました。もう一度お試しください。')
    } finally {
      setIsLoading(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return familyData.familyName.trim() !== ''
      case 2:
        return (
          familyData.parent.name.trim() !== '' &&
          familyData.parent.email.trim() !== '' &&
          familyData.parent.password.trim() !== ''
        )
      case 3:
        return familyData.children.every(child => child.name.trim() !== '')
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-purple-100">
      <div className="container mx-auto px-4 py-8">
        {/* 戻るボタン */}
        <motion.div initial={{opacity: 0, x: -20}} animate={{opacity: 1, x: 0}} transition={{duration: 0.5}} className="mb-8">
          <Link href="/sara" className="inline-flex items-center text-green-600 hover:text-green-800 transition-colors">
            <FaArrowLeft className="mr-2" />
            もどる
          </Link>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          {/* プログレスバー */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3].map(step => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      currentStep >= step ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step}
                  </div>
                  {step < 3 && <div className={`w-full h-1 mx-4 ${currentStep > step ? 'bg-green-500' : 'bg-gray-200'}`} />}
                </div>
              ))}
            </div>
            <div className="text-center text-gray-600">ステップ {currentStep} / 3</div>
          </div>

          {/* フォームコンテンツ */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{opacity: 0, x: 50}}
                  animate={{opacity: 1, x: 0}}
                  exit={{opacity: 0, x: -50}}
                  transition={{duration: 0.3}}
                >
                  <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">家族の名前を決めましょう</h2>
                  <div className="space-y-4">
                    <label className="block text-lg font-medium text-gray-700">家族名</label>
                    <input
                      type="text"
                      value={familyData.familyName}
                      onChange={e => handleFamilyNameChange(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                      placeholder="例：田中家"
                    />
                    <p className="text-gray-500 text-sm">お好きな家族の名前を入力してください</p>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{opacity: 0, x: 50}}
                  animate={{opacity: 1, x: 0}}
                  exit={{opacity: 0, x: -50}}
                  transition={{duration: 0.3}}
                >
                  <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">親の情報を入力してください</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-lg font-medium text-gray-700 mb-2">お名前</label>
                      <input
                        type="text"
                        value={familyData.parent.name}
                        onChange={e => handleParentChange('name', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="例：田中太郎"
                      />
                    </div>
                    <div>
                      <label className="block text-lg font-medium text-gray-700 mb-2">メールアドレス</label>
                      <input
                        type="email"
                        value={familyData.parent.email}
                        onChange={e => handleParentChange('email', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="your-email@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-lg font-medium text-gray-700 mb-2">パスワード</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={familyData.parent.password}
                          onChange={e => handleParentChange('password', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent pr-12"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{opacity: 0, x: 50}}
                  animate={{opacity: 1, x: 0}}
                  exit={{opacity: 0, x: -50}}
                  transition={{duration: 0.3}}
                >
                  <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">お子さんの情報を入力してください</h2>
                  <div className="space-y-6">
                    {familyData.children.map((child, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">お子さん {index + 1}</h3>
                          {familyData.children.length > 1 && (
                            <button type="button" onClick={() => removeChild(index)} className="text-red-500 hover:text-red-700">
                              <FaTrash />
                            </button>
                          )}
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">お名前</label>
                            <input
                              type="text"
                              value={child.name}
                              onChange={e => handleChildChange(index, 'name', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="例：はなこ"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">アバター</label>
                            <div className="grid grid-cols-5 gap-2">
                              {avatarOptions.map(avatar => (
                                <button
                                  key={avatar}
                                  type="button"
                                  onClick={() => handleChildChange(index, 'avatar', avatar)}
                                  className={`p-3 rounded-lg border-2 text-2xl ${
                                    child.avatar === avatar
                                      ? 'border-green-400 bg-green-50'
                                      : 'border-gray-200 hover:border-green-200'
                                  }`}
                                >
                                  {avatar}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">あいことば（任意）</label>
                            <input
                              type="password"
                              value={child.password || ''}
                              onChange={e => handleChildChange(index, 'password', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="子ども用のパスワード（任意）"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addChild}
                      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-green-400 hover:text-green-600 transition-colors flex items-center justify-center"
                    >
                      <FaPlus className="mr-2" />
                      お子さんを追加
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.div
                initial={{opacity: 0, scale: 0.95}}
                animate={{opacity: 1, scale: 1}}
                className="mt-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            {/* ナビゲーションボタン */}
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStep === 1}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  currentStep === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                前へ
              </button>

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors flex items-center ${
                    !canProceed() ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  次へ
                  <FaArrowRight className="ml-2" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canProceed() || isLoading}
                  className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
                    !canProceed() || isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {isLoading ? '登録中...' : '登録完了！'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
