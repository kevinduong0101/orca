import { useEffect } from 'react'
import type { AgentType } from '../../../../shared/agent-status-types'
import type { QueuedMessageMoveAnchor } from './use-structured-agent-session-queued-reorder'
import type { QueuedMessageCard } from '../../../../shared/agent-session/view/structured-agent-session-queued-cards'
import { sendNativeChatMessage } from './native-chat-runtime-send'
import { sendNativeChatMessageWithImageAttachments } from './native-chat-runtime-image-send'

export type NativeChatPtyQueuedItem = {
  id: string
  text: string
  imagePaths?: string[]
}

export function reorderQueuedItems(
  items: readonly NativeChatPtyQueuedItem[],
  messageId: string,
  anchor: QueuedMessageMoveAnchor
): NativeChatPtyQueuedItem[] {
  const moving = items.find((m) => m.id === messageId)
  if (!moving) {
    return [...items]
  }
  const without = items.filter((m) => m.id !== messageId)
  if (anchor.afterMessageId) {
    const idx = without.findIndex((m) => m.id === anchor.afterMessageId)
    if (idx === -1) {
      return [...items]
    }
    const next = [...without]
    next.splice(idx + 1, 0, moving)
    return next
  }
  if (anchor.beforeMessageId === null) {
    return [...without, moving]
  }
  const idx = without.findIndex((m) => m.id === anchor.beforeMessageId)
  if (idx === -1) {
    return [...items]
  }
  const next = [...without]
  next.splice(idx, 0, moving)
  return next
}

export function createPtyQueuedCards(
  items: readonly NativeChatPtyQueuedItem[],
  isPaused: boolean
): QueuedMessageCard[] {
  return items.map((item, index) => ({
    messageId: item.id,
    position: index,
    text: item.text,
    images: item.imagePaths?.map((path) => ({ type: 'image-ref' as const, path })),
    state: 'waiting' as const,
    hold: (isPaused ? 'queue-paused' : 'turn') as const
  }))
}

export function usePtyQueuedAutoDrain(args: {
  isPaused: boolean
  isWorking: boolean
  turnActive: boolean
  hasPromptCard: boolean
  canSend: boolean
  targetPtyId: string | null
  queuedMessages: readonly NativeChatPtyQueuedItem[]
  agent: AgentType
  onOptimisticSend: (text: string, imagePaths?: string[]) => string | undefined
  revealLatest: () => void
  setQueuedMessages: React.Dispatch<React.SetStateAction<NativeChatPtyQueuedItem[]>>
  isDispatchingQueue: boolean
  setIsDispatchingQueue: React.Dispatch<React.SetStateAction<boolean>>
  turnObservedRef: React.MutableRefObject<boolean>
}): void {
  const {
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
  } = args

  useEffect(() => {
    if (
      isPaused ||
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
    isPaused,
    isDispatchingQueue,
    isWorking,
    turnActive,
    hasPromptCard,
    canSend,
    targetPtyId,
    queuedMessages,
    agent,
    onOptimisticSend,
    revealLatest,
    setIsDispatchingQueue,
    setQueuedMessages,
    turnObservedRef
  ])
}
