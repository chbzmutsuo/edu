'use client'

import {signIn, signOut, getSession} from 'next-auth/react'

// クライアントサイド認証関数
export const clientAuthActions = {
  // 親ログイン
  parentLogin: async (email: string, password: string) => {
    const result = await signIn('parent-credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      throw new Error('ログインに失敗しました')
    }

    return result
  },

  // 子どもログイン
  childLogin: async (childId: number, password?: string) => {
    const result = await signIn('child-credentials', {
      childId,
      password,
      redirect: false,
    })

    if (result?.error) {
      throw new Error('ログインに失敗しました')
    }

    return result
  },

  // ログアウト
  logout: () => signOut({redirect: false}),

  // セッション取得
  getSession: () => getSession(),
}
