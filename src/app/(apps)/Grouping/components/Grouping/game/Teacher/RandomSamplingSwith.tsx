import {Grouping} from '@app/(apps)/Grouping/class/Grouping'
import {GameContextType} from '@app/(apps)/Grouping/components/Grouping/game/GameMainPage'

import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
import BasicModal from '@cm/components/utils/modal/BasicModal'

import {makePortal} from '@cm/lib/methods/portal'
import {Button} from '@cm/components/styles/common-components/Button'

import {useState} from 'react'

const RandomSamplingSwith = ({GameCtxValue}) => {
  const [valueState, setvalueState] = useState({
    count: 5,
    minute: 5,
  })

  const {
    Game,
    players,
    randomSamplingInfo: {
      randomSamplingIsEffective,

      setrandomSamplingState,
      showTargetPlayers,
      setshowTargetPlayers,
    },
    toggleLoad,
  } = GameCtxValue as GameContextType

  const handleOnClick = async e => {
    if (randomSamplingIsEffective) {
      if (confirm(`ランダム抽出を終了します。よろしいですか？`)) {
        toggleLoad(async () => {
          await Grouping.RandomTargetStudentIds({Game})
          setrandomSamplingState({count: null, minute: null})
        })
      }
    } else {
      if (confirm(`ランダム抽出を開始します。よろしいですか？`)) {
        toggleLoad(async () => {
          const newrandomSamplingState = {
            count: valueState.count,
            minute: valueState.minute,
          }
          const result = await Grouping.setRandomTargetStudentIds({
            Game,
            randomSamplingState: newrandomSamplingState,
            setshowTargetPlayers,
          })

          setrandomSamplingState(newrandomSamplingState)
        })
      }
    }
  }

  const SelectedPlayers = ({className = 'text-[10px]'}) => {
    return (
      <>
        {players
          .filter(p => Game.randomTargetStudentIds.includes(p.id))
          .map((p, idx) => {
            const delay = `delay-${idx * 25}`
            return (
              <Button color="yellow" className={`mx-1 transform animate-bounce ${delay}  p-0.5 px-1 ${className}`} key={p.id}>
                {p.name}
              </Button>
            )
          })}
      </>
    )
  }

  const portaledSelectedPlayer = makePortal({
    JsxElement: (
      <div className={` position-center  fixed z-50 h-40  w-40`}>
        <Button onClick={e => setshowTargetPlayers(true)} className={`bg-primary-main text-white`}>
          ランダムアンケート対象者
        </Button>
        <BasicModal
          {...{
            alertOnClose: false,
            style: {backgroundColor: 'rgba(255, 255, 255, 0.838)'},
            open: showTargetPlayers,
            handleClose: () => setshowTargetPlayers(false),
          }}
        >
          <div className={`p-20`}>
            <h3 className={`mb-12 text-[30px]`}> ランダムサンプリング対象者</h3>
            <div className={`duration-1000`}>
              <C_Stack className={` items-center gap-6`}>
                <SelectedPlayers className={'text-[50px]'} />
              </C_Stack>
            </div>
          </div>
        </BasicModal>
      </div>
    ),
  })

  return (
    <div className={` w-fit`}>
      {randomSamplingIsEffective && portaledSelectedPlayer}
      <R_Stack>
        <Input
          {...{
            label: 'サンプル人数',
            name: 'count',
            valueState,
            setvalueState,
            setrandomSamplingState,
          }}
        />
        <Input
          {...{
            label: '切替分数',
            name: 'minute',
            valueState,
            setvalueState,
            setrandomSamplingState,
          }}
        />
        <Button onClick={handleOnClick} color={randomSamplingIsEffective ? 'red' : 'blue'}>
          {randomSamplingIsEffective ? '終了' : '開始'}
        </Button>
      </R_Stack>
      <div>
        <R_Stack>
          <div>
            {'現在の対象者 >>>'} <SelectedPlayers />
          </div>
        </R_Stack>
      </div>
    </div>
  )
}

export default RandomSamplingSwith

const Input = ({label, name, valueState, setvalueState, setrandomSamplingState}) => {
  return (
    <R_Stack>
      <label>{label}</label>
      <input
        onChange={e => {
          setvalueState({...valueState, [name]: e.target.value})
          setrandomSamplingState({...valueState, [name]: e.target.value})
        }}
        value={valueState[name]}
        type="number"
        className={`w-[70px] border-[1px] px-1 text-center`}
      />
    </R_Stack>
  )
}
