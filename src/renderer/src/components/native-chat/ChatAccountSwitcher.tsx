import { memo, useCallback, useState } from 'react'
import { Bot, Check, ChevronDown, Layers, Plus, Settings, Shield, Sparkles, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store'
import type { AIProvider, AccountProfile } from '../../../../shared/account-profile-types'
import { useAccountProfilesStore } from '@/store/slices/accounts/account-profiles-store'
import { useChatAccountOAuth } from './use-chat-account-oauth'

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

function ProviderIcon({ provider, className }: { provider: AIProvider; className?: string }): React.JSX.Element {
  switch (provider) {
    case 'gemini':
      return <Sparkles className={cn('text-sky-400', className)} />
    case 'chatgpt':
      return <Bot className={cn('text-emerald-400', className)} />
    case 'claude':
      return <Layers className={cn('text-amber-400', className)} />
  }
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
  const { isLoggingIn, handleOAuthLogin } = useChatAccountOAuth()

  const profiles = useAccountProfilesStore((s) => s.profiles)
  const activeAccountByProvider = useAccountProfilesStore((s) => s.activeAccountByProvider)
  const failoverConfig = useAccountProfilesStore((s) => s.failoverConfig)
  const setActiveAccount = useAccountProfilesStore((s) => s.setActiveAccount)
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

  const isLimited = activeProfile?.quotaStatus === 'limited'
  const displayName = activeProfile ? activeProfile.name : `${currentProvider.toUpperCase()} (Mặc định)`

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
                'h-7 max-w-48 px-2.5 rounded-full border border-border/70 hover:border-border/90 bg-background/60 hover:bg-muted/40 backdrop-blur-md shadow-xs text-xs font-medium gap-1.5 transition-all duration-150',
                isLimited && 'border-status-warning/50 bg-status-warning/10 text-status-warning'
              )}
            >
              <span className="flex items-center gap-1.5 min-w-0">
                <span className="relative flex size-2 shrink-0 items-center justify-center">
                  <span
                    className={cn(
                      'absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping',
                      isLimited ? 'bg-amber-400' : 'bg-emerald-400'
                    )}
                  />
                  <span
                    className={cn(
                      'relative inline-flex size-1.5 rounded-full',
                      isLimited
                        ? 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.8)]'
                        : 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]'
                    )}
                  />
                </span>
                <ProviderIcon provider={currentProvider} className="size-3.5 shrink-0" />
                <span className="truncate max-w-28 text-foreground font-medium text-[11.5px]">{displayName}</span>
              </span>
              <ChevronDown
                className={cn(
                  'size-3 text-muted-foreground/80 shrink-0 transition-transform duration-200',
                  isOpen && 'rotate-180'
                )}
              />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={4} className="border bg-popover/95 backdrop-blur-md shadow-lg">
          <div className="space-y-0.5 text-xs">
            <div className="font-semibold text-foreground flex items-center gap-1.5">
              <ProviderIcon provider={currentProvider} className="size-3" />
              <span>{displayName}</span>
            </div>
            <div className="text-[11px] text-muted-foreground">
              {isLimited ? 'Đang hạ nhiệt Cooldown — Tự chuyển tài khoản phụ' : 'Sẵn sàng — Zero-Risk Auto Failover'}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>

      <PopoverContent
        align="end"
        side="top"
        sideOffset={8}
        className="w-[324px] p-0 shadow-2xl border border-border/70 rounded-2xl overflow-hidden bg-popover/98 backdrop-blur-xl animate-in fade-in-0 zoom-in-95"
      >
        {/* Card Header */}
        <div className="px-3.5 py-2.5 border-b border-border/50 bg-gradient-to-b from-muted/50 to-muted/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shadow-xs">
              <Shield className="size-3.5 text-primary" />
            </div>
            <div>
              <div className="text-xs font-semibold text-foreground tracking-tight">AI Multi-Accounts</div>
              <div className="text-[10px] text-muted-foreground leading-none">Zero-Risk Failover</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => updateFailoverConfig({ enabled: !failoverConfig.enabled })}
            className={cn(
              'px-2 py-0.5 rounded-full text-[10.5px] font-medium flex items-center gap-1.5 transition-all shadow-xs border',
              failoverConfig.enabled
                ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/25'
                : 'bg-muted/80 text-muted-foreground border-border/50 hover:bg-muted'
            )}
          >
            <Zap className={cn('size-3', failoverConfig.enabled && 'fill-emerald-500')} />
            <span>{failoverConfig.enabled ? 'Auto BẬT' : 'Failover TẮT'}</span>
          </button>
        </div>

        {/* Segmented Provider Tabs */}
        <div className="p-2 border-b border-border/40 bg-muted/20">
          <div className="grid grid-cols-3 gap-1 p-1 bg-muted/50 rounded-xl border border-border/40 text-[11px]">
            {(['gemini', 'chatgpt', 'claude'] as const).map((prov) => {
              const count = profiles.filter((p) => p.provider === prov).length
              const isSel = selectedProvider === prov
              return (
                <button
                  key={prov}
                  type="button"
                  onClick={() => setSelectedProvider(prov)}
                  className={cn(
                    'py-1 rounded-lg text-center font-medium capitalize flex items-center justify-center gap-1.5 transition-all',
                    isSel
                      ? 'bg-background shadow-xs text-foreground font-semibold border border-border/40'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <ProviderIcon provider={prov} className="size-3 shrink-0" />
                  <span>{prov}</span>
                  {count > 0 ? (
                    <span className="text-[9.5px] px-1 py-0.2 rounded-full bg-muted/80 text-muted-foreground font-mono">
                      {count}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>

        {/* Account List */}
        <div className="max-h-56 overflow-y-auto p-2 space-y-1.5">
          {providerProfiles.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground flex flex-col items-center gap-1.5">
              <ProviderIcon provider={selectedProvider} className="size-6 opacity-40 mb-1" />
              <span>Chưa có tài khoản {selectedProvider.toUpperCase()} nào.</span>
              <span className="text-[11px] text-muted-foreground/80">Nhấn nút bên dưới để thêm ngay!</span>
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
                    'w-full text-left p-2.5 rounded-xl border transition-all duration-150 flex items-center justify-between group',
                    isActive
                      ? 'bg-primary/10 border-primary/30 shadow-xs ring-1 ring-primary/20'
                      : 'bg-background/40 hover:bg-muted/60 border-border/50 hover:border-border'
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <div
                      className={cn(
                        'size-7 rounded-full flex items-center justify-center shrink-0 border shadow-xs',
                        isActive
                          ? 'bg-primary/20 border-primary/40 text-primary'
                          : 'bg-muted/80 border-border/60 text-muted-foreground'
                      )}
                    >
                      <ProviderIcon provider={p.provider} className="size-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-xs text-foreground truncate flex items-center gap-1.5">
                        <span className="truncate">{p.name}</span>
                        {isPQuotaLimited ? (
                          <span className="text-[9.5px] font-medium px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30">
                            Tạm nghỉ
                          </span>
                        ) : isActive ? (
                          <span className="text-[9.5px] font-medium px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                            Đang dùng
                          </span>
                        ) : null}
                      </div>
                      {p.email ? (
                        <div className="text-[10px] text-muted-foreground truncate">{p.email}</div>
                      ) : (
                        <div className="text-[10px] text-muted-foreground/70 truncate">OAuth Web Session</div>
                      )}
                    </div>
                  </div>
                  {isActive ? (
                    <div className="size-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-xs">
                      <Check className="size-3 stroke-[2.5]" />
                    </div>
                  ) : null}
                </button>
              )
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-2 border-t border-border/50 bg-muted/20 flex flex-col gap-1.5">
          <Button
            type="button"
            variant="default"
            size="xs"
            disabled={isLoggingIn}
            onClick={() => handleOAuthLogin(selectedProvider)}
            className="w-full h-7.5 rounded-lg text-xs font-medium gap-1.5 justify-center shadow-xs"
          >
            {isLoggingIn ? <Sparkles className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
            <span>Thêm tài khoản {selectedProvider.toUpperCase()} (OAuth Web)</span>
          </Button>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false)
              useAppStore.getState().openSettingsTarget({ pane: 'accounts', repoId: null })
            }}
            className="w-full h-6.5 px-2 rounded-lg text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex items-center justify-between"
          >
            <span className="flex items-center gap-1.5">
              <Settings className="size-3" />
              <span>Quản lý Đa tài khoản trong Cài đặt</span>
            </span>
            <kbd className="px-1.5 py-0.5 rounded text-[9.5px] font-mono bg-muted border border-border/60 text-muted-foreground">
              ⌘,
            </kbd>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
})
