import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useAccountProfilesStore } from '@/store/slices/accounts/account-profiles-store'
import { resolveProviderFromAgent } from './ChatAccountSwitcher'

export type UseNativeChatAutoFailoverParams = {
  agent?: string
  usageLimitTurnItemId: string | null
  continueUsageLimit: () => void
}

export function useNativeChatAutoFailover({
  agent,
  usageLimitTurnItemId,
  continueUsageLimit
}: UseNativeChatAutoFailoverParams): void {
  const handledTurnRef = useRef<string | null>(null)
  const failoverConfig = useAccountProfilesStore((s) => s.failoverConfig)
  const performAutoFailover = useAccountProfilesStore((s) => s.performAutoFailover)

  useEffect(() => {
    if (!usageLimitTurnItemId) {
      handledTurnRef.current = null
      return
    }

    if (handledTurnRef.current === usageLimitTurnItemId) {
      return
    }

    if (!failoverConfig.enabled || !failoverConfig.autoRetryOnFailover) {
      return
    }

    const provider = resolveProviderFromAgent(agent)
    const result = performAutoFailover(provider)

    if (result.switched && result.nextAccount) {
      handledTurnRef.current = usageLimitTurnItemId

      if (failoverConfig.notifyOnFailover) {
        if (result.isCrossProvider) {
          toast.info(
            `Bảo vệ an toàn ToS: Đã chuyển sang ${result.nextAccount.provider.toUpperCase()} (${result.nextAccount.name}) để tiếp tục task mà không bị trùng lặp hạn ngạch.`,
            { duration: 6000 }
          )
        } else {
          toast.info(
            `Quota giới hạn! Đã chuyển sang tài khoản an toàn: ${result.nextAccount.name} và tiếp tục thực hiện task.`,
            { duration: 5000 }
          )
        }
      }

      // Safety delay to allow session state to propagate and avoid rapid burst
      const delayMs = (failoverConfig.safetyDelaySeconds ?? 3) * 1000
      const timer = setTimeout(() => {
        continueUsageLimit()
      }, Math.max(delayMs, 1000))

      return () => {
        clearTimeout(timer)
      }
    }
  }, [
    agent,
    usageLimitTurnItemId,
    continueUsageLimit,
    failoverConfig.enabled,
    failoverConfig.autoRetryOnFailover,
    failoverConfig.notifyOnFailover,
    failoverConfig.safetyDelaySeconds,
    performAutoFailover
  ])
}
