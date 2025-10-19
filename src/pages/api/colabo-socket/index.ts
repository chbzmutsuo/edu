import {Server as SocketIOServer} from 'socket.io'
import type {Server as HTTPServer} from 'http'
import type {Socket} from 'socket.io'
import {
  SOCKET_EVENTS,
  type JoinGamePayload,
  type ChangeSlidePayload,
  type ChangeModePayload,
  type CloseAnswerPayload,
  type SubmitAnswerPayload,
  type ShareAnswerPayload,
  type RevealCorrectPayload,
  type GameStateSyncPayload,
  type AnswerUpdatedPayload,
  type ConnectionAckPayload,
  type SocketErrorPayload,
  type SocketRole,
} from '@app/(apps)/edu/Colabo/lib/socket-config'

// Socket.ioの設定を無効化（Next.jsのbodyParser）
export const config = {
  api: {
    bodyParser: false,
  },
}

// Game状態管理用の型定義
interface GameState {
  currentSlideId: number | null
  mode: 'view' | 'answer' | 'result' | null
  participants: Map<
    string,
    {
      socketId: string
      role: SocketRole
      userId: number
      userName?: string
    }
  >
}

// Game状態を保持するメモリ内ストア
const gameStates = new Map<number, GameState>()

// Socket情報を保持（socketId -> {gameId, role, userId}）
const socketInfo = new Map<
  string,
  {
    gameId: number
    role: SocketRole
    userId: number
  }
>()

/**
 * Gameの状態を初期化または取得
 */
function getOrCreateGameState(gameId: number): GameState {
  if (!gameStates.has(gameId)) {
    gameStates.set(gameId, {
      currentSlideId: null,
      mode: null,
      participants: new Map(),
    })
  }
  return gameStates.get(gameId)!
}

/**
 * Game状態の統計情報を取得
 */
function getGameStats(gameId: number) {
  const state = gameStates.get(gameId)
  if (!state) {
    return {
      totalStudents: 0,
      connectedStudents: 0,
      connectedTeachers: 0,
    }
  }

  let connectedStudents = 0
  let connectedTeachers = 0

  state.participants.forEach(participant => {
    if (participant.role === 'student') {
      connectedStudents++
    } else if (participant.role === 'teacher') {
      connectedTeachers++
    }
  })

  return {
    totalStudents: connectedStudents,
    connectedStudents,
    connectedTeachers,
  }
}

/**
 * Socket.ioサーバーのセットアップ
 */
