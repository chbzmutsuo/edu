'use client'

import {Button} from '@cm/components/styles/common-components/Button'
import {useState, useEffect} from 'react'
import BlockItem from './BlockItem'

import AutoGridContainer from '@cm/components/utils/AutoGridContainer'

import {C_Stack, Circle, R_Stack} from '@cm/components/styles/common-components/common-components'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'
import {PlusIcon} from 'lucide-react'

interface RightSidebarProps {
  selectedSlide: any | null

  onUpdateSlide: (slideId: number, updates: any) => void
  onDeleteSlide: (slideId: number) => void
}

export default function RightSidebar({selectedSlide, onUpdateSlide, onDeleteSlide}: RightSidebarProps) {
  const [editingBlock, setEditingBlock] = useState<any | null>(null)

  // ローカル編集状態
  const [localTitle, setLocalTitle] = useState('')
  const [localQuestion, setLocalQuestion] = useState('')

  // スライドが変更されたらローカル状態を更新
  useEffect(() => {
    setLocalTitle(selectedSlide?.contentData?.title || '')
    setLocalQuestion(selectedSlide?.contentData?.question || '')
  }, [selectedSlide?.id])

  // タイトル保存（フォーカスが外れた時）
  const handleTitleBlur = () => {
    if (!selectedSlide) return
    if (localTitle !== selectedSlide.contentData?.title) {
      onUpdateSlide(selectedSlide.id, {
        contentData: {
          ...selectedSlide.contentData,
          title: localTitle,
        },
      })
    }
  }

  // 問題文保存（フォーカスが外れた時）
  const handleQuestionBlur = () => {
    if (!selectedSlide) return
    if (localQuestion !== selectedSlide.contentData?.question) {
      onUpdateSlide(selectedSlide.id, {
        contentData: {
          ...selectedSlide.contentData,
          question: localQuestion,
        },
      })
    }
  }

  // ブロック追加
  const handleAddBlock = (blockType: string) => {
    if (!selectedSlide) return
    const newBlock = {
      id: `temp_${Date.now()}`,
      blockType,
      content: '',
      sortOrder: selectedSlide.contentData?.blocks?.length || 0,
    }
    const updatedBlocks = [...(selectedSlide.contentData?.blocks || []), newBlock]
    onUpdateSlide(selectedSlide.id, {
      contentData: {
        ...selectedSlide.contentData,
        blocks: updatedBlocks,
      },
    })
    setEditingBlock(newBlock)
  }

  // ブロック更新
  const handleUpdateBlock = (blockId: string, updates: any) => {
    if (!selectedSlide) return
    const updatedBlocks = selectedSlide.contentData?.blocks?.map((b: any) => (b.id === blockId ? {...b, ...updates} : b))
    onUpdateSlide(selectedSlide.id, {
      contentData: {
        ...selectedSlide.contentData,
        blocks: updatedBlocks,
      },
    })
  }

  // ブロック削除
  const handleDeleteBlock = (blockId: string) => {
    if (!selectedSlide) return
    const updatedBlocks = selectedSlide.contentData?.blocks?.filter((b: any) => b.id !== blockId)
    onUpdateSlide(selectedSlide.id, {
      contentData: {
        ...selectedSlide.contentData,
        blocks: updatedBlocks,
      },
    })
    setEditingBlock(null)
  }

  // ブロック移動
  const handleMoveBlock = (blockId: string, direction: 'up' | 'down') => {
    if (!selectedSlide) return
    const blocks = selectedSlide.contentData?.blocks || []
    const index = blocks.findIndex((b: any) => b.id === blockId)
    if (index === -1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= blocks.length) return

    const newBlocks = [...blocks]
    ;[newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]]
    // 更新sortOrder
    newBlocks.forEach((block, i) => {
      block.sortOrder = i
    })

    onUpdateSlide(selectedSlide.id, {
      contentData: {
        ...selectedSlide.contentData,
        blocks: newBlocks,
      },
    })
  }

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
      {/* セクション1: テンプレート追加 */}

      {/* セクション2: ブロック編集 */}
      <div className="flex-1 overflow-y-auto p-4">
        {selectedSlide ? (
          <C_Stack>
            {/* スライド情報 */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">編集中</div>
              <div className="font-semibold text-blue-900">
                スライド #{selectedSlide.sortOrder + 1} • {selectedSlide.templateType}
              </div>
            </div>

            {/* タイトル編集 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">タイトル</label>
              <input
                type="text"
                value={localTitle}
                onChange={e => setLocalTitle(e.target.value)}
                onBlur={handleTitleBlur}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="スライドのタイトルを入力"
              />
            </div>

            <section>
              {/* ノーマルスライドの場合 */}
              {selectedSlide.templateType === 'normal' && (
                <section>
                  <h4 className="font-semibold text-sm text-gray-700 ">ブロック</h4>

                  {/* ブロック一覧 */}
                  <C_Stack className={`gap-8`}>
                    {selectedSlide.contentData?.blocks && selectedSlide.contentData.blocks.length > 0 && (
                      <div className="space-y-6">
                        {selectedSlide.contentData.blocks.map((block: any, index: number) => (
                          <BlockItem
                            key={block.id}
                            block={block}
                            index={index}
                            totalBlocks={selectedSlide.contentData.blocks.length}
                            isEditing={editingBlock?.id === block.id}
                            onEdit={() => setEditingBlock(block)}
                            handleUpdateBlock={handleUpdateBlock}
                            onDelete={() => handleDeleteBlock(block.id)}
                            onMove={handleMoveBlock}
                          />
                        ))}
                      </div>
                    )}

                    {/* ブロック追加ボタン */}
                    <R_Stack>
                      <Button size="sm" onClick={() => handleAddBlock('text')}>
                        <PlusIcon className="inline" /> 📝 テキスト
                      </Button>
                      <Button size="sm" onClick={() => handleAddBlock('image')}>
                        <PlusIcon className="inline" /> 🖼️ 画像
                      </Button>
                      <Button size="sm" onClick={() => handleAddBlock('link')}>
                        <PlusIcon className="inline" /> 🔗 リンク
                      </Button>
                    </R_Stack>
                  </C_Stack>
                </section>
              )}

              {/* 選択クイズスライドの場合 */}
              {selectedSlide.templateType === 'choice' && (
                <section>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">問題文</label>
                    <textarea
                      value={localQuestion}
                      onChange={e => setLocalQuestion(e.target.value)}
                      onBlur={handleQuestionBlur}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      rows={3}
                      placeholder="問題を入力してください"
                    />
                  </div>

                  {/* 選択肢は後で実装 */}
                  <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-800">選択肢編集機能は実装中です</div>
                </section>
              )}

              {/* 自由記述スライドの場合 */}
              {selectedSlide.templateType === 'freetext' && (
                <section>
                  <label className="block text-sm font-medium text-gray-700 mb-2">問題文</label>
                  <textarea
                    value={localQuestion}
                    onChange={e => setLocalQuestion(e.target.value)}
                    onBlur={handleQuestionBlur}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    rows={5}
                    placeholder="問題を入力してください"
                  />
                </section>
              )}

              {/* 心理アンケート/まとめスライドの場合 */}
              {(selectedSlide.templateType === 'psycho' || selectedSlide.templateType === 'summary') && (
                <section className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
                  <p className="font-medium mb-2">このテンプレートについて</p>
                  <p>このテンプレートはGroupingアプリの質問項目を使用します。質問内容はシステムで管理されています。</p>
                </section>
              )}
            </section>
            {/* スライド削除ボタン */}
            <div className="pt-4 border-t border-gray-200">
              <Button
                onClick={() => {
                  if (confirm('このスライドを削除してもよろしいですか？')) {
                    onDeleteSlide(selectedSlide.id)
                  }
                }}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                🗑️ このスライドを削除
              </Button>
            </div>
          </C_Stack>
        ) : (
          <div className="text-center text-gray-400 py-12">
            <div className="text-4xl mb-2">👈</div>
            <p className="text-sm">スライドを選択してください</p>
          </div>
        )}
      </div>
    </div>
  )
}
