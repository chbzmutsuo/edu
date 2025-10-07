import {EnhancedIntroduction} from '@app/(apps)/KM/components/enhanced/EnhancedIntroduction'
import {EnhancedEasyProfile} from '@app/(apps)/KM/components/enhanced/EnhancedEasyProfile'

import prisma from 'src/lib/prisma'
import {initServerComopnent} from 'src/non-common/serverSideFunction'

const KM_ENHANCED_PAGE = async () => {
  const {session, scopes} = await initServerComopnent({query: {}})
  const kaizenClient = await prisma.kaizenClient.findMany({where: {public: true}, orderBy: [{id: 'asc'}]})
  const works = await prisma.kaizenWork.findMany({
    include: {
      KaizenClient: {},
      KaizenWorkImage: true,
    },
    orderBy: [{date: 'desc'}],
  })

  // ヘッダーメニュー項目
  const menuItems = [
    {label: '改善マニアとは？', id: 'introduction'},
    {label: 'お仕事', id: 'mainActivity'},
    {label: '実績', id: 'works'},
    {label: 'お問い合わせ', id: 'contact'},
  ]

  return (
    <div className="min-h-screen ">
      {/* <EnhancedHeader menuItems={menuItems} /> */}

      <div className={`max-w-screen-xl mx-auto bg-gray-100 lg:p-8`}>
        <main>
          <div>
            <EnhancedIntroduction />
          </div>
          <div className=" mt-4 max-w-screen-xl mx-auto rounded-2xl bg-gray-50 p-1 lg:p-4">
            <EnhancedEasyProfile {...{kaizenClient, works}} />
          </div>
        </main>

        {/* フッター */}
        <footer className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 py-12 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="mb-4">
                <h3 className="text-2xl font-bold">改善マニア</h3>
                <p className="mt-2 text-sm text-gray-400">マイデスクから始める業務改善</p>
              </div>
              <div className="mb-6 h-px w-32 mx-auto bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
              <p className="text-sm text-gray-400">© 2025 改善マニア. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default KM_ENHANCED_PAGE
