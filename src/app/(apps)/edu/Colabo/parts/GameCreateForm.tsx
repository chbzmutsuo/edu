'use client'

import {useState} from 'react'
import {Button} from '@cm/components/styles/common-components/Button'
import {Alert} from '@cm/components/styles/common-components/Alert'
import {toast} from 'react-toastify'
import {createColaboGame} from '../colabo-server-actions'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {HREF} from '@cm/lib/methods/urls'

interface GameCreateFormProps {
  schools: any[]
  teachers: any[]
  subjects: any[]
  classrooms: any[]
  onClose?: () => void
  defaultSchoolId?: number
  defaultTeacherId?: number
}

export default function GameCreateForm({
  schools,
  teachers,
  subjects,
  classrooms,
  onClose,
  defaultSchoolId,
  defaultTeacherId,
}: GameCreateFormProps) {
  const {router, query} = useGlobal()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    schoolId: defaultSchoolId,
    teacherId: defaultTeacherId,
    subjectNameMasterId: subjects[0]?.id || 0,
    selectedClassroomIds: [] as number[],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.schoolId || !formData.teacherId) {
      toast.error('必須項目を入力してください')
      return
    }

    setIsLoading(true)

    try {
      // 選択されたクラスの生徒IDを取得
      const selectedClassrooms = classrooms.filter(c => formData.selectedClassroomIds.includes(c.id))
      const studentIds: number[] = []

      selectedClassrooms.forEach(classroom => {
        if (classroom.Student) {
          classroom.Student.forEach((student: any) => {
            if (!studentIds.includes(student.id)) {
              studentIds.push(student.id)
            }
          })
        }
      })

      // Game作成
      const result = await createColaboGame({
        name: formData.name,
        date: new Date(formData.date),
        schoolId: formData.schoolId,
        teacherId: formData.teacherId,
        subjectNameMasterId: formData.subjectNameMasterId || undefined,
        studentIds,
      })

      if (result.success && result.game) {
        toast.success(`Game「${result.game.name}」を作成しました`)
        router.push(HREF(`/edu/Colabo/games/${result.game.id}/slides`, {}, query))
        onClose?.()
      } else {
        toast.error(result.error || 'Game作成に失敗しました')
      }
    } catch (error) {
      console.error('Game作成エラー:', error)
      toast.error('予期しないエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClassroomToggle = (classroomId: number) => {
    setFormData(prev => ({
      ...prev,
      selectedClassroomIds: prev.selectedClassroomIds.includes(classroomId)
        ? prev.selectedClassroomIds.filter(id => id !== classroomId)
        : [...prev.selectedClassroomIds, classroomId],
    }))
  }

  // 選択されたクラスの生徒数を計算
  const selectedStudentCount = classrooms
    .filter(c => formData.selectedClassroomIds.includes(c.id))
    .reduce((sum, classroom) => sum + (classroom.Student?.length || 0), 0)

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">新しい授業を作成</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 授業名 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">授業名 *</label>
          <input
            type="text"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="例：国語 第1回 物語文の読解"
            required
          />
        </div>

        {/* 日付 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">実施日 *</label>
          <input
            type="date"
            value={formData.date}
            onChange={e => setFormData({...formData, date: e.target.value})}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* 学校 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">学校 *</label>
          <select
            value={formData.schoolId}
            onChange={e => setFormData({...formData, schoolId: Number(e.target.value)})}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            {schools.map(school => (
              <option key={school.id} value={school.id}>
                {school.name}
              </option>
            ))}
          </select>
        </div>

        {/* 教師 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">担当教師 *</label>
          <select
            value={formData.teacherId}
            onChange={e => setFormData({...formData, teacherId: Number(e.target.value)})}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            {teachers.map(teacher => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name}
              </option>
            ))}
          </select>
        </div>

        {/* 教科 */}
        {subjects.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">教科</label>
            <select
              value={formData.subjectNameMasterId}
              onChange={e => setFormData({...formData, subjectNameMasterId: Number(e.target.value)})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={0}>選択なし</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* クラス選択 */}
        {classrooms.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">対象クラス（複数選択可）</label>
            <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
              {classrooms
                .filter(c => c.schoolId === formData.schoolId)
                .map(classroom => (
                  <label key={classroom.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={formData.selectedClassroomIds.includes(classroom.id)}
                      onChange={() => handleClassroomToggle(classroom.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">
                      {classroom.grade}年{classroom.class}組 ({classroom.Student?.length || 0}名)
                    </span>
                  </label>
                ))}
            </div>
            {formData.selectedClassroomIds.length > 0 && (
              <Alert color="blue" className="mt-2">
                選択中: {formData.selectedClassroomIds.length}クラス / 生徒 {selectedStudentCount}名
              </Alert>
            )}
          </div>
        )}

        {/* ボタン */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t">
          {onClose && (
            <Button type="button" onClick={onClose} disabled={isLoading} className="bg-gray-500 hover:bg-gray-600">
              キャンセル
            </Button>
          )}
          <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
            {isLoading ? '作成中...' : '作成'}
          </Button>
        </div>
      </form>
    </div>
  )
}
