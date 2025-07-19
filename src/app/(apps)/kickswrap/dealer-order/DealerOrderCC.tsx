'use client'
import HistorySelector from '@app/(apps)/kickswrap/components/HistorySelector'
import ItemOrderForm from '@app/(apps)/kickswrap/components/ItemOrderForm'
import LoginForm from '@app/(apps)/kickswrap/components/LoginForm'
import {OrderedItemTable} from '@app/(apps)/kickswrap/components/OrderedItemTable'

import {knockEmailApi} from '@cm/lib/methods/knockEmailApi'

import {useEffect, useState} from 'react'
import {toast} from 'react-toastify'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'

import {Center, C_Stack, NoData, Padding, R_Stack} from '@cm/components/styles/common-components/common-components'
import {Button} from '@cm/components/styles/common-components/Button'
import {getItems} from '@app/(apps)/kickswrap/dealer-order/getItem'
import useIdbModel from '@cm/hooks/useIdbModel'
import {obj__initializeProperty} from '@cm/class/ObjHandler/transformers'

const spreadApiPath = `https://script.google.com/macros/s/AKfycbyM3qObZfNC_oSQyDVzXqQFcCO-MzDtwUshms6cEYtpJHYW9orH35Y_0jLnkxClt8iRfw/exec`

const DealerOrderCC = () => {
  const {toggleLoad, router, globalLoaderAtom} = useGlobal()
  const {data: user, updateModel} = useIdbModel({key: `user`, defaultValue: null})

  const [users, setusers] = useState<any[]>([])
  const [category, setcategory] = useState<any>(``)
  const [items, setitems] = useState<any>([])
  const [registerdItems, setregisterdItems] = useState<any[]>([])
  const filteredItems = items.filter(item => {
    const hit = !category ? true : item.category === category

    return hit
  })

  const filterdRegisterdItems = registerdItems.filter(item => {
    const hit = !category ? true : item.category === category
    return hit
  })

  const getCategories = () => {
    const categoryMasterObj = {}
    items?.forEach(item => {
      obj__initializeProperty(categoryMasterObj, item.category, {})
    })
    const categories: string[] = Object.keys(categoryMasterObj)

    return categories
  }

  useEffect(() => {
    const getData = async () => {
      const {items, users} = await getItems(spreadApiPath)

      setitems(items)
      setusers(users)
    }
    getData()
  }, [globalLoaderAtom])

  const total = {
    count: registerdItems.reduce((acc, item) => acc + item.quantity, 0),

    price: registerdItems.reduce((acc, item) => {
      return acc + item.wholesalePrice * item.quantity
    }, 0),
  }

  if (items.length === 0) return <div>loading...</div>

  if (!user)
    return (
      <Center>
        <LoginForm {...{users}} />
      </Center>
    )

  const historyOrigin = users.find(u => u.id === user.id)?.history ?? []

  let history = historyOrigin ? JSON.parse(historyOrigin) : []
  history = Array.isArray(history) ? history : []

  return (
    <Padding className={``}>
      <C_Stack className={`items-center gap-[20px] pt-[10px]`}>
        <div className={` mx-auto max-w-[350px]`}>
          <ItemOrderForm
            {...{
              items,
              registerdItems,
              filteredItems,
              setregisterdItems,
              getCategories,
              category,
              setcategory,
            }}
          />
        </div>

        <hr />

        <div className={`mx-auto max-w-[600px]`}>
          <C_Stack>
            {registerdItems.length === 0 ? (
              <div className={`h-[100px] w-[300px] `}>
                <NoData>商品を登録してください</NoData>
              </div>
            ) : (
              <>
                <OrderedItemTable {...{registerdItems, setregisterdItems, filterdRegisterdItems, total}} />
                <div className={`text-center`}>
                  <Button
                    className={`h-[40px] w-[60px]`}
                    color={`red`}
                    onClick={async e => {
                      if (confirm(`発注申請をしてもよろしいですか？`)) {
                        toggleLoad(async () => {
                          const currentHistory = [...history]
                          currentHistory.push(registerdItems.map(d => ({...d, createdAt: new Date().toISOString()})))
                          if (currentHistory.length > 3) {
                            currentHistory.shift()
                          }

                          const data = registerdItems.map(d => {
                            const itemCode = d.item.match(/【(.+)】/)[1]
                            const itemNameModified = d.item.replace(/【.+】/, '').replace(/\n/, '')

                            return {...d, item: itemNameModified, itemCode}
                          })

                          const res = await fetch(spreadApiPath, {
                            method: 'POST',
                            body: JSON.stringify({action: `order`, registerdItems: data, user, history: currentHistory}),
                          }).then(res => res.json())

                          if (res.result) {
                            const itemCount = res.result.length

                            toast.success(`${itemCount}件の発注申請を送信しました`)
                            setregisterdItems([])
                          }
                        })

                        await knockEmailApi({
                          to: [`wholesale@kickswrap.com`],
                          cc: [`ryo@kickswrap.com`],
                          subject: `KicksWrap卸フォームに注文が入りました。`,
                          text: `KicksWrap卸フォームに注文が入りました。https://docs.google.com/spreadsheets/d/1PFo91jePTsKjSLPx_fJUe8TlPLS-Obx-Lg8Tuf5g44k/edit?usp=sharing`,
                        })
                      }
                    }}
                  >
                    送信
                  </Button>
                </div>
              </>
            )}
          </C_Stack>
        </div>
      </C_Stack>

      <div className={`absolute right-4 top-4`}>
        <R_Stack>
          <HistorySelector {...{history, registerdItems, setregisterdItems}} />
          <Button
            className={`float-right`}
            onClick={async () => {
              await updateModel(prev => null)
            }}
          >
            ログアウト
          </Button>
        </R_Stack>
      </div>
    </Padding>
  )
}
export default DealerOrderCC
