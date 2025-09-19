'use client'
import React, { useState, useRef } from 'react'
import { Button } from '@cm/components/styles/common-components/Button'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import { toastByResult } from '@cm/lib/ui/notifications'
import { UploadIcon, FileIcon } from 'lucide-react'

interface EtcFileUploadProps {
  onFileLoaded: (content: string) => void
  isLoading: boolean
  onSubmit: () => void
}

export const EtcFileUpload: React.FC<EtcFileUploadProps> = ({ onFileLoaded, isLoading }) => {
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // CSVファイルかどうかをチェック
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toastByResult({ success: false, message: 'CSVファイルを選択してください' })
      return
    }

    setFileName(file.name)

    // ファイルを読み込む
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        const content = event.target.result.toString()
        
        // Shift-JISエンコードされたCSVファイルを適切に処理
        // ブラウザ環境では文字コード変換が難しいため、サーバーサイドで処理するか
        // 文字化けしたままでも構造を解析できるようにする
        
        onFileLoaded(content)
      }
    }
    reader.onerror = () => {
      toastByResult({ success: false, message: 'ファイルの読み込みに失敗しました' })
    }
    reader.readAsText(file, 'Shift_JIS') // Shift-JISエンコードを指定
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <C_Stack className="gap-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv"
        style={{ display: 'none' }}
      />
      
      <R_Stack className="items-center gap-2">
        <Button
          onClick={handleButtonClick}
          disabled={isLoading}
          leftIcon={<UploadIcon size={16} />}
        >
          {isLoading ? 'アップロード中...' : 'CSVファイルを選択'}
        </Button>
        
        {fileName && (
          <R_Stack className="items-center gap-1 text-sm text-gray-600">
            <FileIcon size={16} />
            <span>{fileName}</span>
          </R_Stack>
        )}
      </R_Stack>
    </C_Stack>
  )
}
