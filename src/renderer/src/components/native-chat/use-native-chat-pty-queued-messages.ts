import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { AgentType } from '../../../../shared/agent-status-types'
import type { StructuredAgentSessionQueuedMessagesController } from './use-structured-agent-session-queued-messages'
import type {
  QueuedMessageMoveAnchor,
  QueuedMessageReorder
} from './use-structured-agent-session-queued-reorder'
import type { QueuedMessageInlineEditor } from './native-chat-queued-edit-session'
import { sendNativeChatMessage } from './native-chat-runtime-send'
import { sendNativeChatMessageWithImageAttachments } from './native-chat-runtime-image-send'
import { createBrowserUuid } from '@/lib/browser-uuid'
import {
  createPtyQueuedCards,
  reorderQueuedItems,
  usePtyQueuedAutoDrain,
  type NativeChatPtyQueuedItem
} from './native-chat-pty-queued-helpers'

export type { NativeChatPtyQueuedItem } from './native-chat-pty-queued-helpers'

export type UseNativeChatPtyQueuedMessagesArgs = {
  agent: AgentType
  targetPtyId: string | null
  paneKey: string
  sessionId: string
  isWorking: boolean
  turnActive: boolean
  canSend: boolean
  hasPromptCard: boolean
  onOptimisticSend: (text: string, imagePaths?: string[]) => string | undefined
  revealLatest: () => void
}

export type UseNativeChatPtyQueuedMessagesResult = {
  queuedController: StructuredAgentSessionQueuedMessagesController
  onQueuePtySend: (text: string, imagePaths?: string[]) => boolean
  clearQueue: () => void
  pauseQueue: () => void
}

