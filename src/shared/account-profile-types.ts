export type AIProvider = 'gemini' | 'chatgpt' | 'claude' | 'custom'

export type AccountQuotaStatus = 'ready' | 'limited' | 'error'

export type AccountAuthKind = 'oauth-web' | 'token' | 'api-key'

export type AccountProfile = {
  id: string
  name: string
  email: string | null
  avatarUrl: string | null
  provider: AIProvider
  partitionId: string
  authKind: AccountAuthKind
  quotaStatus: AccountQuotaStatus
  quotaResetAt: number | null
  rateLimitCount: number
  lastUsedAt: number
  createdAt: number
  metadata?: Record<string, unknown>
}

export type AccountFailoverStrategy = 'round-robin' | 'priority' | 'least-used'

export type AccountFailoverConfig = {
  enabled: boolean
  strategy: AccountFailoverStrategy
  autoRetryOnFailover: boolean
  cooldownMinutes: number
  notifyOnFailover: boolean
  crossProviderFallback?: boolean
  safetyDelaySeconds?: number
}

export type AccountFailoverResult = {
  switched: boolean
  previousAccount: AccountProfile | null
  nextAccount: AccountProfile | null
  isCrossProvider?: boolean
}

export type OAuthLoginRequest = {
  provider: AIProvider
  accountId?: string
  accountName?: string
  initialUrl?: string
}

export type OAuthLoginResult = {
  success: boolean
  accountId?: string
  email?: string | null
  accountName?: string
  error?: string
}
