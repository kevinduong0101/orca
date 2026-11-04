import { memo, useCallback, useState } from 'react'
import {
  Check,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import type { AIProvider, AccountProfile } from '../../../../shared/account-profile-types'
import { useAccountProfilesStore } from '@/store/slices/accounts/account-profiles-store'

export const MultiAccountSettingsManager = memo(function MultiAccountSettingsManager(): React.JSX.Element {
  const profiles = useAccountProfilesStore((s) => s.profiles)
  const activeAccountByProvider = useAccountProfilesStore((s) => s.activeAccountByProvider)
  const failoverConfig = useAccountProfilesStore((s) => s.failoverConfig)
  const setActiveAccount = useAccountProfilesStore((s) => s.setActiveAccount)
  const upsertProfile = useAccountProfilesStore((s) => s.upsertProfile)
  const removeProfile = useAccountProfilesStore((s) => s.removeProfile)
  const updateFailoverConfig = useAccountProfilesStore((s) => s.updateFailoverConfig)

  const [activeTab, setActiveTab] = useState<AIProvider>('gemini')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const tabProfiles = profiles.filter((p) => p.provider === activeTab)
  const activeId = activeAccountByProvider[activeTab]

  const handleOAuthLogin = useCallback(
    async (provider: AIProvider) => {
      setIsLoggingIn(true)
      try {
        const nextIndex = profiles.filter((p) => p.provider === provider).length + 1
        const accountId = `oauth-${provider}-${Date.now()}`
        const accountName = `${provider.toUpperCase()} #${nextIndex}`

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
            toast.success(`Đã kết nối tài khoản web an toàn: ${newProfile.name}`)
          }
        } else {
          // Mock preview
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
        toast.error(`Đăng nhập lỗi: ${err instanceof Error ? err.message : String(err)}`)
      } finally {
        setIsLoggingIn(false)
      }
    },
    [profiles, upsertProfile, setActiveAccount]
  )

  return (
    <div className="space-y-6 rounded-xl border border-border/60 bg-muted/20 p-5">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-emerald-500" />
            <h3 className="text-sm font-semibold text-foreground">
              Quản lý Đa Tài khoản & Auto-Failover (Kevin Studio)
            </h3>
            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-medium text-emerald-500">
              Isolated Web Partitions
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Mỗi tài khoản được bảo vệ trong một không gian lưu trữ riêng biệt, không bị đá session và tuân thủ giới hạn an toàn của nhà cung cấp.
          </p>
        </div>

        {/* Global Auto Failover Toggle */}
        <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-background/80 px-3 py-2">
          <div className="space-y-0.5">
            <Label className="text-xs font-medium flex items-center gap-1.5 cursor-pointer">
              <Zap className="size-3.5 text-amber-500" />
              <span>Tự động chuyển khi đầy Quota (429)</span>
            </Label>
            <p className="text-[10px] text-muted-foreground">
              Tự đổi sang tài khoản khả dụng tiếp theo và tiếp tục task
            </p>
          </div>
          <Switch
            checked={failoverConfig.enabled}
            onCheckedChange={(checked) => updateFailoverConfig({ enabled: checked })}
          />
        </div>
      </div>

      {/* Provider Selector Tabs */}
      <div className="flex gap-2 border-b border-border/40 pb-2">
        {(['gemini', 'chatgpt', 'claude'] as const).map((prov) => (
          <button
            key={prov}
            type="button"
            onClick={() => setActiveTab(prov)}
            className={cn(
              'px-3.5 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors',
              activeTab === prov
                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            {prov} ({profiles.filter((p) => p.provider === prov).length})
          </button>
        ))}
      </div>

      {/* Account List for Active Provider */}
      <div className="grid gap-2 sm:grid-cols-2">
        {tabProfiles.map((p) => {
          const isActive = activeId === p.id
          const isLimited = p.quotaStatus === 'limited'
          return (
            <div
              key={p.id}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg border transition-all text-xs',
                isActive
                  ? 'border-primary bg-primary/5 shadow-xs'
                  : 'border-border/50 bg-background/50 hover:bg-background'
              )}
            >
              <div className="min-w-0 pr-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground truncate">{p.name}</span>
                  {isActive ? (
                    <span className="rounded-full bg-primary/15 text-primary text-[10px] px-1.5 py-0.2 font-medium">
                      Đang dùng
                    </span>
                  ) : null}
                  {isLimited ? (
                    <span className="rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30 text-[10px] px-1.5 py-0.2 font-medium flex items-center gap-1">
                      <ShieldAlert className="size-3" />
                      Limited
                    </span>
                  ) : (
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                  )}
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground truncate">
                  {p.email || 'OAuth Web Session'}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {!isActive ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => setActiveAccount(activeTab, p.id)}
                    className="h-7 text-xs"
                  >
                    Chọn
                  </Button>
                ) : (
                  <div className="flex size-7 items-center justify-center text-primary">
                    <Check className="size-4" />
                  </div>
                )}
                {tabProfiles.length > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => removeProfile(p.id)}
                    className="size-7 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>

      {/* Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isLoggingIn}
          onClick={() => handleOAuthLogin(activeTab)}
          className="gap-2 text-xs"
        >
          {isLoggingIn ? (
            <Sparkles className="size-3.5 animate-spin" />
          ) : (
            <Plus className="size-3.5" />
          )}
          <span>Thêm tài khoản {activeTab.toUpperCase()} (OAuth Web Độc lập)</span>
        </Button>

        <div className="text-[11px] text-muted-foreground">
          Thời gian hồi phục Quota: <strong>{failoverConfig.cooldownMinutes} phút</strong> (tự động mở lại tài khoản khi hết hạn 429)
        </div>
      </div>
    </div>
  )
})
