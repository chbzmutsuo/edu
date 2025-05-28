import {Services} from '@app/(apps)/KM/components/Services'
import prisma from '@cm/lib/prisma'

const Page = async () => {
  const kaizenClient = await prisma.kaizenClient.findMany({where: {public: true}, orderBy: [{id: 'asc'}]})

  return <Services {...{kaizenClient}} />
}

export default Page
