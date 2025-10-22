'use client'

import {Button} from '@cm/components/styles/common-components/Button'
import {useState, useEffect} from 'react'
import BlockItem from './BlockItem'

import {C_Stack, Circle, R_Stack} from '@cm/components/styles/common-components/common-components'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'
import {PlusIcon} from 'lucide-react'

interface RightSidebarProps {
  selectedSlide: any | null

  handleUpdateSlide: (slideId: number, updates: any) => void
  handleDeleteSlide: (slideId: number) => void
}

export default function RightSidebar({selectedSlide, handleUpdateSlide, handleDeleteSlide}: RightSidebarProps) {
  const [editingBlock, setEditingBlock] = useState<any | null>(null)

  // ローカル編集状態
  const [localTitle, setLocalTitle] = useState('')
  const [localQuestion, setLocalQuestion] = useState('')
  const [localChoices, setLocalChoices] = useState<any[]>([])

  // スライドが変更されたらローカル状態を更新
  useEffect(() => {
    setLocalTitle(selectedSlide?.contentData?.title || '')
    setLocalQuestion(selectedSlide?.contentData?.question || '')
    setLocalChoices(selectedSlide?.contentData?.choices || [])
  }, [selectedSlide?.id])

  // タイトル保存（フォーカスが外れた時）
  const handleTitleBlur = () => {
    if (!selectedSlide) return
    if (localTitle !== selectedSlide.contentData?.title) {
      handleUpdateSlide(selectedSlide.id, {
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
      handleUpdateSlide(selectedSlide.id, {
        contentData: {
          ...selectedSlide.contentData,
          question: localQuestion,
        },
      })
    }
  }

  // 選択肢追加
  const handleAddChoice = () => {
    const newChoice = {
      id: `choice_${Date.now()}`,
      text: '',
      isCorrect: false,
      sortOrder: localChoices.length,
    }
    const updatedChoices = [...localChoices, newChoice]
    setLocalChoices(updatedChoices)
    saveChoices(updatedChoices)
  }

  // 選択肢更新
  const handleUpdateChoice = (choiceId: string, field: string, value: any) => {
    const updatedChoices = localChoices.map(choice => (choice.id === choiceId ? {...choice, [field]: value} : choice))
    setLocalChoices(updatedChoices)
    saveChoices(updatedChoices)
  }

  // 選択肢削除
  const handleDeleteChoice = (choiceId: string) => {
    const updatedChoices = localChoices.filter(choice => choice.id !== choiceId)
    // sortOrderを再設定
    updatedChoices.forEach((choice, index) => {
      choice.sortOrder = index
    })
    setLocalChoices(updatedChoices)
    saveChoices(updatedChoices)
  }

  // 選択肢移動
  const handleMoveChoice = (choiceId: string, direction: 'up' | 'down') => {
    const index = localChoices.findIndex(c => c.id === choiceId)
    if (index === -1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= localChoices.length) return

    const newChoices = [...localChoices]
    ;[newChoices[index], newChoices[newIndex]] = [newChoices[newIndex], newChoices[index]]
    // sortOrderを更新
    newChoices.forEach((choice, i) => {
      choice.sortOrder = i
    })

    setLocalChoices(newChoices)
    saveChoices(newChoices)
  }

  // 選択肢をサーバーに保存
  const saveChoices = (choices: any[]) => {
    if (!selectedSlide) return
    handleUpdateSlide(selectedSlide.id, {
      contentData: {
        ...selectedSlide.contentData,
        choices,
      },
    })
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
    handleUpdateSlide(selectedSlide.id, {
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
    handleUpdateSlide(selectedSlide.id, {
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
    handleUpdateSlide(selectedSlide.id, {
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

    handleUpdateSlide(selectedSlide.id, {
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
                  <C_Stack className="gap-6">
                    {/* 問題文 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">問題文</label>
                      <textarea
                        value={localQuestion}
                        onChange={e => setLocalQuestion(e.target.value)}
                        onBlur={handleQuestionBlur}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="問題を入力してください"
                      />
                    </div>

                    {/* 選択肢 */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-sm text-gray-700">選択肢</h4>
                        <Button size="sm" onClick={handleAddChoice} className="bg-green-600 hover:bg-green-700">
                          <PlusIcon className="inline w-4 h-4" /> 選択肢を追加
                        </Button>
                      </div>

                      {localChoices.length > 0 ? (
                        <C_Stack className="gap-3">
                          {localChoices.map((choice, index) => (
                            <div
                              key={choice.id}
                              className={`border rounded-lg p-3 ${choice.isCorrect ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'}`}
                            >
                              <R_Stack className="gap-2 items-start">
                                {/* 選択肢番号 */}
                                <div className="flex-shrink-0 mt-2">
                                  <Circle className="w-6 h-6 flex items-center justify-center bg-gray-200 text-xs font-bold">
                                    {index + 1}
                                  </Circle>
                                </div>

                                {/* テキスト入力 */}
                                <div className="flex-1">
                                  <input
                                    type="text"
                                    value={choice.text}
                                    onChange={async e => {
                                      await handleUpdateChoice(choice.id, 'text', e.target.value)
                                    }}
                                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                                    placeholder={`選択肢${index + 1}を入力`}
                                  />
                                </div>

                                {/* 正解チェックボックス */}
                                <div className="flex-shrink-0 flex items-center space-x-1 mt-1">
                                  <input
                                    type="checkbox"
                                    checked={choice.isCorrect}
                                    onChange={async e => {
                                      await handleUpdateChoice(choice.id, 'isCorrect', e.target.checked)
                                    }}
                                    className="w-4 h-4 text-green-600 focus:ring-green-500"
                                    title="正解にする"
                                  />
                                  <label className="text-xs text-gray-600">正解</label>
                                </div>

                                {/* 操作ボタン */}
                                <div className="flex-shrink-0 flex flex-col gap-1">
                                  <IconBtn
                                    onClick={() => handleMoveChoice(choice.id, 'up')}
                                    disabled={index === 0}
                                    className="p-1 text-xs disabled:opacity-30"
                                  >
                                    ↑
                                  </IconBtn>
                                  <IconBtn
                                    onClick={() => handleMoveChoice(choice.id, 'down')}
                                    disabled={index === localChoices.length - 1}
                                    className="p-1 text-xs disabled:opacity-30"
                                  >
                                    ↓
                                  </IconBtn>
                                </div>

                                {/* 削除ボタン */}
                                <div className="flex-shrink-0">
                                  <IconBtn
                                    onClick={() => {
                                      if (confirm('この選択肢を削除してもよろしいですか？')) {
                                        handleDeleteChoice(choice.id)
                                      }
                                    }}
                                    className="p-1 text-red-600 hover:bg-red-50"
                                  >
                                    🗑️
                                  </IconBtn>
                                </div>
                              </R_Stack>
                            </div>
                          ))}
                        </C_Stack>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-400">
                          <p className="text-sm">選択肢がありません</p>
                          <p className="text-xs mt-1">「選択肢を追加」ボタンから追加してください</p>
                        </div>
                      )}

                      {/* 正解数の確認 */}
                      {localChoices.length > 0 && (
                        <div className="mt-3 text-xs text-gray-600">
                          <span>
                            全{localChoices.length}個 / 正解: {localChoices.filter(c => c.isCorrect).length}個
                            {localChoices.filter(c => c.isCorrect).length === 0 && (
                              <span className="text-orange-600 ml-2">⚠️ 正解が設定されていません</span>
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </C_Stack>
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
                    handleDeleteSlide(selectedSlide.id)
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
