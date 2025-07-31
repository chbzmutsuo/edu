'use client'
import React, {useState, useEffect, useMemo} from 'react'

import {
  Search,
  PlusCircle,
  Trash2,
  Edit,
  Users,
  Package,
  BarChart2,
  Save,
  X,
  Calendar as CalendarIcon,
  Printer,
  Map,
  AlertTriangle,
  Menu,
  ChevronDown,
  Users2,
  Star,
  CheckSquare,
  Square,
} from 'lucide-react'
import {useIsMobile} from '@cm/shadcn/hooks/use-mobile'

type Product = {
  id: string
  name: string
  cost: number
  price: number
}

type Customer = {
  id: string
  name: string
  contactName: string
  contactKana: string
  phoneNumber: string
  postalCode: string
  prefecture: string
  city: string
  street: string
}

type Reservation = {
  id: string
  customerId: string
  customerName: string
  deliveryAddress: string
  deliveryDate: Date
  items: {productId: string; productName: string; quantity: number; unitPrice: number; cost: number}[]
  totalAmount: number
  totalCost: number
  orderStaff: string
  createdAt: Date
  purpose: string
  paymentMethod: string
  orderChannel: string
  pointUsage: number
  notes: string
  pickupLocation: string
  tasks: {delivered: boolean; collected: boolean}
}

// --- Hardcoded Data Generation ---
const generateInitialData = () => {
  console.log('Generating initial hardcoded data...')
  const initialProducts = [
    {id: 'prod-1', name: '特製幕の内弁当', cost: 600, price: 1200},
    {id: 'prod-2', name: '彩り野菜のヘルシー弁当', cost: 500, price: 950},
    {id: 'prod-3', name: '唐揚げデラックス弁当', cost: 450, price: 880},
    {id: 'prod-4', name: '鮭の塩焼き弁当', cost: 550, price: 1000},
    {id: 'prod-5', name: '日替わりランチ', cost: 400, price: 750},
    {id: 'prod-6', name: '豪華うな重', cost: 1500, price: 2500},
    {id: 'prod-7', name: 'レジ袋', cost: 1, price: 5},
    {id: 'prod-8', name: '紙袋', cost: 10, price: 20},
  ]

  const initialCustomers: Customer[] = [
    {
      id: 'cust-1',
      name: '株式会社 岡山商事',
      contactName: '山田 太郎',
      contactKana: 'ヤマダ タロウ',
      phoneNumber: '0862231111',
      postalCode: '700-0904',
      prefecture: '岡山県',
      city: '岡山市北区',
      street: '柳町1-1-1',
    },
    {
      id: 'cust-2',
      name: '倉敷工業大学',
      contactName: '鈴木 花子',
      contactKana: 'スズキ ハナコ',
      phoneNumber: '0864222222',
      postalCode: '710-0055',
      prefecture: '岡山県',
      city: '倉敷市',
      street: '阿知3-21-8',
    },
    {
      id: 'cust-3',
      name: '佐藤 一郎',
      contactName: '佐藤 一郎',
      contactKana: 'サトウ イチロウ',
      phoneNumber: '09012345678',
      postalCode: '700-0822',
      prefecture: '岡山県',
      city: '岡山市北区',
      street: '表町3-11-5',
    },
    {
      id: 'cust-4',
      name: '高橋 美咲',
      contactName: '高橋 美咲',
      contactKana: 'タカハシ ミサキ',
      phoneNumber: '08087654321',
      postalCode: '703-8256',
      prefecture: '岡山県',
      city: '岡山市中区',
      street: '浜1-2-3',
    },
    {
      id: 'cust-5',
      name: '伊藤 健太',
      contactName: '伊藤 健太',
      contactKana: 'イトウ ケンタ',
      phoneNumber: '07055558888',
      postalCode: '702-8033',
      prefecture: '岡山県',
      city: '岡山市南区',
      street: '福浜町1-16',
    },
    {
      id: 'cust-6',
      name: '岡山駅前クリニック',
      contactName: '田中 誠',
      contactKana: 'タナカ マコト',
      phoneNumber: '0862345678',
      postalCode: '700-0024',
      prefecture: '岡山県',
      city: '岡山市北区',
      street: '駅元町15-1',
    },
    {
      id: 'cust-7',
      name: '後楽園ホテル',
      contactName: '渡辺 久美子',
      contactKana: 'ワタナベ クミコ',
      phoneNumber: '0862721111',
      postalCode: '703-8274',
      prefecture: '岡山県',
      city: '岡山市北区',
      street: '後楽園1-5',
    },
    {
      id: 'cust-8',
      name: '中区役所',
      contactName: '中村 修',
      contactKana: 'ナカムラ オサム',
      phoneNumber: '0869011603',
      postalCode: '703-8544',
      prefecture: '岡山県',
      city: '岡山市中区',
      street: '浜3-7-15',
    },
    {
      id: 'cust-9',
      name: '南区 福浜公民館',
      contactName: '小林 あゆみ',
      contactKana: 'コバヤシ アユミ',
      phoneNumber: '0862641105',
      postalCode: '702-8033',
      prefecture: '岡山県',
      city: '岡山市南区',
      street: '福浜町1-16',
    },
    {
      id: 'cust-10',
      name: '東区役所',
      contactName: '加藤 雄一',
      contactKana: 'カトウ ユウイチ',
      phoneNumber: '0869445000',
      postalCode: '704-8555',
      prefecture: '岡山県',
      city: '岡山市東区',
      street: '西大寺南1-2-4',
    },
  ]

  const initialReservations: Reservation[] = []
  const today = new Date('2025-07-22T12:00:00')

  // RFM data
  for (let i = 0; i < 50; i++) {
    const customer = initialCustomers[i % 5]
    const product = initialProducts[i % 6]
    const deliveryDate = new Date(today)
    deliveryDate.setDate(today.getDate() - (i * 3 + 5))
    const items = [
      {productId: product.id, productName: product.name, quantity: 1 + (i % 5), unitPrice: product.price, cost: product.cost},
    ]
    const totalAmount = items.reduce((s, it) => s + it.quantity * it.unitPrice, 0)
    const totalCost = items.reduce((s, it) => s + it.quantity * it.cost, 0)
    initialReservations.push({
      id: `res-rfm-${i}`,
      customerId: customer.id,
      customerName: customer.name,
      deliveryAddress: `${customer.prefecture}${customer.city}${customer.street}`,
      deliveryDate,
      items,
      totalAmount,
      totalCost,
      orderStaff: ['山田', '佐藤'][i % 2],
      createdAt: deliveryDate,
      purpose: '会議',
      paymentMethod: '現金',
      orderChannel: '電話',
      pointUsage: 0,
      notes: '',
      pickupLocation: '配達',
      tasks: {delivered: i % 2 === 0, collected: i % 4 === 0},
    })
  }

  // Delivery route demo data
  const deliveryDemoDate = '2025-07-22'
  const deliveryCustomerIds = ['cust-6', 'cust-7', 'cust-8', 'cust-9', 'cust-10']
  deliveryCustomerIds.forEach((custId, index) => {
    const customer = initialCustomers.find(c => c.id === custId) as Customer
    const product = initialProducts[0]
    const items = [
      {productId: product.id, productName: product.name, quantity: 10 + index * 2, unitPrice: product.price, cost: product.cost},
    ]

    const totalAmount = items.reduce((s, it) => s + it.quantity * it.unitPrice, 0)
    const totalCost = items.reduce((s, it) => s + it.quantity * it.cost, 0)
    const fullAddress = `${customer?.prefecture}${customer.city}${customer.street}`
    initialReservations.push({
      id: `res-demo-${index}`,
      customerId: customer.id,
      customerName: customer.name,
      deliveryAddress: fullAddress,
      deliveryDate: parseDateTime(deliveryDemoDate, `${11 + index}:00`),
      items,
      totalAmount,
      totalCost,
      orderStaff: '佐藤',
      createdAt: new Date(),
      purpose: 'イベント',
      paymentMethod: '請求書',
      orderChannel: 'オンライン',
      pointUsage: 0,
      notes: '時間厳守でお願いします。',
      pickupLocation: '配達',
      tasks: {delivered: false, collected: false},
    })
  })

  return {
    products: initialProducts,
    customers: initialCustomers,
    reservations: initialReservations,
  }
}

