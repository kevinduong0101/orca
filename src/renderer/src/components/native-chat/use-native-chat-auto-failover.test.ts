import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAccountProfilesStore } from '@/store/slices/accounts/account-profiles-store'
import { useNativeChatAutoFailover } from './use-native-chat-auto-failover'

vi.mock('sonner', () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn()
  }
}))

describe('useNativeChatAutoFailover', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
    const state = useAccountProfilesStore.getState()
    state.setActiveAccount('gemini', 'default-gemini-1')
    state.recordQuotaStatus('default-gemini-1', 'ready')
    state.recordQuotaStatus('default-gemini-2', 'ready')
    state.updateFailoverConfig({ enabled: true, autoRetryOnFailover: true })
  })

  it('triggers auto failover and retries continuation when usageLimitTurnItemId is set', () => {
    const continueUsageLimit = vi.fn()

    const { rerender } = renderHook(
      ({ turnItemId }: { turnItemId: string | null }) =>
        useNativeChatAutoFailover({
          agent: 'gemini',
          usageLimitTurnItemId: turnItemId,
          continueUsageLimit
        }),
      { initialProps: { turnItemId: null } }
    )

    expect(continueUsageLimit).not.toHaveBeenCalled()
    expect(useAccountProfilesStore.getState().activeAccountByProvider.gemini).toBe('default-gemini-1')

    // Simulate rate limit cut arrival
    rerender({ turnItemId: 'turn-cut-123' })

    // Auto failover should have switched account to backup
    expect(useAccountProfilesStore.getState().activeAccountByProvider.gemini).toBe('default-gemini-2')

    // Fast-forward delay
    vi.advanceTimersByTime(700)

    expect(continueUsageLimit).toHaveBeenCalledTimes(1)
  })

  it('does not failover if failover is disabled', () => {
    useAccountProfilesStore.getState().updateFailoverConfig({ enabled: false })
    const continueUsageLimit = vi.fn()

    const { rerender } = renderHook(
      ({ turnItemId }: { turnItemId: string | null }) =>
        useNativeChatAutoFailover({
          agent: 'gemini',
          usageLimitTurnItemId: turnItemId,
          continueUsageLimit
        }),
      { initialProps: { turnItemId: null } }
    )

    rerender({ turnItemId: 'turn-cut-456' })
    vi.advanceTimersByTime(700)

    expect(continueUsageLimit).not.toHaveBeenCalled()
    expect(useAccountProfilesStore.getState().activeAccountByProvider.gemini).toBe('default-gemini-1')
  })
})
