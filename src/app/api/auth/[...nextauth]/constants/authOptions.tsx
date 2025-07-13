import prisma from 'src/lib/prisma'
import {normalCredentialsProvider} from '@app/api/auth/[...nextauth]/constants/next-auth-providers'
import {googleProvider} from '@app/api/auth/[...nextauth]/constants/GoogleProvider'

const maxAge = process.env.NEXT_PUBLIC_ROOTPATH === 'Grouping' ? 60 * 60 : 30 * 24 * 60 * 60

export const authOptions: any = {
  // Configure one or more authentication providers
  providers: [
    //
    googleProvider,
    normalCredentialsProvider,
    // parentProvider,
    // childProvider,
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
      const familyId = token.user.familyId ?? 0
      const Family = await prisma.family.findUnique({
        where: {id: token.user.familyId ?? 0},
        include: {User: true},
      })

      const Parent = Family?.User.filter((u: any) => u.type === 'parent')
      const Child = Family?.User.filter((u: any) => u.type === 'child')

      session.accmessToken = token.accessToken
      session.refreshToken = token.refreshToken
      session.accessTokenExpires = token.accessTokenExpires
      session.user = {
        ...token.user,
        Family,
        Parent,
        Child,
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
