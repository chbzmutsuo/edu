'use client'

import {useState} from 'react'
import {useSession} from 'next-auth/react'
import {motion, AnimatePresence} from 'framer-motion'
import {authApi} from '../(lib)/nextauth-api'

interface ModeSwitcherProps {
  onModeChange?: (mode: 'parent' | 'child') => void
}

export default function ModeSwitcher({onModeChange}: ModeSwitcherProps) {
  const {data: session, update} = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedChild, setSelectedChild] = useState<string>('')
  const [password, setPassword] = useState('')

  if (!session?.user) return null

  const isParentMode = session.user.type === 'parent'
  const children = session.user.children || []

  const handleSwitchToChild = async (childId: string, childPassword?: string) => {
    setIsLoading(true)
    try {
      await authApi.switchToChild(childId, childPassword)
      await update() // セッションを更新
      onModeChange?.('child')
      setIsOpen(false)
      setPassword('')
    } catch (error) {
      console.error('子モードへの切り替えに失敗:', error)
      alert('切り替えに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwitchToParent = async () => {
    setIsLoading(true)
    try {
      await authApi.switchToParent()
      await update() // セッションを更新
      onModeChange?.('parent')
    } catch (error) {
      console.error('親モードへの切り替えに失敗:', error)
      alert('切り替えに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative">
      {/* 現在のモード表示 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        disabled={isLoading}
      >
        <div className="text-2xl">{isParentMode ? '👨‍👩‍👧‍👦' : session.user.avatar || '👶'}</div>
        <div className="text-left">
          <div className="text-sm font-medium text-gray-900">{session.user.name}</div>
          <div className="text-xs text-gray-500">{isParentMode ? '親モード' : '子モード'}</div>
        </div>
        <div className="text-gray-400">{isOpen ? '▲' : '▼'}</div>
      </button>

      {/* 切り替えメニュー */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{opacity: 0, y: -10}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -10}}
            className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-50"
          >
            <div className="p-4">
              {isParentMode ? (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">子モードに切り替え</h3>
                  <div className="space-y-2">
                    {children.map(child => (
                      <button
                        key={child.id}
                        onClick={() => {
                          setSelectedChild(child.id)
                          // パスワードが必要かチェック（実際の実装では子どもの情報を取得）
                          handleSwitchToChild(child.id)
                        }}
                        className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        disabled={isLoading}
                      >
                        <div className="text-2xl">{child.avatar}</div>
                        <div className="text-left">
                          <div className="text-sm font-medium text-gray-900">{child.name}</div>
                          <div className="text-xs text-gray-500">子モードに切り替え</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">親モードに戻る</h3>
                  <button
                    onClick={handleSwitchToParent}
                    className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={isLoading}
                  >
                    <div className="text-2xl">👨‍👩‍👧‍👦</div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-900">親モード</div>
                      <div className="text-xs text-gray-500">管理画面に戻る</div>
                    </div>
                  </button>
                </div>
              )}

              {/* パスワード入力（必要な場合） */}
              {selectedChild && (
                <div className="mt-4 pt-4 border-t">
                  <label className="block text-sm font-medium text-gray-700 mb-2">パスワード（設定されている場合）</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="パスワードを入力"
                  />
                  <div className="flex space-x-2 mt-3">
                    <button
                      onClick={() => handleSwitchToChild(selectedChild, password)}
                      className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                      disabled={isLoading}
                    >
                      切り替え
                    </button>
                    <button
                      onClick={() => {
                        setSelectedChild('')
                        setPassword('')
                      }}
                      className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="mt-4 text-center">
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span className="ml-2 text-sm text-gray-600">切り替え中...</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 背景クリックで閉じる */}
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  )
}
