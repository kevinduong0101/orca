import { memo, useCallback, useState } from 'react'
import { Check, ChevronDown, Plus, Settings, Shield, Sparkles, User, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store'
import type { AIProvider, AccountProfile } from '../../../../shared/account-profile-types'
import { useAccountProfilesStore } from '@/store/slices/accounts/account-profiles-store'

export function resolveProviderFromAgent(agent?: string): AIProvider {
  if (!agent) {
    return 'gemini'
  }
  const lower = agent.toLowerCase()
  if (lower.includes('claude')) {
    return 'claude'
  }
  if (lower.includes('codex') || lower.includes('openai') || lower.includes('chatgpt')) {
    return 'chatgpt'
  }
  return 'gemini'
}

export type ChatAccountSwitcherProps = {
  agent?: string
  disabled?: boolean
}

export const ChatAccountSwitcher = memo(function ChatAccountSwitcher({
  agent,
  disabled = false
}: ChatAccountSwitcherProps): React.JSX.Element {
  const currentProvider = resolveProviderFromAgent(agent)
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(currentProvider)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const profiles = useAccountProfilesStore((s) => s.profiles)
  const activeAccountByProvider = useAccountProfilesStore((s) => s.activeAccountByProvider)
  const failoverConfig = useAccountProfilesStore((s) => s.failoverConfig)
  const setActiveAccount = useAccountProfilesStore((s) => s.setActiveAccount)
  const upsertProfile = useAccountProfilesStore((s) => s.upsertProfile)
  const updateFailoverConfig = useAccountProfilesStore((s) => s.updateFailoverConfig)

  const activeId = activeAccountByProvider[currentProvider]
  const activeProfile = profiles.find((p) => p.id === activeId) ?? null

  const providerProfiles = profiles.filter((p) => p.provider === selectedProvider)

  const handleSwitch = useCallback(
    (profile: AccountProfile) => {
      setActiveAccount(profile.provider, profile.id)
      toast.success(`Đã chuyển sang tài khoản: ${profile.name}`)
      setIsOpen(false)
    },
    [setActiveAccount]
  )

  const handleOAuthLogin = useCallback(
    async (provider: AIProvider) => {
      setIsLoggingIn(true)
      try {
        const nextIndex = profiles.filter((p) => p.provider === provider).length + 1
        const accountId = `oauth-${provider}-${Date.now()}`
        const accountName = `${provider.toUpperCase()} Tài khoản #${nextIndex}`

        const api = window.electron?.multiAccountOAuth
        if (api?.openOAuthLogin) {
          const res = await api.openOAuthLogin({
            provider,
            accountId,
            accountName
          })
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
            toast.success(`Đã kết nối tài khoản web OAuth: ${newProfile.name}`)
          }
        } else {
          // Web preview / mock fallback
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

  const isLimited = activeProfile?.quotaStatus === 'limited'
  const displayName = activeProfile ? activeProfile.name : `${currentProvider.toUpperCase()}`

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild disabled={disabled}>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              aria-label={`Chuyển tài khoản AI: ${displayName}`}
              disabled={disabled}
              className={cn(
                'h-7 max-w-44 px-2 rounded-lg bg-foreground/[0.04] hover:bg-foreground/[0.08] border border-border/60 text-xs font-medium gap-1.5 transition-colors',
                isLimited && 'border-status-warning/40 bg-status-warning/10 text-status-warning'
              )}
            >
              <span className="flex items-center gap-1 min-w-0">
                <span
                  className={cn(
                    'size-1.5 rounded-full shrink-0',
                    isLimited
                      ? 'bg-status-warning animate-pulse'
                      : activeProfile
                        ? 'bg-emerald-500'
                        : 'bg-muted-foreground'
                  )}
                />
                <User className="size-3 text-muted-foreground shrink-0" />
                <span className="truncate text-chat-foreground">{displayName}</span>
              </span>
              <ChevronDown className="size-3 text-muted-foreground shrink-0" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={4}>
          <div className="space-y-0.5 text-xs">
            <div className="font-medium">Tài khoản: {displayName}</div>
            <div className="text-muted-foreground">
              {isLimited
                ? 'Đang bị giới hạn Quota - Auto Failover sẵn sàng'
                : 'Sẵn sàng - Auto Failover Bật'}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>

      <PopoverContent align="end" side="top" sideOffset={8} className="w-80 p-0 shadow-lg border">
        <div className="p-2.5 border-b bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Shield className="size-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">Kevin Studio Accounts</span>
          </div>
          <button
            type="button"
            onClick={() => updateFailoverConfig({ enabled: !failoverConfig.enabled })}
            className={cn(
              'px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 transition-colors',
              failoverConfig.enabled
                ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                : 'bg-muted text-muted-foreground'
            )}
          >
            <Zap className="size-3" />
            {failoverConfig.enabled ? 'Auto Failover BẬT' : 'Failover TẮT'}
          </button>
        </div>

        {/* Provider Tabs */}
        <div className="grid grid-cols-3 gap-1 p-1.5 border-b bg-muted/10 text-[11px]">
          {(['gemini', 'chatgpt', 'claude'] as const).map((prov) => (
            <button
              key={prov}
              type="button"
              onClick={() => setSelectedProvider(prov)}
              className={cn(
                'py-1 rounded text-center font-medium capitalize transition-colors',
                selectedProvider === prov
                  ? 'bg-background shadow-xs text-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {prov}
            </button>
          ))}
        </div>

        {/* Account List */}
        <div className="max-h-56 overflow-y-auto p-1.5 space-y-1">
          {providerProfiles.length === 0 ? (
            <div className="p-3 text-center text-xs text-muted-foreground">
              Chưa có tài khoản {selectedProvider}. Nhấn thêm bên dưới!
            </div>
          ) : (
            providerProfiles.map((p) => {
              const isActive = activeAccountByProvider[p.provider] === p.id
              const isPQuotaLimited = p.quotaStatus === 'limited'
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSwitch(p)}
                  className={cn(
                    'w-full text-left p-2 rounded-md flex items-center justify-between transition-colors text-xs',
                    isActive
                      ? 'bg-primary/10 border border-primary/20 text-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-medium truncate flex items-center gap-1.5">
                      <span>{p.name}</span>
                      {isPQuotaLimited ? (
                        <span className="text-[10px] text-status-warning bg-status-warning/10 px-1 py-0.2 rounded font-normal">
                          Limited
                        </span>
                      ) : null}
                    </div>
                    {p.email ? (
                      <div className="text-[10px] text-muted-foreground truncate">{p.email}</div>
                    ) : null}
                  </div>
                  {isActive ? <Check className="size-3.5 text-primary shrink-0" /> : null}
                </button>
              )
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-1.5 border-t bg-muted/20 flex flex-col gap-1">
          <Button
            type="button"
            variant="outline"
            size="xs"
            disabled={isLoggingIn}
            onClick={() => handleOAuthLogin(selectedProvider)}
            className="w-full text-xs gap-1.5 justify-center font-medium"
          >
            {isLoggingIn ? (
              <Sparkles className="size-3 animate-spin" />
            ) : (
              <Plus className="size-3" />
            )}
            <span>+ Thêm tài khoản {selectedProvider.toUpperCase()} (OAuth Web)</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => {
              setIsOpen(false)
              useAppStore.getState().openSettingsTarget({ pane: 'accounts', repoId: null })
            }}
            className="w-full text-[11px] text-muted-foreground hover:text-foreground h-6 justify-center gap-1.5"
          >
            <Settings className="size-3" />
            <span>Mở Quản lý Đa tài khoản trong Cài đặt</span>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
})
