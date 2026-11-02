import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CrossAgentBus } from './cross-agent-bus'

describe('CrossAgentBus', () => {
  let bus: CrossAgentBus

  beforeEach(() => {
    bus = new CrossAgentBus()
  })

  it('publishes an item and notifies subscribers', () => {
    const listener = vi.fn()
    const unsubscribe = bus.subscribe(listener)

    const item = bus.publish({
      sourceAgentId: 'agent-backend',
      sourceWorktreeId: 'wt-auth',
      category: 'api_contract',
      severity: 'warning',
      title: 'Auth Route Updated',
      summary: 'POST /auth/login now requires deviceId header',
      impactedFiles: ['src/api/auth.ts']
    })

    expect(item.id).toMatch(/^k-\d+-[a-f0-9]+$/)
    expect(item.title).toBe('Auth Route Updated')
    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledWith(item)

    unsubscribe()
    bus.publish({
      sourceAgentId: 'agent-backend',
      category: 'general_insight',
      title: 'Another note',
      summary: 'Some detail'
    })

    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('filters items by category, severity, agent ID, and filePattern', () => {
    bus.publish({
      sourceAgentId: 'agent-backend',
      category: 'schema_change',
      severity: 'critical',
      title: 'User table change',
      summary: 'Added uuid column',
      impactedFiles: ['prisma/schema.prisma']
    })

    bus.publish({
      sourceAgentId: 'agent-frontend',
      category: 'bug_discovery',
      severity: 'info',
      title: 'CSS flex overflow',
      summary: 'Fixed in dialog modal',
      impactedFiles: ['src/components/Modal.tsx']
    })

    const schemaItems = bus.query({ category: 'schema_change' })
    expect(schemaItems).toHaveLength(1)
    expect(schemaItems[0].title).toBe('User table change')

    const withoutFrontend = bus.query({ excludeAgentId: 'agent-frontend' })
    expect(withoutFrontend).toHaveLength(1)
    expect(withoutFrontend[0].sourceAgentId).toBe('agent-backend')

    const prismaFiles = bus.query({ filePattern: 'prisma' })
    expect(prismaFiles).toHaveLength(1)
    expect(prismaFiles[0].title).toBe('User table change')
  })

  it('handles TTL and item expiration', async () => {
    bus.publish({
      sourceAgentId: 'agent-worker',
      category: 'general_insight',
      title: 'Transient build lock',
      summary: 'Lock will release shortly',
      ttlMs: 20
    })

    bus.publish({
      sourceAgentId: 'agent-worker',
      category: 'general_insight',
      title: 'Permanent note',
      summary: 'Important convention'
    })

    expect(bus.query()).toHaveLength(2)

    await new Promise((resolve) => setTimeout(resolve, 30))

    expect(bus.query()).toHaveLength(1)
    expect(bus.query()[0].title).toBe('Permanent note')

    const clearedCount = bus.clearExpired()
    expect(clearedCount).toBe(1)
    expect(bus.getAll()).toHaveLength(1)
  })

  it('formats prompt context injection cleanly and excludes target agent', () => {
    bus.publish({
      sourceAgentId: 'agent-db',
      category: 'schema_change',
      title: 'Accounts Schema',
      summary: 'Migrated to bigint IDs',
      impactedFiles: ['db/schema.sql']
    })

    bus.publish({
      sourceAgentId: 'agent-ui',
      category: 'general_insight',
      title: 'Tailwind v4 upgrade',
      summary: 'Use new class tokens',
      impactedFiles: []
    })

    const contextForDbAgent = bus.formatForPromptContext('agent-db')
    expect(contextForDbAgent).toContain('Tailwind v4 upgrade')
    expect(contextForDbAgent).not.toContain('Accounts Schema')

    const contextForUiAgent = bus.formatForPromptContext('agent-ui')
    expect(contextForUiAgent).toContain('Accounts Schema')
    expect(contextForUiAgent).toContain('[Schema]')
    expect(contextForUiAgent).not.toContain('Tailwind v4 upgrade')

    const emptyContext = bus.formatForPromptContext('agent-db', {
      sinceTimestamp: Date.now() + 10000
    })
    expect(emptyContext).toBe('')
  })
})
