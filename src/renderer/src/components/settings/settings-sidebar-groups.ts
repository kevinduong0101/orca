import type { ComponentType } from 'react'
import {
  FolderGit2,
  Palette,
  ShieldCheck,
  Sparkles
} from 'lucide-react'
import type { SettingsNavIcon, SettingsNavInstallStatus } from '@/lib/settings-navigation-types'

export type NavSection = {
  id: string
  title: string
  icon: SettingsNavIcon
  badge?: string
  installStatus?: SettingsNavInstallStatus
}

export type NavGroup = {
  id: string
  title: string
  sections: NavSection[]
}

export type ModernGroupCategory = {
  id: string
  title: string
  subtitle: string
  icon: ComponentType<{ className?: string }>
}

export const MODERN_CATEGORIES: ModernGroupCategory[] = [
  {
    id: 'ai',
    title: 'Trí tuệ nhân tạo',
    subtitle: 'AI & Multi-Account',
    icon: Sparkles
  },
  {
    id: 'interface',
    title: 'Giao diện & Trải nghiệm',
    subtitle: 'Interface & UX',
    icon: Palette
  },
  {
    id: 'workspace',
    title: 'Không gian làm việc',
    subtitle: 'Workspaces & Tools',
    icon: FolderGit2
  },
  {
    id: 'system',
    title: 'Hệ thống & Bảo mật',
    subtitle: 'System & Security',
    icon: ShieldCheck
  }
]

const SECTION_TO_CATEGORY: Record<string, string> = {
  accounts: 'ai',
  agents: 'ai',
  orchestration: 'ai',
  'computer-use': 'ai',
  voice: 'ai',
  linear: 'ai',

  appearance: 'interface',
  chat: 'interface',
  shortcuts: 'interface',
  input: 'interface',
  notifications: 'interface',
  stats: 'interface',
  'browser-use': 'interface',
  'floating-workspace': 'interface',
  'quick-commands': 'interface',

  general: 'workspace',
  terminal: 'workspace',
  git: 'workspace',
  integrations: 'workspace',
  tasks: 'workspace',
  'session-history': 'workspace',
  'share-skills': 'workspace',
  artifacts: 'workspace',
  mobile: 'workspace',
  'mobile-emulator': 'workspace',

  ssh: 'system',
  servers: 'system',
  'wsl-hosts': 'system',
  'developer-permissions': 'system',
  privacy: 'system',
  plugins: 'system',
  advanced: 'system',
  experimental: 'system',
  devtools: 'system',
  'ephemeral-vms': 'system',
  automations: 'system'
}

export function groupSectionsByModernCategory(
  rawGroups: NavGroup[]
): { category: ModernGroupCategory; sections: NavSection[] }[] {
  const allSections = rawGroups.flatMap((g) => g.sections)
  const uniqueSections = new Map<string, NavSection>()

  for (const section of allSections) {
    if (section.id !== 'setup-guide' && !uniqueSections.has(section.id)) {
      uniqueSections.set(section.id, section)
    }
  }

  return MODERN_CATEGORIES.map((cat) => {
    const sections = Array.from(uniqueSections.values()).filter((sec) => {
      const targetCat = SECTION_TO_CATEGORY[sec.id] || 'system'
      return targetCat === cat.id
    })
    return {
      category: cat,
      sections
    }
  }).filter((group) => group.sections.length > 0)
}
