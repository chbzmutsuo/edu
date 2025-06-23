import {ArrowsRightLeftIcon} from '@heroicons/react/20/solid'
import React from 'react'

export default function MemberSwitchTd({Student, editable, iconClass, isMoveCandidate, moveStudent, setmoveStudent}) {
  return (
    <>
      {editable && (
        <>
          {!isMoveCandidate && moveStudent ? (
            ``
          ) : (
            <ArrowsRightLeftIcon
              {...{
                className: iconClass,
                onClick: () => {
                  if (moveStudent) {
                    setmoveStudent(null)
                  } else {
                    setmoveStudent(Student)
                  }
                },
              }}
            />
          )}
        </>
      )}
    </>
  )
}
