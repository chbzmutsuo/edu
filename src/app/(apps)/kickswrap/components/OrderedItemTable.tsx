'use client'

import {R_Stack} from '@components/styles/common-components/common-components'
import {TableBordered, TableWrapper} from '@components/styles/common-components/Table'
import {NumHandler} from '@class/NumHandler'
import Image from 'next/image'
export const OrderedItemTable = ({registerdItems, setregisterdItems, filterdRegisterdItems, total}) => {
  return (
    <TableWrapper
      className={` w-[90vw] max-w-[600px] [&_td]:!p-0.5
       [&_th]:!p-0.5`}
    >
      <TableBordered>
        <thead>
          <tr className={` text-sm`}>
            <th>商品名</th>

            <th className={`w-[60px] text-xs`}>
              <div>小売(税抜)</div>
              <div>卸(税抜)</div>
              <div>最低発注数</div>
            </th>
            <th className={`text-xs`}>
              <div>発注数</div>
              <div>合計金額</div>
            </th>
          </tr>
        </thead>
        <tbody className={`text-responsive `}>
          {registerdItems.map((item, index) => {
            const {
              item: itemName,
              quantity,
              imageUrl,

              retailPrice,
              wholesalePrice,
              minimum,
              category,
            } = item
            const imageId = String(imageUrl).replace(/.+d\//, '').replace(/\/.*/, '')

            const src = `http://drive.google.com/uc?export=view&id=${imageId}`
            const DeleteBtn = () => {
              return (
                <button
                  className={` text-error-main text-[10px] underline`}
                  onClick={() => {
                    if (confirm(`削除してもよろしいですか？`)) {
                      const newItems = registerdItems.filter((_, i) => i !== index)
                      setregisterdItems(newItems)
                    }
                  }}
                >
                  削除
                </button>
              )
            }
            return (
              <tr key={index}>
                <td className={`min-w-[120px]  overflow-auto`}>
                  <R_Stack className={` flex-nowrap justify-between gap-1`}>
                    <div className={`w-full`}>
                      <div>{itemName}</div>
                      <R_Stack className={` justify-between`}>
                        <small>{category}</small>
                        <DeleteBtn />
                      </R_Stack>
                    </div>
                    <Image className={``} src={src} width={50} height={50} alt={``} />
                  </R_Stack>
                </td>

                <td>
                  <div>{NumHandler.toPrice(retailPrice)}</div>
                  <div>{NumHandler.toPrice(wholesalePrice)}</div>
                  <div>{minimum || 0}</div>
                </td>
                <td>
                  <div>
                    <span className={` font-bold  text-red-700`}>
                      <input
                        className={`w-[40px] border-[1px] p-0.5 text-center`}
                        value={quantity}
                        onChange={e => {
                          const newItems = registerdItems.map((d, i) => {
                            if (i === index) {
                              return {...d, quantity: e.target.value}
                            }
                            return d
                          })
                          setregisterdItems(newItems)
                        }}
                      />
                    </span>
                    <span>✖️ {wholesalePrice} </span>
                  </div>
                  <div>
                    =<strong className={` text-sm text-red-500`}>{NumHandler.toPrice(wholesalePrice * quantity)}</strong>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr className={` font-bold`}>
            <td>合計</td>
            <td>{total.count}</td>
            <td>{NumHandler.toPrice(total.price)}</td>
          </tr>
        </tfoot>
      </TableBordered>
    </TableWrapper>
  )
}
