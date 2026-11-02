import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mkdtemp, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { CustomProviderManager } from './custom-provider-manager'
import type { CustomProviderConfig } from '../../shared/custom-provider-types'

describe('CustomProviderManager', () => {
  let tempDir: string
  let manager: CustomProviderManager

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'orca-providers-test-'))
    manager = new CustomProviderManager(tempDir)
  })

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true })
    vi.restoreAllMocks()
  })

  const sampleProvider: CustomProviderConfig = {
    id: 'deepseek-test',
    name: 'DeepSeek Test',
    protocol: 'openai',
    baseUrl: 'https://api.deepseek.com/v1',
    apiKey: 'sk-test-key-12345',
    defaultModel: 'deepseek-chat',
    enabled: true,
    models: [
      {
        id: 'deepseek-chat',
        displayName: 'DeepSeek V3',
        contextWindow: 64000
      }
    ]
  }

  it('returns empty array when no providers exist', async () => {
    const list = await manager.loadProviders()
    expect(list).toEqual([])
  })

  it('upserts and retrieves custom providers', async () => {
    await manager.upsertProvider(sampleProvider)
    const list = await manager.loadProviders()
    expect(list.length).toBe(1)
    expect(list[0]?.id).toBe('deepseek-test')
    expect(list[0]?.baseUrl).toBe('https://api.deepseek.com/v1')

    // Update existing provider
    await manager.upsertProvider({
      ...sampleProvider,
      defaultModel: 'deepseek-reasoner'
    })

    const updatedList = await manager.loadProviders()
    expect(updatedList.length).toBe(1)
    expect(updatedList[0]?.defaultModel).toBe('deepseek-reasoner')
  })

  it('removes provider by id correctly', async () => {
    await manager.upsertProvider(sampleProvider)
    const removed = await manager.removeProvider('deepseek-test')
    expect(removed).toBe(true)

    const list = await manager.loadProviders()
    expect(list.length).toBe(0)
  })

  it('tests connection and parses model list on HTTP 200', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: [{ id: 'qwen-plus' }, { id: 'qwen-max' }]
      })
    })
    globalThis.fetch = mockFetch

    const result = await manager.testConnection('https://api.example.com/v1', 'sk-key')
    expect(result.success).toBe(true)
    expect(result.discoveredModels?.length).toBe(2)
    expect(result.discoveredModels?.[0]?.id).toBe('qwen-plus')
  })

  it('handles connection failure gracefully', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network unreachable'))
    globalThis.fetch = mockFetch

    const result = await manager.testConnection('https://unreachable.local', '')
    expect(result.success).toBe(false)
    expect(result.message).toContain('Network unreachable')
  })
})
