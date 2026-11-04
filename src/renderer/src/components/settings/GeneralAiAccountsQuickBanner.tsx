import { memo, useState } from 'react'
import { ExternalLink, Plus, Users, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAccountProfilesStore } from '@/store/slices/accounts/account-profiles-store'
import { useAppStore } from '@/store'
import { AddAccountDialog } from './AddAccountDialog'

export const GeneralAiAccountsQuickBanner = memo(
  function GeneralAiAccountsQuickBanner(): React.JSX.Element {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const profiles = useAccountProfilesStore((s) => s.profiles)
    const failoverConfig = useAccountProfilesStore((s) => s.failoverConfig)
    const openSettingsTarget = useAppStore((s) => s.openSettingsTarget)

    const geminiCount = profiles.filter((p) => p.provider === 'gemini').length
    const chatgptCount = profiles.filter((p) => p.provider === 'chatgpt').length
    const claudeCount = profiles.filter((p) => p.provider === 'claude').length

    return (
      <div className="rounded-xl border border-primary/25 bg-gradient-to-r from-primary/10 via-primary/5 to-background p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/20 text-primary">
              <Users className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Đa Tài khoản AI & Auto-Failover (Kevin Studio)
                </h3>
                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-medium text-emerald-500">
                  Sẵn sàng
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Đăng nhập nhiều tài khoản Gemini, ChatGPT, Claude với Web OAuth biệt lập và tự
                động chuyển đổi khi chạm quota 429.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => setIsAddDialogOpen(true)}
              className="gap-1.5 text-xs font-semibold shadow-xs"
            >
              <Plus className="size-4" />
              <span>+ Thêm tài khoản</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => openSettingsTarget({ pane: 'accounts', repoId: null })}
              className="gap-1.5 text-xs font-medium"
            >
              <span>Quản lý chi tiết</span>
              <ExternalLink className="size-3.5 text-muted-foreground" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/40 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Tài khoản hiện có:</span>
          <span className="px-2 py-0.5 rounded-md bg-muted/60 text-foreground font-mono text-[11px]">
            Gemini: {geminiCount}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-muted/60 text-foreground font-mono text-[11px]">
            ChatGPT: {chatgptCount}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-muted/60 text-foreground font-mono text-[11px]">
            Claude: {claudeCount}
          </span>

          <span className="ml-auto flex items-center gap-1.5 text-[11px]">
            <Zap className="size-3 text-amber-500" />
            <span>Auto-Failover: </span>
            <strong
              className={failoverConfig.enabled ? 'text-emerald-500' : 'text-muted-foreground'}
            >
              {failoverConfig.enabled ? 'BẬT (Tự động 100%)' : 'TẮT'}
            </strong>
          </span>
        </div>

        <AddAccountDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          defaultProvider="gemini"
        />
      </div>
    )
  }
)
