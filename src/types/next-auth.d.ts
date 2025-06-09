import 'next-auth'
import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface User {
    type: 'parent' | 'child'
    familyId: string
    familyName: string
    avatar?: string
    children?: {
      id: string
      name: string
      avatar: string
    }[]
  }

  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      type: 'parent' | 'child'
      familyId: string
      familyName: string
      avatar?: string
      children?: {
        id: string
        name: string
        avatar: string
      }[]
    }
  }

  // interface User {
  //   id?: string
  //   idToken?: string
  //   accessToken?: string
  //   refreshToken?: string
  //   expiresIn?: number
  //   email: string
  //   name: string
  //   emailVerified?: boolean
  //   sub?: string
  //   userStatus?: string
  // }
}

declare module 'next-auth/jwt' {
  interface JWT {
    idToken?: string
    accessToken?: string
    refreshToken?: string
    expiresIn?: number
    error?: string
    email: string
    name: string
    emailVerified?: boolean
    sub?: string
    userStatus?: string
    type: 'parent' | 'child'
    familyId: string
    familyName: string
    avatar?: string
    children?: {
      id: string
      name: string
      avatar: string
    }[]
  }
}
