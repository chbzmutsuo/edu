export {}

// import prisma from '@cm/lib/prisma'
// import {Prisma} from '@prisma/client'
// import {NextRequest, NextResponse} from 'next/server'

// export const POST = async (req: NextRequest) => {
//   const gameFindmanyArgs: Prisma.GameFindManyArgs = {
//     include: {
//       Room: {
//         include: {RoomStudent: true},
//       },
//     },
//   }

//   const allProjects = await prisma.game.findMany(gameFindmanyArgs)
//   const queries: transactionQuery[] = []

//   const allRoomStudent = await prisma.roomStudent.findMany({
//     include: {Room: {include: {Game: {}}}},
//   })
//   allRoomStudent.forEach(roomStudent => {
//     const {studentId, roomId, Room} = roomStudent
//     const GameOnRoom = Room.Game

//     GameOnRoom.forEach(game => {
//       const gameId = game.id

//       const data = {
//         gameId,
//         studentId: studentId,
//       }

//       const payload: Prisma.GameStudentUpsertArgs = {
//         where: {
//           unique_gameId_studentId: {
//             gameId,
//             studentId: studentId,
//           },
//         },
//         create: data,
//         update: data,
//       }

//       queries.push({
//         model: `gameStudent`,
//         method: 'upsert',
//         queryObject: payload,
//       })
//     })
//   })

//   await MyPrisma.transactions({
//     transactionQueryList: queries,
//   })

//   return NextResponse.json({allProjects})
// }
