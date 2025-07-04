'use client'

import React, {useState, useEffect, useRef} from 'react'
import {createTask, updateTask} from '../../(lib)/task-actions'
import {Task} from '../../(lib)/task-actions'
import useGlobal from '@hooks/globalHooks/useGlobal'
import {uploadTaskAttachment} from './uploadTaskAttachment'

type Props = {
  task?: Task | null
  onClose: () => void
}

export default function TaskModal({task, onClose}: Props) {
  const {session} = useGlobal()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || '')
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '')
    }
  }, [task])

  // モーダル外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      setSelectedFiles(prev => [...prev, ...filesArray])
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const taskData = {
        title,
        description: description || undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      }

      let savedTask
      if (task) {
        // 更新
        const result = await updateTask(task.id, taskData)
        savedTask = result.data
      } else {
        // 新規作成
        const result = await createTask({...taskData, userId: session?.id})
        savedTask = result.data
      }

      // ファイルがある場合はアップロード
      if (selectedFiles.length > 0 && savedTask) {
        setUploading(true)
        for (const file of selectedFiles) {
          await uploadTaskAttachment({
            taskId: savedTask.id,
            file: file,
          })
        }
      }

      onClose()
    } catch (error) {
      console.error('Failed to save task:', error)
      alert('タスクの保存に失敗しました')
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-md lg:max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-lg sm:text-xl font-bold mb-4">{task ? 'タスク編集' : '新しいタスク'}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              タスク名 *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              説明
            </label>
            <textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
              期限日
            </label>
            <input
              type="date"
              id="dueDate"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="files" className="block text-sm font-medium text-gray-700">
              画像添付（複数選択可）
            </label>
            <input
              type="file"
              id="files"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* 選択されたファイルの一覧 */}
            {selectedFiles.length > 0 && (
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-600">選択されたファイル:</p>
                <div className="max-h-24 overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm text-gray-700 bg-gray-50 px-2 py-1 rounded"
                    >
                      <span className="truncate flex-1 mr-2">{file.name}</span>
                      <button type="button" onClick={() => removeFile(index)} className="text-red-500 hover:text-red-700 text-xs">
                        削除
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 text-sm sm:text-base"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 text-sm sm:text-base"
            >
              {loading ? '保存中...' : uploading ? 'アップロード中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
