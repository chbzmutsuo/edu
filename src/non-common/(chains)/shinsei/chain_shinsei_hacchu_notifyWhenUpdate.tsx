'use server'

import {sendEmailWrapper} from 'src/non-common/(chains)/shinsei/sendEmailWrapper'
import prisma from 'src/lib/prisma'

export const chain_shinsei_hacchu_notifyWhenUpdate = async ({purchaseRequestId}) => {
  const purchaseRequest = await prisma.purchaseRequest.findUnique({
    where: {id: purchaseRequestId},
    include: {
      Approval: {
        include: {User: {}},
        orderBy: [{index: 'asc'}],
      },
    },
  })

  if (!purchaseRequest) return

  const {purchaseType, productId, quantity, reason, userId} = purchaseRequest
  const lastRemainingApprover = purchaseRequest?.Approval.find(approval => approval.status === '未回答')

  const approveCompleted = lastRemainingApprover && !lastRemainingApprover?.notifiedAt
  const hasNoApprover = purchaseRequest?.Approval.length === 0

  if (approveCompleted || hasNoApprover) {
    const res = await sendEmailWrapper({
      to: [lastRemainingApprover?.User?.email ?? ''],
      subject: `発注申請がありました`,
      text: await getEmailText({purchaseRequestId}),
    })
  }
}

export const getEmailText = async ({purchaseRequestId}) => {
  const purchaseRequest = await prisma.purchaseRequest.findUnique({
    where: {id: purchaseRequestId},
    include: {
      Approval: {
        include: {User: {}},
        orderBy: [{index: 'asc'}],
      },
    },
  })

  if (!purchaseRequest) return ''

  const {purchaseType, productId, quantity, reason, userId} = purchaseRequest
  const theUser = await prisma.user.findUnique({
    where: {id: userId},
  })

  const theProduct = await prisma.product.findUnique({
    where: {id: productId},
  })

  const text = [
    `発注申請がありました`,
    `申請者: ${theUser?.name}`,
    `購入区分: ${purchaseType}`,
    `商品: ${[theProduct?.code, theProduct?.name].filter(Boolean).join(' - ')}`,
    `数量: ${quantity}`,
    `理由: ${reason}`,
  ].join('\n')

  return text
}