// --- Helper Functions & Constants ---
const formatDate = date => {
  if (!date) return ''
  const d = date instanceof Date ? date : date.toDate()
  return d.toISOString().split('T')[0]
}
const formatDateTime = date => {
  if (!date) return ''
  const d = date instanceof Date ? date : date.toDate()
  return `${formatDate(d)} ${formatTime(d)}`
}
const formatTime = date => {
  if (!date) return ''
  const d = date instanceof Date ? date : date.toDate()
  return d.toTimeString().split(' ')[0].substring(0, 5)
}
const parseDateTime = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return new Date()
  return new Date(`${dateStr}T${timeStr}`)
}
const formatPhoneNumber = phone => {
  if (!phone) return ''
  const cleaned = ('' + phone).replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{4})(\d{4})$/)
  if (match) return `${match[1]}-${match[2]}-${match[3]}`
  const match2 = cleaned.match(/^(\d{2})(\d{4})(\d{4})$/)
  if (match2) return `${match2[1]}-${match2[2]}-${match2[3]}`
  return phone
}
const initialReservationState = {
  customerId: '',
  customerName: '',
  contactName: '',
  contactKana: '',
  phoneNumber: '',
  postalCode: '',
  prefecture: '',
  city: '',
  street: '',
  deliveryDate: formatDate(new Date()),
  deliveryTime: '12:00',
  purpose: '会議',
  paymentMethod: '現金',
  orderChannel: '電話',
  pointUsage: 0,
  orderStaff: '',
  notes: '',
  items: [{productId: '', productName: '', quantity: 1, unitPrice: 0, cost: 0}],
  totalAmount: 0,
  totalCost: 0,
  pickupLocation: '配達',
  tasks: {delivered: false, collected: false},
}
const PURPOSE_OPTIONS = ['会議', '法事', '慶事', 'イベント', '個人', 'その他']
const PAYMENT_OPTIONS = ['現金', '請求書', 'クレジットカード', 'その他']
const ORDER_CHANNEL_OPTIONS = ['電話', '店頭', 'オンライン']

