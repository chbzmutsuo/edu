import {Works} from '@app/(apps)/KM/components/Works'

import prisma from '@cm/lib/prisma'
import {MyContainer} from '@components/styles/common-components/common-components'

const WorkPage = async () => {
  const works = await prisma.kaizenWork.findMany({
    include: {
      KaizenWorkImage: {},
      KaizenClient: {},
    },
    orderBy: {
      date: 'desc',
    },
  })

  return (
    <MyContainer>
      <Works {...{works}} />
    </MyContainer>
  )
}

export default WorkPage
