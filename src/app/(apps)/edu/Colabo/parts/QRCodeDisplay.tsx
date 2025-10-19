'use client'

import {QRCodeSVG} from 'qrcode.react'
import {Button} from '@cm/components/styles/common-components/Button'
import {useState} from 'react'

interface QRCodeDisplayProps {
  secretKey: string
  gameName: string
  baseUrl?: string
}

export default function QRCodeDisplay({secretKey, gameName, baseUrl}: QRCodeDisplayProps) {
  const [copied, setCopied] = useState(false)

  // 生徒用のURL
  const studentUrl = `${baseUrl || window.location.origin}/edu/Colabo/enter?key=${secretKey}`

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(studentUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyKey = () => {
    navigator.clipboard.writeText(secretKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4 text-center">生徒用 参加QRコード</h3>

      <div className="mb-4 text-center">
        <p className="text-sm text-gray-600 mb-1">授業名</p>
        <p className="text-lg font-semibold">{gameName}</p>
      </div>

      {/* QRコード */}
      <div className="flex justify-center mb-6 bg-white p-4 rounded">
        <QRCodeSVG value={studentUrl} size={256} level="H" includeMargin={true} />
      </div>

      {/* 秘密鍵 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">参加キー</label>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={secretKey}
            readOnly
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 bg-gray-50 font-mono text-center text-2xl font-bold tracking-wider"
          />
          <Button onClick={handleCopyKey} className="bg-gray-600 hover:bg-gray-700">
            {copied ? '✓' : 'コピー'}
          </Button>
        </div>
      </div>

      {/* URL */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">参加URL</label>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={studentUrl}
            readOnly
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-sm"
          />
          <Button onClick={handleCopyUrl} className="bg-gray-600 hover:bg-gray-700">
            {copied ? '✓' : 'コピー'}
          </Button>
        </div>
      </div>

      {/* 説明 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <h4 className="font-semibold text-blue-900 mb-2">生徒の参加方法</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>1. スマートフォンやタブレットでQRコードを読み取る</li>
          <li>2. または、参加キーを入力画面に入力する</li>
          <li>3. 自分の名前を選択して参加する</li>
        </ul>
      </div>
    </div>
  )
}
