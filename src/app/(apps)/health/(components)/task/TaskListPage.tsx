'use client'

import React, {useState, useEffect, useMemo} from 'react'
import {getTasks, toggleTaskComplete, deleteTask, deleteTaskAttachment} from '../../(lib)/task-actions'
import {Task} from '../../(lib)/task-actions'
import TaskModal from './TaskModal'
import RecurringTaskModal from './RecurringTaskModal'
import useGlobal from '@hooks/globalHooks/useGlobal'

export default function TaskListPage() {
  const {session} = useGlobal()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('pending')
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'dueDate' | 'createdAt' | 'title'>('dueDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [deletingAttachmentId, setDeletingAttachmentId] = useState<number | null>(null)

  const loadTasks = async () => {
    if (!session?.id) return

    setLoading(true)
    const result = await getTasks({userId: session.id, filter, sortBy, sortOrder})
    if (result.success && result.data) {
      setTasks(result.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadTasks()
  }, [filter, sortBy, sortOrder, session?.id])

  // 検索フィルタリング
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks

    const query = searchQuery.toLowerCase()
    return tasks.filter(
      task => task.title.toLowerCase().includes(query) || (task.description && task.description.toLowerCase().includes(query))
    )
  }, [tasks, searchQuery])

  const handleToggleComplete = async (taskId: number) => {
    const result = await toggleTaskComplete(taskId)
    if (result.success) {
      await loadTasks()
    }
  }

  const handleDeleteTask = async (taskId: number) => {
    if (confirm('このタスクを削除しますか？')) {
      const result = await deleteTask(taskId)
      if (result.success) {
        await loadTasks()
      }
    }
  }

  const handleDeleteAttachment = async (attachmentId: number) => {
    if (confirm('この画像を削除しますか？\n削除した画像は復元できません。')) {
      setDeletingAttachmentId(attachmentId)
      try {
        const result = await deleteTaskAttachment(attachmentId)
        if (result.success) {
          await loadTasks()
        } else {
          alert(`画像の削除に失敗しました: ${result.error}`)
        }
      } catch (error) {
        console.error('画像削除エラー:', error)
        alert('画像の削除に失敗しました')
      } finally {
        setDeletingAttachmentId(null)
      }
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsTaskModalOpen(true)
  }

  const handleTaskModalClose = () => {
    setIsTaskModalOpen(false)
    setEditingTask(null)
    loadTasks()
  }

  const handleSortChange = (newSortBy: 'dueDate' | 'createdAt' | 'title') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(newSortBy)
      setSortOrder('asc')
    }
  }

  const isOverdue = (dueDate: Date | null) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date() && !tasks.find(t => t.dueDate === dueDate)?.completed
  }

  const formatDate = (date: Date | null) => {
    if (!date) return '期限なし'
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getSortIcon = (field: 'dueDate' | 'createdAt' | 'title') => {
    if (sortBy !== field) return '↕️'
    return sortOrder === 'asc' ? '↑' : '↓'
  }

  if (loading) {
    return <div className="p-4">読み込み中...</div>
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">タスク管理</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm sm:text-base"
          >
            新しいタスク
          </button>
          <button
            onClick={() => setIsRecurringModalOpen(true)}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm sm:text-base"
          >
            定期タスク
          </button>
        </div>
      </div>

      {/* 検索・フィルタ・ソート */}
      <div className="flex flex-col gap-4 mb-6">
        {/* 検索バー */}
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="タスクを検索..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="px-3 py-2 text-gray-500 hover:text-gray-700 text-sm">
              クリア
            </button>
          )}
        </div>

        {/* フィルタ */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded text-sm ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            すべて
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded text-sm ${filter === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            未完了
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded text-sm ${filter === 'completed' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            完了
          </button>
        </div>

        {/* ソート
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600 self-center">並び順:</span>
          <button
            onClick={() => handleSortChange('dueDate')}
            className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${
              sortBy === 'dueDate' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            期限日 {getSortIcon('dueDate')}
          </button>
          <button
            onClick={() => handleSortChange('createdAt')}
            className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${
              sortBy === 'createdAt' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            作成日 {getSortIcon('createdAt')}
          </button>
          <button
            onClick={() => handleSortChange('title')}
            className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${
              sortBy === 'title' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            タイトル {getSortIcon('title')}
          </button>
        </div> */}
      </div>

      {/* 検索結果の表示 */}
      {searchQuery && (
        <div className="mb-4 text-sm text-gray-600">
          検索結果: {filteredTasks.length}件 / 全{tasks.length}件
        </div>
      )}

      {/* タスク一覧 */}
      <div className="space-y-2">
        {filteredTasks.map(task => (
          <div
            key={task.id}
            className={`p-3 sm:p-4 border rounded-lg ${
              task.completed
                ? 'bg-green-50 border-green-200'
                : isOverdue(task.dueDate || null)
                  ? 'bg-red-50 border-red-200'
                  : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggleComplete(task.id)}
                  className="w-4 h-4 mt-1 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3
                    className={`font-medium text-sm sm:text-base ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}
                  >
                    {task.title}
                  </h3>
                  {task.description && <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words">{task.description}</p>}
                  <div className="text-xs sm:text-sm text-gray-500 mt-1">
                    期限: {formatDate(task.dueDate || null)}
                    {task.isRecurring && (
                      <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">定期</span>
                    )}
                  </div>
                  {/* 添付画像の表示 */}
                  {task.TaskAttachment && task.TaskAttachment.length > 0 && (
                    <div className="mt-2">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                        {task.TaskAttachment.map(attachment => (
                          <div key={attachment.id} className="relative group">
                            <img
                              src={attachment.url}
                              alt={attachment.originalName}
                              className="w-full h-16 sm:h-20 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => window.open(attachment.url, '_blank')}
                            />
                            <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                              📎
                            </div>
                            {/* 削除ボタン */}
                            <button
                              onClick={() => handleDeleteAttachment(attachment.id)}
                              disabled={deletingAttachmentId === attachment.id}
                              className="absolute -top-2 -left-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              {deletingAttachmentId === attachment.id ? '...' : '×'}
                            </button>
                            {/* ファイル名のツールチップ */}
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 rounded-b opacity-0 group-hover:opacity-100 transition-opacity truncate">
                              {attachment.originalName}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => handleEditTask(task)}
                  className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-blue-600 hover:bg-blue-50 rounded"
                >
                  編集
                </button>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-red-600 hover:bg-red-50 rounded"
                >
                  削除
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredTasks.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
            {searchQuery ? '検索条件に一致するタスクがありません' : 'タスクがありません'}
          </div>
        )}
      </div>

      {/* モーダル */}
      {isTaskModalOpen && <TaskModal task={editingTask} onClose={handleTaskModalClose} />}
      {isRecurringModalOpen && (
        <RecurringTaskModal
          onClose={() => {
            setIsRecurringModalOpen(false)
            loadTasks()
          }}
        />
      )}
    </div>
  )
}
