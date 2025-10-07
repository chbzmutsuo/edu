'use client'

import {useState, useEffect, useCallback} from 'react'
import {motion, AnimatePresence} from 'framer-motion'
import {Menu, X} from 'lucide-react'
import {Button} from '@cm/shadcn/ui/button'
import {Kaizen} from '@app/(apps)/KM/class/Kaizen'
import useWindowSize from '@cm/hooks/useWindowSize'

interface MenuItem {
  label: string
  id: string
}

export const EnhancedHeader = ({menuItems}: {menuItems: MenuItem[]}) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const {device} = useWindowSize()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = useCallback((id: string) => {
    const element = document.getElementById(id)
    element?.scrollIntoView({behavior: 'smooth', block: 'start'})
    setIsMobileMenuOpen(false)
  }, [])

  return (
    <>
      <motion.header
        initial={{y: -100}}
        animate={{y: 0}}
        transition={{duration: 0.6}}
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          isScrolled ? 'bg-white shadow-lg' : 'bg-white/95 backdrop-blur-sm'
        }`}
      >
        <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between lg:h-20">
            {/* ロゴ */}
            <motion.div initial={{opacity: 0}} animate={{opacity: 1}} transition={{delay: 0.3}} className="flex items-center">
              <button
                onClick={() => scrollToSection('introduction')}
                className="flex items-center gap-2 transition-all hover:opacity-80"
              >
                <div className="rounded-lg p-2">{Kaizen.KaizenManiaIcon}</div>
                {/* <span className="text-lg font-bold text-gray-900 sm:text-xl">改善マニア</span> */}
              </button>
            </motion.div>

            {/* デスクトップメニュー */}
            {!device.SP && (
              <nav className="hidden items-center gap-6 lg:flex lg:gap-8">
                {menuItems.map((item, index) => (
                  <motion.button
                    key={index}
                    initial={{opacity: 0, y: -10}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.4 + index * 0.1}}
                    onClick={() => scrollToSection(item.id)}
                    className="group relative text-base font-medium text-gray-700 transition-colors hover:text-blue-600"
                  >
                    {item.label}
                    <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-blue-600 to-blue-700 transition-all group-hover:w-full"></span>
                  </motion.button>
                ))}
                <motion.div initial={{opacity: 0, scale: 0.8}} animate={{opacity: 1, scale: 1}} transition={{delay: 0.8}}>
                  <Button
                    size="lg"
                    onClick={() => scrollToSection('mainActivity')}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 font-bold shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                  >
                    サービスを見る
                  </Button>
                </motion.div>
              </nav>
            )}

            {/* モバイルメニューボタン */}
            {device.SP && (
              <motion.button
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{delay: 0.3}}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100 lg:hidden"
                aria-label="メニュー"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </motion.button>
            )}
          </div>
        </div>
      </motion.header>

      {/* モバイルメニュー */}
      <AnimatePresence>
        {isMobileMenuOpen && device.SP && (
          <>
            {/* オーバーレイ */}
            <motion.div
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            />

            {/* メニューパネル */}
            <motion.div
              initial={{x: '100%'}}
              animate={{x: 0}}
              exit={{x: '100%'}}
              transition={{type: 'tween', duration: 0.3}}
              className="fixed right-0 top-16 z-50 h-[calc(100vh-4rem)] w-80 overflow-y-auto bg-white shadow-2xl lg:hidden"
            >
              <nav className="flex flex-col p-6">
                {/* メニュー項目 */}
                {menuItems.map((item, index) => (
                  <motion.button
                    key={index}
                    initial={{opacity: 0, x: 20}}
                    animate={{opacity: 1, x: 0}}
                    transition={{delay: index * 0.1}}
                    onClick={() => scrollToSection(item.id)}
                    className="border-b border-gray-200 py-4 text-left text-lg font-medium text-gray-700 transition-colors hover:text-blue-600"
                  >
                    {item.label}
                  </motion.button>
                ))}

                {/* CTAボタン */}
                <motion.div
                  initial={{opacity: 0, y: 20}}
                  animate={{opacity: 1, y: 0}}
                  transition={{delay: menuItems.length * 0.1 + 0.2}}
                  className="mt-6"
                >
                  <Button
                    size="lg"
                    onClick={() => scrollToSection('mainActivity')}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 font-bold shadow-lg"
                  >
                    サービスを見る
                  </Button>
                </motion.div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
