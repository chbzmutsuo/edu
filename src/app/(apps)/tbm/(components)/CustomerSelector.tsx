'use client'

import {useRouter, useSearchParams} from 'next/navigation'

interface Customer {
  id: number
  name: string
}

interface CustomerSelectorProps {
  customers: Customer[]
  currentCustomerId?: number
}

export default function CustomerSelector({customers, currentCustomerId}: CustomerSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleCustomerChange = (customerId: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (customerId) {
      params.set('customerId', customerId)
    } else {
      params.delete('customerId')
    }

    router.push(`?${params.toString()}`)
  }

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">請求書設定</h3>
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">請求先:</label>
        <select
          className="border border-gray-300 rounded px-3 py-2"
          value={currentCustomerId || ''}
          onChange={e => handleCustomerChange(e.target.value)}
        >
          <option value="">全顧客</option>
          {customers.map(customer => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
