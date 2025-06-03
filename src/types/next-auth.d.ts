import 'next-auth'

declare module 'next-auth' {
  interface Session {
    idToken?: string
    accessToken?: string
    error?: string
    user: User
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
  }
}
