'use server'

import {sendEmailWrapper} from 'src/non-common/(chains)/shinsei/sendEmailWrapper'

import {formatDate} from '@class/Days/date-utils/formatters'
import prisma from 'src/lib/prisma'

export const chain_shinsei_kyuka_notifyWhenUpdate = async ({leaveRequestId}) => {
  const leaveRequest = await prisma.leaveRequest.findUnique({
    where: {id: leaveRequestId},
    include: {
      Approval: {include: {User: {}}, orderBy: [{index: 'asc'}]},
    },
  })

  const lastRemainingApprover = leaveRequest?.Approval.find(approval => approval.status === '未回答')
  if (lastRemainingApprover && !lastRemainingApprover?.notifiedAt) {
    const res = await sendEmailWrapper({
      to: [lastRemainingApprover?.User?.email ?? ''],
      subject: `休暇申請がありました`,
      text: await getEmailText({leaveRequestId}),
    })
  }
}

export const getEmailText = async ({leaveRequestId}) => {
  const leaveRequest = await prisma.leaveRequest.findUnique({
    where: {id: leaveRequestId},
    include: {
      Approval: {
        include: {User: {}},
        orderBy: [{index: 'asc'}],
      },
    },
  })

  const {userId} = leaveRequest ?? {}
  const theUser = await prisma.user.findUnique({
    where: {id: userId},
  })

  const text = [
    `休暇申請がありました`,
    `申請者: ${theUser?.name}`,
    `いつから: ${formatDate(leaveRequest?.from)}`,
    `いつまで: ${formatDate(leaveRequest?.to)}`,
    `休暇区分: ${leaveRequest?.leaveType}`,
    `理由: ${leaveRequest?.reason}`,
  ].join('\n')

  return text
}
