import {User} from '@prisma/client'
import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: User | (Parent & {Child: Child[]; Family: Family}) | (Child & {Family: Family})
  }
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
    saraFamilyId: string
    familyName: string
    avatar?: string | null
    children?: {
      id: string
      name: string
      avatar: string | null
    }[]
  }
}
