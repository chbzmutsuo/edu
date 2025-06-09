import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      id: 'parent-credentials',
      name: 'Parent Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const parent = await prisma.saraParent.findUnique({
            where: { email: credentials.email },
            include: {
              family: {
                include: {
                  children: true
                }
              }
            }
          })

          if (!parent) {
            return null
          }

          const isValidPassword = await bcrypt.compare(credentials.password, parent.password)
          if (!isValidPassword) {
            return null
          }

          return {
            id: parent.id,
            name: parent.name,
            email: parent.email,
            type: 'parent',
            familyId: parent.familyId,
            familyName: parent.family.name,
            children: parent.family.children.map(child => ({
              id: child.id,
              name: child.name,
              avatar: child.avatar
            }))
          }
        } catch (error) {
          console.error('Parent auth error:', error)
          return null
        }
      }
    }),
    CredentialsProvider({
      id: 'child-credentials',
      name: 'Child Login',
      credentials: {
        childId: { label: 'Child ID', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.childId) {
          return null
        }

        try {
          const child = await prisma.saraChild.findUnique({
            where: { id: credentials.childId },
            include: {
              family: true
            }
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

          return {
            id: child.id,
            name: child.name,
            type: 'child',
            familyId: child.familyId,
            familyName: child.family.name,
            avatar: child.avatar
          }
        } catch (error) {
          console.error('Child auth error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.type = user.type
        token.familyId = user.familyId
        token.familyName = user.familyName
        token.avatar = user.avatar
        token.children = user.children
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.type = token.type as string
        session.user.familyId = token.familyId as string
        session.user.familyName = token.familyName as string
        session.user.avatar = token.avatar as string
        session.user.children = token.children as any[]
      }
      return session
    }
  },
  pages: {
    signIn: '/sara/auth/signin',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7日間
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
