import { describe, expect, it, beforeEach } from 'vitest'
import { useAccountProfilesStore } from './account-profiles-store'
import type { AccountProfile } from '../../../../../shared/account-profile-types'

describe('account-profiles-store', () => {
  beforeEach(() => {
    localStorage.clear()
    const state = useAccountProfilesStore.getState()
    // Reset to defaults
    state.setActiveAccount('gemini', 'default-gemini-1')
    state.recordQuotaStatus('default-gemini-1', 'ready')
    state.recordQuotaStatus('default-gemini-2', 'ready')
  })

  it('retrieves profiles for a specific provider', () => {
    const geminiProfiles = useAccountProfilesStore.getState().getProfilesForProvider('gemini')
    expect(geminiProfiles.length).toBeGreaterThanOrEqual(2)
    expect(geminiProfiles.every((p) => p.provider === 'gemini')).toBe(true)
  })

  it('switches active account', () => {
    const store = useAccountProfilesStore.getState()
    store.setActiveAccount('gemini', 'default-gemini-2')
    expect(useAccountProfilesStore.getState().activeAccountByProvider.gemini).toBe('default-gemini-2')
    expect(useAccountProfilesStore.getState().getActiveProfile('gemini')?.id).toBe('default-gemini-2')
  })

  it('performs 100% automatic failover to the next healthy account on rate limit', () => {
    const store = useAccountProfilesStore.getState()
    // Initial active is default-gemini-1
    store.setActiveAccount('gemini', 'default-gemini-1')

    const result = store.performAutoFailover('gemini', 'default-gemini-1')
    expect(result.switched).toBe(true)
    expect(result.previousAccount?.id).toBe('default-gemini-1')
    expect(result.nextAccount?.id).toBe('default-gemini-2')

    // default-gemini-1 is now limited
    const p1 = useAccountProfilesStore.getState().profiles.find((p) => p.id === 'default-gemini-1')
    expect(p1?.quotaStatus).toBe('limited')
    expect(p1?.rateLimitCount).toBe(1)
    expect(p1?.quotaResetAt).toBeGreaterThan(Date.now())

    // active account is now default-gemini-2
    expect(useAccountProfilesStore.getState().activeAccountByProvider.gemini).toBe('default-gemini-2')
  })

  it('adds and removes account profiles', () => {
    const store = useAccountProfilesStore.getState()
    const newProfile: AccountProfile = {
      id: 'custom-gemini-3',
      name: 'Gemini Custom Team',
      email: 'team@gmail.com',
      avatarUrl: null,
      provider: 'gemini',
      partitionId: 'persist:account_gemini_team',
      authKind: 'oauth-web',
      quotaStatus: 'ready',
      quotaResetAt: null,
      rateLimitCount: 0,
      lastUsedAt: Date.now(),
      createdAt: Date.now()
    }
    store.upsertProfile(newProfile)

    const profiles = useAccountProfilesStore.getState().getProfilesForProvider('gemini')
    expect(profiles.some((p) => p.id === 'custom-gemini-3')).toBe(true)

    store.removeProfile('custom-gemini-3')
    const profilesAfter = useAccountProfilesStore.getState().getProfilesForProvider('gemini')
    expect(profilesAfter.some((p) => p.id === 'custom-gemini-3')).toBe(false)
  })
})
