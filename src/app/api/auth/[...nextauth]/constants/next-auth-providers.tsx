import CredentialsProvider from 'next-auth/providers/credentials'

import {CheckLogin} from '@app/api/prisma/login/checkLogin'
import prisma from '@lib/prisma'
import bcrypt from 'bcrypt'

export const normalCredentialsProvider = CredentialsProvider({
  id: 'credentials',
  name: 'Normal Login',
  credentials: {
    email: {label: 'メールアドレス', type: 'text', placeholder: 'test@test.com'},
    password: {label: 'パスワード', type: 'password', placeholder: 'password123'},
  },
  authorize: async (credentials: {email: string; password: string}, req) => {
    const {email, password} = credentials

    const user = await CheckLogin({authId: email, authPw: password})
    return user
  },
})

export const parentProvider = CredentialsProvider({
  id: 'parent-credentials',
  name: 'Parent Login',
  credentials: {
    email: {label: 'Email', type: 'email'},
    password: {label: 'Password', type: 'password'},
  },

  authorize: async (credentials: {email: string; password: string}, req) => {
    if (!credentials?.email || !credentials?.password) {
      return null
    }

    try {
      const parent = await prisma.parent.findUnique({
        where: {email: credentials.email},
        include: {
          Family: {
            include: {
              Child: true,
            },
          },
        },
      })

      if (!parent) {
        return null
      }

      const isValidPassword = await bcrypt.compare(credentials.password, parent.password)
      if (!isValidPassword) {
        return null
      }

      return parent as any
    } catch (error) {
      console.error('Parent auth error:', error)
      return null
    }
  },
})

export const childProvider = CredentialsProvider({
  id: 'child-credentials',
  name: 'Child Login',
  credentials: {
    childId: {label: 'Child ID', type: 'text'},
    password: {label: 'Password', type: 'password'},
  },
  authorize: async (credentials: {childId: string; password: string}, req) => {
    if (!credentials?.childId) {
      return null
    }

    try {
      const child = await prisma.child.findUnique({
        where: {id: Number(credentials.childId)},
        include: {
          Family: true,
        },
      })

      if (!child) {
        return null
      }

      // パスワードが設定されている場合は確認
      if (child.password) {
        if (!credentials.password) {
          return null
        }

        const isValidPassword = await bcrypt.compare(credentials.password, child.password)
        if (!isValidPassword) {
          return null
        }
      }

      return child as any
    } catch (error) {
      console.error('Child auth error:', error)
      return null
    }
  },
})
