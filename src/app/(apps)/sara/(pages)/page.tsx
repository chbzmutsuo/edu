'use client'

import Link from 'next/link'
import {motion} from 'framer-motion'
import {FaHome, FaUsers, FaStar} from 'react-icons/fa'

export default function SaraHomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <motion.header
          initial={{opacity: 0, y: -20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.6}}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full mb-6">
            <FaStar className="text-white text-3xl" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">おうちスタンプラリー</h1>
          <p className="text-gray-600 text-lg">みんなで楽しく生活習慣を身につけよう！</p>
        </motion.header>

        {/* メイン機能説明 */}
        <motion.section
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.6, delay: 0.2}}
          className="mb-12"
        >
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUsers className="text-blue-500 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">家族みんなで</h3>
              <p className="text-gray-600">お父さん、お母さんと一緒に、みんなで頑張ろう！</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaStar className="text-green-500 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">がんばったらスタンプ</h3>
              <p className="text-gray-600">いいことをしたら、素敵なスタンプがもらえるよ！</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaHome className="text-purple-500 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">おうちで楽しく</h3>
              <p className="text-gray-600">いつものおうちが、楽しい冒険の場所に変身！</p>
            </div>
          </div>
        </motion.section>

        {/* ログインボタン */}
        <motion.section
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.6, delay: 0.4}}
          className="text-center"
        >
          <div className="space-y-4">
            <Link href="/sara/auth/parent/login">
              <motion.button
                whileHover={{scale: 1.05}}
                whileTap={{scale: 0.95}}
                className="w-full max-w-sm mx-auto block bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-4 px-8 rounded-xl shadow-lg"
              >
                おとうさん・おかあさん ログイン
              </motion.button>
            </Link>

            <Link href="/sara/auth/child/login">
              <motion.button
                whileHover={{scale: 1.05}}
                whileTap={{scale: 0.95}}
                className="w-full max-w-sm mx-auto block bg-gradient-to-r from-pink-400 to-pink-500 text-white font-semibold py-4 px-8 rounded-xl shadow-lg"
              >
                こども ログイン
              </motion.button>
            </Link>

            <Link href="/sara/auth/register">
              <motion.button
                whileHover={{scale: 1.05}}
                whileTap={{scale: 0.95}}
                className="w-full max-w-sm mx-auto block bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-4 px-8 rounded-xl shadow-lg"
              >
                はじめて登録する
              </motion.button>
            </Link>
          </div>
        </motion.section>

        {/* フッター */}
        <motion.footer
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          transition={{duration: 0.6, delay: 0.6}}
          className="text-center mt-16 text-gray-500"
        >
          <p>&copy; 2024 おうちスタンプラリー. All rights reserved.</p>
        </motion.footer>
      </div>
    </div>
  )
}
