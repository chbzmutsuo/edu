import CredentialsProvider from 'next-auth/providers/credentials'

import GoogleProvider from 'next-auth/providers/google'

import {doStandardPrisma} from '@lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {CheckLogin} from '@app/api/prisma/login/checkLogin'
const maxAge = process.env.NEXT_PUBLIC_ROOTPATH === 'Grouping' ? 60 * 60 : 30 * 24 * 60 * 60

const authorize = async (credentials: {email: string; password: string}, req) => {
  const {email, password} = credentials
  const user = await CheckLogin({authId: email, authPw: password})

  return user
}

export const authOptions: any = {
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      profile: async (profile, tokens) => {
        const {result: user} = await doStandardPrisma(`user`, `findUnique`, {
          where: {email: profile.email},
        })

        const userInfoSpread = user ?? {}

        return {id: profile.sub, ...userInfoSpread}
      },
    }),
    CredentialsProvider({
      credentials: {
        email: {label: 'メールアドレス', type: 'text', placeholder: 'test@test.com'},
        password: {label: 'パスワード', type: 'password', placeholder: 'password123'},
      },
      authorize,
    }),
  ],

  callbacks: {
    async jwt({token, user, account}) {
      // 最初のサインイン
      if (account && user) {
        return {
          ...token,
          user: user,
        }
      }

      return token
    },
    async session({session, token}) {
      session.accessToken = token.accessToken
      session.refreshToken = token.refreshToken
      session.accessTokenExpires = token.accessTokenExpires
      session.user = {
        ...token.user,
      }

      return session
    },
  },

  session: {
    strategy: 'jwt',
    maxAge,
  },

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    // signIn: '/login',
    // signOut: '/login',
    error: `/login?`,
  },
}
