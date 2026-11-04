import { useState } from 'react'
import { Plus, ShieldCheck, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { AIProvider, AccountProfile } from '../../../../shared/account-profile-types'
import { useAccountProfilesStore } from '@/store/slices/accounts/account-profiles-store'

export type AddAccountDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialProvider?: AIProvider
}

const PROVIDER_OPTIONS: { id: AIProvider; label: string; desc: string }[] = [
  { id: 'gemini', label: 'Google Gemini', desc: 'Đăng nhập bằng tài khoản Google' },
  { id: 'chatgpt', label: 'OpenAI ChatGPT', desc: 'Đăng nhập bằng tài khoản OpenAI' },
  { id: 'claude', label: 'Anthropic Claude', desc: 'Đăng nhập bằng tài khoản Claude' }
]

export function AddAccountDialog({
  open,
  onOpenChange,
  initialProvider = 'gemini'
}: AddAccountDialogProps): React.JSX.Element {
  const [provider, setProvider] = useState<AIProvider>(initialProvider)
  const [accountName, setAccountName] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const profiles = useAccountProfilesStore((s) => s.profiles)
  const upsertProfile = useAccountProfilesStore((s) => s.upsertProfile)
  const setActiveAccount = useAccountProfilesStore((s) => s.setActiveAccount)

  const handleStartOAuth = async (): Promise<void> => {
    setIsLoggingIn(true)
    try {
      const providerCount = profiles.filter((p) => p.provider === provider).length
      const resolvedName =
        accountName.trim() || `${provider.toUpperCase()} Tài khoản #${providerCount + 1}`
      const accountId = `oauth-${provider}-${Date.now()}`

      const api = window.electron?.multiAccountOAuth
      if (api?.openOAuthLogin) {
        const res = await api.openOAuthLogin({
          provider,
          accountId,
          accountName: resolvedName
        })
        if (res.success) {
          const newProfile: AccountProfile = {
            id: res.accountId || accountId,
            name: res.accountName || resolvedName,
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
          toast.success(`Đã thêm thành công tài khoản: ${newProfile.name}`)
          onOpenChange(false)
          setAccountName('')
        }
      } else {
        // Mock fallback for browser / development preview
        const newProfile: AccountProfile = {
          id: accountId,
          name: resolvedName,
          email: `kevin.${provider}${providerCount + 1}@gmail.com`,
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
        onOpenChange(false)
        setAccountName('')
      }
    } catch (err) {
      toast.error(`Đăng nhập thất bại: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsLoggingIn(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Plus className="size-4 text-primary" />
            <span>Thêm tài khoản AI mới</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Đăng nhập qua cửa sổ Web OAuth độc lập với phân vùng bảo mật riêng.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Provider Choice */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">1. Chọn nhà cung cấp AI</Label>
            <div className="grid grid-cols-3 gap-2">
              {PROVIDER_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setProvider(opt.id)}
                  className={cn(
                    'p-2.5 rounded-lg border text-left transition-all',
                    provider === opt.id
                      ? 'border-primary bg-primary/10 shadow-xs ring-1 ring-primary/30'
                      : 'border-border/60 hover:bg-muted/40'
                  )}
                >
                  <div className="font-semibold text-xs text-foreground">{opt.label}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                    {opt.id.toUpperCase()}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Account Label Input */}
          <div className="space-y-1.5">
            <Label htmlFor="account-name-input" className="text-xs font-medium">
              2. Đặt tên gợi nhớ cho tài khoản (Tùy chọn)
            </Label>
            <Input
              id="account-name-input"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder={`Ví dụ: ${provider === 'gemini' ? 'Gemini Cá nhân / Gemini Cty' : 'ChatGPT Plus 1'}`}
              className="h-8 text-xs"
            />
          </div>

          {/* Security Note */}
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2.5 text-[11px] text-muted-foreground flex items-start gap-2">
            <ShieldCheck className="size-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <strong>Bảo mật:</strong> Cửa sổ đăng nhập được cô lập partition, không lưu password thô và không làm mất session của tài khoản khác.
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isLoggingIn}
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Hủy
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isLoggingIn}
            onClick={handleStartOAuth}
            className="gap-1.5 text-xs font-medium"
          >
            {isLoggingIn ? (
              <Sparkles className="size-3.5 animate-spin" />
            ) : (
              <Plus className="size-3.5" />
            )}
            <span>Đăng nhập OAuth Web</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
