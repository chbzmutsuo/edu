import * as fs from 'fs'
import {Button} from '@components/styles/common-components/Button'
import {Absolute, C_Stack} from '@components/styles/common-components/common-components'
import React from 'react'
import path from 'path'
import {superTrim} from '@lib/methods/common'
import prisma from '@lib/prisma'
import {createUpdate} from '@lib/methods/createUpdate'
import {doTransaction} from '@lib/server-actions/common-server-actions/doTransaction/doTransaction'

export default function page() {
  return (
    <Absolute>
      <C_Stack className={` items-center gap-8`}>
        <Button
          {...{
            onClick: async () => {
              'use server'
              const filePath = path.join(process.cwd(), `src/app/(apps)/shinsei/seed`, `user.csv`)
              const csv = fs.readFileSync(filePath, 'utf8')
              const lines = csv.split('\n')
              const data = lines
                .map(line => {
                  const [code, name, email, password] = line.split(',').map(v => superTrim(v))
                  return {code, name, email, password}
                })
                .filter(data => data.code)

              const res = await doTransaction({
                transactionQueryList: data.map(data => {
                  const {name, email, password} = data
                  const code = String(data.code).padStart(4, '0')

                  const data2 = createUpdate({
                    code,
                    name,
                    email,
                    password,
                    apps: [`shinsei`],
                  })

                  return {
                    model: 'user',
                    method: 'upsert',
                    queryObject: {
                      where: {email},
                      ...data2,
                    },
                  }
                }),
              })

              console.log(res)
            },
          }}
        >
          ユーザー
        </Button>
        <Button
          {...{
            onClick: async () => {
              'use server'
              const filePath = path.join(process.cwd(), `src/app/(apps)/shinsei/seed`, `shiireSaki.csv`)
              const csv = fs.readFileSync(filePath, 'utf8')
              const lines = csv.split('\n')
              const data = lines.map(line => {
                const [code, name] = line.split(',').map(v => superTrim(v))
                return {code, name}
              })

              const res = await doTransaction({
                transactionQueryList: data
                  .filter(data => data.code)
                  .map(data => {
                    return {
                      model: 'shiireSaki',
                      method: 'upsert',
                      queryObject: {
                        where: {code: data.code},
                        ...createUpdate({
                          code: data.code,
                          name: data.name,
                        }),
                      },
                    }
                  }),
              })

              console.log(res)
            },
          }}
        >
          仕入れ先シード
        </Button>
        <Button
          {...{
            onClick: async () => {
              'use server'

              const shiiresaki = await prisma.shiireSaki.findMany()

              const filePath = path.join(process.cwd(), `src/app/(apps)/shinsei/seed`, `buhin.csv`)
              const csv = fs.readFileSync(filePath, 'utf8')
              const lines = csv.split('\n')
              const data: any[] = lines
                .map(line => {
                  // eslint-disable-next-line no-control-regex
                  const cols = line.split(',').map(v => v.replace(/|\r|"/g, ''))
                  const [shiiresakiCode, A, code, name, price] = cols
                  return {shiiresakiCode, A, code, name, price}
                })
                .filter(d => d.code)

              const res = await doTransaction({
                transactionQueryList: data.map(data => {
                  const {shiiresakiCode, A, code, name, price} = data

                  const shiireSakiId = shiiresaki.find(shiiresaki => shiiresaki.code === shiiresakiCode)?.id

                  return {
                    model: 'product',
                    method: 'upsert',
                    queryObject: {
                      where: {code},
                      ...createUpdate({code, name, shiireSakiId}),
                    },
                  }
                }),
              })

              console.log(res)
            },
          }}
        >
          工具先シード
        </Button>
      </C_Stack>
    </Absolute>
  )
}
