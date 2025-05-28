import {R_Stack} from 'src/cm/components/styles/common-components/common-components'
import {ChevronDoubleDownIcon} from '@heroicons/react/20/solid'

const VerticalStepper = ({children}) => {
  return (
    <R_Stack className={`bg-primary-light text-sub-main mx-auto  w-full justify-around gap-2 rounded-sm py-2 font-bold `}>
      <ChevronDoubleDownIcon className={`w-8`} />
      <span>{children}</span>
      <ChevronDoubleDownIcon className={`w-8`} />
    </R_Stack>
  )
}
export default VerticalStepper
