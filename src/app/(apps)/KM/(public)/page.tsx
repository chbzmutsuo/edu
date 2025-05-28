import {EasyProfile} from '@app/(apps)/KM/components/common'
import {Introducation} from '@app/(apps)/KM/components/Introduction'

import prisma from '@cm/lib/prisma'

const KM_PAGE = async () => {
  const kaizenClient = await prisma.kaizenClient.findMany({where: {public: true}, orderBy: [{id: 'asc'}]})
  const works = await prisma.kaizenWork.findMany({
    include: {
      KaizenClient: {},
      KaizenWorkImage: true,
    },
    orderBy: [
      {
        date: 'desc',
      },
    ],
  })

  return (
    <>
      <div>
        <Introducation />
      </div>
      <div className={`bg-white`}>
        <div className={`p-0 pb-10 `}>
          <EasyProfile {...{kaizenClient, works}} />
        </div>
      </div>
    </>
  )
}

export default KM_PAGE
