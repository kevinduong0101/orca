import { useState, useEffect } from 'react'

export type FeedbackRating = 'like' | 'dislike'

export type MessageFeedback = {
  messageId: string
  rating: FeedbackRating
  reason?: string
  timestamp: number
  snippet?: string
}

const STORAGE_KEY = 'orca:chat-feedback-store'
const LISTENERS = new Set<() => void>()

function notifyListeners(): void {
  for (const listener of LISTENERS) {
    listener()
  }
}

export function readAllFeedback(): Record<string, MessageFeedback> {
  if (typeof window === 'undefined' || !window.localStorage) {
    return {}
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeAllFeedback(data: Record<string, MessageFeedback>): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    notifyListeners()
  } catch {
    // ignore quota errors
  }
}

export function getMessageFeedback(messageId: string): MessageFeedback | undefined {
  const all = readAllFeedback()
  return all[messageId]
}

export function setMessageFeedback(
  messageId: string,
  rating: FeedbackRating,
  reason?: string,
  snippet?: string
): void {
  const all = readAllFeedback()
  all[messageId] = {
    messageId,
    rating,
    reason,
    timestamp: Date.now(),
    snippet: snippet ? snippet.slice(0, 160) : undefined
  }
  writeAllFeedback(all)
}

export function removeMessageFeedback(messageId: string): void {
  const all = readAllFeedback()
  if (all[messageId]) {
    delete all[messageId]
    writeAllFeedback(all)
  }
}

export function getFeedbackGuidelines(): string[] {
  const all = readAllFeedback()
  const entries = Object.values(all)
  const guidelines: string[] = []

  const reasonsCount: Record<string, number> = {}
  for (const entry of entries) {
    if (entry.rating === 'dislike' && entry.reason) {
      reasonsCount[entry.reason] = (reasonsCount[entry.reason] ?? 0) + 1
    }
  }

  for (const [reason, count] of Object.entries(reasonsCount)) {
    if (count > 0) {
      if (reason.includes('dài') || reason.toLowerCase().includes('verbose')) {
        guidelines.push('Cần trả lời ngắn gọn, súc tích, đi thẳng vào trọng tâm.')
      } else if (reason.includes('code') || reason.includes('lệnh')) {
        guidelines.push('Kiểm tra kỹ cú pháp code và các câu lệnh trước khi đề xuất.')
      } else if (reason.includes('chính xác') || reason.includes('đúng ý')) {
        guidelines.push('Đọc kỹ yêu cầu và đối chiếu ngữ cảnh trước khi thực hiện.')
      } else {
        guidelines.push(`Lưu ý của người dùng: ${reason}`)
      }
    }
  }

  return Array.from(new Set(guidelines))
}

export function useMessageFeedback(messageId: string): {
  feedback: MessageFeedback | undefined
  setRating: (rating: FeedbackRating, reason?: string, snippet?: string) => void
  remove: () => void
} {
  const [feedback, setFeedbackState] = useState<MessageFeedback | undefined>(() =>
    getMessageFeedback(messageId)
  )

  useEffect(() => {
    const handleUpdate = () => {
      setFeedbackState(getMessageFeedback(messageId))
    }
    LISTENERS.add(handleUpdate)
    return () => {
      LISTENERS.delete(handleUpdate)
    }
  }, [messageId])

  const setRating = (rating: FeedbackRating, reason?: string, snippet?: string) => {
    setMessageFeedback(messageId, rating, reason, snippet)
  }

  const remove = () => {
    removeMessageFeedback(messageId)
  }

  return { feedback, setRating, remove }
}
