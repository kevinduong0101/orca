import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import type { AIProvider, AccountProfile } from '../../../../shared/account-profile-types'
import { useAccountProfilesStore } from '@/store/slices/accounts/account-profiles-store'

export function useChatAccountOAuth(): {
  isLoggingIn: boolean
  handleOAuthLogin: (provider: AIProvider) => Promise<void>
} {
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const profiles = useAccountProfilesStore((s) => s.profiles)
  const upsertProfile = useAccountProfilesStore((s) => s.upsertProfile)
  const setActiveAccount = useAccountProfilesStore((s) => s.setActiveAccount)

  const handleOAuthLogin = useCallback(
    async (provider: AIProvider) => {
      setIsLoggingIn(true)
      try {
        const nextIndex = profiles.filter((p) => p.provider === provider).length + 1
        const accountId = `oauth-${provider}-${Date.now()}`
        const accountName = `${provider.toUpperCase()} Tài khoản #${nextIndex}`

        const api = window.electron?.multiAccountOAuth
        if (api?.openOAuthLogin) {
          const res = await api.openOAuthLogin({ provider, accountId, accountName })
          if (res.success) {
            const newProfile: AccountProfile = {
              id: res.accountId || accountId,
              name: res.accountName || accountName,
              email: res.email || null,
              avatarUrl: null,
              provider,
              partitionId: `persist:oauth_${provider}_${res.accountId || accountId}`,
              authKind: 'oauth-web',
              quotaStatus: 'ready',
              quotaResetAt: null,
              rateLimitCount: 0,
              lastUsedAt: Date.now(),
              createdAt: Date.now()
            }
            upsertProfile(newProfile)
            setActiveAccount(provider, newProfile.id)
            toast.success(`Đã kết nối tài khoản: ${newProfile.name}`)
          }
        } else {
          const newProfile: AccountProfile = {
            id: accountId,
            name: accountName,
            email: `kevin.${provider}${nextIndex}@gmail.com`,
            avatarUrl: null,
            provider,
            partitionId: `persist:oauth_${provider}_${accountId}`,
            authKind: 'oauth-web',
            quotaStatus: 'ready',
            quotaResetAt: null,
            rateLimitCount: 0,
            lastUsedAt: Date.now(),
            createdAt: Date.now()
          }
          upsertProfile(newProfile)
          setActiveAccount(provider, newProfile.id)
          toast.success(`Đã thêm tài khoản: ${newProfile.name}`)
        }
      } catch (err) {
        toast.error(`Đăng nhập thất bại: ${err instanceof Error ? err.message : String(err)}`)
      } finally {
        setIsLoggingIn(false)
      }
    },
    [profiles, upsertProfile, setActiveAccount]
  )

  return { isLoggingIn, handleOAuthLogin }
}
