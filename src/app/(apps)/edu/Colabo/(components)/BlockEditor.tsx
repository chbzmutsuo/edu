'use client'

import {useState} from 'react'
import {Button} from '@cm/components/styles/common-components/Button'

export const BlockEditor = ({block, onSave, onCancel}) => {
  const [formData, setFormData] = useState({
    blockType: block.blockType,
    content: block.content || '',
    imageUrl: block.imageUrl || '',
    linkUrl: block.linkUrl || '',
    alignment: block.alignment || 'left',
    verticalAlign: block.verticalAlign || 'top',
    textColor: block.textColor || '#000000',
    backgroundColor: block.backgroundColor || '#ffffff',
    fontWeight: block.fontWeight || 'normal',
    textDecoration: block.textDecoration || 'none',
    isCorrectAnswer: block.isCorrectAnswer || false,
  })

  const handleInputChange = (field, value) => {
    setFormData(prev => ({...prev, [field]: value}))
  }

  const handleSave = () => {
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">ブロック編集</h2>
        </div>

        <div className="p-6 space-y-4">
          {/* コンテンツ入力 */}
          {['text', 'quiz_question', 'choice_option'].includes(formData.blockType) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {formData.blockType === 'quiz_question'
                  ? '問題文'
                  : formData.blockType === 'choice_option'
                    ? '選択肢テキスト'
                    : 'テキスト'}
              </label>
              <textarea
                value={formData.content}
                onChange={e => handleInputChange('content', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 h-32"
                placeholder="Markdown記法が使えます"
              />
              <div className="text-xs text-gray-500 mt-1"># 見出し、**太字**、*斜体*、[リンク](URL) などが使えます</div>
            </div>
          )}

          {/* 画像URL */}
          {formData.blockType === 'image' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">画像URL</label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={e => handleInputChange('imageUrl', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="https://example.com/image.jpg"
              />
              {formData.imageUrl && (
                <div className="mt-2">
                  <img src={formData.imageUrl} alt="プレビュー" className="max-w-full h-auto max-h-32 rounded border" />
                </div>
              )}
            </div>
          )}

          {/* リンクURL */}
          {formData.blockType === 'link' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">リンクURL</label>
              <input
                type="url"
                value={formData.linkUrl}
                onChange={e => handleInputChange('linkUrl', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="https://example.com"
              />
              <label className="block text-sm font-medium text-gray-700 mb-1 mt-3">表示テキスト</label>
              <input
                type="text"
                value={formData.content}
                onChange={e => handleInputChange('content', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="リンクテキスト（空の場合はURLが表示されます）"
              />
            </div>
          )}

          {/* レイアウト設定 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">水平配置</label>
              <select
                value={formData.alignment}
                onChange={e => handleInputChange('alignment', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="left">左寄せ</option>
                <option value="center">中央</option>
                <option value="right">右寄せ</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">垂直配置</label>
              <select
                value={formData.verticalAlign}
                onChange={e => handleInputChange('verticalAlign', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="top">上寄せ</option>
                <option value="middle">中央</option>
                <option value="bottom">下寄せ</option>
              </select>
            </div>
          </div>

          {/* 色設定 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">テキスト色</label>
              <input
                type="color"
                value={formData.textColor}
                onChange={e => handleInputChange('textColor', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-1 py-1 h-10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">背景色</label>
              <input
                type="color"
                value={formData.backgroundColor}
                onChange={e => handleInputChange('backgroundColor', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-1 py-1 h-10"
              />
            </div>
          </div>

          {/* フォント設定 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">太字</label>
              <select
                value={formData.fontWeight}
                onChange={e => handleInputChange('fontWeight', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="normal">通常</option>
                <option value="bold">太字</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">装飾</label>
              <select
                value={formData.textDecoration}
                onChange={e => handleInputChange('textDecoration', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="none">なし</option>
                <option value="underline">下線</option>
              </select>
            </div>
          </div>

          {/* クイズ設定 */}
          {formData.blockType === 'choice_option' && (
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isCorrectAnswer}
                  onChange={e => handleInputChange('isCorrectAnswer', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700">この選択肢を正解にする</span>
              </label>
            </div>
          )}
        </div>

        {/* ボタン */}
        <div className="p-6 border-t flex justify-end space-x-2">
          <Button onClick={onCancel}>キャンセル</Button>
          <Button onClick={handleSave}>保存</Button>
        </div>
      </div>
    </div>
  )
}
