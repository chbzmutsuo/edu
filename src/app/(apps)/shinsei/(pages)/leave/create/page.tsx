'use client'

import {Fields} from '@class/Fields/Fields'
import useBasicFormProps from '@hooks/useBasicForm/useBasicFormProps'
import {C_Stack, FitMargin} from '@components/styles/common-components/common-components'
import useGlobal from '@hooks/globalHooks/useGlobal'

import {Button} from '@components/styles/common-components/Button'
import {defaultRegister} from '@class/builders/ColBuilderVariables'
import {doStandardPrisma} from '@lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

import {CODE_MASTER} from '@app/(apps)/shinsei/(constants)/CODE_MASTER'
import {isDev} from '@lib/methods/common'
import {chain_shinsei_kyuka_notifyWhenUpdate} from 'src/non-common/(chains)/shinsei/chain_shinsei_kyuka_notifyWhenUpdate'
import {HREF} from '@lib/methods/urls'
import {toastByResult} from '@lib/ui/notifications'

export default function PurchaseRequestPage() {
  const useGlobalProps = useGlobal()
  const {query, session, toggleLoad, accessScopes, router} = useGlobalProps

  const {admin} = accessScopes()
  const userId = session.id

  const columns = new Fields([
    //
    {
      id: `userId`,
      label: `申請者`,
      forSelect: {},
      form: {defaultValue: userId, disabled: admin ? false : !!userId},
    },

    {id: `from`, label: `開始日`, type: `date`, form: {defaultValue: isDev ? new Date() : undefined}},
    {id: `to`, label: `終了日`, type: `date`, form: {defaultValue: isDev ? new Date() : undefined}},
    {
      id: `leaveType`,
      label: `区分`,
      form: {defaultValue: isDev ? `1日` : undefined},
      forSelect: {
        optionsOrOptionFetcher: CODE_MASTER.LEAVE_TYPE_OPTION,
      },
    },
    {id: `reason`, label: `理由`, type: `textarea`, form: {defaultValue: isDev ? `test` : undefined}},
  ])
    .customAttributes(({col}) => {
      return {
        ...col,
        form: {
          ...col.form,
          style: {width: 400, maxWidth: `90%`},
          ...defaultRegister,
        },
      }
    })
    .transposeColumns()

  const {BasicForm, latestFormData} = useBasicFormProps({
    columns: columns,
  })

  return (
    <FitMargin>
      <C_Stack className={`items-center gap-8 p-4`}>
        <BasicForm
          {...{
            latestFormData,
            onSubmit: async data => {
              const {from, to, leaveType, reason, userId} = data

              const {result: me} = await doStandardPrisma(`user`, `findUnique`, {
                include: {UserRole: {include: {RoleMaster: true}}},
                where: {id: userId},
              })

              // 自分が統括かどうかチェック
              // const isTokatsu = me.UserRole?.some(role => role.RoleMaster.name === '統括')

              // 統括の場合は部長をスキップ
              const nextApproverRole = [`部長`, `統括`]

              let {result: approveUser} = await doStandardPrisma(`user`, `findMany`, {
                where: {
                  OR: [
                    {
                      AND: [
                        //
                        {UserRole: {some: {RoleMaster: {name: {in: [`部長`]}}}}},
                        {departmentId: me.departmentId ?? 0},
                      ],
                    },
                    {
                      AND: [
                        //
                        {UserRole: {some: {RoleMaster: {name: {in: [`統括`]}}}}},
                      ],
                    },
                  ],
                },
                include: {UserRole: {include: {RoleMaster: true}}, Department: true},
              })

              approveUser = approveUser.filter(data => data.id !== userId)

              approveUser.sort((a, b) => {
                const aIndex = nextApproverRole?.findIndex(role => a.UserRole.find(item => item.RoleMaster.name === role)) ?? 0
                const bIndex = nextApproverRole?.findIndex(role => b.UserRole.find(item => item.RoleMaster.name === role)) ?? 0

                return aIndex - bIndex
              })
              const message =
                approveUser.length === 0
                  ? [
                      `承認者が設定されていないため、自動的に承認となります。よろしいですか？`,
                      `*承認者: 同部署の「部長」または「統括」。ただし自分自身を除く`,
                    ].join(`\n`)
                  : [
                      `以下の承認者に対して申請を行います。`,
                      `${approveUser.map(user => `・${user.name}`).join(`\n`)}`,
                      ``,
                      `＊同部署の「部長」または「統括」。ただし自分自身を除く`,
                    ].join(`\n`)
              if (!confirm(message)) {
                return
              }

              toggleLoad(async item => {
                const res = await doStandardPrisma(`leaveRequest`, `create`, {
                  data: {
                    from,
                    to,
                    leaveType,
                    reason,
                    User: {connect: {id: userId}},
                    ...(approveUser.length === 0
                      ? undefined
                      : {
                          Approval: {
                            createMany: {
                              data: approveUser.map((user, index) => {
                                return {
                                  type: `休暇`,
                                  status: `未回答`,
                                  userId: user.id,
                                  index,
                                }
                              }),
                            },
                          },
                        }),
                  },
                  include: {
                    Approval: {
                      include: {User: {}},
                    },
                  },
                })
                await chain_shinsei_kyuka_notifyWhenUpdate({leaveRequestId: res.result.id})
                toastByResult(res)
                router.push(HREF(`/shinsei`, {}, query))
              })
            },
          }}
        >
          <C_Stack className={`items-center gap-2`}>
            <div>
              <small>担当者にメールが送信されます。</small>
            </div>
            <div>
              <Button>申請する</Button>
            </div>
          </C_Stack>
        </BasicForm>
      </C_Stack>
    </FitMargin>
  )

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-2xl font-bold">発注フォーム</h1>
      {/* <Form {...form}>
        <form
          onSubmit={e => {
            e.preventDefault()
            form.handleSubmit(onSubmit)
          }}
          className="space-y-6"
        >
          <div>
            <FormItem>
              <FormLabel>購入区分</FormLabel>
              <FormControl>
                <Select
                  onChange={e => form.setValue('purchaseType', e.target.value as '新規' | '折損' | 'リピート')}
                  defaultValue={form.getValues('purchaseType')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="購入区分を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="新規">新規</SelectItem>
                    <SelectItem value="折損">折損</SelectItem>
                    <SelectItem value="リピート">リピート</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          </div>

          <div>
            <FormItem>
              <FormLabel>商品</FormLabel>
              <FormControl>
                <Input {...form.register('product')} placeholder="商品を選択または入力" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </div>

          <div>
            <FormItem>
              <FormLabel>数量</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...form.register('quantity', {
                    valueAsNumber: true,
                  })}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </div>

          <div>
            <FormItem>
              <FormLabel>理由</FormLabel>
              <FormControl>
                <Textarea {...form.register('reason')} placeholder="申請理由を入力してください" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </div>

          <Button type="submit">送信</Button>
        </form>
      </Form> */}
    </div>
  )
}
