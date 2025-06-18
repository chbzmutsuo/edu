import {Shrikhand} from 'next/font/google'
const shrikhandFont = Shrikhand({
  subsets: ['latin'],
  weight: ['400'],
})

const Rank = ({rank, children}) => {
  let rankStyles = ''

  let affix
  switch (rank) {
    case 1:
      rankStyles = 'bg-yellow-400   text-yellow-800'
      affix = 'st'

      break
    case 2:
      rankStyles = 'bg-gray-500  text-gray-700'
      affix = 'nd'
      break
    case 3:
      rankStyles = 'bg-orange-800  text-orange-300'
      affix = 'rd'
      break
    default:
      rankStyles = 'bg-gray-200 text-gray-700'
      affix = 'th'
      break
  }

  return (
    <>
      <div
        className={`row-stack   w-full justify-start gap-8 bg-opacity-80 p-3
        ${rankStyles}


        `}
      >
        <div className={`${shrikhandFont.className} w-16 `}>
          <span className="inln text-4xl font-bold">{rank}</span>
          <span className={` text-xl`}>{affix}</span>
        </div>
        <div className={`mx-auto w-full`}>{children}</div>
      </div>
    </>
  )
}

export default Rank
