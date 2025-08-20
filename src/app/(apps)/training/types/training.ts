// トレーニング記録アプリ用型定義

// 種目マスタの型
export interface ExerciseMaster {
  id: number
  userId: number
  part: string
  name: string
  unit: string
  createdAt: Date
  updatedAt: Date
}

// ワークアウトログの型
export interface WorkoutLog {
  id: number
  userId: number
  exerciseId: number
  date: Date
  strength: number
  reps: number
  createdAt: Date
  updatedAt: Date
}

// 種目マスタ作成・更新用の型
export type ExerciseMasterInput = Pick<ExerciseMaster, 'part' | 'name' | 'unit'>

// ワークアウトログ作成・更新用の型
export type WorkoutLogInput = Pick<WorkoutLog, 'exerciseId' | 'strength' | 'reps'>

// 記録一覧表示用の型（種目マスタ情報を含む）
export interface WorkoutLogWithMaster extends WorkoutLog {
  ExerciseMaster: ExerciseMaster
}
