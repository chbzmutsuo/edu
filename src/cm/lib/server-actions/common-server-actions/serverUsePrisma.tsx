'use server'

import {revalidatePath} from 'next/cache'

import * as fs from 'fs'

export const fs_write_text = async ({title, content}) => {
  const write = await fs.writeFileSync(title, content, 'utf8')
}
