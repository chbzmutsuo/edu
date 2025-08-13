'use client'

import {ExpenseFormData, AIDraft} from '@app/(apps)/keihi/types'
import {toast} from 'react-toastify'

interface ExpenseAIDraftSectionProps {
  formData: ExpenseFormData
  setFormData: (field: string, value: any) => void
  aiDraft: AIDraft | null
  setAiDraft: React.Dispatch<React.SetStateAction<AIDraft | null>>
  showDraft: boolean
  setShowDraft: React.Dispatch<React.SetStateAction<boolean>>
  isAnalyzing: boolean
  additionalInstruction: string
  setAdditionalInstruction: React.Dispatch<React.SetStateAction<string>>
  onGenerateDraft: () => Promise<void>
  onRegenerateDraft: () => Promise<void>
}

export function ExpenseAIDraftSection({
  formData,
  setFormData,
  aiDraft,
  setAiDraft,
  showDraft,
  setShowDraft,
  isAnalyzing,
  additionalInstruction,
  setAdditionalInstruction,
  onGenerateDraft,
  onRegenerateDraft,
}: ExpenseAIDraftSectionProps) {
  return (
    <div className="border-t border-gray-200 pt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">AIインサイト下書き</h2>
        <button
          type="button"
          onClick={onGenerateDraft}
          disabled={isAnalyzing}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isAnalyzing && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
          {isAnalyzing ? '生成中...' : '下書き生成'}
        </button>
      </div>
      {/* 追加指示入力 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">AIへの追加指示（任意）</label>
        <textarea
          value={additionalInstruction}
          onChange={e => setAdditionalInstruction(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          placeholder="例：技術的な内容を重視して、営業面は簡潔に"
        />
      </div>
      {/* 下書き表示 */}
      {aiDraft && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-purple-900">生成された下書き</h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onRegenerateDraft}
                disabled={isAnalyzing}
                className="text-sm px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
              >
                再生成
              </button>
              <button
                type="button"
                onClick={() => setShowDraft(false)}
                className="text-sm px-3 py-1 border border-purple-300 text-purple-700 rounded hover:bg-purple-100"
              >
                閉じる
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* 摘要 */}
            <div>
              <label className="block text-sm font-medium text-purple-800 mb-1">摘要</label>
              <textarea
                value={aiDraft.summary}
                onChange={e => setAiDraft(prev => (prev ? {...prev, summary: e.target.value} : null))}
                rows={1}
                className="w-full px-2 py-1 text-sm border border-purple-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                placeholder="経費の簡潔な説明文"
              />
            </div>

            {/* 統合されたインサイト */}
            <div>
              <label className="block text-sm font-medium text-purple-800 mb-1">
                インサイト
                <span className="text-xs text-purple-600 ml-2">（営業・ビジネス・技術の観点を統合）</span>
              </label>
              <textarea
                value={aiDraft.insight}
                onChange={e => setAiDraft(prev => (prev ? {...prev, insight: e.target.value} : null))}
                rows={5}
                className="w-full px-2 py-1 text-sm border border-purple-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                placeholder="営業・ビジネス・技術の観点を統合したインサイト"
              />
            </div>

            {/* 生成されたキーワード */}
            {aiDraft.generatedKeywords && aiDraft.generatedKeywords.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-purple-800 mb-1">
                  生成されたキーワード
                  <span className="text-xs text-purple-600 ml-2">（想定される交流内容から生成）</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {aiDraft.generatedKeywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-green-100 text-green-800 border border-green-300 rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      // 生成されたキーワードをフォームのキーワードに追加
                      const currentKeywords = formData.keywords || []
                      const newKeywords = [...new Set([...currentKeywords, ...aiDraft.generatedKeywords])]
                      setFormData('keywords', newKeywords)
                      toast.success('生成されたキーワードをフォームに追加しました')
                    }}
                    className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    キーワードをフォームに追加
                  </button>
                </div>
              </div>
            )}

            {/* 自動タグ */}
            <div>
              <label className="block text-sm font-medium text-purple-800 mb-1">自動生成タグ</label>
              <div className="flex flex-wrap gap-2">
                {aiDraft.autoTags.map((tag, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <input
                      type="text"
                      value={tag}
                      onChange={e => {
                        const newTags = [...aiDraft.autoTags]
                        newTags[index] = e.target.value
                        setAiDraft(prev => (prev ? {...prev, autoTags: newTags} : null))
                      }}
                      className="px-2 py-1 text-xs border border-purple-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newTags = aiDraft.autoTags.filter((_, i) => i !== index)
                        setAiDraft(prev => (prev ? {...prev, autoTags: newTags} : null))
                      }}
                      className="text-purple-600 hover:text-purple-800 text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => {
                    const newTag = prompt('新しいタグを入力してください:')
                    if (newTag?.trim()) {
                      setAiDraft(prev => (prev ? {...prev, autoTags: [...prev.autoTags, newTag.trim()]} : null))
                    }
                  }}
                  className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  タグ追加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
