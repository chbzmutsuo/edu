import {Center} from '@cm/components/styles/common-components/common-components'

const GameStatus = ({Game}) => {
  return (
    <div>
      <Center className={` bg-error-main m-2 rounded-lg px-10 py-4 text-white`}>{Game?.status}</Center>
    </div>
  )
}

export default GameStatus