function setupSocketIO(io: SocketIOServer) {
  console.log('[Colabo Socket.io] サーバーが起動しました')

  io.on(SOCKET_EVENTS.CONNECTION, (socket: Socket) => {
    console.log(`[Colabo Socket.io] クライアント接続: ${socket.id}`)

    /**
     * Gameへの参加
     */
    socket.on(SOCKET_EVENTS.JOIN_GAME, (payload: JoinGamePayload) => {
      try {
        const {gameId, role, userId, userName} = payload

        // バリデーション
        if (!gameId || !role || !userId) {
          const error: SocketErrorPayload = {
            message: '必要なパラメータが不足しています',
            code: 'INVALID_PAYLOAD',
          }
          socket.emit(SOCKET_EVENTS.ERROR, error)
          return
        }

        // Roomに参加
        const roomName = `game-${gameId}`
        socket.join(roomName)

        // Game状態を取得または作成
        const gameState = getOrCreateGameState(gameId)

        // 参加者情報を追加
        gameState.participants.set(socket.id, {
          socketId: socket.id,
          role,
          userId,
          userName,
        })

        // Socket情報を保存
        socketInfo.set(socket.id, {gameId, role, userId})

        console.log(`[Colabo Socket.io] ${role} (userId: ${userId}) が Game ${gameId} に参加`)

        // 接続確認応答を送信
        const ackPayload: ConnectionAckPayload = {
          success: true,
          gameId,
          role,
          currentState: {
            gameId,
            currentSlideId: gameState.currentSlideId,
            mode: gameState.mode,
            stats: {
              totalStudents: getGameStats(gameId).totalStudents,
              connectedStudents: getGameStats(gameId).connectedStudents,
            },
          },
        }
        socket.emit(SOCKET_EVENTS.CONNECTION_ACK, ackPayload)

        // 全員に参加者数の更新を通知
        const stats = getGameStats(gameId)
        const syncPayload: GameStateSyncPayload = {
          gameId,
          currentSlideId: gameState.currentSlideId,
          mode: gameState.mode,
          stats: {
            totalStudents: stats.totalStudents,
            connectedStudents: stats.connectedStudents,
          },
        }
        io.to(roomName).emit(SOCKET_EVENTS.GAME_STATE_SYNC, syncPayload)
      } catch (error) {
        console.error('[Colabo Socket.io] JOIN_GAME エラー:', error)
        const errorPayload: SocketErrorPayload = {
          message: 'Gameへの参加に失敗しました',
          code: 'JOIN_GAME_ERROR',
        }
        socket.emit(SOCKET_EVENTS.ERROR, errorPayload)
      }
    })

    /**
     * スライド切り替え（教師のみ）
     */
    socket.on(SOCKET_EVENTS.TEACHER_CHANGE_SLIDE, (payload: ChangeSlidePayload) => {
      try {
        const {gameId, slideId, slideIndex} = payload
        const info = socketInfo.get(socket.id)

        // 権限チェック
        if (!info || info.role !== 'teacher') {
          const error: SocketErrorPayload = {
            message: '教師のみがスライドを変更できます',
            code: 'UNAUTHORIZED',
          }
          socket.emit(SOCKET_EVENTS.ERROR, error)
          return
        }

        // Game状態を更新
        const gameState = getOrCreateGameState(gameId)
        gameState.currentSlideId = slideId

        console.log(`[Colabo Socket.io] Game ${gameId}: スライド変更 -> ${slideId}`)

        // 全員に同期
        const roomName = `game-${gameId}`
        const syncPayload: GameStateSyncPayload = {
          gameId,
          currentSlideId: slideId,
          mode: gameState.mode,
          stats: {
            totalStudents: getGameStats(gameId).totalStudents,
            connectedStudents: getGameStats(gameId).connectedStudents,
          },
        }
        io.to(roomName).emit(SOCKET_EVENTS.GAME_STATE_SYNC, syncPayload)
      } catch (error) {
        console.error('[Colabo Socket.io] TEACHER_CHANGE_SLIDE エラー:', error)
        const errorPayload: SocketErrorPayload = {
          message: 'スライドの変更に失敗しました',
          code: 'CHANGE_SLIDE_ERROR',
        }
        socket.emit(SOCKET_EVENTS.ERROR, errorPayload)
      }
    })

    /**
     * モード変更（教師のみ）
     */
    socket.on(SOCKET_EVENTS.TEACHER_CHANGE_MODE, (payload: ChangeModePayload) => {
      try {
        const {gameId, slideId, mode} = payload
        const info = socketInfo.get(socket.id)

        // 権限チェック
        if (!info || info.role !== 'teacher') {
          const error: SocketErrorPayload = {
            message: '教師のみがモードを変更できます',
            code: 'UNAUTHORIZED',
          }
          socket.emit(SOCKET_EVENTS.ERROR, error)
          return
        }

        // Game状態を更新
        const gameState = getOrCreateGameState(gameId)
        gameState.mode = mode

        console.log(`[Colabo Socket.io] Game ${gameId}: モード変更 -> ${mode}`)

        // 全員に同期
        const roomName = `game-${gameId}`
        const syncPayload: GameStateSyncPayload = {
          gameId,
          currentSlideId: gameState.currentSlideId,
          mode,
          stats: {
            totalStudents: getGameStats(gameId).totalStudents,
            connectedStudents: getGameStats(gameId).connectedStudents,
          },
        }
        io.to(roomName).emit(SOCKET_EVENTS.GAME_STATE_SYNC, syncPayload)
      } catch (error) {
        console.error('[Colabo Socket.io] TEACHER_CHANGE_MODE エラー:', error)
        const errorPayload: SocketErrorPayload = {
          message: 'モードの変更に失敗しました',
          code: 'CHANGE_MODE_ERROR',
        }
        socket.emit(SOCKET_EVENTS.ERROR, errorPayload)
      }
    })

    /**
     * 回答締切（教師のみ）
     */
    socket.on(SOCKET_EVENTS.TEACHER_CLOSE_ANSWER, (payload: CloseAnswerPayload) => {
      try {
        const {gameId, slideId} = payload
        const info = socketInfo.get(socket.id)

        // 権限チェック
        if (!info || info.role !== 'teacher') {
          const error: SocketErrorPayload = {
            message: '教師のみが回答を締め切ることができます',
            code: 'UNAUTHORIZED',
          }
          socket.emit(SOCKET_EVENTS.ERROR, error)
          return
        }

        console.log(`[Colabo Socket.io] Game ${gameId}: 回答締切 (スライド ${slideId})`)

        // 全員に締切を通知（モードを結果表示に変更）
        const gameState = getOrCreateGameState(gameId)
        gameState.mode = 'result'

        const roomName = `game-${gameId}`
        const syncPayload: GameStateSyncPayload = {
          gameId,
          currentSlideId: gameState.currentSlideId,
          mode: 'result',
          stats: {
            totalStudents: getGameStats(gameId).totalStudents,
            connectedStudents: getGameStats(gameId).connectedStudents,
          },
        }
        io.to(roomName).emit(SOCKET_EVENTS.GAME_STATE_SYNC, syncPayload)
      } catch (error) {
        console.error('[Colabo Socket.io] TEACHER_CLOSE_ANSWER エラー:', error)
        const errorPayload: SocketErrorPayload = {
          message: '回答締切に失敗しました',
          code: 'CLOSE_ANSWER_ERROR',
        }
        socket.emit(SOCKET_EVENTS.ERROR, errorPayload)
      }
    })

    /**
     * 生徒回答送信
     */
    socket.on(SOCKET_EVENTS.STUDENT_SUBMIT_ANSWER, (payload: SubmitAnswerPayload) => {
      try {
        const {gameId, slideId, studentId, answerData} = payload
        const info = socketInfo.get(socket.id)

        // バリデーション
        if (!info || info.role !== 'student') {
          const error: SocketErrorPayload = {
            message: '生徒のみが回答を送信できます',
            code: 'UNAUTHORIZED',
          }
          socket.emit(SOCKET_EVENTS.ERROR, error)
          return
        }

        console.log(`[Colabo Socket.io] Game ${gameId}: 生徒 ${studentId} が回答送信 (スライド ${slideId})`)

        // 生徒本人に保存完了を通知
        socket.emit(SOCKET_EVENTS.STUDENT_ANSWER_SAVED, {
          success: true,
          slideId,
          studentId,
        })

        // 教師に回答状況更新を通知（詳細はDBから取得する想定）
        const roomName = `game-${gameId}`
        const gameState = gameStates.get(gameId)
        if (gameState) {
          const stats = getGameStats(gameId)
          const answerUpdatePayload: AnswerUpdatedPayload = {
            gameId,
            slideId,
            answerCount: 0, // 実際にはDBから取得
            totalStudents: stats.totalStudents,
          }

          // 教師のみに送信
          gameState.participants.forEach((participant, socketId) => {
            if (participant.role === 'teacher') {
              io.to(socketId).emit(SOCKET_EVENTS.GAME_ANSWER_UPDATED, answerUpdatePayload)
            }
          })
        }
      } catch (error) {
        console.error('[Colabo Socket.io] STUDENT_SUBMIT_ANSWER エラー:', error)
        const errorPayload: SocketErrorPayload = {
          message: '回答の送信に失敗しました',
          code: 'SUBMIT_ANSWER_ERROR',
        }
        socket.emit(SOCKET_EVENTS.ERROR, errorPayload)
      }
    })

    /**
     * 特定回答の共有（教師のみ）
     */
    socket.on(SOCKET_EVENTS.TEACHER_SHARE_ANSWER, (payload: ShareAnswerPayload) => {
      try {
        const {gameId, slideId, answerId, isAnonymous} = payload
        const info = socketInfo.get(socket.id)

        // 権限チェック
        if (!info || info.role !== 'teacher') {
          const error: SocketErrorPayload = {
            message: '教師のみが回答を共有できます',
            code: 'UNAUTHORIZED',
          }
          socket.emit(SOCKET_EVENTS.ERROR, error)
          return
        }

        console.log(`[Colabo Socket.io] Game ${gameId}: 回答 ${answerId} を共有`)

        // 全員に共有（詳細はDBから取得する想定）
        const roomName = `game-${gameId}`
        io.to(roomName).emit(SOCKET_EVENTS.TEACHER_SHARE_ANSWER, {
          gameId,
          slideId,
          answerId,
          isAnonymous,
        })
      } catch (error) {
        console.error('[Colabo Socket.io] TEACHER_SHARE_ANSWER エラー:', error)
        const errorPayload: SocketErrorPayload = {
          message: '回答の共有に失敗しました',
          code: 'SHARE_ANSWER_ERROR',
        }
        socket.emit(SOCKET_EVENTS.ERROR, errorPayload)
      }
    })

    /**
     * 正答公開（教師のみ）
     */
    socket.on(SOCKET_EVENTS.TEACHER_REVEAL_CORRECT, (payload: RevealCorrectPayload) => {
      try {
        const {gameId, slideId} = payload
        const info = socketInfo.get(socket.id)

        // 権限チェック
        if (!info || info.role !== 'teacher') {
          const error: SocketErrorPayload = {
            message: '教師のみが正答を公開できます',
            code: 'UNAUTHORIZED',
          }
          socket.emit(SOCKET_EVENTS.ERROR, error)
          return
        }

        console.log(`[Colabo Socket.io] Game ${gameId}: 正答公開 (スライド ${slideId})`)

        // 全員に正答公開を通知
        const roomName = `game-${gameId}`
        io.to(roomName).emit(SOCKET_EVENTS.TEACHER_REVEAL_CORRECT, {
          gameId,
          slideId,
        })
      } catch (error) {
        console.error('[Colabo Socket.io] TEACHER_REVEAL_CORRECT エラー:', error)
        const errorPayload: SocketErrorPayload = {
          message: '正答の公開に失敗しました',
          code: 'REVEAL_CORRECT_ERROR',
        }
        socket.emit(SOCKET_EVENTS.ERROR, errorPayload)
      }
    })

    /**
     * Gameからの退出
     */
    socket.on(SOCKET_EVENTS.LEAVE_GAME, (payload: {gameId: number}) => {
      handleLeaveGame(socket, payload.gameId)
    })

    /**
     * 切断処理
     */
    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      console.log(`[Colabo Socket.io] クライアント切断: ${socket.id}`)

      const info = socketInfo.get(socket.id)
      if (info) {
        handleLeaveGame(socket, info.gameId)
      }
    })
  })
}

