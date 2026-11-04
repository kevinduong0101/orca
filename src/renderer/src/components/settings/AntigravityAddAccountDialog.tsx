import { memo } from 'react'
import { Check, Globe, LogIn, Save, Sparkles, Terminal } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AgentIcon } from '@/lib/agent-catalog'
import type { AntigravityAccountState } from '../../../../shared/antigravity-account-types'

export type AntigravityAddAccountDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  state: AntigravityAccountState | null
  busy: boolean
  signInActionLabel: string
  signInDisabled: boolean
  onStartBrowserSignIn: () => void
  onSaveCurrentAccount: () => void
}

export const AntigravityAddAccountDialog = memo(function AntigravityAddAccountDialog({
  open,
  onOpenChange,
  state,
  busy,
  signInActionLabel,
  signInDisabled,
  onStartBrowserSignIn,
  onSaveCurrentAccount
}: AntigravityAddAccountDialogProps): React.JSX.Element {
  const currentEmail = state?.currentAccount?.email ?? null
  const isAlreadySaved =
    currentEmail && state?.accounts.some((acc) => acc.email === currentEmail)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AgentIcon agent="antigravity" size={20} />
            <DialogTitle className="text-base font-semibold">
              Thêm tài khoản Antigravity
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Chọn phương thức để kết nối hoặc lưu tài khoản Google / Antigravity mới vào ứng dụng.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Method 1: Browser OAuth Sign-In */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="size-4 text-primary" />
                <span className="text-xs font-semibold text-foreground">
                  1. Đăng nhập Google qua trình duyệt (Khuyến nghị)
                </span>
              </div>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                Tự động
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Mở phiên duyệt web để xác thực trực tiếp với Google. Thích hợp cho phiên chat và agent
              Antigravity mà không cần dùng terminal.
            </p>
            <Button
              type="button"
              size="sm"
              disabled={signInDisabled || busy}
              onClick={() => {
                onStartBrowserSignIn()
                onOpenChange(false)
              }}
              className="w-full gap-2 text-xs font-medium"
            >
              <LogIn className="size-3.5" />
              <span>{signInActionLabel || 'Bắt đầu đăng nhập Google'}</span>
            </Button>
          </div>

          {/* Method 2: Save Current Native Account */}
          <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="size-4 text-foreground/80" />
                <span className="text-xs font-semibold text-foreground">
                  2. Lưu tài khoản Native agy CLI
                </span>
              </div>
              {currentEmail ? (
                <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <Check className="size-3" />
                  Đã phát hiện
                </span>
              ) : (
                <span className="text-[10px] text-muted-foreground">Chưa đăng nhập CLI</span>
              )}
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {currentEmail ? (
                <>
                  Tài khoản đang đăng nhập trong agy CLI:{' '}
                  <strong className="text-foreground font-mono">{currentEmail}</strong>.
                  {isAlreadySaved ? ' (Tài khoản này đã có trong danh sách đã lưu)' : ''}
                </>
              ) : (
                'Để đăng nhập tài khoản khác qua CLI, mở Terminal và gõ "agy /logout" rồi đăng nhập tài khoản mới, sau đó quay lại đây lưu.'
              )}
            </p>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy || !state?.currentAccount || Boolean(isAlreadySaved)}
              onClick={() => {
                onSaveCurrentAccount()
                onOpenChange(false)
              }}
              className="w-full gap-2 text-xs font-medium"
            >
              {isAlreadySaved ? (
                <>
                  <Check className="size-3.5 text-emerald-500" />
                  <span>Tài khoản hiện tại đã được lưu</span>
                </>
              ) : (
                <>
                  <Save className="size-3.5" />
                  <span>Lưu tài khoản agy hiện tại ({currentEmail ?? 'Chưa có'})</span>
                </>
              )}
            </Button>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between pt-1">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            <span>Kevin Studio Multi-Account Management</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})
