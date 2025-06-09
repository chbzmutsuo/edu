import {signIn, signOut, getSession} from 'next-auth/react'

// API呼び出し用のユーティリティ関数（NextAuth版）

const API_BASE = '/sara/api'

export interface ApiResponse<T = any> {
  message?: string
  error?: string
  data?: T
  [key: string]: any
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function apiCall<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new ApiError(response.status, data.error || 'APIエラーが発生しました')
  }

  return data
}

// 認証API（NextAuth版）
export const authApi = {
  // 家族登録
  register: (data: {
    familyName: string
    parent: {name: string; email: string; password: string}
    children: {name: string; avatar: string; password?: string}[]
  }) =>
    apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 親ログイン
  parentLogin: async (email: string, password: string) => {
    const result = await signIn('parent-credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      throw new ApiError(401, 'ログインに失敗しました')
    }

    return result
  },

  // 子どもログイン
  childLogin: async (childId: string, password?: string) => {
    const result = await signIn('child-credentials', {
      childId,
      password,
      redirect: false,
    })

    if (result?.error) {
      throw new ApiError(401, 'ログインに失敗しました')
    }

    return result
  },

  // 子どもリスト取得
  getChildren: (familyId: string) => apiCall(`/auth/child/login?familyId=${familyId}`),

  // 親モードから子モードへ切り替え
  switchToChild: async (childId: string, password?: string) => {
    const result = await apiCall('/auth/switch-to-child', {
      method: 'POST',
      body: JSON.stringify({childId, password}),
    })

    // セッションを更新するため、子どもとしてサインイン
    await signIn('child-credentials', {
      childId,
      password,
      redirect: false,
    })

    return result
  },

  // 子モードから親モードへ切り替え
  switchToParent: async () => {
    const session = await getSession()
    if (!session?.user?.familyId) {
      throw new ApiError(401, 'セッションが無効です')
    }

    const result = await apiCall('/auth/switch-to-parent', {
      method: 'POST',
    })

    // セッションを更新（親の情報で再ログイン）
    // 注意: 実際の実装では親のメールアドレスとパスワードが必要
    // ここでは簡略化のため、セッション更新のみ
    window.location.reload() // 簡易的な方法

    return result
  },

  // ログアウト
  logout: () => signOut({redirect: false}),

  // 現在のセッション取得
  getSession: () => getSession(),
}

// 評価項目API
export const evaluationItemsApi = {
  // 一覧取得
  getAll: () => apiCall('/evaluation-items'),

  // 作成
  create: (data: {
    title: string
    description?: string
    scores: {
      score: number
      title: string
      description?: string
      iconUrl?: string
      animationLevel?: string
    }[]
  }) =>
    apiCall('/evaluation-items', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 更新
  update: (data: {
    id: string
    title: string
    description?: string
    scores?: {
      score: number
      title: string
      description?: string
      iconUrl?: string
      animationLevel?: string
    }[]
    order?: number
  }) =>
    apiCall('/evaluation-items', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 削除
  delete: (id: string) =>
    apiCall(`/evaluation-items?id=${id}`, {
      method: 'DELETE',
    }),
}

// 評価申請API
export const evaluationRequestsApi = {
  // 一覧取得
  getAll: (params?: {status?: string; childId?: string; date?: string}) => {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.set('status', params.status)
    if (params?.childId) searchParams.set('childId', params.childId)
    if (params?.date) searchParams.set('date', params.date)

    const query = searchParams.toString()
    return apiCall(`/evaluation-requests${query ? `?${query}` : ''}`)
  },

  // 申請作成（子ども用）
  create: (data: {evaluationItemId: string; evaluationScoreId: string}) =>
    apiCall('/evaluation-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 承認・却下（親用）
  update: (data: {id: string; status: 'approved' | 'rejected'; parentComment?: string}) =>
    apiCall('/evaluation-requests', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 開封状態更新
  markAsOpened: (id: string) =>
    apiCall(`/evaluation-requests/${id}/open`, {
      method: 'PUT',
    }),
}

// ダッシュボードAPI
export const dashboardApi = {
  // 統計データ取得
  getStats: (childId?: string) => {
    const query = childId ? `?childId=${childId}` : ''
    return apiCall(`/dashboard/stats${query}`)
  },
}

export {ApiError}
