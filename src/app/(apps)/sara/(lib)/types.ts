'use server'

import {User, Family, Activity, ActivityScore, ActivityEvaluationRequest} from '@prisma/client'
import {score} from './nextauth-api'

// 拡張User型
export type SaraUser = User & {
  Family?: Family | null
}

// Activity関連型
export type ActivityWithScores = Activity & {
  ActivityScore: ActivityScore[]
}

export type ActivityEvaluationRequestWithDetails = ActivityEvaluationRequest & {
  RequestedBy: Pick<User, 'id' | 'name' | 'avatar'>
  Activity: Pick<Activity, 'id' | 'title' | 'description'>
  ActivityScore: Pick<ActivityScore, 'id' | 'score' | 'title' | 'description' | 'iconUrl' | 'animationLevel'>
  ApprovedBy?: Pick<User, 'id' | 'name'> | null
}

// 共通ActionResponse型
export interface ActionResponse<T = any> {
  success: boolean
  message?: string
  error?: string
  data?: T
}

// 家族登録データ型
export interface RegisterData {
  familyName: string
  parent: {
    name: string
    email: string
    password: string
  }
  children: {
    name: string
    avatar: string
    password?: string
  }[]
}

// 習慣作成データ型
export interface ActivityCreateData {
  title: string
  description?: string
  order?: number
  scores: {
    score: number
    title: string
    description?: string
    iconUrl?: string
    animationLevel: string
  }[]
}

// 習慣更新データ型
export interface ActivityUpdateData {
  id: number
  title?: string
  description?: string
  order?: number
  active?: boolean
  scores?: score[]
}

// 評価申請作成データ型
export interface RequestCreateData {
  activityId: number
  activityScoreId: number
}

// 承認データ型
export interface ApprovalData {
  id: number
  status: 'approved' | 'rejected'
  comment?: string
}

// フィルターパラメータ型
export interface FilterParams {
  status?: 'pending' | 'approved' | 'rejected'
  childId?: number
  date?: string
}