/**
 * Gameからの退出処理
 */
function handleLeaveGame(socket: Socket, gameId: number) {
  const info = socketInfo.get(socket.id)
  if (!info) return

  const gameState = gameStates.get(gameId)
  if (gameState) {
    // 参加者リストから削除
    gameState.participants.delete(socket.id)

    // Roomから退出
    const roomName = `game-${gameId}`
    socket.leave(roomName)

    console.log(`[Colabo Socket.io] ${info.role} (userId: ${info.userId}) が Game ${gameId} から退出`)

    // 全員に参加者数の更新を通知
    const stats = getGameStats(gameId)
    const syncPayload: GameStateSyncPayload = {
      gameId,
      currentSlideId: gameState.currentSlideId,
      mode: gameState.mode,
      stats: {
        totalStudents: stats.totalStudents,
        connectedStudents: stats.connectedStudents,
      },
    }
    socket.to(roomName).emit(SOCKET_EVENTS.GAME_STATE_SYNC, syncPayload)

    // 参加者がいなくなったらGame状態を削除
    if (gameState.participants.size === 0) {
      gameStates.delete(gameId)
      console.log(`[Colabo Socket.io] Game ${gameId} の状態を削除`)
    }
  }

  // Socket情報を削除
  socketInfo.delete(socket.id)
}

/**
 * Next.js APIハンドラー
 */
export default function handler(req: any, res: any) {
  if (!res.socket.server.io) {
    console.log('[Colabo Socket.io] 新しいSocket.ioサーバーを初期化')

    const httpServer: HTTPServer = res.socket.server
    const io = new SocketIOServer(httpServer, {
      path: '/api/colabo-socket',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    })

    res.socket.server.io = io
    setupSocketIO(io)
  } else {
    console.log('[Colabo Socket.io] Socket.ioサーバーは既に起動済み')
  }

  res.end()
}
