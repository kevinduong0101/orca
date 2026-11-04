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
  gemini: null,
  chatgpt: null,
  claude: null,
  custom: null
}

export const DEFAULT_PROFILES: AccountProfile[] = []

export function loadStoredProfiles(): AccountProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AccountProfile[]
      if (Array.isArray(parsed)) {
        // Filter out any stale mock profiles that were previously seeded
        return parsed.filter(
          (p) =>
            !p.id.startsWith('default-') &&
            !p.id.startsWith('mock-') &&
            !p.email?.includes('kevin.gemini') &&
            !p.email?.includes('kevin.chatgpt') &&
            !p.email?.includes('kevin.claude')
        )
      }
    }
  } catch {
    // Ignore parse error and fallback to empty
  }
  return []
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
