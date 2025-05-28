import {userRoleType} from '@hooks/useUserRole'
import {User} from '@prisma/client'
import {getScopes} from 'src/non-common/scope-lib/getScopes'

export class UserCl {
  data: User & {
    roles: userRoleType[]
    scopes: ReturnType<typeof getScopes>
  }
  constructor(props: {user: User; roles: userRoleType[]; scopes: ReturnType<typeof getScopes>}) {
    this.data = {
      ...props.user,
      scopes: props.scopes,
      roles: props.roles,
    }
  }
}