// --- UI Components ---
const Modal = ({children, isOpen, onClose, size = '2xl'}) => {
  if (!isOpen) return null
  const sizeClasses = {sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl', '2xl': 'max-w-2xl', '4xl': 'max-w-4xl'}
  return (
    <div className="fixed inset-0 bg-black/60  z-50 flex justify-center items-center p-4">
      <div className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col`}>
        <div className="p-6 relative overflow-y-auto">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10">
            <X size={24} />
          </button>
          {children}
        </div>
      </div>
    </div>
  )
}
const ConfirmModal = ({isOpen, onClose, onConfirm, title, message}) => (
  <Modal isOpen={isOpen} onClose={onClose} size="md">
    <div className="text-center">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
        <AlertTriangle className="h-6 w-6 text-red-600" />
      </div>
      <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">{title}</h3>
      <div className="mt-2 px-7 py-3">
        <p className="text-sm text-gray-500">{message}</p>
      </div>
      <div className="flex justify-center items-center px-4 py-3 space-x-4">
        <button onClick={onClose} className="py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
          キャンセル
        </button>
        <button onClick={onConfirm} className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700">
          実行する
        </button>
      </div>
    </div>
  </Modal>
)
const Spinner = () => (
  <div className="flex justify-center items-center h-full">
    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
  </div>
)

// --- Main Application Component ---
export default function App() {
  const isMobile = useIsMobile()
  const [currentView, setCurrentView] = useState('dashboard')
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const data = generateInitialData()

    setProducts(data.products)
    setCustomers(data.customers)
    setReservations(data.reservations)
    setLoading(false)
  }, [])

  const handleSave = (dataType, data) => {
    const setter = {
      customers: setCustomers,
      products: setProducts,
      reservations: setReservations,
    }[dataType]

    if (data.id) {
      // Update
      setter(prev => prev.map(item => (item.id === data.id ? data : item)))
    } else {
      // Create
      const newData = {...data, id: crypto.randomUUID()}
      setter(prev => [...prev, newData])
    }
  }

  const handleDelete = (dataType, id) => {
    const setter = {
      customers: setCustomers,
      products: setProducts,
      reservations: setReservations,
    }[dataType]
    setter(prev => prev.filter(item => item.id !== id))
  }

  const changeView = view => {
    setCurrentView(view)
    setMobileMenuOpen(false)
  }

  if (loading) {
    return (
      <div className="h-screen w-screen bg-gray-100 flex flex-col items-center justify-center gap-4">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans">
      <Header
        currentView={currentView}
        changeView={changeView}
        isMobileMenuOpen={isMobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {currentView === 'dashboard' && <DashboardView reservations={reservations} />}
          {currentView === 'reservations' && (
            <ReservationView
              reservations={reservations}
              customers={customers}
              products={products}
              onSave={handleSave}
              onDelete={handleDelete}
            />
          )}
          {currentView === 'invoices' && <InvoiceView reservations={reservations} />}
          {currentView === 'delivery_route' && <DeliveryRouteView reservations={reservations} />}
          {currentView === 'rfm' && <RFMAnalysisView reservations={reservations} customers={customers} />}
          {currentView === 'customers' && <CustomerView customers={customers} onSave={handleSave} onDelete={handleDelete} />}
          {currentView === 'products' && <ProductView products={products} onSave={handleSave} onDelete={handleDelete} />}
        </div>
      </main>
    </div>
  )
}

// --- Components ---
const Header = ({currentView, changeView, isMobileMenuOpen, setMobileMenuOpen}) => {
  const isMobile = useIsMobile()
  const navItems = [
    {name: 'dashboard', label: 'ダッシュボード', icon: <BarChart2 size={20} />},
    {name: 'reservations', label: '予約管理', icon: <CalendarIcon size={20} />},
    {name: 'delivery_route', label: '配達ルート', icon: <Map size={20} />},
    {name: 'rfm', label: '顧客分析', icon: <Star size={20} />},
    {name: 'invoices', label: '伝票印刷', icon: <Printer size={20} />},
  ]
  const masterDataItems = [
    {name: 'customers', label: '顧客マスタ', icon: <Users size={20} />},
    {name: 'products', label: '商品マスタ', icon: <Package size={20} />},
  ]

  const NavLink = ({item}) => (
    <button
      onClick={() => changeView(item.name)}
      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === item.name ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-200'} ${isMobile ? 'w-full justify-start' : ''}`}
    >
      {item.icon} <span className="ml-2">{item.label}</span>
    </button>
  )

  return (
    <header className="bg-white shadow-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-blue-600">弁当予約Pro</h1>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map(item => (
              <NavLink key={item.name} item={item} />
            ))}
            <div className="relative group">
              <button className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200">
                <Users2 size={20} /> <span className="ml-2">マスタ管理</span> <ChevronDown size={16} className="ml-1" />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 invisible group-hover:visible">
                {masterDataItems.map(item => (
                  <button
                    key={item.name}
                    onClick={() => changeView(item.name)}
                    className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:bg-gray-200"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map(item => (
              <NavLink key={item.name} item={item} />
            ))}
            <div className="border-t my-2"></div>
            <h3 className="px-3 pt-2 text-xs font-semibold text-gray-500 uppercase">マスタ管理</h3>
            {masterDataItems.map(item => (
              <NavLink key={item.name} item={item} />
            ))}
          </div>
        </div>
      )}
    </header>
  )
}

