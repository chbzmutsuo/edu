import {Days} from '@cm/class/Days/Days'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

export const chechIsHoliday = ({holidays, date}) => {
  const isHoliday = holidays.find(h => {
    return Days.validate.isSameDate(h.date, date)
  })
  return isHoliday || formatDate(date, 'ddd') === '日'
}
