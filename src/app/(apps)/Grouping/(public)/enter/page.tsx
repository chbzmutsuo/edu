'use client'

import {doStandardPrisma} from '@lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {Center} from '@components/styles/common-components/common-components'
import useGlobal from '@hooks/globalHooks/useGlobal'

import {useState} from 'react'
import {toast} from 'react-toastify'
export default function GameRoomSelectPage() {
  const {router} = useGlobal()

  const [key, setkey] = useState('')

  return (
    <Center className={``}>
      <form className={`col-stack items-center justify-around gap-10`}>
        <label>
          <p className={`t-heading`}>プロジェクトキーを入力してください</p>
          <input
            value={key}
            onChange={e => {
              setkey(e.target.value)
            }}
            className={`myFormControl`}
            required
          />
        </label>
        <button
          className={`t-btn text-2xl`}
          onClick={async e => {
            e.preventDefault()

            const findTheGame = await doStandardPrisma('game', 'findUnique', {
              where: {secretKey: key},
            }).then(res => res.result)

            if (!findTheGame) {
              toast.error('入力されたキーは存在しません。')
              return
            } else {
              toast.success('ルームに入ります。')
              router.push(`/Grouping/game/main/${findTheGame.secretKey}`)
            }
          }}
        >
          ルームへ入る
        </button>
      </form>
    </Center>
  )
}
