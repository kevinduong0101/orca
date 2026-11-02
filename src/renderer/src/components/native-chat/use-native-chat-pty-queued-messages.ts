import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { AgentType } from '../../../../shared/agent-status-types'
import type { QueuedMessageCard } from '../../../../shared/agent-session/view/structured-agent-session-queued-cards'
import type { StructuredAgentSessionQueuedMessagesController } from './use-structured-agent-session-queued-messages'
import { sendNativeChatMessage } from './native-chat-runtime-send'
import { sendNativeChatMessageWithImageAttachments } from './native-chat-runtime-image-send'
import { createBrowserUuid } from '@/lib/browser-uuid'

export type NativeChatPtyQueuedItem = {
  id: string
  text: string
  imagePaths?: string[]
}

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

  const [queuedMessages, setQueuedMessages] = useState<NativeChatPtyQueuedItem[]>([])
  const [isDispatchingQueue, setIsDispatchingQueue] = useState(false)
  const turnObservedRef = useRef(false)

  useEffect(() => {
    setQueuedMessages([])
    setIsDispatchingQueue(false)
    turnObservedRef.current = false
  }, [paneKey, sessionId])

  const onQueuePtySend = useCallback(
    (text: string, imagePaths?: string[]): boolean => {
      if (isWorking || turnActive || queuedMessages.length > 0 || isDispatchingQueue) {
        const id = createBrowserUuid()
        setQueuedMessages((prev) => [...prev, { id, text, imagePaths }])
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

  useEffect(() => {
    if (
      isDispatchingQueue ||
      isWorking ||
      turnActive ||
      hasPromptCard ||
      !canSend ||
      !targetPtyId ||
      queuedMessages.length === 0
    ) {
      return
    }

    const nextMessage = queuedMessages[0]
    if (!nextMessage) {
      return
    }

    setIsDispatchingQueue(true)
    setQueuedMessages((prev) => prev.slice(1))

    onOptimisticSend(nextMessage.text, nextMessage.imagePaths)
    revealLatest()

    const imagePaths = nextMessage.imagePaths ?? []
    if (imagePaths.length > 0) {
      sendNativeChatMessageWithImageAttachments(agent, targetPtyId, nextMessage.text, imagePaths)
    } else {
      sendNativeChatMessage(targetPtyId, nextMessage.text)
    }

    const timeoutId = setTimeout(() => {
      setIsDispatchingQueue((current) => {
        if (current && !turnObservedRef.current) {
          return false
        }
        return current
      })
    }, 4000)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [
    isDispatchingQueue,
    isWorking,
    turnActive,
    hasPromptCard,
    canSend,
    targetPtyId,
    queuedMessages,
    agent,
    onOptimisticSend,
    revealLatest
  ])

  const clearQueue = useCallback(() => {
    setQueuedMessages([])
    setIsDispatchingQueue(false)
    turnObservedRef.current = false
  }, [])

  const queuedCards = useMemo<QueuedMessageCard[]>(() => {
    return queuedMessages.map((item, index) => ({
      messageId: item.id,
      position: index,
      text: item.text,
      images: item.imagePaths?.map((path) => ({ type: 'image-ref' as const, path })),
      state: 'waiting' as const,
      hold: 'turn' as const
    }))
  }, [queuedMessages])

  const queuedController = useMemo<StructuredAgentSessionQueuedMessagesController>(() => {
    return {
      cards: queuedCards,
      queueCapable: true,
      clearCapable: queuedMessages.length > 0,
      pause: null,
      resume: async () => true,
      clear: async () => {
        setQueuedMessages([])
        return true
      },
      queuePending: null,
      pending: () => null,
      steer: async (messageId: string) => {
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
      remove: async (messageId: string) => {
        setQueuedMessages((prev) => prev.filter((m) => m.id !== messageId))
      },
      editCapable: false,
      editor: undefined,
      edit: async () => {},
      steerHead: () => {
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
      },
      isWorking: isWorking || turnActive
    }
  }, [
    queuedCards,
    queuedMessages,
    isWorking,
    turnActive,
    targetPtyId,
    canSend,
    agent,
    onOptimisticSend,
    revealLatest
  ])

  return { queuedController, onQueuePtySend, clearQueue }
}
