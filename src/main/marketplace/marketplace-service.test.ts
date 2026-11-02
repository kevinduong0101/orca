import { beforeEach, describe, expect, it } from 'vitest'
import { MarketplaceService } from './marketplace-service'

describe('MarketplaceService', () => {
  let service: MarketplaceService

  beforeEach(() => {
    service = new MarketplaceService()
  })

  it('initializes with curated skills and MCP servers', () => {
    const all = service.getItems()
    expect(all.length).toBeGreaterThanOrEqual(6)

    const skills = service.getItems({ type: 'skill' })
    expect(skills.every((s) => s.type === 'skill')).toBe(true)
    expect(skills.length).toBeGreaterThanOrEqual(3)

    const mcpServers = service.getItems({ type: 'mcp_server' })
    expect(mcpServers.every((m) => m.type === 'mcp_server')).toBe(true)
    expect(mcpServers.length).toBeGreaterThanOrEqual(3)
  })

  it('filters items by search term and category', () => {
    const testItems = service.getItems({ category: 'testing' })
    expect(testItems.length).toBeGreaterThanOrEqual(2)

    const ponytailSearch = service.getItems({ search: 'ponytail' })
    expect(ponytailSearch).toHaveLength(1)
    expect(ponytailSearch[0].id).toBe('skill-ponytail')

    const postgresSearch = service.getItems({ search: 'postgres' })
    expect(postgresSearch).toHaveLength(1)
    expect(postgresSearch[0].id).toBe('mcp-postgres')
  })

  it('handles installation, toggle, and uninstallation lifecycle', () => {
    const installRes = service.installItem('skill-ponytail')
    expect(installRes.success).toBe(true)
    expect(installRes.item.installed).toBe(true)
    expect(installRes.item.enabled).toBe(true)

    const toggleOff = service.toggleItem('skill-ponytail', false)
    expect(toggleOff.success).toBe(true)
    expect(toggleOff.item.enabled).toBe(false)

    const toggleOn = service.toggleItem('skill-ponytail', true)
    expect(toggleOn.success).toBe(true)
    expect(toggleOn.item.enabled).toBe(true)

    const uninstallRes = service.uninstallItem('skill-ponytail')
    expect(uninstallRes.success).toBe(true)
    expect(uninstallRes.item.installed).toBe(false)
    expect(uninstallRes.item.enabled).toBe(false)
  })

  it('fails to toggle uninstalled items', () => {
    const res = service.toggleItem('mcp-github')
    expect(res.success).toBe(false)
    expect(res.message).toContain('Phải cài đặt tiện ích trước khi bật/tắt')
  })

  it('registers custom item and syncs with local environment', () => {
    service.registerCustomItem({
      id: 'custom-linear-mcp',
      name: 'Custom Linear MCP',
      type: 'mcp_server',
      category: 'workflow',
      author: 'team-linear',
      description: 'Sync with Linear boards',
      tags: ['linear', 'issues']
    })

    expect(service.getItem('custom-linear-mcp')).toBeDefined()

    service.syncWithLocalEnvironment(['skill-code-review'], ['custom-linear-mcp'])
    expect(service.getItem('skill-code-review')?.installed).toBe(true)
    expect(service.getItem('custom-linear-mcp')?.installed).toBe(true)
  })
})
