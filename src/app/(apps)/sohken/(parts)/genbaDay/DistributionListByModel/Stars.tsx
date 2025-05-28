export const IsInShift = ({hasShift}) => {
  return hasShift > 0 ? <div className={`text-error-main`}>★</div> : <></>
}

export const IsInKyukaTodoke = ({DayRemark}) => {
  return DayRemark?.kyukaTodoke ? <div className={`text-yellow-600`}>⚫︎</div> : <></>
}

export const IsInKyuka = ({DayRemark}) => {
  return DayRemark?.kyuka ? <div className={`text-blue-600`}>■</div> : <></>
}

export const isRed = ({shiftsOnOtherGembaOnSameDate, DayRemark}) =>
  shiftsOnOtherGembaOnSameDate.length === 0 || DayRemark?.kyukaTodoke || DayRemark?.kyuka
