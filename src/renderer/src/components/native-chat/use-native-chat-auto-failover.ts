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
        toast.info(
          `Quota giới hạn! Kevin Studio đã tự động chuyển sang: ${result.nextAccount.name} và tiếp tục thực hiện task.`,
          { duration: 5000 }
        )
      }

      // Small delay to allow session state to propagate, then trigger continuation
      const timer = setTimeout(() => {
        continueUsageLimit()
      }, 600)

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
    performAutoFailover
  ])
}
