import {NextRequest} from 'next/server'
import {getServerSession} from 'next-auth'

export interface AuthPayload {
  parentId?: string
  childId?: string
  saraFamilyId: string
  type: 'parent' | 'child'
  user: any
}

export async function verifyAuth(request: NextRequest): Promise<AuthPayload | null> {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return null
    }

    return {
      parentId: session.user.type === 'parent' ? session.user.id : undefined,
      childId: session.user.type === 'child' ? session.user.id : undefined,
      saraFamilyId: session.user.saraFamilyId,
      type: session.user.type,
      user: session.user,
    }
  } catch (error) {
    console.error('Auth verification error:', error)
    return null
  }
}

export async function requireParentAuth(request: NextRequest): Promise<AuthPayload | null> {
  const auth = await verifyAuth(request)

  if (!auth || auth.type !== 'parent') {
    return null
  }

  return auth
}

export async function requireChildAuth(request: NextRequest): Promise<AuthPayload | null> {
  const auth = await verifyAuth(request)

  if (!auth || auth.type !== 'child') {
    return null
  }

  return auth
}

export async function requireAnyAuth(request: NextRequest): Promise<AuthPayload | null> {
  return await verifyAuth(request)
}
