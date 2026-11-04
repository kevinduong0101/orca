import type {
  AccountFailoverConfig,
  AccountProfile,
  AIProvider
} from '../../../../../shared/account-profile-types'

export const STORAGE_KEY = 'kevin-studio:account-profiles'
export const CONFIG_STORAGE_KEY = 'kevin-studio:account-failover-config'
export const ACTIVE_ACCOUNTS_KEY = 'kevin-studio:active-account-by-provider'

export const DEFAULT_FAILOVER_CONFIG: AccountFailoverConfig = {
  enabled: true,
  strategy: 'round-robin',
  autoRetryOnFailover: true,
  cooldownMinutes: 15,
  notifyOnFailover: true,
  crossProviderFallback: true,
  safetyDelaySeconds: 3
}

export const DEFAULT_ACTIVE_ACCOUNTS: Record<AIProvider, string | null> = {
  gemini: 'default-gemini-1',
  chatgpt: 'default-chatgpt-1',
  claude: 'default-claude-1',
  custom: null
}

export const DEFAULT_PROFILES: AccountProfile[] = [
  {
    id: 'default-gemini-1',
    name: 'Gemini Primary (A)',
    email: 'kevin.gemini.primary@gmail.com',
    avatarUrl: null,
    provider: 'gemini',
    partitionId: 'persist:account_gemini_primary',
    authKind: 'oauth-web',
    quotaStatus: 'ready',
    quotaResetAt: null,
    rateLimitCount: 0,
    lastUsedAt: Date.now(),
    createdAt: Date.now()
  },
  {
    id: 'default-gemini-2',
    name: 'Gemini Backup (B)',
    email: 'kevin.gemini.backup@gmail.com',
    avatarUrl: null,
    provider: 'gemini',
    partitionId: 'persist:account_gemini_backup',
    authKind: 'oauth-web',
    quotaStatus: 'ready',
    quotaResetAt: null,
    rateLimitCount: 0,
    lastUsedAt: Date.now() - 3600000,
    createdAt: Date.now() - 3600000
  },
  {
    id: 'default-chatgpt-1',
    name: 'ChatGPT Plus (A)',
    email: 'kevin.chatgpt.1@openai.com',
    avatarUrl: null,
    provider: 'chatgpt',
    partitionId: 'persist:account_chatgpt_primary',
    authKind: 'oauth-web',
    quotaStatus: 'ready',
    quotaResetAt: null,
    rateLimitCount: 0,
    lastUsedAt: Date.now(),
    createdAt: Date.now()
  },
  {
    id: 'default-chatgpt-2',
    name: 'ChatGPT Backup (B)',
    email: 'kevin.chatgpt.2@openai.com',
    avatarUrl: null,
    provider: 'chatgpt',
    partitionId: 'persist:account_chatgpt_backup',
    authKind: 'oauth-web',
    quotaStatus: 'ready',
    quotaResetAt: null,
    rateLimitCount: 0,
    lastUsedAt: Date.now() - 7200000,
    createdAt: Date.now() - 7200000
  },
  {
    id: 'default-claude-1',
    name: 'Claude Pro (A)',
    email: 'kevin.claude.1@anthropic.com',
    avatarUrl: null,
    provider: 'claude',
    partitionId: 'persist:account_claude_primary',
    authKind: 'oauth-web',
    quotaStatus: 'ready',
    quotaResetAt: null,
    rateLimitCount: 0,
    lastUsedAt: Date.now(),
    createdAt: Date.now()
  }
]

export function loadStoredProfiles(): AccountProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AccountProfile[]
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch {
    // Ignore parse error and fallback to defaults
  }
  return DEFAULT_PROFILES
}

export function loadStoredActive(): Record<AIProvider, string | null> {
  try {
    const raw = localStorage.getItem(ACTIVE_ACCOUNTS_KEY)
    if (raw) {
      return { ...DEFAULT_ACTIVE_ACCOUNTS, ...JSON.parse(raw) }
    }
  } catch {
    // Ignore parse error
  }
  return DEFAULT_ACTIVE_ACCOUNTS
}

export function loadStoredConfig(): AccountFailoverConfig {
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY)
    if (raw) {
      return { ...DEFAULT_FAILOVER_CONFIG, ...JSON.parse(raw) }
    }
  } catch {
    // Ignore parse error
  }
  return DEFAULT_FAILOVER_CONFIG
}

export function persistProfiles(profiles: AccountProfile[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles))
  } catch {
    // Ignore error
  }
}

export function persistActive(active: Record<AIProvider, string | null>): void {
  try {
    localStorage.setItem(ACTIVE_ACCOUNTS_KEY, JSON.stringify(active))
  } catch {
    // Ignore error
  }
}

export function persistConfig(config: AccountFailoverConfig): void {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config))
  } catch {
    // Ignore error
  }
}
