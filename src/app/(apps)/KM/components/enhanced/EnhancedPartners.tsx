'use client'

import {motion} from 'framer-motion'
import {useInView} from 'react-intersection-observer'
import {Building2, GraduationCap, Users, Sparkles} from 'lucide-react'

export const EnhancedPartners = ({kaizenClient}: {kaizenClient: any[]}) => {
  const {ref, inView} = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  // 顧客を種類別に分類
  const categories = [
    {
      icon: Building2,
      title: '企業様',
      color: 'from-blue-600 to-blue-800',
      bgColor: 'from-blue-50/50 to-blue-100/30',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-700',
      clients: kaizenClient.filter(c => c.category === 'company' || !c.category),
    },
    {
      icon: GraduationCap,
      title: '大学・研究機関',
      color: 'from-purple-600 to-purple-800',
      bgColor: 'from-purple-50/50 to-purple-100/30',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-700',
      clients: kaizenClient.filter(c => c.category === 'university'),
    },
    {
      icon: Users,
      title: '個人事業主様',
      color: 'from-amber-600 to-amber-800',
      bgColor: 'from-amber-50/50 to-amber-100/30',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-700',
      clients: kaizenClient.filter(c => c.category === 'individual'),
    },
  ].filter(cat => cat.clients.length > 0) // クライアントがいるカテゴリーのみ表示

  // カテゴリーがない場合は全て表示
  const displayCategories =
    categories.length === 1 && categories[0].clients.length === kaizenClient.length
      ? [
          {
            icon: Sparkles,
            title: '取引実績',
            color: 'from-indigo-600 to-indigo-800',
            bgColor: 'from-indigo-50/50 to-indigo-100/30',
            iconBg: 'bg-indigo-100',
            iconColor: 'text-indigo-700',
            clients: kaizenClient,
          },
        ]
      : categories

  return (
    <div ref={ref} className="space-y-6">
      {/* ヘッダー統計 */}
      <motion.div
        initial={{opacity: 0, y: 20}}
        animate={inView ? {opacity: 1, y: 0} : {}}
        transition={{duration: 0.6}}
        className="mb-6 text-center"
      >
        <div className="mx-auto inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 shadow-lg">
          <Building2 className="h-5 w-5 text-white" />
          <span className="text-lg font-bold text-white">
            {kaizenClient.length}
            <span className="ml-1 text-sm font-normal text-white/90">社との取引実績</span>
          </span>
        </div>
      </motion.div>

      {/* カテゴリー別表示 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {displayCategories.map((category, categoryIndex) => {
          const Icon = category.icon
          return (
            <motion.div
              key={categoryIndex}
              initial={{opacity: 0, scale: 0.95}}
              animate={inView ? {opacity: 1, scale: 1} : {}}
              transition={{duration: 0.5, delay: categoryIndex * 0.15}}
              className="group"
            >
              <div className="h-full overflow-hidden rounded-2xl border-2 border-gray-200/50 bg-white shadow-md transition-all duration-300 hover:scale-[1.02] hover:border-gray-300 hover:shadow-xl">
                {/* カテゴリーヘッダー */}
                <div className={`bg-gradient-to-br ${category.bgColor} p-4`}>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${category.iconBg}`}>
                      <Icon className={`h-5 w-5 ${category.iconColor}`} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{category.title}</h4>
                      <p className="text-xs text-gray-600">{category.clients.length}社</p>
                    </div>
                  </div>
                </div>

                {/* クライアントリスト */}
                <div className="max-h-60 overflow-y-auto p-4">
                  <div className="space-y-2">
                    {category.clients.map((client, clientIndex) => (
                      <motion.div
                        key={clientIndex}
                        initial={{opacity: 0, x: -10}}
                        animate={inView ? {opacity: 1, x: 0} : {}}
                        transition={{duration: 0.3, delay: categoryIndex * 0.15 + clientIndex * 0.05}}
                        className="group/item flex items-center gap-2 rounded-lg bg-gray-50 p-2.5 transition-all hover:bg-gray-100"
                      >
                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white">
                          <span className="text-xs font-bold text-gray-400">{client.name?.substring(0, 1) || '?'}</span>
                        </div>
                        <span className="flex-1 text-sm font-medium text-gray-700 group-hover/item:text-gray-900">
                          {client.name}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* フッター統計 */}
                <div className={`border-t border-gray-100 bg-gradient-to-r ${category.color} p-3`}>
                  <div className="text-center text-xs font-semibold text-white">{category.clients.length}件の実績</div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* 補足メッセージ */}
      <motion.div
        initial={{opacity: 0}}
        animate={inView ? {opacity: 1} : {}}
        transition={{duration: 0.8, delay: 0.8}}
        className="mt-6 text-center"
      >
        <p className="text-sm text-gray-600">業界・規模を問わず、様々なお客様の業務改善をサポートしております</p>
      </motion.div>
    </div>
  )
}
