import { describe, expect, it } from 'vitest'
import {
  groupSectionsByModernCategory,
  MODERN_CATEGORIES,
  type NavGroup
} from './settings-sidebar-groups'
import { Bot, UserCog, Palette, Terminal } from 'lucide-react'

describe('settings-sidebar-groups', () => {
  it('groups sections into modern categories', () => {
    const rawGroups: NavGroup[] = [
      {
        id: 'capabilities',
        title: 'Capabilities',
        sections: [
          { id: 'accounts', title: 'AI Accounts', icon: UserCog },
          { id: 'agents', title: 'Agents', icon: Bot }
        ]
      },
      {
        id: 'interface',
        title: 'Interface',
        sections: [{ id: 'appearance', title: 'Appearance', icon: Palette }]
      },
      {
        id: 'setup',
        title: 'Setup',
        sections: [{ id: 'terminal', title: 'Terminal', icon: Terminal }]
      }
    ]

    const grouped = groupSectionsByModernCategory(rawGroups)

    expect(grouped.length).toBeGreaterThan(0)
    const aiGroup = grouped.find((g) => g.category.id === 'ai')
    expect(aiGroup).toBeDefined()
    expect(aiGroup?.sections.map((s) => s.id)).toContain('accounts')
    expect(aiGroup?.sections.map((s) => s.id)).toContain('agents')

    const interfaceGroup = grouped.find((g) => g.category.id === 'interface')
    expect(interfaceGroup).toBeDefined()
    expect(interfaceGroup?.sections.map((s) => s.id)).toContain('appearance')

    const workspaceGroup = grouped.find((g) => g.category.id === 'workspace')
    expect(workspaceGroup).toBeDefined()
    expect(workspaceGroup?.sections.map((s) => s.id)).toContain('terminal')
  })

  it('contains all 4 predefined modern categories', () => {
    expect(MODERN_CATEGORIES.map((c) => c.id)).toEqual(['ai', 'interface', 'workspace', 'system'])
  })
})
