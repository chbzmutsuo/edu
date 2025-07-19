import BasicModal from '@cm/components/utils/modal/BasicModal'
import {Button} from '@cm/components/styles/common-components/Button'
import {R_Stack} from '@cm/components/styles/common-components/common-components'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'
import {useState} from 'react'

const HistorySelector = ({history, registerdItems, setregisterdItems}) => {
  const [open, setopen] = useState(false)

  return (
    <>
      <Button
        onClick={() => {
          setopen(true)
        }}
      >
        履歴から
      </Button>
      <BasicModal
        {...{
          open,
          handleClose: () => {
            setopen(false)
          },
        }}
      >
        <div className={`table-wrapper [&_td]:p-1!`}>
          <table>
            <thead>
              <tr>
                <th>日付</th>
                <th>点数</th>
                <th>金額</th>
                <th>選択</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => {
                const total = {
                  count: 0,
                  price: 0,
                }

                h.forEach(d => {
                  total.count += Number(d.quantity)
                  total.price += Number(d.wholesalePrice) * Number(d.quantity)
                })
                const date = h[0].createdAt

                return (
                  <tr key={i}>
                    <td>
                      <R_Stack>
                        <span>{new Date(date).toLocaleDateString()}</span>
                        <span>{new Date(date).toLocaleTimeString()}</span>
                      </R_Stack>
                    </td>

                    <td>{total.count}点</td>
                    <td>{total.price}円</td>
                    <td>
                      <IconBtn
                        onClick={() => {
                          setregisterdItems(h)
                          setopen(false)
                        }}
                        color={`red`}
                      >
                        選択
                      </IconBtn>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <small>過去3回の履歴から自動入力をすることができます。</small>
      </BasicModal>
    </>
  )
}

export default HistorySelector
