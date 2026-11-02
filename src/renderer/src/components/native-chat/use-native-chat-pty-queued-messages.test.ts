// @vitest-environment happy-dom

import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useNativeChatPtyQueuedMessages } from './use-native-chat-pty-queued-messages'
import * as runtimeSend from './native-chat-runtime-send'

vi.mock('./native-chat-runtime-send', () => ({
  sendNativeChatMessage: vi.fn(),
  sendNativeChatTypedCommand: vi.fn(),
  submitNativeChatPrompt: vi.fn()
}))

vi.mock('./native-chat-runtime-image-send', () => ({
  sendNativeChatMessageWithImageAttachments: vi.fn()
}))

describe('useNativeChatPtyQueuedMessages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('allows direct send when idle and queue is empty', () => {
    const onOptimisticSend = vi.fn()
    const revealLatest = vi.fn()

    const { result } = renderHook(() =>
      useNativeChatPtyQueuedMessages({
        agent: 'antigravity',
        targetPtyId: 'pty-1',
        paneKey: 'pane-1',
        sessionId: 'session-1',
        isWorking: false,
        turnActive: false,
        canSend: true,
        hasPromptCard: false,
        onOptimisticSend,
        revealLatest
      })
    )

    let queued = false
    act(() => {
      queued = result.current.onQueuePtySend('hello world')
    })

    expect(queued).toBe(false)
    expect(result.current.queuedController.cards).toHaveLength(0)
  })

  it('queues messages when agent is working', () => {
    const onOptimisticSend = vi.fn()
    const revealLatest = vi.fn()

    const { result } = renderHook(() =>
      useNativeChatPtyQueuedMessages({
        agent: 'antigravity',
        targetPtyId: 'pty-1',
        paneKey: 'pane-1',
        sessionId: 'session-1',
        isWorking: true,
        turnActive: true,
        canSend: true,
        hasPromptCard: false,
        onOptimisticSend,
        revealLatest
      })
    )

    let queuedFirst = false
    let queuedSecond = false
    act(() => {
      queuedFirst = result.current.onQueuePtySend('message 1')
      queuedSecond = result.current.onQueuePtySend('message 2')
    })

    expect(queuedFirst).toBe(true)
    expect(queuedSecond).toBe(true)
    expect(result.current.queuedController.cards).toHaveLength(2)
    expect(result.current.queuedController.cards[0].text).toBe('message 1')
    expect(result.current.queuedController.cards[1].text).toBe('message 2')
  })

  it('auto-drains queued messages once agent finishes working', () => {
    const onOptimisticSend = vi.fn()
    const revealLatest = vi.fn()

    const { result, rerender } = renderHook(
      ({ isWorking, turnActive }) =>
        useNativeChatPtyQueuedMessages({
          agent: 'antigravity',
          targetPtyId: 'pty-1',
          paneKey: 'pane-1',
          sessionId: 'session-1',
          isWorking,
          turnActive,
          canSend: true,
          hasPromptCard: false,
          onOptimisticSend,
          revealLatest
        }),
      { initialProps: { isWorking: true, turnActive: true } }
    )

    act(() => {
      result.current.onQueuePtySend('queued message')
    })
    expect(result.current.queuedController.cards).toHaveLength(1)

    // Agent finishes working
    act(() => {
      rerender({ isWorking: false, turnActive: false })
    })

    expect(runtimeSend.sendNativeChatMessage).toHaveBeenCalledWith('pty-1', 'queued message')
    expect(onOptimisticSend).toHaveBeenCalledWith('queued message', undefined)
    expect(revealLatest).toHaveBeenCalled()
    expect(result.current.queuedController.cards).toHaveLength(0)
  })

  it('allows manual removal and clearing of queued messages', () => {
    const onOptimisticSend = vi.fn()
    const revealLatest = vi.fn()

    const { result } = renderHook(() =>
      useNativeChatPtyQueuedMessages({
        agent: 'antigravity',
        targetPtyId: 'pty-1',
        paneKey: 'pane-1',
        sessionId: 'session-1',
        isWorking: true,
        turnActive: true,
        canSend: true,
        hasPromptCard: false,
        onOptimisticSend,
        revealLatest
      })
    )

    act(() => {
      result.current.onQueuePtySend('msg 1')
      result.current.onQueuePtySend('msg 2')
    })
    expect(result.current.queuedController.cards).toHaveLength(2)

    // Remove first card
    const firstId = result.current.queuedController.cards[0].messageId
    act(() => {
      void result.current.queuedController.remove(firstId)
    })
    expect(result.current.queuedController.cards).toHaveLength(1)
    expect(result.current.queuedController.cards[0].text).toBe('msg 2')

    // Clear all
    act(() => {
      void result.current.queuedController.clear()
    })
    expect(result.current.queuedController.cards).toHaveLength(0)
  })
})
