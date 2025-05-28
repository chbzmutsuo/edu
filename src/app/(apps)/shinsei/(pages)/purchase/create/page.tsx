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
import {chain_shinsei_hacchu_notifyWhenUpdate} from 'src/non-common/(chains)/shinsei/chain_shinsei_hacchu_notifyWhenUpdate'
import {HREF} from '@lib/methods/urls'
import {toastByResult} from '@lib/ui/notifications'
import {sendEmailToShiireSaki} from '@app/(apps)/shinsei/(pages)/purchase/PurchaseApproveModal'

export default function PurchaseRequestPage() {
  const useGlobalProps = useGlobal()
  const {session, toggleLoad, accessScopes, router, query} = useGlobalProps

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
    {
      id: `purchaseType`,
      label: `購入区分`,
      form: {defaultValue: isDev ? `新規` : undefined},
      forSelect: {optionsOrOptionFetcher: CODE_MASTER.PURCHASE_TYPE_OPTIONS},
    },
    {
      id: `productId`,
      label: `商品`,
      form: {defaultValue: isDev ? 1 : undefined},
      forSelect: {
        // allowCreateOptions: {
        //   creator: () => {
        //     return {
        //       getCreatFormProps: (props: ControlContextType & {searchFormData}) => {
        //         return {columns: ColBuilder.product({useGlobalProps}), formData: {}}
        //       },
        //     }
        //   },
        // },
        option: {style: {width: 400, padding: 6}},
        config: {
          select: {
            id: 'number',
            code: 'text',
            name: 'text',
          },
          nameChanger: op => {
            const name = op && [op.code, op.name].join(' - ')

            return {...op, name}
          },
        },
      },
    },
    {id: `quantity`, label: `数量`, type: `float`, form: {defaultValue: isDev ? 1 : undefined}},
    {id: `reason`, label: `理由`, type: `textarea`, form: {defaultValue: isDev ? `test` : undefined}},
  ])
    .customAttributes(({col}) => {
      return {
        ...col,
        form: {
          ...col.form,
          style: {width: 400},
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
              const {purchaseType, productId, quantity, reason, userId} = data

              // const approverRoleList = [`新規`, `折損`].some(item => item === purchaseType) ? [`工場長`] : [`発注担当者`]

              const nextApproverRole = CODE_MASTER.PURCHASE_TYPE_OPTIONS.find(item => item.value === purchaseType)?.nextApprover

              let {result: approveUser} = await doStandardPrisma(`user`, `findMany`, {
                where: {UserRole: {some: {RoleMaster: {name: {in: nextApproverRole}}}}},
                include: {UserRole: {include: {RoleMaster: true}}},
              })

              approveUser.sort((a, b) => {
                const aIndex = nextApproverRole?.findIndex(role => a.UserRole.find(item => item.RoleMaster.name === role)) ?? 0
                const bIndex = nextApproverRole?.findIndex(role => b.UserRole.find(item => item.RoleMaster.name === role)) ?? 0

                return aIndex - bIndex
                // return aIndex - bIndex
              })

              if (purchaseType === `新規`) {
                approveUser = []
              }

              if (!confirm(`申請を実施しますか？`)) {
                return
              }

              const {result: Product} = await doStandardPrisma(`product`, `findUnique`, {
                where: {id: productId},
                include: {ShiireSaki: true},
              })
              const shiiresaki = Product.ShiireSaki

              if (
                purchaseType === `新規` &&
                !confirm(`発注を確定すると、【${shiiresaki?.name}】へ自動でメール通知が実施されます。`)
              ) {
                return
              }

              toggleLoad(async item => {
                const res = await doStandardPrisma(`purchaseRequest`, `create`, {
                  data: {
                    purchaseType,
                    quantity,
                    reason,
                    User: {connect: {id: userId}},
                    Product: {connect: {id: productId}},
                    ...(approveUser.length === 0
                      ? undefined
                      : {
                          Approval: {
                            createMany: {
                              data: approveUser.map((user, index) => {
                                return {
                                  type: `発注`,
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

                await chain_shinsei_hacchu_notifyWhenUpdate({purchaseRequestId: res.result.id})
                if (purchaseType === `新規`) {
                  await sendEmailToShiireSaki(res.result.id)
                }
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
              <Button>発注する</Button>
            </div>
          </C_Stack>
        </BasicForm>

        <section>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
            <h2 className="mb-4 border-b pb-2 text-xl font-bold text-gray-800">承認フロー</h2>
            <C_Stack className="gap-4">
              <C_Stack className="gap-8">
                <div className="flex items-center">
                  <span className="mr-2 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">リピート</span>
                  <span className="text-gray-700">
                    現場スタッフが申請 → 発注担当者に通知 → <span className="font-semibold text-blue-600">発注担当者が承認</span>
                  </span>
                </div>

                <div className="flex items-center">
                  <span className="mr-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">新規</span>
                  <span className="text-gray-700">
                    発注担当者が申請。
                    <span className="font-semibold text-red-600">承認不要</span>
                  </span>
                </div>

                <div className="flex items-center">
                  <span className="mr-2 rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800">再研磨</span>
                  <span className="text-gray-700">
                    工場長が申請 → 発注担当に通知 → <span className="font-semibold text-blue-600">発注担当者が承認</span>
                  </span>
                  <div className="ml-24 text-xs text-red-500">※現場スタッフは申請不可</div>
                </div>

                <div className="flex items-center">
                  <span className="mr-2 rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-800">
                    折損・トラブル
                  </span>
                  <span className="text-gray-700">
                    現場スタッフが申請 → 工場長が承認 → 発注担当者に通知 →{' '}
                    <span className="font-semibold text-blue-600">発注担当者が承認</span>
                  </span>
                </div>
              </C_Stack>

              <div className="mt-4">
                <h2 className="mb-4 border-b pb-2 text-xl font-bold text-gray-800">仕入れ先への注文メール</h2>
                <p className=" border-gray-300 pl-2 text-gray-700">
                  発注担当者が承認時に上記<span className="mx-1 text-lg font-bold text-blue-600">承認</span>
                  後、自動で仕入先に注文メールを送る。
                </p>
              </div>
            </C_Stack>
          </div>
        </section>
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
