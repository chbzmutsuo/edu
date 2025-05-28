'use client'

import AddForm from '@app/(apps)/achievement/AddForm'
import LoginForm from '@app/(apps)/achievement/LoginForm'
import {formatDate} from '@class/Days/date-utils/formatters'

import PlaceHolder from '@cm/components/utils/loader/PlaceHolder'
import BasicModal from '@cm/components/utils/modal/BasicModal'
import useModal from '@cm/components/utils/modal/useModal'
import {Alert} from '@components/styles/common-components/Alert'
import {Button} from '@components/styles/common-components/Button'
import {C_Stack, Padding, R_Stack} from '@components/styles/common-components/common-components'
import useGlobal from '@hooks/globalHooks/useGlobal'

import {useEffect, useState} from 'react'
import {toast} from 'react-toastify'

export const AchievementSpreadApiPath = `https://script.google.com/macros/s/AKfycby_RSTocqdlMQ5Y07NVULOkmrSdqWfcyVjq9YZqwSkyR7C76TIM8UxVHidWfJV-5Y8D/exec`
export type record = {
  timestamp?: any
  date: Date
  storeName: string
  stuffCode: string
  stuffName: string
  stuffType: string
  callOut: number
  achievement: number
}
const Page = () => {
  const {globalLoaderAtom, toggleLoad} = useGlobal()
  const {users, stores, userStore} = initiation({globalLoaderAtom})

  const [formData, setformData] = useState<record[]>([])
  const [showAllUser, setshowAllUser] = useState(false)
  const [currentStore, setcurrentStore] = useState<any>(null)
  const userOptions = showAllUser
    ? users
    : users.filter(user => {
        const theUS = userStore.filter(us => {
          return us?.storeName === currentStore?.storeName
        })

        return theUS.find(us => us.stuffCode === user.stuffCode)
      })

  const {handleOpen, handleClose, open: selected} = useModal()

  const send = async () => {
    const res = await fetch(AchievementSpreadApiPath, {
      method: 'POST',
      body: JSON.stringify({action: `send`, formData}),
    }).then(res => res.json())

    toast.success(`送信しました`)
    setformData([])
  }
  if (users.length === 0 || stores.length === 0 || userStore.length === 0) return <PlaceHolder />
  if (!currentStore) {
    return <LoginForm {...{stores, currentStore, setcurrentStore}} />
  }

  return (
    <Padding>
      <C_Stack className={`mx-auto w-[700px] max-w-[95vw]`}>
        <section>
          <R_Stack>
            <Button color={`blue`}>{currentStore.storeName}でログイン中</Button>
            <Button onClick={async () => setcurrentStore(null)}>Logout</Button>
          </R_Stack>
        </section>
        <section className={`h-[10px]`}></section>

        <section>
          <div>
            <C_Stack>
              <div className={`m-2 text-start`}>
                <R_Stack className={` justify-start`}>
                  <Button onClick={handleOpen}>追加</Button>
                  <Button onClick={() => setshowAllUser(prev => !prev)}>
                    {showAllUser ? `全社員から選択` : `店舗社員のみ選択`}
                  </Button>
                </R_Stack>
              </div>
              <Alert className={`w-fit text-sm`} color={`red`}>
                以下は送信前リストの為、まだデータ未登録です。 一括送信ボタンでデータ登録を必ず行って下さい。
              </Alert>
              <div className={`sticky-table-wrapper  max-h-[600px] max-w-[600px] text-center [&_tr]:border-b-[1px]!`}>
                <table>
                  <thead>
                    <tr className={`text-sm md:text-base`}>
                      <th>日付</th>
                      <th>店舗名</th>
                      <th>社員</th>
                      <th>社員区分</th>
                      <th>声かけ件数</th>
                      <th>実績件数</th>
                      <th>編集</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.map((data, i) => {
                      return (
                        <tr key={i} className={`text-sm md:text-base`}>
                          <td>{formatDate(data.date, 'M-D')}</td>
                          <td>
                            <Input
                              {...{
                                index: i,
                                data,
                                setformData,
                                users,
                                dataKey: `storeName`,
                                options: stores.map(s => s.storeName),
                              }}
                            />
                          </td>
                          <td>
                            <Input
                              {...{
                                index: i,
                                data,
                                setformData,
                                users,
                                dataKey: `stuffName`,
                                options: userOptions.map(s => s.name),
                              }}
                            />
                          </td>
                          <td>{data.stuffType}</td>
                          <td>
                            <Input {...{index: i, data, setformData, users, dataKey: `callOut`, options: null}} />
                          </td>
                          <td>
                            <Input {...{index: i, data, setformData, users, dataKey: `achievement`, options: null}} />
                          </td>
                          <td>
                            <R_Stack className={`mx-auto gap-1 `}>
                              <Button
                                className={`p-0.5 text-sm md:text-base`}
                                color={`red`}
                                onClick={() => {
                                  if (confirm(`この行は削除されます。宜しいですか？`)) {
                                    setformData(prev => prev.filter((_, index) => index !== i))
                                  }
                                }}
                              >
                                削除
                              </Button>

                              <Button className={`p-0.5 text-sm md:text-base`} color={`blue`} onClick={() => handleOpen(data)}>
                                編集
                              </Button>
                            </R_Stack>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className={`my-2 text-center`}>
                <Button
                  disabled={formData.length === 0}
                  color={`red`}
                  onClick={async () => {
                    if (confirm(`送信前リストの内容をデータベースに登録します。よろしいですか？`)) {
                      toggleLoad(async () => {
                        await send()
                      })
                    }
                  }}
                >
                  一括送信
                </Button>
              </div>
            </C_Stack>
          </div>
        </section>
      </C_Stack>

      {/* modal */}
      <BasicModal {...{open: selected, handleClose}}>
        <AddForm {...{currentStore, setformData, handleClose, userOptions, users, selected}} />
      </BasicModal>
    </Padding>
  )
}

const Input = ({dataKey, data, options, setformData, index, users}) => {
  const value = data[dataKey]
  return value

  const onChange = e => {
    if (dataKey === `stuffName`) {
      const theUser = users.find(user => user.name === e.target.value)

      setformData(prev => {
        const newFormData = [...prev]
        newFormData[index] = {
          ...newFormData[index],
          stuffName: e.target.value,
          stuffCode: theUser.stuffCode,
          stuffType: theUser.type,
        }
        return newFormData
      })
    } else {
      setformData(prev => {
        const newFormData = [...prev]
        newFormData[index] = {...newFormData[index], [dataKey]: e.target.value}
        return newFormData
      })
    }
  }
  const className = `myFormControl w-fit text-center mx-auto max-w-[100px] `

  if (options) {
    return (
      <select {...{onChange, value, className}}>
        {options.map((option, i) => (
          <option key={i} value={option}>
            {option}
          </option>
        ))}
      </select>
    )
  } else {
    return <input {...{onChange, value, className}} />
  }
}

export default Page

function initiation({globalLoaderAtom}) {
  const [users, setusers] = useState<any[]>([])
  const [stores, setstores] = useState<any[]>([])
  const [userStore, setuserStore] = useState<any[]>([])
  useEffect(() => {
    const getData = async () => {
      const res = await fetch(AchievementSpreadApiPath, {
        method: 'POST',
        body: JSON.stringify({action: `getItemData`}),
      }).then(res => res.json())

      const {users, stores, userStore} = res.result
      setusers(users)
      setstores(stores)
      setuserStore(userStore)
    }
    getData()
  }, [globalLoaderAtom])

  return {users, stores, userStore}
}
