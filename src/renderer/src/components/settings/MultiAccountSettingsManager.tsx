import { memo, useState } from 'react'
import {
  Check,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import type { AIProvider } from '../../../../shared/account-profile-types'
import { useAccountProfilesStore } from '@/store/slices/accounts/account-profiles-store'
import { AddAccountDialog } from './AddAccountDialog'

export const MultiAccountSettingsManager = memo(function MultiAccountSettingsManager(): React.JSX.Element {
  const profiles = useAccountProfilesStore((s) => s.profiles)
  const activeAccountByProvider = useAccountProfilesStore((s) => s.activeAccountByProvider)
  const failoverConfig = useAccountProfilesStore((s) => s.failoverConfig)
  const setActiveAccount = useAccountProfilesStore((s) => s.setActiveAccount)
  const removeProfile = useAccountProfilesStore((s) => s.removeProfile)
  const updateFailoverConfig = useAccountProfilesStore((s) => s.updateFailoverConfig)

  const [activeTab, setActiveTab] = useState<AIProvider>('gemini')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const tabProfiles = profiles.filter((p) => p.provider === activeTab)
  const activeId = activeAccountByProvider[activeTab]

  return (
    <div className="space-y-5 rounded-xl border border-border/60 bg-muted/20 p-5">
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
            Mỗi tài khoản lưu trữ độc lập qua Electron Partitions, tự động chuyển tài khoản khi hết quota 429.
          </p>
        </div>

        {/* Action Controls Header */}
        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            size="sm"
            onClick={() => setIsAddDialogOpen(true)}
            className="gap-1.5 text-xs font-semibold shadow-xs"
          >
            <Plus className="size-4" />
            <span>+ Thêm tài khoản</span>
          </Button>

          <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-background/80 px-3 py-1.5">
            <Label className="text-xs font-medium flex items-center gap-1.5 cursor-pointer">
              <Zap className="size-3.5 text-amber-500" />
              <span>Auto-Failover</span>
            </Label>
            <Switch
              checked={failoverConfig.enabled}
              onCheckedChange={(checked) => updateFailoverConfig({ enabled: checked })}
            />
          </div>
        </div>
      </div>

      {/* Zero-Risk ToS Protection Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-500/25 bg-emerald-500/5 px-3 py-2 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
          <span className="font-semibold text-foreground">
            Bảo vệ ToS & Hạn ngạch (Zero-Risk):
          </span>
          <span className="text-muted-foreground text-[11px]">
            Tự động chuyển chéo sang hãng AI khác khi gặp 429 để triệt tiêu nguy cơ trùng lặp hạn ngạch.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <span className="text-[11px] font-medium text-foreground">
              Chuyển đổi chéo hãng AI:
            </span>
            <Switch
              checked={failoverConfig.crossProviderFallback ?? true}
              onCheckedChange={(checked) =>
                updateFailoverConfig({ crossProviderFallback: checked })
              }
            />
          </label>
        </div>
      </div>

      {/* Provider Selector Tabs */}
      <div className="flex items-center justify-between border-b border-border/40 pb-2">
        <div className="flex gap-1.5">
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

        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={() => setIsAddDialogOpen(true)}
          className="gap-1 text-xs text-primary border-primary/30 hover:bg-primary/10"
        >
          <Plus className="size-3" />
          <span>Thêm {activeTab.toUpperCase()}</span>
        </Button>
      </div>

      {/* Account List Grid */}
      <div className="grid gap-2.5 sm:grid-cols-2">
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

        {/* Add Account Card Button in Grid */}
        <button
          type="button"
          onClick={() => setIsAddDialogOpen(true)}
          className="flex min-h-18 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border/80 p-3 text-center text-xs text-muted-foreground transition-colors hover:border-primary/60 hover:bg-primary/5 hover:text-primary"
        >
          <div className="flex size-6 items-center justify-center rounded-full bg-muted/60 text-muted-foreground group-hover:text-primary">
            <Plus className="size-3.5" />
          </div>
          <span className="font-medium">+ Thêm tài khoản {activeTab.toUpperCase()} mới</span>
        </button>
      </div>

      {/* Safety & Compliance Checklist */}
      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs space-y-1.5 text-muted-foreground">
        <div className="font-semibold text-foreground flex items-center gap-1.5">
          <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
          <span>Cam kết An toàn & Tuân thủ chính sách Gemini / ChatGPT:</span>
        </div>
        <div className="grid gap-1 sm:grid-cols-2 text-[11px]">
          <div>• <strong>Isolated Storage:</strong> Phân vùng riêng, không đá cookie giữa các tài khoản.</div>
          <div>• <strong>Whitelisted HTTPS:</strong> Chỉ mở đúng domain chính thức của Google/OpenAI.</div>
          <div>• <strong>Tôn trọng Rate Limit:</strong> Nghỉ {failoverConfig.cooldownMinutes} phút khi đầy Quota 429.</div>
          <div>• <strong>Zero Credential Leak:</strong> Không lưu password thô, dùng OAuth chuẩn.</div>
        </div>
      </div>

      {/* Dialog for adding account */}
      <AddAccountDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        initialProvider={activeTab}
      />
    </div>
  )
})