export function useNativeChatPtyQueuedMessages(
  args: UseNativeChatPtyQueuedMessagesArgs
): UseNativeChatPtyQueuedMessagesResult {
  const {
    agent,
    targetPtyId,
    paneKey,
    sessionId,
    isWorking,
    turnActive,
    canSend,
    hasPromptCard,
    onOptimisticSend,
    revealLatest
  } = args

  const sessionQueueKey = `orca:pty-queue:${paneKey}`
  const [queuedMessages, setQueuedMessages] = useState<NativeChatPtyQueuedItem[]>(() => {
    try {
      const stored = sessionStorage.getItem(`orca:pty-queue:${paneKey}`)
      return stored ? (JSON.parse(stored) as NativeChatPtyQueuedItem[]) : []
    } catch {
      return []
    }
  })

  const [isPaused, setIsPaused] = useState(false)
  const [isDispatchingQueue, setIsDispatchingQueue] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')
  const turnObservedRef = useRef(false)

  useEffect(() => {
    try {
      if (queuedMessages.length > 0) {
        sessionStorage.setItem(sessionQueueKey, JSON.stringify(queuedMessages))
      } else {
        sessionStorage.removeItem(sessionQueueKey)
      }
    } catch {
      // Ignore quota errors
    }
  }, [queuedMessages, sessionQueueKey])

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(`orca:pty-queue:${paneKey}`)
      setQueuedMessages(stored ? (JSON.parse(stored) as NativeChatPtyQueuedItem[]) : [])
    } catch {
      setQueuedMessages([])
    }
    setIsPaused(false)
    setIsDispatchingQueue(false)
    turnObservedRef.current = false
    setEditingId(null)
  }, [paneKey, sessionId])

  const onQueuePtySend = useCallback(
    (text: string, imagePaths?: string[]): boolean => {
      if (isWorking || turnActive || queuedMessages.length > 0 || isDispatchingQueue) {
        const id = createBrowserUuid()
        setQueuedMessages((prev) => [...prev, { id, text, imagePaths }])
        setIsPaused(false)
        return true
      }
      return false
    },
    [isWorking, turnActive, queuedMessages.length, isDispatchingQueue]
  )

  useEffect(() => {
    if (isWorking || turnActive) {
      turnObservedRef.current = true
    } else if (turnObservedRef.current) {
      turnObservedRef.current = false
      setIsDispatchingQueue(false)
    }
  }, [isWorking, turnActive])

  usePtyQueuedAutoDrain({
    isPaused,
    isWorking,
    turnActive,
    hasPromptCard,
    canSend,
    targetPtyId,
    queuedMessages,
    agent,
    onOptimisticSend,
    revealLatest,
    setQueuedMessages,
    isDispatchingQueue,
    setIsDispatchingQueue,
    turnObservedRef
  })

  const clearQueue = useCallback(() => {
    setQueuedMessages([])
    setIsPaused(false)
    setIsDispatchingQueue(false)
    turnObservedRef.current = false
    setEditingId(null)
    try {
      sessionStorage.removeItem(sessionQueueKey)
    } catch {
      // Ignore
    }
  }, [sessionQueueKey])

  const pauseQueue = useCallback(() => {
    setIsPaused(true)
    setIsDispatchingQueue(false)
    turnObservedRef.current = false
  }, [])

  const move = useCallback(async (messageId: string, anchor: QueuedMessageMoveAnchor) => {
    setQueuedMessages((prev) => reorderQueuedItems(prev, messageId, anchor))
  }, [])

  const reorder = useMemo<QueuedMessageReorder>(
    () => ({ scope: paneKey, pending: false, move }),
    [paneKey, move]
  )

  const editor = useMemo<QueuedMessageInlineEditor | undefined>(() => {
    if (!editingId) {
      return undefined
    }
    return {
      messageId: editingId,
      draftScopeKey: `pty-queued-edit:${editingId}`,
      text: editingText,
      change: (text: string) => setEditingText(text),
      acquiring: false,
      saving: false,
      canSave: editingText.trim() !== '',
      imagesCapable: false,
      save: () => {
        setQueuedMessages((prev) =>
          prev.map((m) => (m.id === editingId ? { ...m, text: editingText } : m))
        )
        setEditingId(null)
      },
      cancel: () => setEditingId(null)
    }
  }, [editingId, editingText])

  const queuedCards = useMemo(
    () => createPtyQueuedCards(queuedMessages, isPaused),
    [isPaused, queuedMessages]
  )

  const steer = useCallback(
    async (messageId: string) => {
      if (isWorking || turnActive) {
        return
      }
      const targetMsg = queuedMessages.find((m) => m.id === messageId)
      if (!targetMsg || !targetPtyId || !canSend) {
        return
      }
      setQueuedMessages((prev) => prev.filter((m) => m.id !== messageId))
      onOptimisticSend(targetMsg.text, targetMsg.imagePaths)
      revealLatest()
      const imagePaths = targetMsg.imagePaths ?? []
      if (imagePaths.length > 0) {
        sendNativeChatMessageWithImageAttachments(agent, targetPtyId, targetMsg.text, imagePaths)
      } else {
        sendNativeChatMessage(targetPtyId, targetMsg.text)
      }
    },
    [
      agent,
      canSend,
      isWorking,
      onOptimisticSend,
      queuedMessages,
      revealLatest,
      targetPtyId,
      turnActive
    ]
  )

  const steerHead = useCallback(() => {
    if (isWorking || turnActive || queuedMessages.length === 0 || !targetPtyId || !canSend) {
      return false
    }
    const head = queuedMessages[0]
    if (!head) {
      return false
    }
    setQueuedMessages((prev) => prev.slice(1))
    onOptimisticSend(head.text, head.imagePaths)
    revealLatest()
    const imagePaths = head.imagePaths ?? []
    if (imagePaths.length > 0) {
      sendNativeChatMessageWithImageAttachments(agent, targetPtyId, head.text, imagePaths)
    } else {
      sendNativeChatMessage(targetPtyId, head.text)
    }
    return true
  }, [
    agent,
    canSend,
    isWorking,
    onOptimisticSend,
    queuedMessages,
    revealLatest,
    targetPtyId,
    turnActive
  ])

  const edit = useCallback(
    async (messageId: string) => {
      const target = queuedMessages.find((m) => m.id === messageId)
      if (target) {
        setEditingId(messageId)
        setEditingText(target.text)
      }
    },
    [queuedMessages]
  )

  const remove = useCallback(async (messageId: string) => {
    setQueuedMessages((prev) => prev.filter((m) => m.id !== messageId))
  }, [])

  const resume = useCallback(async () => {
    setIsPaused(false)
    return true
  }, [])

  const clear = useCallback(async () => {
    clearQueue()
    return true
  }, [clearQueue])

  const queuedController = useMemo<StructuredAgentSessionQueuedMessagesController>(() => {
    return {
      cards: queuedCards,
      reorder,
      queueCapable: true,
      clearCapable: queuedCards.length > 0,
      pause: isPaused && queuedCards.length > 0 ? { reason: 'stopped' } : null,
      resume,
      clear,
      queuePending: null,
      pending: () => null,
      steer,
      remove,
      editCapable: true,
      editor,
      edit,
      steerHead,
      isWorking: isWorking || turnActive
    }
  }, [
    clear,
    edit,
    editor,
    isPaused,
    isWorking,
    queuedCards,
    remove,
    reorder,
    resume,
    steer,
    steerHead,
    turnActive
  ])

  return { queuedController, onQueuePtySend, clearQueue, pauseQueue }
}
