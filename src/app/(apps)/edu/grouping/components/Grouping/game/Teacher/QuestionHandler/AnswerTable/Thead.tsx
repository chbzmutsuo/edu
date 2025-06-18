import {formatDate} from '@class/Days/date-utils/formatters'
import {C_Stack, R_Stack} from '@components/styles/common-components/common-components'
import {TrashIcon} from '@heroicons/react/20/solid'
import {cl} from '@cm/lib/methods/common'

export const Thead = ({Game, activePrompt, handleDeletePrompt, isSummary, btnClass}) => {
  return (
    <thead>
      <tr className={` text-[10px]`}>
        <th className={`w-[10px] `}>出欠</th>
        <th className={`w-[10px]`}>学年</th>
        <th className={`w-[10px]`}>組</th>
        <th className={`w-[10px]`}>性別</th>
        <th className={`w-[40px]`}>児童・生徒</th>

        {Game?.QuestionPrompt?.map((prompt, i) => {
          const {createdAt, active, asSummary} = prompt
          const isActivePrompt = activePrompt?.id === prompt.id

          return (
            <th key={i} className={`w-[40px]`}>
              <div className={cl(` ${isActivePrompt ? (isSummary ? '  ' : 't-aler-warning') : ''}`)}>
                <>
                  <C_Stack className={`gap-0.5`}>
                    <div>
                      <span>{formatDate(createdAt, 'HH:mm')}</span>
                      <small className={`text-[8px]`}>実施</small>
                    </div>
                    <R_Stack className={`justify-around gap-0`}>
                      {/* <AnsweredIcon {...{isActivePrompt, prompt}} /> */}
                      <TrashIcon
                        className={`${btnClass} `}
                        onClick={async e => {
                          await handleDeletePrompt(prompt)
                        }}
                      />
                    </R_Stack>
                  </C_Stack>
                </>
              </div>
            </th>
          )
        })}
      </tr>
    </thead>
  )
}
