import SalesNewCC from '@app/(apps)/aquapot/(pages)/sale/register/SalesNewCC/SalesNewCC'
import {Button} from '@cm/shadcn-ui/components/ui/button'
import {doStandardPrisma} from '@lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {initServerComopnent} from 'src/non-common/serverSideFunction'

export default async function Page(props) {
  const query = await props.searchParams
  const {session} = await initServerComopnent({query})
  const {result: user} = await doStandardPrisma(`user`, `findUnique`, {
    where: {id: session.id},
  })
  if (!user) {
    return <div>ユーザーが見つかりません</div>
  }
  return (
    <div>
      <Button variant="default">glasjkgas</Button>
      <SalesNewCC />
    </div>
  )
}
