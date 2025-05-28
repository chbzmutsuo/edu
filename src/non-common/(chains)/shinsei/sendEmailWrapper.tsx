import {attachment, knockEmailApi} from '@lib/methods/knockEmailApi'

export const sendEmailWrapper = async (props: {
  subject: string
  text: string
  to: string[]
  cc?: string[]
  html?: string
  attachments?: attachment[]
}) => {
  await knockEmailApi({
    ...props,
    to: [`info.ishidaseiko@gmail.com`],
    cc: [`info@ishidaseiko.com`],
  })
}
