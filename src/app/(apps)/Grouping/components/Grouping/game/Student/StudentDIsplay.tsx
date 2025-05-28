import PsychoQuestion from '../question/PsychoQuestion'
import MainViewForStudent from './MainViewForStudent '

import Waiting from '@app/(apps)/Grouping/components/Grouping/game/Student/Waiting'

export default function StudentDisplay({GameCtxValue}) {
  const {randomSamplingInfo, Game, activePrompt, hasAnsweredToPrompt, player, playerInfo, activeGroup, useGlobalProps} =
    GameCtxValue

  if (playerInfo.questionToAnswer) {
    return <PsychoQuestion {...{GameCtxValue}} />
  }

  /**回答要請 */
  if (activePrompt) {
    return <Waiting {...{Game, GameCtxValue}} />
  } else {
    return (
      <div className={`p-2`}>
        <MainViewForStudent {...{GameCtxValue}} />
      </div>
    )
  }
}
