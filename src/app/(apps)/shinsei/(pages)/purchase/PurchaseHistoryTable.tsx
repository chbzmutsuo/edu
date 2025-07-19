'use client'

import PurchaseApproveModal from '@app/(apps)/shinsei/(pages)/purchase/PurchaseApproveModal'
import {Button} from '@cm/components/styles/common-components/Button'
import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
import {Paper} from '@cm/components/styles/common-components/paper'
import useModal from '@cm/components/utils/modal/useModal'
import MyPopover from '@cm/components/utils/popover/MyPopover'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {isDev, shorten} from '@cm/lib/methods/common'
import {Approval, Product, User} from '@prisma/client'
import {useEffect, useState} from 'react'
import {twMerge} from 'tailwind-merge'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

interface PurchaseRequest {
  id: number
  purchaseType: string
  Product: Product
  quantity: number
  reason: string
  createdAt: string
  emailSentAt: string
  User: User
  Approval: (Approval & {User: User})[]
}

export default function PurchaseHistoryTable({
  dataFetchProps = {},
  deletable = false,
}: {
  dataFetchProps: any
  deletable?: boolean
}) {
  const useGlobalProps = useGlobal()
  const {session, accessScopes, toggleLoad} = useGlobalProps
  const {isKanrisha} = accessScopes().getShinseiScopes()

  const [requests, setRequests] = useState<PurchaseRequest[]>([])

  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const itemsPerPage = 20
  const fetchRequests = async () => {
    try {
      const where: any = {}
      if (startDate) where.createdAt = {...(where.createdAt || {}), gte: new Date(startDate)}
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        where.createdAt = {...(where.createdAt || {}), lte: end}
      }

      const response = await doStandardPrisma(`purchaseRequest`, `findMany`, {
        orderBy: {createdAt: 'desc'},
        include: {
          Product: {},
          User: {},
          Approval: {
            orderBy: [{index: 'asc'}],
            include: {User: {}},
          },
        },
        skip: (currentPage - 1) * itemsPerPage,
        take: itemsPerPage,
        ...dataFetchProps,
        where: {...dataFetchProps?.where, ...where},
      })

      setRequests(response.result)
      // 総ページ数を計算するために、全件数を取得
      const totalResponse = await doStandardPrisma(`purchaseRequest`, `findMany`, {
        select: {id: true},
        where,
        ...dataFetchProps,
      })
      setTotalPages(Math.ceil(totalResponse.result.length / itemsPerPage))
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [currentPage, startDate, endDate])

  const {open, setopen, handleClose, Modal} = useModal()

  if (loading) {
    return <div className="container mx-auto p-6">読み込み中...</div>
  }

  const tableClass = twMerge(
    isDev && `max-w-[90vw] max-h-[75vh]`,
    `text-sm overflow-x-auto  `,
    `[&_td]:text-center! [&_td]:p-2! [&_td]:px-3! [&_td]:border-b! [&_td]:border-gray-300!`,
    `[&_th]:text-center! [&_th]:p-2! [&_th]:border-b! [&_th]:border-gray-300! [&_th]:bg-gray-100!`

    // `overflow-x-auto`,
    // mapper(`[&_td]`, ['text-center', 'p-4', 'border-b', 'border-gray-300']),
    // mapper(`[&_th]`, ['text-center', 'p-4', 'border-b', 'border-gray-300', 'bg-gray-100'])
  )

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const deleteMode = isKanrisha && deletable === true
  return (
    <div>
      <C_Stack className={` items-center gap-4`}>
        <Modal>
          <PurchaseApproveModal
            {...{
              Approval: open.Approval,
              request: open.request,
              fetchRequests: () => fetchRequests(),
              handleClose,
            }}
          />
        </Modal>

        <div className="flex gap-4 mb-4 items-center">
          <label>
            開始日:
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="ml-2 border rounded px-2 py-1"
            />
          </label>
          <label>
            終了日:
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="ml-2 border rounded px-2 py-1"
            />
          </label>
        </div>

        <div className={tableClass}>
          <C_Stack className={` gap-1 font-bold`}>
            <p>
              ・<span className={`text-red-500`}>自身の承認待ち</span>
            </p>
            <p>
              ・<span className={`text-blue-500`}>承認待ちのユーザー</span>
            </p>
            <p>
              ・<span className={`text-gray-500`}>承認順に到達していないユーザー</span>
            </p>
          </C_Stack>
          <table className="border border-gray-300 bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th>申請日時</th>
                <th>申請者</th>
                <th>購入区分</th>
                <th>商品</th>
                <th>数量</th>
                <th>理由</th>
                <th>承認者</th>
                <th>コメント</th>
                <th>最終結果</th>
                {isDev && <th>仕入先メール送付</th>}
                {deleteMode && <th>削除</th>}
              </tr>
            </thead>
            <tbody>
              {(requests ?? []).map(request => {
                const ApprovalList = request.Approval

                const hasSomeRejection = ApprovalList.some(data => data.status === '却下')

                const allApproved = ApprovalList.every(data => data.status === '承認')

                const lastApprovedIdx = ApprovalList.findIndex(data => data.status === '承認')

                const nextApproverIdx = ApprovalList.findIndex(data => {
                  return data.index === lastApprovedIdx + 1
                })

                return (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td>{new Date(request.createdAt).toLocaleString('ja-JP')}</td>
                    <td>{request.User.name}</td>
                    <td>{request.purchaseType}</td>

                    <td>
                      <C_Stack className={` items-start gap-0.5`}>
                        <small>{request.Product.code}</small>
                        <div>{request.Product.name}</div>
                      </C_Stack>
                    </td>
                    <td>{request.quantity}</td>
                    <td>{request.reason}</td>
                    <td>
                      <R_Stack className={`  flex-nowrap justify-normal `}>
                        {ApprovalList.map((approve, i) => {
                          const passed = approve.status === '承認' && i < lastApprovedIdx

                          const allPassed = ApprovalList.every(data => data.status === '承認')

                          const isNextApprover = i === nextApproverIdx
                          const notMyTime = nextApproverIdx < i
                          const hasAnswered = approve.status !== '未回答'
                          const updateable = session.id === approve.userId && !notMyTime && !allPassed && !hasAnswered

                          const buttonClass =
                            hasSomeRejection || allPassed
                              ? ''
                              : isNextApprover
                                ? updateable
                                  ? 'bg-red-500 font-bold text-white'
                                  : 'bg-blue-500 font-bold text-white'
                                : notMyTime
                                  ? 'bg-gray-300 text-gray-500 opacity-50'
                                  : 'bg-gray-300'

                          return (
                            <R_Stack key={i} className={`flex-nowrap `}>
                              <button
                                onClick={() => {
                                  if (updateable) {
                                    setopen({Approval: approve, request})
                                  }
                                }}
                                className={twMerge(
                                  'rounded-sm p-1',
                                  updateable ? 'cursor-pointer' : 'pointer-events-none',
                                  buttonClass
                                )}
                              >
                                {approve.User.name}
                              </button>
                              {i !== ApprovalList.length - 1 && <div>→</div>}
                            </R_Stack>
                          )
                        })}
                      </R_Stack>
                    </td>

                    <td>
                      <C_Stack className={`gap-1`}>
                        {ApprovalList.map(data => {
                          return (
                            <R_Stack key={data.id}>
                              <R_Stack className=" flex flex-nowrap  gap-2 text-start">
                                <span
                                  className={twMerge(
                                    `w-[70px] rounded-full px-2 py-0.5 text-center text-xs `,
                                    data.status === '承認'
                                      ? 'bg-green-100 text-green-800'
                                      : data.status === '却下'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-gray-100 text-gray-800'
                                  )}
                                >
                                  {data.status}
                                </span>
                                <small className={`w-[80px] text-end`}>{data.User.name}:</small>
                              </R_Stack>
                              {data.comment && (
                                <MyPopover
                                  {...{
                                    mode: 'click',
                                    button: (
                                      <div className="max-w-[300px] border-gray-300 pl-2 text-sm text-gray-600">
                                        {shorten(data.comment, 20)}
                                      </div>
                                    ),
                                  }}
                                >
                                  <Paper className={`w-[500px] overflow-auto`}>{data.comment}</Paper>
                                </MyPopover>
                              )}
                            </R_Stack>
                          )
                        })}
                      </C_Stack>
                    </td>
                    <td>
                      <span
                        className={twMerge(
                          `rounded-full px-3 py-1 text-sm font-medium`,
                          hasSomeRejection
                            ? 'bg-red-100 text-red-800'
                            : allApproved
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                        )}
                      >
                        {hasSomeRejection ? '却下' : allApproved ? '承認' : '進行中'}
                      </span>
                    </td>
                    {isDev && <td>{formatDate(request.emailSentAt)}</td>}
                    {deleteMode && (
                      <td>
                        <Button
                          color={`red`}
                          onClick={async () => {
                            if (confirm(`データを削除しますか?`)) {
                              if (confirm(`本当に削除してもよろしいですか?`)) {
                                await doStandardPrisma(`purchaseRequest`, `delete`, {
                                  where: {id: request.id ?? 0},
                                })
                                fetchRequests()
                              }
                            }
                          }}
                        >
                          削除
                        </Button>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* ページネーション */}
        <div className="mt-4 flex justify-center gap-2">
          <button
            className="rounded-sm border border-gray-300 px-4 py-2 hover:bg-gray-100 disabled:opacity-50"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            前へ
          </button>
          {Array.from({length: totalPages}, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`rounded px-4 py-2 ${
                currentPage === page ? 'bg-blue-500 text-white' : 'border border-gray-300 hover:bg-gray-100'
              }`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
          <button
            className="rounded-sm border border-gray-300 px-4 py-2 hover:bg-gray-100 disabled:opacity-50"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            次へ
          </button>
        </div>
      </C_Stack>
    </div>
  )
}
