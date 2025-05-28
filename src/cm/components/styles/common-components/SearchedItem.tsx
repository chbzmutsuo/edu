import {XMarkIcon} from '@heroicons/react/20/solid'
import {IconBtn} from '@components/styles/common-components/IconBtn'

export const SearchedItem = ({value, onClick, closeBtn = false}) => {
  return (
    <IconBtn color={`yellow`} onClick={onClick} rounded={false}>
      <div className={`flex`}>
        {value}
        {closeBtn && <XMarkIcon className={` w-4`} />}
      </div>
    </IconBtn>
  )
}
