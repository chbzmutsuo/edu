// // 重い処理（JSXコンポーネント生成など）
// import React from 'react'

// /**
//  * JSON表示コンポーネント生成（動的インポート使用）
//  */
// export const convertToJsonComponent = async (value: unknown): Promise<React.ReactElement | null> => {
//   if (!value) return null

//   try {
//     // 動的インポート
//     const [{shorten, superTrim}, {default: BasicModal}, {default: JsonFormatter}] = await Promise.all([
//       import('@lib/methods/common'),
//       import('@components/utils/modal/BasicModal'),
//       import('react-json-formatter'),
//     ])

//     const shortHand = shorten(superTrim(JSON.stringify(value)), 80)

//     return React.createElement(BasicModal, {
//       alertOnClose: false,
//       btnComponent: React.createElement('div', {}, shortHand),
//       children: React.createElement(
//         'div',
//         {
//           className: 'max-h-[70vh] overflow-auto',
//         },
//         React.createElement(JsonFormatter, {json: value as Record<string, any>})
//       ),
//     })
//   } catch (error) {
//     console.warn('Failed to load JSON component:', error)
//     return React.createElement('div', {}, JSON.stringify(value))
//   }
// }
