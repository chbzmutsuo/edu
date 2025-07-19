import {TableBordered, TableWrapper} from '@cm/components/styles/common-components/Table'

import GlobalModal from '@cm/components/utils/modal/GlobalModal'

import {PrismaModelNames} from '@cm/types/prisma-types'
import {DetailPagePropType} from '@cm/types/types'
import {useEffect, useState} from 'react'
import {RoleMaster, User, UserRole} from '@prisma/client'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {surroundings} from '@cm/components/DataLogic/types/customParams-types'
import {anyObject} from '@cm/types/utility-types'

export type PageBuidlerClassType = {
  [key in PrismaModelNames]: surroundings
} & anyObject

export type DataModelBuilder = {
  table?: (props: DetailPagePropType) => React.ReactNode
  top?: (props: DetailPagePropType) => React.ReactNode
  form?: (props: DetailPagePropType) => React.ReactNode
  bottom?: (props: DetailPagePropType) => React.ReactNode
  left?: (props: DetailPagePropType) => React.ReactNode
  right?: (props: DetailPagePropType) => React.ReactNode
}

export const roleMaster: DataModelBuilder = {
  top: props => {
    return (
      <GlobalModal {...{id: `user-role-control`, Trigger: <div className={`t-link`}>割当表</div>}}>
        <RoleAllocationTable {...{PageBuilderExtraProps: props.PageBuilderExtraProps}} />
      </GlobalModal>
    )
  },
}

const RoleAllocationTable = ({PageBuilderExtraProps}) => {
  const {rootPath} = useGlobal()
  type user = User & {UserRole: UserRole[]}
  const [users, setusers] = useState<user[]>([])
  const [roles, setroles] = useState<RoleMaster[]>([])

  const fetchUsers = async () => {
    const apps = {has: rootPath}
    const {result: users = []} = await doStandardPrisma(`user`, `findMany`, {
      where: {...PageBuilderExtraProps?.where, apps},
      include: {UserRole: {include: {RoleMaster: {}}}},
      orderBy: [{code: `asc`}, {sortOrder: `asc`}, {name: `asc`}],
    })
    setusers(users)
  }

  const fetchRoles = async () => {
    const {result: roles = []} = await doStandardPrisma(`roleMaster`, `findMany`, {})
    setroles(roles)
  }

  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [PageBuilderExtraProps?.where, PageBuilderExtraProps?.where?.userId, PageBuilderExtraProps?.where?.roleMasterId])

  return (
    <TableWrapper>
      <TableBordered>
        <thead>
          <tr>
            <th></th>
            {roles.map(r => {
              return <th key={r.id}>{r.name}</th>
            })}
          </tr>
        </thead>
        <tbody>
          {users.map(u => {
            return (
              <tr key={u.id}>
                <td>{u.name}</td>
                {roles.map(r => {
                  const userRole = u.UserRole.find(ur => ur.roleMasterId === r.id)
                  return (
                    <td key={r.id} className={`text-center`}>
                      <input
                        onChange={async e => {
                          const apply = e.target.checked
                          const userId_roleMasterId_unique = {
                            userId: u.id,
                            roleMasterId: r.id,
                          }

                          if (apply) {
                            if (!confirm(`${u.name}に${r.name}を割り当てますか？`)) return

                            await doStandardPrisma(`userRole`, `upsert`, {
                              where: {userId_roleMasterId_unique},
                              create: {userId: u.id, roleMasterId: r.id},
                              update: {userId: u.id, roleMasterId: r.id},
                            })
                            await fetchUsers()
                          } else {
                            if (!confirm(`${u.name}から${r.name}を割り当て解除しますか？`)) return
                            await doStandardPrisma(`userRole`, `delete`, {
                              where: {userId_roleMasterId_unique},
                            })
                            await fetchUsers()
                          }
                        }}
                        className={`mx-auto text-center`}
                        type="checkbox"
                        defaultChecked={!!userRole}
                      />
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </TableBordered>
    </TableWrapper>
  )
}
