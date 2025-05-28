'use client'

import {defaultRegister} from '@class/builders/ColBuilderVariables'
import {Fields} from '@cm/class/Fields/Fields'
import {columnGetterType} from '@cm/types/types'
import {Center, R_Stack} from '@components/styles/common-components/common-components'
import {IconBtn} from '@components/styles/common-components/IconBtn'

export class ColBuilder {
  static department = (props: columnGetterType) => {
    return new Fields([
      // {...{id: 'code', label: 'コード', type: `string`}, form: {...defaultRegister}},
      {...{id: 'name', label: '名称'}, form: {...defaultRegister}},
      {...{id: 'color', label: '色'}, form: {}, type: `color`},
    ]).transposeColumns()
  }
  static user = (props: columnGetterType) => {
    return new Fields([
      {...{id: 'code', label: 'コード', type: `string`}, form: {...defaultRegister}},
      {...{id: 'name', label: '名称'}, form: {...defaultRegister}},
      {...{id: 'email', label: 'Email'}, form: {...defaultRegister}},
      {...{id: 'password', label: 'パスワード', type: `password`}, form: {}},
      {...{id: 'departmentId', label: '部署', forSelect: {}}, form: {...defaultRegister}},
      {
        id: '権限',
        label: '権限',
        format: (value, row) => {
          const UserRole = row.UserRole

          const roles = UserRole.map(role => role.RoleMaster.name)
          return (
            <Center>
              <R_Stack>
                {roles.map((data, index) => {
                  return (
                    <div key={index}>
                      <IconBtn color={`blue`}>{data}</IconBtn>
                    </div>
                  )
                })}
              </R_Stack>
            </Center>
          )
        },
        form: {hidden: true},
      },
    ]).transposeColumns()
  }

  static shiireSaki = (props: columnGetterType) => {
    return new Fields([
      {...{id: 'code', label: 'コード', type: 'string'}, form: {...defaultRegister}, search: {}},
      {...{id: 'name', label: '名称'}, form: {...defaultRegister}, search: {}},
      {...{id: 'email', label: '送付先メールアドレス'}, form: {...defaultRegister}, search: {}},
    ]).transposeColumns()
  }

  static product = (props: columnGetterType) => {
    return new Fields([
      {...{id: 'code', label: '品番', type: 'string'}, form: {...defaultRegister}, search: {}},
      {...{id: 'name', label: '商品名'}, form: {...defaultRegister}, search: {}},
      {...{id: 'shiireSakiId', label: '仕入れ先'}, form: {...defaultRegister}, forSelect: {}},
      // {...{id: 'maker', label: 'メーカー'}, form: {...defaultRegister}},
      // {...{id: 'unit', label: '単位'}, form: {...defaultRegister}},
    ]).transposeColumns()
  }
}
