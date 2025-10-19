'use client'

import {useEffect, useRef, useState, useCallback} from 'react'
import {io, Socket} from 'socket.io-client'
import {
  SOCKET_CONFIG,
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
  type SlideMode,
} from '../lib/socket-config'

// 接続状態の型
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

// フックのプロパティ型
export interface UseColaboSocketProps {
  gameId: number
  role: SocketRole
  userId: number
  userName?: string
  onSlideChange?: (slideId: number, slideIndex: number) => void
  onModeChange?: (mode: SlideMode | null) => void
  onGameStateSync?: (state: GameStateSyncPayload) => void
  onAnswerUpdate?: (data: AnswerUpdatedPayload) => void
  onAnswerSaved?: (data: any) => void
  onSharedAnswer?: (data: any) => void
  onRevealCorrect?: (data: any) => void
  onError?: (error: SocketErrorPayload) => void
  autoConnect?: boolean
}

/**
 * Colabo Socket.io カスタムフック
 * リアルタイム通信を管理
 */
export function useColaboSocket({
  gameId,
  role,
  userId,
  userName,
  onSlideChange,
  onModeChange,
  onGameStateSync,
  onAnswerUpdate,
  onAnswerSaved,
  onSharedAnswer,
  onRevealCorrect,
  onError,
  autoConnect = true,
}: UseColaboSocketProps) {
  const socketRef = useRef<Socket | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
  const [currentState, setCurrentState] = useState<GameStateSyncPayload | null>(null)

  /**
   * Socket.io接続を確立
   */
  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      console.log('[useColaboSocket] 既に接続済み')
      return
    }

    console.log('[useColaboSocket] 接続開始...')
    setConnectionStatus('connecting')

    // Socket.ioインスタンスを作成
    const socket = io(SOCKET_CONFIG.path, {
      ...SOCKET_CONFIG,
      autoConnect: false,
    })

    socketRef.current = socket

    // 接続イベント
    socket.on('connect', () => {
      console.log('[useColaboSocket] Socket.io接続成功')
      setConnectionStatus('connected')

      // Gameに参加
      const joinPayload: JoinGamePayload = {
        gameId,
        role,
        userId,
        userName,
      }
      socket.emit(SOCKET_EVENTS.JOIN_GAME, joinPayload)
    })

    // 接続確認応答
    socket.on(SOCKET_EVENTS.CONNECTION_ACK, (data: ConnectionAckPayload) => {
      console.log('[useColaboSocket] 接続確認:', data)
      if (data.currentState) {
        setCurrentState(data.currentState)
        onGameStateSync?.(data.currentState)
      }
    })

    // 状態同期
    socket.on(SOCKET_EVENTS.GAME_STATE_SYNC, (data: GameStateSyncPayload) => {
      console.log('[useColaboSocket] 状態同期:', data)
      setCurrentState(data)
      onGameStateSync?.(data)

      // 個別のコールバックも呼び出し
      if (data.currentSlideId !== currentState?.currentSlideId) {
        onSlideChange?.(data.currentSlideId!, 0) // slideIndexは別途管理
      }
      if (data.mode !== currentState?.mode) {
        onModeChange?.(data.mode)
      }
    })

    // 回答状況更新（教師のみ）
    socket.on(SOCKET_EVENTS.GAME_ANSWER_UPDATED, (data: AnswerUpdatedPayload) => {
      console.log('[useColaboSocket] 回答状況更新:', data)
      onAnswerUpdate?.(data)
    })

    // 回答保存完了（生徒のみ）
    socket.on(SOCKET_EVENTS.STUDENT_ANSWER_SAVED, (data: any) => {
      console.log('[useColaboSocket] 回答保存完了:', data)
      onAnswerSaved?.(data)
    })

    // 回答共有
    socket.on(SOCKET_EVENTS.TEACHER_SHARE_ANSWER, (data: any) => {
      console.log('[useColaboSocket] 回答共有:', data)
      onSharedAnswer?.(data)
    })

    // 正答公開
    socket.on(SOCKET_EVENTS.TEACHER_REVEAL_CORRECT, (data: any) => {
      console.log('[useColaboSocket] 正答公開:', data)
      onRevealCorrect?.(data)
    })

    // エラー
    socket.on(SOCKET_EVENTS.ERROR, (error: SocketErrorPayload) => {
      console.error('[useColaboSocket] エラー:', error)
      onError?.(error)
    })

    // 切断
    socket.on('disconnect', reason => {
      console.log('[useColaboSocket] 切断:', reason)
      setConnectionStatus('disconnected')
    })

    // 接続エラー
    socket.on('connect_error', error => {
      console.error('[useColaboSocket] 接続エラー:', error)
      setConnectionStatus('error')
    })

    // 再接続
    socket.on('reconnect', attemptNumber => {
      console.log('[useColaboSocket] 再接続成功:', attemptNumber)
      setConnectionStatus('connected')

      // 再度Gameに参加
      const joinPayload: JoinGamePayload = {
        gameId,
        role,
        userId,
        userName,
      }
      socket.emit(SOCKET_EVENTS.JOIN_GAME, joinPayload)
    })

    // 接続開始
    socket.connect()
  }, [
    gameId,
    role,
    userId,
    userName,
    onSlideChange,
    onModeChange,
    onGameStateSync,
    onAnswerUpdate,
    onAnswerSaved,
    onSharedAnswer,
    onRevealCorrect,
    onError,
    currentState,
  ])

  /**
   * 接続を切断
   */
  const disconnect = useCallback(() => {
    if (!socketRef.current) return

    console.log('[useColaboSocket] 切断処理開始')

    // Gameから退出
    socketRef.current.emit(SOCKET_EVENTS.LEAVE_GAME, {gameId})

    // Socket切断
    socketRef.current.disconnect()
    socketRef.current = null
    setConnectionStatus('disconnected')
  }, [gameId])

  /**
   * スライド変更を送信（教師のみ）
   */
  const changeSlide = useCallback(
    (slideId: number, slideIndex: number) => {
      if (!socketRef.current?.connected) {
        console.warn('[useColaboSocket] 未接続のためスライド変更できません')
        return
      }

      if (role !== 'teacher') {
        console.warn('[useColaboSocket] 教師のみがスライドを変更できます')
        return
      }

      const payload: ChangeSlidePayload = {
        gameId,
        slideId,
        slideIndex,
      }
      socketRef.current.emit(SOCKET_EVENTS.TEACHER_CHANGE_SLIDE, payload)
    },
    [gameId, role]
  )

  /**
   * モード変更を送信（教師のみ）
   */
  const changeMode = useCallback(
    (slideId: number, mode: SlideMode) => {
      if (!socketRef.current?.connected) {
        console.warn('[useColaboSocket] 未接続のためモード変更できません')
        return
      }

      if (role !== 'teacher') {
        console.warn('[useColaboSocket] 教師のみがモードを変更できます')
        return
      }

      const payload: ChangeModePayload = {
        gameId,
        slideId,
        mode,
      }
      socketRef.current.emit(SOCKET_EVENTS.TEACHER_CHANGE_MODE, payload)
    },
    [gameId, role]
  )

  /**
   * 回答締切を送信（教師のみ）
   */
  const closeAnswer = useCallback(
    (slideId: number) => {
      if (!socketRef.current?.connected) {
        console.warn('[useColaboSocket] 未接続のため回答締切できません')
        return
      }

      if (role !== 'teacher') {
        console.warn('[useColaboSocket] 教師のみが回答を締め切れます')
        return
      }

      const payload: CloseAnswerPayload = {
        gameId,
        slideId,
      }
      socketRef.current.emit(SOCKET_EVENTS.TEACHER_CLOSE_ANSWER, payload)
    },
    [gameId, role]
  )

  /**
   * 回答を送信（生徒のみ）
   */
  const submitAnswer = useCallback(
    (slideId: number, answerData: any) => {
      if (!socketRef.current?.connected) {
        console.warn('[useColaboSocket] 未接続のため回答送信できません')
        return
      }

      if (role !== 'student') {
        console.warn('[useColaboSocket] 生徒のみが回答を送信できます')
        return
      }

      const payload: SubmitAnswerPayload = {
        gameId,
        slideId,
        studentId: userId,
        answerData,
      }
      socketRef.current.emit(SOCKET_EVENTS.STUDENT_SUBMIT_ANSWER, payload)
    },
    [gameId, role, userId]
  )

  /**
   * 特定回答を共有（教師のみ）
   */
  const shareAnswer = useCallback(
    (slideId: number, answerId: number, isAnonymous: boolean = false) => {
      if (!socketRef.current?.connected) {
        console.warn('[useColaboSocket] 未接続のため回答共有できません')
        return
      }

      if (role !== 'teacher') {
        console.warn('[useColaboSocket] 教師のみが回答を共有できます')
        return
      }

      const payload: ShareAnswerPayload = {
        gameId,
        slideId,
        answerId,
        isAnonymous,
      }
      socketRef.current.emit(SOCKET_EVENTS.TEACHER_SHARE_ANSWER, payload)
    },
    [gameId, role]
  )

  /**
   * 正答を公開（教師のみ）
   */
  const revealCorrect = useCallback(
    (slideId: number) => {
      if (!socketRef.current?.connected) {
        console.warn('[useColaboSocket] 未接続のため正答公開できません')
        return
      }

      if (role !== 'teacher') {
        console.warn('[useColaboSocket] 教師のみが正答を公開できます')
        return
      }

      const payload: RevealCorrectPayload = {
        gameId,
        slideId,
      }
      socketRef.current.emit(SOCKET_EVENTS.TEACHER_REVEAL_CORRECT, payload)
    },
    [gameId, role]
  )

  // 自動接続
  useEffect(() => {
    if (autoConnect) {
      connect()
    }

    // クリーンアップ
    return () => {
      disconnect()
    }
  }, [autoConnect, connect, disconnect])

  return {
    // 状態
    connectionStatus,
    isConnected: connectionStatus === 'connected',
    currentState,

    // メソッド
    connect,
    disconnect,
    changeSlide,
    changeMode,
    closeAnswer,
    submitAnswer,
    shareAnswer,
    revealCorrect,
  }
}
