import React from 'react'

export default function FormSecLabel({columns, ControlOptions, children}) {
  const colFormIndexGroupName = ControlOptions?.showLabel === false ? undefined : columns[0]?.form?.colIndex
  return (
    <>
      {isNaN(colFormIndexGroupName) && colFormIndexGroupName ? (
        <>
          <section className={`  rounded-sm border border-gray-300 p-1`}>
            <div className={`  text-primary-main text-center text-lg font-bold `}>{colFormIndexGroupName}</div>
            {children}
          </section>
          {/* <section >
            <div className={`  text-center text-lg font-bold `}>{colFormIndexGroupName}</div>
            <div className={` border-primary-main    rounded-t-md border-t-2 text-center text-transparent`}>a</div>
            {children}
            <div className={` border-primary-main    rounded-b-md  border-b-2 text-center text-transparent`}>a</div>
          </section> */}
        </>
      ) : (
        children
      )}
    </>
  )
}
