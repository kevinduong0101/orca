import { create } from 'zustand'
import type {
  AccountFailoverConfig,
  AccountProfile,
  AccountQuotaStatus,
  AIProvider
} from '../../../../../shared/account-profile-types'
import {
  loadStoredActive,
  loadStoredConfig,
  loadStoredProfiles,
  persistActive,
  persistConfig,
  persistProfiles
} from './account-profiles-defaults'

export type AccountFailoverResult = {
  switched: boolean
  previousAccount: AccountProfile | null
  nextAccount: AccountProfile | null
}

export type AccountProfilesState = {
  profiles: AccountProfile[]
  activeAccountByProvider: Record<AIProvider, string | null>
  failoverConfig: AccountFailoverConfig
  getProfilesForProvider: (provider: AIProvider) => AccountProfile[]
  getActiveProfile: (provider: AIProvider) => AccountProfile | null
  setActiveAccount: (provider: AIProvider, accountId: string | null) => void
  upsertProfile: (profile: AccountProfile) => void
  removeProfile: (accountId: string) => void
  recordQuotaStatus: (
    accountId: string,
    status: AccountQuotaStatus,
    resetsAt?: number | null
  ) => void
  getNextAvailableAccount: (provider: AIProvider, excludeAccountId?: string) => AccountProfile | null
  performAutoFailover: (
    provider: AIProvider,
    currentAccountId?: string | null
  ) => AccountFailoverResult
  updateFailoverConfig: (config: Partial<AccountFailoverConfig>) => void
}

export const useAccountProfilesStore = create<AccountProfilesState>()((set, get) => ({
  profiles: loadStoredProfiles(),
  activeAccountByProvider: loadStoredActive(),
  failoverConfig: loadStoredConfig(),

  getProfilesForProvider: (provider: AIProvider): AccountProfile[] => {
    return get().profiles.filter((p) => p.provider === provider)
  },

  getActiveProfile: (provider: AIProvider): AccountProfile | null => {
    const activeId = get().activeAccountByProvider[provider]
    if (!activeId) {
      return null
    }
    return get().profiles.find((p) => p.id === activeId) ?? null
  },

  setActiveAccount: (provider: AIProvider, accountId: string | null): void => {
    set((state) => {
      const updatedActive = {
        ...state.activeAccountByProvider,
        [provider]: accountId
      }
      persistActive(updatedActive)

      const updatedProfiles = state.profiles.map((p) => {
        if (p.id === accountId) {
          return { ...p, lastUsedAt: Date.now() }
        }
        return p
      })
      persistProfiles(updatedProfiles)

      return {
        activeAccountByProvider: updatedActive,
        profiles: updatedProfiles
      }
    })
  },

  upsertProfile: (profile: AccountProfile): void => {
    set((state) => {
      const existingIndex = state.profiles.findIndex((p) => p.id === profile.id)
      let nextProfiles: AccountProfile[]
      if (existingIndex !== -1) {
        nextProfiles = [...state.profiles]
        nextProfiles[existingIndex] = { ...nextProfiles[existingIndex], ...profile }
      } else {
        nextProfiles = [...state.profiles, profile]
      }
      persistProfiles(nextProfiles)

      const currentActive = state.activeAccountByProvider[profile.provider]
      let nextActive = state.activeAccountByProvider
      if (!currentActive) {
        nextActive = { ...nextActive, [profile.provider]: profile.id }
        persistActive(nextActive)
      }

      return { profiles: nextProfiles, activeAccountByProvider: nextActive }
    })
  },

  removeProfile: (accountId: string): void => {
    set((state) => {
      const removed = state.profiles.find((p) => p.id === accountId)
      const nextProfiles = state.profiles.filter((p) => p.id !== accountId)
      persistProfiles(nextProfiles)

      let nextActive = state.activeAccountByProvider
      if (removed && state.activeAccountByProvider[removed.provider] === accountId) {
        const replacement = nextProfiles.find((p) => p.provider === removed.provider)
        nextActive = {
          ...nextActive,
          [removed.provider]: replacement ? replacement.id : null
        }
        persistActive(nextActive)
      }

      return { profiles: nextProfiles, activeAccountByProvider: nextActive }
    })
  },

  recordQuotaStatus: (
    accountId: string,
    status: AccountQuotaStatus,
    resetsAt: number | null = null
  ): void => {
    set((state) => {
      const nextProfiles = state.profiles.map((p) => {
        if (p.id !== accountId) {
          return p
        }
        const isLimited = status === 'limited'
        return {
          ...p,
          quotaStatus: status,
          quotaResetAt: isLimited ? resetsAt : null,
          rateLimitCount: isLimited ? p.rateLimitCount + 1 : p.rateLimitCount
        }
      })
      persistProfiles(nextProfiles)
      return { profiles: nextProfiles }
    })
  },

  getNextAvailableAccount: (
    provider: AIProvider,
    excludeAccountId?: string
  ): AccountProfile | null => {
    const now = Date.now()
    const candidates = get().profiles.filter((p) => {
      if (p.provider !== provider) {
        return false
      }
      if (excludeAccountId && p.id === excludeAccountId) {
        return false
      }
      if (p.quotaStatus === 'limited') {
        if (p.quotaResetAt && p.quotaResetAt <= now) {
          return true
        }
        return false
      }
      return p.quotaStatus === 'ready'
    })

    if (candidates.length === 0) {
      return null
    }

    const { strategy } = get().failoverConfig
    if (strategy === 'least-used') {
      return candidates.slice().sort((a, b) => a.rateLimitCount - b.rateLimitCount)[0]
    }
    return candidates.slice().sort((a, b) => a.lastUsedAt - b.lastUsedAt)[0]
  },

  performAutoFailover: (
    provider: AIProvider,
    currentAccountId?: string | null
  ): AccountFailoverResult => {
    const state = get()
    const activeId = currentAccountId ?? state.activeAccountByProvider[provider]
    const currentProfile = state.profiles.find((p) => p.id === activeId) ?? null

    if (activeId) {
      const cooldownMs = state.failoverConfig.cooldownMinutes * 60 * 1000
      get().recordQuotaStatus(activeId, 'limited', Date.now() + cooldownMs)
    }

    // 1. Cross-Provider Safe Fallback first (100% ToS compliant: shifts workload to distinct platform)
    if (state.failoverConfig.crossProviderFallback) {
      const otherProviders: AIProvider[] = (['gemini', 'claude', 'chatgpt'] as const).filter(
        (p) => p !== provider
      )
      for (const altProvider of otherProviders) {
        const altCandidate = get().getNextAvailableAccount(altProvider)
        if (altCandidate) {
          get().setActiveAccount(altProvider, altCandidate.id)
          return {
            switched: true,
            previousAccount: currentProfile,
            nextAccount: altCandidate,
            isCrossProvider: true
          }
        }
      }
    }

    // 2. Same-provider fallback (when no alternate provider account is available)
    const nextAccount = get().getNextAvailableAccount(provider, activeId ?? undefined)
    if (!nextAccount) {
      return {
        switched: false,
        previousAccount: currentProfile,
        nextAccount: null,
        isCrossProvider: false
      }
    }

    get().setActiveAccount(provider, nextAccount.id)
    return {
      switched: true,
      previousAccount: currentProfile,
      nextAccount,
      isCrossProvider: false
    }
  },

  updateFailoverConfig: (config: Partial<AccountFailoverConfig>): void => {
    set((state) => {
      const nextConfig = { ...state.failoverConfig, ...config }
      persistConfig(nextConfig)
      return { failoverConfig: nextConfig }
    })
  }
}))
