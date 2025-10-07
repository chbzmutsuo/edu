'use client'

import {MyContainer, Padding, C_Stack} from '@cm/components/styles/common-components/common-components'
import {getSecondLayerMenus} from '@app/(apps)/KM/components/common'
import {motion} from 'framer-motion'
import {useInView} from 'react-intersection-observer'
import {Code, GraduationCap, Users2} from 'lucide-react'

const iconMap = {
  manager: Code,
  collaborationWithUniversity: Users2,
  coach: GraduationCap,
}

export const EnhancedServices = ({kaizenClient}: {kaizenClient: any[]}) => {
  const {ref, inView} = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const menus = getSecondLayerMenus({kaizenClient})
  const wrapperClas = ' w-screen-lg max-w-[90vw]'
  return (
    <MyContainer className={`p-2   mx-auto ${wrapperClas}`}>
      <div ref={ref} className="py-4">
        {menus.map((menu, index) => {
          const {value, label, id} = menu
          const Icon = iconMap[id as keyof typeof iconMap] || Code
          const isEven = index % 2 === 0

          return (
            <motion.div
              key={id}
              id={id}
              initial={{opacity: 0, y: 50}}
              animate={inView ? {opacity: 1, y: 0} : {}}
              transition={{duration: 0.8, delay: index * 0.2}}
              className="mb-8 last:mb-0"
            >
              <div>
                <div
                  className={`overflow-hidden rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl ${
                    isEven
                      ? 'bg-gradient-to-br from-blue-900/5 via-white to-blue-900/5'
                      : 'bg-gradient-to-br from-amber-50 via-white to-amber-50'
                  }`}
                >
                  {/* ヘッダー部分 */}
                  <div
                    className={`p-2 sm:p-5 ${
                      isEven ? 'bg-gradient-to-r from-blue-800 to-blue-950' : 'bg-gradient-to-r from-amber-600 to-amber-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* アイコン */}
                      <motion.div
                        initial={{scale: 0}}
                        animate={inView ? {scale: 1} : {}}
                        transition={{duration: 0.5, delay: index * 0.2 + 0.3, type: 'spring'}}
                        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm sm:h-14 sm:w-14"
                      >
                        <Icon className="h-6 w-6 text-white sm:h-7 sm:w-7" />
                      </motion.div>

                      {/* タイトル */}
                      <div>
                        <motion.h3
                          initial={{opacity: 0, x: -20}}
                          animate={inView ? {opacity: 1, x: 0} : {}}
                          transition={{duration: 0.6, delay: index * 0.2 + 0.4}}
                          className="text-lg font-bold text-white sm:text-xl lg:text-2xl"
                        >
                          {label}
                        </motion.h3>
                      </div>
                    </div>
                  </div>

                  {/* コンテンツ部分 */}
                  <motion.div
                    initial={{opacity: 0}}
                    animate={inView ? {opacity: 1} : {}}
                    transition={{duration: 0.6, delay: index * 0.2 + 0.5}}
                    className="p-2 sm:p-5"
                  >
                    <div className="prose prose-base max-w-none">{value}</div>
                  </motion.div>

                  {/* 装飾ライン */}
                  <div className="h-1 w-full">
                    <div
                      className={`h-full w-full ${
                        isEven ? 'bg-gradient-to-r from-blue-700 to-blue-900' : 'bg-gradient-to-r from-amber-400 to-amber-600'
                      }`}
                    ></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </MyContainer>
  )
}
