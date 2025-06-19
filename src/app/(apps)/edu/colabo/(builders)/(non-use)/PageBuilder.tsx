// 'use client'

// import {DetailPagePropType} from '@cm/types/types'

// import {ColBuilder} from './ColBuilder'
// import MyForm from '@components/DataLogic/TFs/MyForm/MyForm'
// import {R_Stack} from '@components/styles/common-components/common-components'
// import Accordion from '@components/utils/Accordions/Accordion'

// export class PageBuilder {
//   static masterKeyClient = {
//     form: (props: DetailPagePropType) => {
//       return (
//         <R_Stack className={`max-w-4xl items-stretch`}>
//           <div className={`w-full`}>
//             <Accordion {...{label: `基本情報`, defaultOpen: true, closable: true}}>
//               <MyForm {...{...props}} />
//             </Accordion>
//           </div>
//         </R_Stack>
//       )
//     },
//   }

//   // static getPageBuilderConfigs = (props: pageBuilderType) => {
//   //   const {useGlobalProps, dataModelName} = props
//   //   const {session, accessScopes} = useGlobalProps
//   //   const scopes = accessScopes()
//   //   const {schoolId, teacherId} = scopes.getGroupieScopes()

//   //   const configs = {
//   //     slide: {
//   //       title: 'スライド管理',
//   //       searchKey: 'slide',
//   //       searchDefaultQuery: {
//   //         where: {
//   //           Game: {
//   //             teacherId: teacherId,
//   //           },
//   //         },
//   //         orderBy: [{sortOrder: 'asc'}, {createdAt: 'desc'}],
//   //       },
//   //       ColBuilder: ColBuilder.slide,
//   //       include: QueryBuilder.getInclude(props)?.slide,
//   //       upsertMethods: {
//   //         beforeUpsert: async data => {
//   //           if (!data.gameId) {
//   //             throw new Error('Game ID is required')
//   //           }
//   //           if (!data.sortOrder && data.sortOrder !== 0) {
//   //             const maxOrder = await prisma.slide.findFirst({
//   //               where: {gameId: data.gameId},
//   //               orderBy: {sortOrder: 'desc'},
//   //               select: {sortOrder: true},
//   //             })
//   //             data.sortOrder = (maxOrder?.sortOrder || 0) + 1
//   //           }
//   //           return data
//   //         },
//   //       },
//   //     },

//   //     slideBlock: {
//   //       title: 'スライドブロック',
//   //       searchKey: 'slideBlock',
//   //       searchDefaultQuery: {
//   //         where: {},
//   //         orderBy: [{sortOrder: 'asc'}],
//   //       },
//   //       ColBuilder: ColBuilder.slideBlock,
//   //       include: QueryBuilder.getInclude(props)?.slideBlock,
//   //       upsertMethods: {
//   //         beforeUpsert: async data => {
//   //           if (!data.slideId) {
//   //             throw new Error('Slide ID is required')
//   //           }
//   //           if (!data.sortOrder && data.sortOrder !== 0) {
//   //             const maxOrder = await prisma.slideBlock.findFirst({
//   //               where: {slideId: data.slideId},
//   //               orderBy: {sortOrder: 'desc'},
//   //               select: {sortOrder: true},
//   //             })
//   //             data.sortOrder = (maxOrder?.sortOrder || 0) + 1
//   //           }
//   //           return data
//   //         },
//   //       },
//   //     },

//   //     slideResponse: {
//   //       title: 'スライド回答',
//   //       searchKey: 'slideResponse',
//   //       searchDefaultQuery: {
//   //         where: {
//   //           Game: {
//   //             teacherId: teacherId,
//   //           },
//   //         },
//   //         orderBy: [{createdAt: 'desc'}],
//   //       },
//   //       ColBuilder: ColBuilder.slideResponse,
//   //       include: QueryBuilder.getInclude(props)?.slideResponse,
//   //       readOnly: true,
//   //     },

//   //     game: {
//   //       title: 'Colabo 授業管理',
//   //       searchKey: 'game',
//   //       searchDefaultQuery: {
//   //         where: {
//   //           teacherId: teacherId,
//   //           schoolId: schoolId,
//   //         },
//   //         orderBy: [{date: 'desc'}],
//   //       },
//   //       ColBuilder: ColBuilder.game,
//   //       include: QueryBuilder.getInclude(props)?.game,
//   //       upsertMethods: {
//   //         beforeUpsert: async data => {
//   //           if (!data.secretKey) {
//   //             // Generate unique secret key
//   //             const randomKey = Math.random().toString(36).substring(2, 15)
//   //             data.secretKey = `colabo_${randomKey}_${Date.now()}`
//   //           }
//   //           if (!data.schoolId) {
//   //             data.schoolId = schoolId
//   //           }
//   //           if (!data.teacherId) {
//   //             data.teacherId = teacherId
//   //           }
//   //           return data
//   //         },
//   //         afterUpsert: async (result, data, mode) => {
//   //           if (mode === 'create') {
//   //             // Create default slides for new game
//   //             await prisma.slide.create({
//   //               data: {
//   //                 gameId: result.id,
//   //                 title: 'ウェルカムスライド',
//   //                 templateType: 'normal',
//   //                 sortOrder: 0,
//   //                 SlideBlock: {
//   //                   create: [
//   //                     {
//   //                       blockType: 'text',
//   //                       content: `# ${data.name}へようこそ！\n\n本日の授業を開始します。`,
//   //                       alignment: 'center',
//   //                       sortOrder: 0,
//   //                     },
//   //                   ],
//   //                 },
//   //               },
//   //             })
//   //           }
//   //           return result
//   //         },
//   //       },
//   //     },
//   //   }

//   //   return configs[dataModelName] || {}
//   // }
// }
