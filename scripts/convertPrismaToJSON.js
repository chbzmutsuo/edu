/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs')
const path = require('path')
const {getDMMF} = require('@prisma/internals')

async function generateSchemaExports() {
  // すべての.prismaファイルを読み込む
  const schemaDir = 'prisma/schema'
  const fileNames = fs.readdirSync(schemaDir).filter(name => name.endsWith('.prisma'))

  let combinedSchema = ''
  for (let i = 0; i < fileNames.length; i++) {
    const fileName = fileNames[i]
    const schemaPath = path.join(schemaDir, fileName)
    const schema = fs.readFileSync(schemaPath, 'utf8')
    combinedSchema += schema + '\n'
  }

  // DMMFを取得
  const dmmf = await getDMMF({
    datamodel: combinedSchema,
  })

  // ES Module形式でエクスポート（Next.jsで使用）
  const output = `
export const prismaSchemaString = \`
${combinedSchema}
\`;

export const prismaDMMF = ${JSON.stringify(dmmf.datamodel, null, 2)};
`

  const outputPath = path.join('src/cm/lib/methods/scheme-json-export.js')
  fs.writeFileSync(outputPath, output)

  console.log('✅ Schema exports generated successfully!')
}

generateSchemaExports().catch(error => {
  console.error('Error generating schema exports:', error)
  process.exit(1)
})