const DashboardView = ({reservations}) => {
  const today = formatDate(new Date('2025-07-22'))
  const todaysReservations = reservations.filter(r => formatDate(r.deliveryDate) === today)
  const stats = useMemo(() => {
    if (todaysReservations.length === 0) return {totalSales: 0, profit: 0, avgOrderValue: 0}
    const totalSales = todaysReservations.reduce((sum, r) => sum + r.totalAmount, 0)
    const totalCost = todaysReservations.reduce((sum, r) => sum + r.totalCost, 0)
    return {totalSales, profit: totalSales - totalCost, avgOrderValue: totalSales / todaysReservations.length}
  }, [todaysReservations])
  const salesByPurpose = useMemo(() => {
    const purposeMap = {}
    todaysReservations.forEach(r => {
      if (!purposeMap[r.purpose]) purposeMap[r.purpose] = {count: 0, total: 0}
      purposeMap[r.purpose].count++
      purposeMap[r.purpose].total += r.totalAmount
    })
    return Object.entries(purposeMap).map(entry => {
      const [purpose, data] = entry as any

      return {purpose, ...data}
    })
  }, [todaysReservations])
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">本日のダッシュボード ({today})</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500">売上合計</h3>
          <p className="text-3xl font-bold text-gray-800">{stats.totalSales.toLocaleString()}円</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500">粗利合計</h3>
          <p className="text-3xl font-bold text-gray-800">{stats.profit.toLocaleString()}円</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500">予約件数</h3>
          <p className="text-3xl font-bold text-gray-800">{todaysReservations.length}件</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500">平均客単価</h3>
          <p className="text-3xl font-bold text-gray-800">{Math.round(stats.avgOrderValue).toLocaleString()}円</p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-bold text-lg mb-4">用途別 売上明細</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">用途</th>
                <th className="px-6 py-3">件数</th>
                <th className="px-6 py-3">金額</th>
              </tr>
            </thead>
            <tbody>
              {salesByPurpose.map(item => (
                <tr key={item.purpose} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{item.purpose}</td>
                  <td className="px-6 py-4">{item.count}件</td>
                  <td className="px-6 py-4">{item.total.toLocaleString()}円</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const RFMAnalysisView = ({reservations, customers}) => {
  const rfmData = useMemo(() => {
    const today = new Date('2025-07-22')
    const customerData = {}
    reservations.forEach(r => {
      if (!r.customerId) return
      if (!customerData[r.customerId]) {
        const customerInfo = customers.find(c => c.id === r.customerId)
        customerData[r.customerId] = {
          id: r.customerId,
          name: customerInfo?.name || '不明',
          orders: 0,
          monetary: 0,
          lastOrderDate: new Date(0),
        }
      }
      const data = customerData[r.customerId]
      data.orders++
      data.monetary += r.totalAmount
      if (r.deliveryDate > data.lastOrderDate) {
        data.lastOrderDate = r.deliveryDate
      }
    })
    const calculated = Object.values(customerData).map(
      (
        c: Customer & {
          lastOrderDate: Date
          orders: number
          monetary: number
        }
      ) => ({
        ...c,
        recency: Math.floor((today.getTime() - c.lastOrderDate.getTime()) / (1000 * 60 * 60 * 24)),
      })
    )
    const getScore = (value, isRecency) => {
      if (isRecency) {
        if (value <= 30) return 5
        if (value <= 60) return 4
        if (value <= 90) return 3
        if (value <= 180) return 2
        return 1
      } else {
        if (value >= 100000) return 5
        if (value >= 50000) return 4
        if (value >= 20000) return 3
        if (value >= 5000) return 2
        return 1
      }
    }
    const getFrequencyScore = value => {
      if (value >= 10) return 5
      if (value >= 5) return 4
      if (value >= 3) return 3
      if (value >= 2) return 2
      return 1
    }
    return calculated
      .map(c => {
        const rScore = getScore(c.recency, true)
        const fScore = getFrequencyScore(c.orders)
        const mScore = getScore(c.monetary, false)
        const totalScore = rScore + fScore + mScore
        let rank = '一般'
        if (totalScore >= 13) rank = '優良顧客'
        else if (totalScore >= 9) rank = '安定顧客'
        else if (totalScore <= 5) rank = '離反懸念'
        return {...c, rScore, fScore, mScore, rank}
      })
      .sort((a, b) => b.rScore + b.fScore + b.mScore - (a.rScore + a.fScore + a.mScore))
  }, [reservations, customers])
  const getRankColor = rank => {
    if (rank === '優良顧客') return 'bg-yellow-100 text-yellow-800'
    if (rank === '安定顧客') return 'bg-blue-100 text-blue-800'
    if (rank === '離反懸念') return 'bg-red-100 text-red-800'
    return 'bg-gray-100 text-gray-800'
  }
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">RFM顧客分析</h2>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-6 py-3">顧客名</th>
              <th className="px-6 py-3">ランク</th>
              <th className="px-6 py-3 text-center">R (最終購入日からの日数)</th>
              <th className="px-6 py-3 text-center">F (購入回数)</th>
              <th className="px-6 py-3 text-center">M (購入金額)</th>
            </tr>
          </thead>
          <tbody>
            {rfmData.map(c => (
              <tr key={c.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{c.name}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRankColor(c.rank)}`}>{c.rank}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  {c.recency}日 ({c.rScore})
                </td>
                <td className="px-6 py-4 text-center">
                  {c.orders}回 ({c.fScore})
                </td>
                <td className="px-6 py-4 text-center">
                  {c.monetary.toLocaleString()}円 ({c.mScore})
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const DeliveryRouteView = ({reservations}) => {
  const [deliveryDate, setDeliveryDate] = useState('2025-07-22')
  const [teams, setTeams] = useState({チームA: [], チームB: []})
  const [unassigned, setUnassigned] = useState([])
  useEffect(() => {
    const deliveriesForDate = reservations
      .filter(r => formatDate(r.deliveryDate) === deliveryDate && r.pickupLocation === '配達')
      .sort((a, b) => a.deliveryDate - b.deliveryDate)
    setUnassigned(deliveriesForDate.map(d => d.id))
    setTeams({チームA: [], チームB: []})
  }, [reservations, deliveryDate])
  const handleAssign = (teamName, deliveryId) => {
    setTeams(prev => ({...prev, [teamName]: [...prev[teamName], deliveryId]}))
    setUnassigned(prev => prev.filter(id => id !== deliveryId))
  }
  const handleUnassign = (teamName, deliveryId) => {
    setTeams(prev => ({...prev, [teamName]: prev[teamName].filter(id => id !== deliveryId)}))
    setUnassigned((prev: any) => [...prev, deliveryId] as any)
  }
  const generateMapsUrl = teamDeliveries => {
    if (teamDeliveries.length < 1) return
    if (teamDeliveries.length === 1) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(teamDeliveries[0].deliveryAddress)}`,
        '_blank'
      )
      return
    }
    const addresses = teamDeliveries.map(d => d.deliveryAddress)
    const origin = addresses[0]
    const destination = addresses[addresses.length - 1]
    const waypoints = addresses.slice(1, -1).join('|')
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&waypoints=${encodeURIComponent(waypoints)}`
    window.open(url, '_blank')
  }
  const TeamColumn = ({name, deliveryIds}) => {
    const teamDeliveries = deliveryIds.map(id => reservations.find(r => r.id === id)).filter(Boolean)
    return (
      <div className="bg-gray-50 p-4 rounded-lg flex-1">
        <h3 className="font-bold text-lg mb-4">{name}</h3>
        <div className="space-y-2">
          {teamDeliveries.map(d => (
            <div key={d.id} className="bg-white p-2 rounded border flex justify-between items-center">
              <div>
                <p className="font-semibold">{d.customerName}</p>
                <p className="text-xs text-gray-500">{d.deliveryAddress}</p>
              </div>
              <button onClick={() => handleUnassign(name, d.id)} className="text-gray-400 hover:text-red-500 p-1">
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => generateMapsUrl(teamDeliveries)}
          disabled={teamDeliveries.length === 0}
          className="mt-4 w-full flex items-center justify-center bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 disabled:bg-gray-400"
        >
          <Map size={16} className="mr-2" />
          このチームのルート表示
        </button>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      <div className="md:flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">配達ルート編成</h2>
        <div className="flex items-center gap-4">
          <input
            type="date"
            value={deliveryDate}
            onChange={e => setDeliveryDate(e.target.value)}
            className="border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
      </div>
      {unassigned.length > 0 && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md" role="alert">
          <p className="font-bold">未割り当ての配達があります</p>
          <p>{unassigned.length}件の配達がどのチームにも割り当てられていません。</p>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold text-lg mb-4">未割り当てリスト</h3>
          <div className="space-y-2">
            {unassigned.map(id => {
              const d = reservations.find(r => r.id === id)
              if (!d) return null
              return (
                <div key={d.id} className="bg-white p-2 rounded border">
                  <p className="font-semibold">{d.customerName}</p>
                  <p className="text-xs text-gray-500">{d.deliveryAddress}</p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleAssign('チームA', d.id)}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                    >
                      Aへ
                    </button>
                    <button
                      onClick={() => handleAssign('チームB', d.id)}
                      className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded"
                    >
                      Bへ
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h3 className="font-bold text-lg mb-4">チーム編成</h3>
          <div className="flex flex-col md:flex-row gap-6">
            <TeamColumn name="チームA" deliveryIds={teams['チームA']} />
            <TeamColumn name="チームB" deliveryIds={teams['チームB']} />
          </div>
        </div>
      </div>
    </div>
  )
}

// --- Fully Implemented Views ---
const ReservationView = ({reservations, customers, products, onSave, onDelete}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingReservation, setEditingReservation] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [filters, setFilters] = useState({
    startDate: formatDate(new Date('2025-07-22')),
    endDate: formatDate(new Date('2025-07-22')),
    keyword: '',
  })

  const handleFilterChange = e => setFilters(prev => ({...prev, [e.target.name]: e.target.value}))
  const openModal = (reservation = null) => {
    setEditingReservation(reservation)
    setIsModalOpen(true)
  }
  const closeModal = () => {
    setIsModalOpen(false)
    setEditingReservation(null)
  }
  const confirmDelete = () => {
    if (deletingId) {
      onDelete('reservations', deletingId)
    }
    setDeletingId(null)
  }

  const filteredReservations = useMemo(() => {
    return reservations
      .filter(r => {
        const deliveryDate = new Date(r.deliveryDate)
        const startDate = new Date(filters.startDate)
        const endDate = new Date(filters.endDate)
        endDate.setHours(23, 59, 59, 999) // Include whole day
        if (deliveryDate < startDate || deliveryDate > endDate) return false
        if (filters.keyword && !r.customerName.includes(filters.keyword) && !r.orderStaff.includes(filters.keyword)) return false
        return true
      })
      .sort((a, b) => b.deliveryDate - a.deliveryDate)
  }, [reservations, filters])

  return (
    <div className="space-y-6">
      <div className="md:flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">予約管理</h2>
        <button
          onClick={() => openModal()}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors"
        >
          <PlusCircle size={20} className="mr-2" />
          新規予約
        </button>
      </div>
      <div className="bg-white p-4 rounded-lg shadow space-y-4 md:space-y-0 md:flex items-end gap-4">
        <div>
          <label className="text-sm font-medium">期間</label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="p-2 border rounded-md"
            />
            <span className="text-gray-500">～</span>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="p-2 border rounded-md"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">キーワード</label>
          <input
            type="text"
            name="keyword"
            placeholder="顧客名, 担当者..."
            value={filters.keyword}
            onChange={handleFilterChange}
            className="p-2 border rounded-md w-full"
          />
        </div>
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-6 py-3">納品日時</th>
              <th className="px-6 py-3">顧客名</th>
              <th className="px-6 py-3">受取</th>
              <th className="px-6 py-3">合計金額</th>
              <th className="px-6 py-3">担当者</th>
              <th className="px-6 py-3">タスク</th>
              <th className="px-6 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredReservations.map(r => (
              <tr key={r.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4">{formatDateTime(r.deliveryDate)}</td>
                <td className="px-6 py-4 font-medium">{r.customerName}</td>
                <td className="px-6 py-4">{r.pickupLocation}</td>
                <td className="px-6 py-4">{r.totalAmount.toLocaleString()}円</td>
                <td className="px-6 py-4">{r.orderStaff}</td>
                <td className="px-6 py-4 flex gap-2">
                  {r.tasks.delivered ? (
                    <CheckSquare size={18} className="text-green-500" />
                  ) : (
                    <Square size={18} className="text-gray-300" />
                  )}{' '}
                  {r.tasks.collected ? (
                    <CheckSquare size={18} className="text-green-500" />
                  ) : (
                    <Square size={18} className="text-gray-300" />
                  )}
                </td>
                <td className="px-6 py-4 flex items-center space-x-3">
                  <button onClick={() => openModal(r)} className="text-blue-600 hover:text-blue-800" title="編集">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => setDeletingId(r.id)} className="text-red-600 hover:text-red-800" title="削除">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal} size="4xl">
        <ReservationForm
          initialData={editingReservation}
          customers={customers}
          products={products}
          onSave={onSave}
          onCancel={closeModal}
        />
      </Modal>
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={confirmDelete}
        title="予約の削除"
        message="この予約を完全に削除します。この操作は元に戻せません。"
      />
    </div>
  )
}

const ReservationForm = ({initialData, customers, products, onSave, onCancel}) => {
  const [reservation, setReservation] = useState(
    initialData
      ? {...initialData, deliveryDate: formatDate(initialData.deliveryDate), deliveryTime: formatTime(initialData.deliveryDate)}
      : initialReservationState
  )
  const handleInputChange = e => {
    const {name, value, type, checked} = e.target
    const val = type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value
    setReservation(prev => ({...prev, [name]: val}))
  }
  const handleTaskChange = taskName =>
    setReservation(prev => ({...prev, tasks: {...prev.tasks, [taskName]: !prev.tasks[taskName]}}))
  const handlePhoneLookup = () => {
    const customer = customers.find(c => c.phoneNumber === reservation.phoneNumber.replace(/-/g, ''))
    if (customer) {
      setReservation(prev => ({
        ...prev,
        ...customer,
        customerName: customer.name,
        deliveryAddress: `${customer.prefecture}${customer.city}${customer.street}`,
      }))
    } else {
      alert('該当する顧客情報が見つかりません。')
    }
  }
  const handlePostalCodeLookup = async () => {
    if (!reservation.postalCode) return
    try {
      const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${reservation.postalCode.replace(/-/g, '')}`)
      const data = await res.json()
      if (data.results) {
        const {address1, address2, address3} = data.results[0]
        setReservation(prev => ({...prev, prefecture: address1, city: address2, street: address3}))
      }
    } catch (e) {
      console.error('Postal code lookup failed', e)
    }
  }
  const handleItemChange = (index, field, value) => {
    const newItems = [...reservation.items]
    newItems[index][field] = value
    if (field === 'productId') {
      const product = products.find(p => p.id === value)
      if (product) {
        newItems[index].productName = product.name
        newItems[index].unitPrice = product.price
        newItems[index].cost = product.cost
      }
    }
    if (field === 'quantity') newItems[index].quantity = parseInt(value, 10) || 0
    setReservation(prev => ({...prev, items: newItems}))
  }
  const addItem = () =>
    setReservation(prev => ({
      ...prev,
      items: [...prev.items, {productId: '', productName: '', quantity: 1, unitPrice: 0, cost: 0}],
    }))
  const removeItem = index => setReservation(prev => ({...prev, items: prev.items.filter((_, i) => i !== index)}))
  useEffect(() => {
    const totalCost = reservation.items.reduce((sum, item) => sum + item.quantity * item.cost, 0)
    const subtotal = reservation.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
    const totalAmount = subtotal - reservation.pointUsage
    setReservation(prev => ({...prev, totalCost, totalAmount}))
  }, [reservation.items, reservation.pointUsage])
  const handleSubmit = e => {
    e.preventDefault()
    onSave('reservations', reservation)
    onCancel()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-2xl font-bold text-gray-800">{initialData ? '予約編集' : '新規予約'}</h3>
      {/* Customer Info */}
      <fieldset className="p-4 border rounded-lg">
        <legend className="px-2 font-semibold">お客様情報</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="label">電話番号</label>
            <div className="flex">
              <input
                type="tel"
                name="phoneNumber"
                value={reservation.phoneNumber}
                onChange={handleInputChange}
                className="input-field-grow"
              />
              <button type="button" onClick={handlePhoneLookup} className="btn-secondary ml-2">
                連携
              </button>
            </div>
          </div>
          <div>
            <label className="label">会社・団体名</label>
            <input
              type="text"
              name="customerName"
              value={reservation.customerName}
              onChange={handleInputChange}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="label">担当者名</label>
            <input
              type="text"
              name="contactName"
              value={reservation.contactName}
              onChange={handleInputChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">郵便番号</label>
            <div className="flex">
              <input
                type="text"
                name="postalCode"
                value={reservation.postalCode}
                onChange={handleInputChange}
                className="input-field-grow"
              />
              <button type="button" onClick={handlePostalCodeLookup} className="btn-secondary ml-2">
                住所検索
              </button>
            </div>
          </div>
          <div>
            <label className="label">都道府県</label>
            <input
              type="text"
              name="prefecture"
              value={reservation.prefecture}
              onChange={handleInputChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">市区町村</label>
            <input type="text" name="city" value={reservation.city} onChange={handleInputChange} className="input-field" />
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <label className="label">番地・建物名</label>
            <input type="text" name="street" value={reservation.street} onChange={handleInputChange} className="input-field" />
          </div>
        </div>
      </fieldset>
      {/* Reservation Info */}
      <fieldset className="p-4 border rounded-lg">
        <legend className="px-2 font-semibold">予約情報</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="label">納品日</label>
            <input
              type="date"
              name="deliveryDate"
              value={reservation.deliveryDate}
              onChange={handleInputChange}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="label">納品時間</label>
            <input
              type="time"
              name="deliveryTime"
              value={reservation.deliveryTime}
              onChange={handleInputChange}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="label">受取場所</label>
            <select name="pickupLocation" value={reservation.pickupLocation} onChange={handleInputChange} className="input-field">
              <option value="配達">配達</option>
              <option value="店舗">店舗</option>
            </select>
          </div>
          <div>
            <label className="label">用途</label>
            <select name="purpose" value={reservation.purpose} onChange={handleInputChange} className="input-field">
              {PURPOSE_OPTIONS.map(opt => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">支払方法</label>
            <select name="paymentMethod" value={reservation.paymentMethod} onChange={handleInputChange} className="input-field">
              {PAYMENT_OPTIONS.map(opt => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">注文経路</label>
            <select name="orderChannel" value={reservation.orderChannel} onChange={handleInputChange} className="input-field">
              {ORDER_CHANNEL_OPTIONS.map(opt => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">受付担当者</label>
            <input
              type="text"
              name="orderStaff"
              value={reservation.orderStaff}
              onChange={handleInputChange}
              className="input-field"
            />
          </div>
          <div className="lg:col-span-2">
            <label className="label">予約後タスク</label>
            <div className="flex gap-4 pt-2">
              <button type="button" onClick={() => handleTaskChange('delivered')} className="flex items-center gap-2">
                {reservation.tasks.delivered ? <CheckSquare className="text-blue-600" /> : <Square className="text-gray-400" />}{' '}
                受け渡し済
              </button>
              <button type="button" onClick={() => handleTaskChange('collected')} className="flex items-center gap-2">
                {reservation.tasks.collected ? <CheckSquare className="text-blue-600" /> : <Square className="text-gray-400" />}{' '}
                回収済
              </button>
            </div>
          </div>
        </div>
      </fieldset>
      {/* Items */}
      <fieldset className="p-4 border rounded-lg">
        <legend className="px-2 font-semibold">注文商品</legend>
        <div className="space-y-2">
          {reservation.items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-center">
              <select
                name="productId"
                value={item.productId}
                onChange={e => handleItemChange(index, 'productId', e.target.value)}
                className="col-span-12 md:col-span-5 input-field"
              >
                <option value="">商品を選択</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.price.toLocaleString()}円)
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={item.quantity}
                onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                placeholder="数量"
                className="col-span-4 md:col-span-2 input-field"
                min="1"
              />
              <span className="col-span-6 md:col-span-2 text-right text-sm text-gray-600">
                @{item.unitPrice.toLocaleString()}円
              </span>
              <span className="col-span-6 md:col-span-2 text-right font-semibold">
                {(item.quantity * item.unitPrice).toLocaleString()}円
              </span>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="col-span-2 md:col-span-1 text-red-500 hover:text-red-700 flex justify-center"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addItem}
          className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
        >
          <PlusCircle size={16} className="mr-1" />
          商品を追加
        </button>
        <div className="mt-4 border-t pt-4 space-y-2 text-right">
          <div className="flex justify-end items-center gap-2">
            <label>ポイント使用:</label>
            <input
              type="number"
              name="pointUsage"
              value={reservation.pointUsage}
              onChange={handleInputChange}
              className="w-24 input-field text-right"
            />
            <span>円</span>
          </div>
          <div className="text-xl font-bold">合計: {reservation.totalAmount.toLocaleString()}円</div>
        </div>
      </fieldset>
      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <button type="button" onClick={onCancel} className="btn-secondary">
          キャンセル
        </button>
        <button type="submit" className="btn-primary flex items-center">
          <Save size={18} className="mr-2" />
          保存
        </button>
      </div>
    </form>
  )
}

const InvoiceView = ({reservations}) => {
  const [targetDate, setTargetDate] = useState(formatDate(new Date('2025-07-22')))
  const [selected, setSelected] = useState({})
  const invoicesForDate = reservations.filter(r => formatDate(r.deliveryDate) === targetDate)
  const toggleAll = e => {
    const newSelected = {}
    if (e.target.checked) {
      invoicesForDate.forEach(inv => (newSelected[inv.id] = true))
    }
    setSelected(newSelected)
  }
  const toggleOne = id => setSelected(prev => ({...prev, [id]: !prev[id]}))
  const handlePrint = () => {
    window.print()
  }
  return (
    <div className="space-y-6">
      <div className="md:flex justify-between items-center print:hidden">
        <h2 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">伝票印刷</h2>
        <div className="flex items-center gap-4">
          <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} className="p-2 border rounded-md" />
          <button onClick={handlePrint} className="btn-primary flex items-center">
            <Printer size={18} className="mr-2" />
            選択した伝票を印刷
          </button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto print:hidden">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="p-4">
                <input
                  type="checkbox"
                  onChange={toggleAll}
                  checked={Object.keys(selected).length > 0 && Object.keys(selected).length === invoicesForDate.length}
                />
              </th>
              <th className="px-6 py-3">納品時間</th>
              <th className="px-6 py-3">顧客名</th>
              <th className="px-6 py-3">合計金額</th>
            </tr>
          </thead>
          <tbody>
            {invoicesForDate.map(r => (
              <tr key={r.id} className="bg-white border-b hover:bg-gray-50">
                <td className="p-4">
                  <input type="checkbox" checked={!!selected[r.id]} onChange={() => toggleOne(r.id)} />
                </td>
                <td className="px-6 py-4">{formatTime(r.deliveryDate)}</td>
                <td className="px-6 py-4 font-medium">{r.customerName}</td>
                <td className="px-6 py-4">{r.totalAmount.toLocaleString()}円</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="hidden print:block space-y-8">
        {invoicesForDate
          .filter(r => selected[r.id])
          .map(r => {
            const subtotal = r.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0)
            return (
              <div key={r.id} className="bg-white p-8 border-2 border-dashed page-break-after">
                <h1 className="text-2xl font-bold text-center mb-2">御注文伝票</h1>
                <p className="text-center mb-6">予約No: {r.id.substring(0, 8)}</p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <h3 className="font-bold text-lg">{r.customerName} 御中</h3>
                    <p>{r.phoneNumber}</p>
                    <p>{r.deliveryAddress}</p>
                  </div>
                  <div className="text-right">
                    <p>注文日: {formatDate(r.createdAt)}</p>
                    <p className="font-bold">納品日時: {formatDateTime(r.deliveryDate)}</p>
                  </div>
                </div>
                <table className="w-full mb-6">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="text-left py-2">商品名</th>
                      <th className="text-right">単価</th>
                      <th className="text-right">数量</th>
                      <th className="text-right">金額</th>
                    </tr>
                  </thead>
                  <tbody>
                    {r.items.map((item, i) => (
                      <tr key={i} className="border-b">
                        <td className="py-2">{item.productName}</td>
                        <td className="text-right">{item.unitPrice.toLocaleString()}円</td>
                        <td className="text-right">{item.quantity}</td>
                        <td className="text-right">{(item.unitPrice * item.quantity).toLocaleString()}円</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="w-1/2 ml-auto text-right space-y-2">
                  <div className="flex justify-between">
                    <p>小計:</p>
                    <p>{subtotal.toLocaleString()}円</p>
                  </div>
                  <div className="flex justify-between">
                    <p>ポイント使用:</p>
                    <p>-{(r.pointUsage || 0).toLocaleString()}円</p>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <p>合計金額:</p>
                    <p>{r.totalAmount.toLocaleString()}円</p>
                  </div>
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}

const MasterView = ({title, items, columns, formFields, onSave, onDelete, dataType}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const openModal = (item = null) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }
  const closeModal = () => {
    setIsModalOpen(false)
    setEditingItem(null)
  }
  const handleSaveAndClose = data => {
    onSave(dataType, data)
    closeModal()
  }
  const confirmDelete = () => {
    if (deletingId) {
      onDelete(dataType, deletingId)
    }
    setDeletingId(null)
  }
  const FormComponent = ({item, onSave, onCancel}) => {
    const [formData, setFormData] = useState(item || formFields.reduce((acc, f) => ({...acc, [f.name]: ''}), {}))
    const handleChange = e => {
      const {name, value, type} = e.target
      setFormData(prev => ({...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value}))
    }
    const handleSubmit = e => {
      e.preventDefault()
      onSave(formData)
    }
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-2xl font-bold">{item ? '編集' : '新規作成'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formFields.map(field => (
            <div key={field.name} className={field.fullWidth ? 'md:col-span-2' : ''}>
              <label className="label">{field.label}</label>
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                className="input-field"
                required={field.required}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end space-x-4 pt-4">
          <button type="button" onClick={onCancel} className="btn-secondary">
            キャンセル
          </button>
          <button type="submit" className="btn-primary">
            保存
          </button>
        </div>
      </form>
    )
  }
  return (
    <div className="space-y-6">
      <div className="md:flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">{title}</h2>
        <button onClick={() => openModal()} className="btn-primary flex items-center">
          <PlusCircle size={20} className="mr-2" />
          新規作成
        </button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              {columns.map(c => (
                <th key={c.key} className="px-6 py-3">
                  {c.label}
                </th>
              ))}
              <th className="px-6 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                {columns.map(c => (
                  <td key={c.key} className="px-6 py-4">
                    {c.formatter ? c.formatter(item[c.key]) : item[c.key]}
                  </td>
                ))}
                <td className="px-6 py-4 flex items-center space-x-3">
                  <button onClick={() => openModal(item)} className="text-blue-600">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => setDeletingId(item.id)} className="text-red-600">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal} size="2xl">
        <FormComponent item={editingItem} onSave={handleSaveAndClose} onCancel={closeModal} />
      </Modal>
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={confirmDelete}
        title="削除の確認"
        message="この項目を完全に削除します。この操作は元に戻せません。"
      />
    </div>
  )
}

const CustomerView = ({customers, onSave, onDelete}) => (
  <MasterView
    title="顧客マスタ"
    items={customers}
    onSave={onSave}
    onDelete={onDelete}
    dataType="customers"
    columns={[
      {key: 'name', label: '会社/団体名'},
      {key: 'contactName', label: '担当者名'},
      {key: 'phoneNumber', label: '電話番号', formatter: formatPhoneNumber},
    ]}
    formFields={[
      {name: 'name', label: '会社/団体名', required: true, fullWidth: true},
      {name: 'contactName', label: '担当者名', required: true},
      {name: 'contactKana', label: '担当者名カナ', required: true},
      {name: 'phoneNumber', label: '電話番号', required: true},
      {name: 'postalCode', label: '郵便番号'},
      {name: 'prefecture', label: '都道府県'},
      {name: 'city', label: '市区町村'},
      {name: 'street', label: '番地・建物名', fullWidth: true},
    ]}
  />
)
const ProductView = ({products, onSave, onDelete}) => (
  <MasterView
    title="商品マスタ"
    items={products}
    onSave={onSave}
    onDelete={onDelete}
    dataType="products"
    columns={[
      {key: 'name', label: '商品名'},
      {key: 'cost', label: '原価', formatter: v => `${v.toLocaleString()}円`},
      {key: 'price', label: '販売額', formatter: v => `${v.toLocaleString()}円`},
    ]}
    formFields={[
      {name: 'name', label: '商品名', required: true},
      {name: 'cost', label: '原価', type: 'number', required: true},
      {name: 'price', label: '販売額', type: 'number', required: true},
    ]}
  />
)
