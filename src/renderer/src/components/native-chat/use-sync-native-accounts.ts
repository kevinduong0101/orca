import { useEffect } from 'react'
import { callAntigravityAccounts } from '@/runtime/runtime-antigravity-accounts-client'
import { useAccountProfilesStore } from '@/store/slices/accounts/account-profiles-store'
import type { AccountProfile } from '../../../../shared/account-profile-types'

export function useSyncNativeAccounts(): void {
  const upsertProfile = useAccountProfilesStore((s) => s.upsertProfile)
  const setActiveAccount = useAccountProfilesStore((s) => s.setActiveAccount)
  const activeAccountByProvider = useAccountProfilesStore((s) => s.activeAccountByProvider)

  useEffect(() => {
    let cancelled = false

    // 1. Sync Native Antigravity / Gemini accounts
    void callAntigravityAccounts({ kind: 'local' }, { runtime: 'host', wslDistro: null }, 'List').then(
      (state) => {
        if (cancelled || !state) {
          return
        }

        // Sync saved accounts from Antigravity Vault
        for (const acc of state.accounts) {
          const profile: AccountProfile = {
            id: acc.id,
            name: acc.email ? acc.email.split('@')[0] : `Gemini Account (${acc.id.slice(0, 6)})`,
            email: acc.email,
            avatarUrl: null,
            provider: 'gemini',
            partitionId: `persist:account_gemini_${acc.id}`,
            authKind: 'oauth-web',
            quotaStatus: 'ready',
            quotaResetAt: null,
            rateLimitCount: 0,
            lastUsedAt: acc.updatedAt || Date.now(),
            createdAt: acc.createdAt || Date.now()
          }
          upsertProfile(profile)
        }

        // If a native account is currently active in Keychain/environment
        const currentEmail = state.currentAccount?.email
        if (currentEmail) {
          const activeId =
            state.activeAccountId ||
            state.accounts.find((a) => a.email === currentEmail)?.id ||
            'native-antigravity-primary'

          const activeProfile: AccountProfile = {
            id: activeId,
            name: currentEmail.split('@')[0],
            email: currentEmail,
            avatarUrl: null,
            provider: 'gemini',
            partitionId: 'persist:account_gemini_native',
            authKind: 'oauth-web',
            quotaStatus: 'ready',
            quotaResetAt: null,
            rateLimitCount: 0,
            lastUsedAt: Date.now(),
            createdAt: Date.now()
          }
          upsertProfile(activeProfile)

          if (!activeAccountByProvider.gemini || activeAccountByProvider.gemini !== activeId) {
            setActiveAccount('gemini', activeId)
          }
        }
      },
      () => {
        // Silently continue if native accounts RPC is not yet ready
      }
    )

    // 2. Sync Native Codex & Claude accounts if available
    const api = window.api
    if (api?.codexAccounts?.list) {
      void api.codexAccounts.list().then(
        (codexState) => {
          if (cancelled || !codexState) {
            return
          }
          for (const acc of codexState.accounts) {
            const profile: AccountProfile = {
              id: acc.id,
              name: acc.name || `ChatGPT (${acc.id.slice(0, 6)})`,
              email: acc.email || null,
              avatarUrl: null,
              provider: 'chatgpt',
              partitionId: `persist:account_chatgpt_${acc.id}`,
              authKind: 'oauth-web',
              quotaStatus: 'ready',
              quotaResetAt: null,
              rateLimitCount: 0,
              lastUsedAt: Date.now(),
              createdAt: Date.now()
            }
            upsertProfile(profile)
          }
          if (codexState.activeAccountId && !activeAccountByProvider.chatgpt) {
            setActiveAccount('chatgpt', codexState.activeAccountId)
          }
        },
        () => {}
      )
    }

    if (api?.claudeAccounts?.list) {
      void api.claudeAccounts.list().then(
        (claudeState) => {
          if (cancelled || !claudeState) {
            return
          }
          for (const acc of claudeState.accounts) {
            const profile: AccountProfile = {
              id: acc.id,
              name: acc.name || `Claude (${acc.id.slice(0, 6)})`,
              email: acc.email || null,
              avatarUrl: null,
              provider: 'claude',
              partitionId: `persist:account_claude_${acc.id}`,
              authKind: 'oauth-web',
              quotaStatus: 'ready',
              quotaResetAt: null,
              rateLimitCount: 0,
              lastUsedAt: Date.now(),
              createdAt: Date.now()
            }
            upsertProfile(profile)
          }
          if (claudeState.activeAccountId && !activeAccountByProvider.claude) {
            setActiveAccount('claude', claudeState.activeAccountId)
          }
        },
        () => {}
      )
    }

    return () => {
      cancelled = true
    }
  }, [upsertProfile, setActiveAccount, activeAccountByProvider])
}
