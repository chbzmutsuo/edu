import Link from 'next/link'
import {FaHome, FaStar, FaUsers, FaHeart} from 'react-icons/fa'

export default function SaraLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FaHome className="text-pink-500 text-2xl" />
              <h1 className="text-2xl font-bold text-gray-800">おうちスタンプラリー</h1>
            </div>
            <nav className="flex items-center space-x-4">
              <Link
                href="/sara/auth/register"
                className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-semibold transition-colors"
              >
                家族登録
              </Link>
              <Link
                href="/sara/auth/login"
                className="px-4 py-2 border border-pink-500 text-pink-500 hover:bg-pink-50 rounded-lg font-semibold transition-colors"
              >
                ログイン
              </Link>
            </nav>
          </div>
        </div>
      </header>
      コードです。皆さんちょっと画面の雰囲気違うけど
      {/* メインコンテンツ */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* ヒーローセクション */}
        <section className="text-center mb-16">
          <div className="mb-8">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
              家族で楽しく
              <br />
              <span className="text-pink-500">習慣づくり</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              子どもの良い習慣を家族みんなで応援。
              <br />
              毎日の小さな頑張りが大きな成長につながります。
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/sara/auth/register"
              className="px-8 py-4 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-bold text-lg transition-colors shadow-lg"
            >
              今すぐ始める
            </Link>
            <Link
              href="/sara/auth/login"
              className="px-8 py-4 border-2 border-pink-500 text-pink-500 hover:bg-pink-50 rounded-xl font-bold text-lg transition-colors"
            >
              ログイン
            </Link>
          </div>
        </section>

        {/* 特徴セクション */}
        <section className="mb-16">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">アプリの特徴</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <FaStar className="text-pink-500 text-2xl" />
              </div>
              <h4 className="text-xl font-bold text-center mb-3">3段階評価</h4>
              <p className="text-gray-600 text-center">
                「がんばった」「よくがんばった」「とてもがんばった」の3段階で、子どもの頑張りを細かく評価できます。
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <FaUsers className="text-purple-500 text-2xl" />
              </div>
              <h4 className="text-xl font-bold text-center mb-3">家族で共有</h4>
              <p className="text-gray-600 text-center">
                親が習慣を設定し、子どもが申請、親が承認する仕組みで、家族のコミュニケーションが深まります。
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <FaHeart className="text-indigo-500 text-2xl" />
              </div>
              <h4 className="text-xl font-bold text-center mb-3">楽しい演出</h4>
              <p className="text-gray-600 text-center">
                承認時には美しいアニメーション演出で、子どもの達成感とモチベーションをアップします。
              </p>
            </div>
          </div>
        </section>

        {/* 使い方セクション */}
        <section className="mb-16">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">使い方</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-pink-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h4 className="font-bold mb-2">家族登録</h4>
              <p className="text-gray-600 text-sm">家族情報と子どもの情報を登録します</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h4 className="font-bold mb-2">習慣設定</h4>
              <p className="text-gray-600 text-sm">親が子どもの習慣と評価基準を設定します</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h4 className="font-bold mb-2">毎日の申請</h4>
              <p className="text-gray-600 text-sm">子どもが習慣を実行して申請を送信します</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                4
              </div>
              <h4 className="font-bold mb-2">承認と演出</h4>
              <p className="text-gray-600 text-sm">親が承認すると楽しい演出が表示されます</p>
            </div>
          </div>
        </section>

        {/* CTAセクション */}
        <section className="text-center bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-12 text-white">
          <h3 className="text-3xl font-bold mb-4">今すぐ始めませんか？</h3>
          <p className="text-xl mb-8 opacity-90">家族で楽しく習慣づくりを始めて、子どもの成長を応援しましょう。</p>
          <Link
            href="/sara/auth/register"
            className="inline-block px-8 py-4 bg-white text-pink-600 rounded-xl font-bold text-lg hover:bg-gray-50 transition-colors shadow-lg"
          >
            無料で家族登録
          </Link>
        </section>
      </main>
      {/* フッター */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <FaHome className="text-pink-400 text-xl" />
            <span className="text-lg font-semibold">おうちスタンプラリー</span>
          </div>
          <p className="text-gray-400">家族で育む、習慣の力</p>
        </div>
      </footer>
    </div>
  )
}
