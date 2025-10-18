import {ArrowRightLeftIcon} from 'lucide-react'
import React from 'react'

export default function MemberSwitchTd({Student, editable, iconClass, isMoveCandidate, moveStudent, setmoveStudent}) {
  return (
    <>
      {editable && (
        <>
          {!isMoveCandidate && moveStudent ? (
            ``
          ) : (
            <ArrowRightLeftIcon
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
