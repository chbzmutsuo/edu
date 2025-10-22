'use client'

import {useState, useEffect} from 'react'
import {useSearchParams} from 'next/navigation'
import {toast} from 'react-toastify'
import {findGameBySecretKey} from '../colabo-server-actions'
import {Button} from '@cm/components/styles/common-components/Button'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {HREF} from '@cm/lib/methods/urls'

export default function ColaboEnterPage() {
  const {router, query} = useGlobal()
  const searchParams = useSearchParams()
  const [key, setKey] = useState('')
  const [game, setGame] = useState<any>(null)
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // URLパラメータからkeyを取得
  useEffect(() => {
    const keyFromUrl = searchParams?.get('key')
    if (keyFromUrl) {
      setKey(keyFromUrl)
      handleSearchGame(keyFromUrl)
    }
  }, [searchParams])

  const handleSearchGame = async (secretKey: string) => {
    if (!secretKey) {
      toast.error('参加キーを入力してください')
      return
    }

    setIsLoading(true)
    try {
      const result = await findGameBySecretKey(secretKey)

      if (result.success && result.game) {
        setGame(result.game)
        toast.success('授業が見つかりました')
      } else {
        toast.error(result.error || '入力されたキーの授業が見つかりません')
        setGame(null)
      }
    } catch (error) {
      console.error('Game検索エラー:', error)
      toast.error('予期しないエラーが発生しました')
      setGame(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinGame = () => {
    if (!game || !selectedStudentId) {
      toast.error('生徒を選択してください')
      return
    }

    // 授業参加ページへ遷移
    router.push(HREF(`/edu/Colabo/games/${game.id}/play`, {as: 'student', sid: selectedStudentId}, query))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-8">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Colabo 授業に参加</h1>
          <p className="text-gray-600">先生から伝えられた参加キーを入力してください</p>
        </div>

        {/* キー入力フォーム */}
        {!game && (
          <form
            onSubmit={e => {
              e.preventDefault()
              handleSearchGame(key)
            }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">参加キー</label>
              <input
                type="text"
                value={key}
                onChange={e => setKey(e.target.value.toUpperCase())}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-center text-2xl font-mono font-bold tracking-wider focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="XXXXXXXX"
                maxLength={8}
                required
                autoFocus
              />
            </div>

            <Button type="submit" disabled={isLoading || !key} className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3">
              {isLoading ? '検索中...' : '授業を探す'}
            </Button>
          </form>
        )}

        {/* Game情報と生徒選択 */}
        {game && (
          <div className="space-y-1">
            {/* Game情報 */}
            <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4">授業情報</h2>
              <div className="space-y-2 text-gray-700">
                <div className="flex items-center">
                  <span className="font-semibold mr-2">授業名:</span>
                  <span>{game.name}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold mr-2">日付:</span>
                  <span>{new Date(game.date).toLocaleDateString('ja-JP', {year: 'numeric', month: 'long', day: 'numeric'})}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold mr-2">先生:</span>
                  <span>{game.Teacher?.name}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold mr-2">学校:</span>
                  <span>{game.School?.name}</span>
                </div>
              </div>
            </div>

            {/* 生徒選択 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">あなたの名前を選んでください</h3>
              {game.GameStudent && game.GameStudent.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-2">
                  {game.GameStudent.map((gs: any) => (
                    <button
                      key={gs.Student.id}
                      onClick={() => setSelectedStudentId(gs.Student.id)}
                      className={`p-4 rounded-lg border-2 transition-all text-center ${
                        selectedStudentId === gs.Student.id
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-semibold text-gray-800">{gs.Student.name}</div>
                      {gs.Student.attendanceNumber && (
                        <div className="text-sm text-gray-500">出席番号: {gs.Student.attendanceNumber}</div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>まだ生徒が登録されていません</p>
                  <p className="text-sm mt-2">先生に確認してください</p>
                </div>
              )}
            </div>

            {/* アクションボタン */}
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => {
                  setGame(null)
                  setSelectedStudentId(null)
                  setKey('')
                }}
                className="flex-1 bg-gray-500 hover:bg-gray-600"
              >
                戻る
              </Button>
              <Button
                onClick={handleJoinGame}
                disabled={!selectedStudentId}
                className="flex-1 bg-green-600 hover:bg-green-700 text-lg py-3"
              >
                授業に参加
              </Button>
            </div>
          </div>
        )}

        {/* 説明 */}
        <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
          <p>QRコードを読み取った場合は、自動的に授業が表示されます</p>
        </div>
      </div>
    </div>
  )
}
