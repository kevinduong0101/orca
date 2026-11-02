import { existsSync } from 'node:fs'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import type { CustomProviderConfig, CustomProviderModel } from '../../shared/custom-provider-types'

export type ProviderConnectionTestResult = {
  success: boolean
  message: string
  latencyMs: number
  discoveredModels?: CustomProviderModel[]
}

export class CustomProviderManager {
  constructor(private readonly configDir: string) {}

  private getFilePath(): string {
    return join(this.configDir, 'custom-providers.json')
  }

  async loadProviders(): Promise<CustomProviderConfig[]> {
    const filePath = this.getFilePath()
    if (!existsSync(filePath)) {
      return []
    }

    try {
      const data = await readFile(filePath, 'utf-8')
      const parsed = JSON.parse(data)
      if (Array.isArray(parsed)) {
        return parsed
      }
      return []
    } catch {
      return []
    }
  }

  async saveProviders(providers: CustomProviderConfig[]): Promise<void> {
    if (!existsSync(this.configDir)) {
      await mkdir(this.configDir, { recursive: true })
    }

    const filePath = this.getFilePath()
    await writeFile(filePath, JSON.stringify(providers, null, 2), 'utf-8')
  }

  async upsertProvider(provider: CustomProviderConfig): Promise<void> {
    const providers = await this.loadProviders()
    const index = providers.findIndex((p) => p.id === provider.id)

    if (index !== -1) {
      providers[index] = provider
    } else {
      providers.push(provider)
    }

    await this.saveProviders(providers)
  }

  async removeProvider(providerId: string): Promise<boolean> {
    const providers = await this.loadProviders()
    const filtered = providers.filter((p) => p.id !== providerId)

    if (filtered.length !== providers.length) {
      await this.saveProviders(filtered)
      return true
    }

    return false
  }

  async testConnection(
    baseUrl: string,
    apiKey: string,
    timeoutMs = 5000
  ): Promise<ProviderConnectionTestResult> {
    const startTime = Date.now()
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const url = baseUrl.endsWith('/') ? `${baseUrl}models` : `${baseUrl}/models`
      const headers: Record<string, string> = {
        Accept: 'application/json'
      }

      if (apiKey.trim()) {
        headers.Authorization = `Bearer ${apiKey.trim()}`
      }

      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: controller.signal
      })

      const latencyMs = Date.now() - startTime

      if (!response.ok) {
        return {
          success: false,
          message: `Endpoint returned HTTP status ${response.status} (${response.statusText})`,
          latencyMs
        }
      }

      const body = (await response.json()) as { data?: { id: string }[] }
      const discoveredModels: CustomProviderModel[] = []

      if (Array.isArray(body?.data)) {
        for (const item of body.data) {
          if (item?.id) {
            discoveredModels.push({
              id: item.id,
              displayName: item.id,
              contextWindow: 128000
            })
          }
        }
      }

      return {
        success: true,
        message: `Connected successfully (${latencyMs}ms)`,
        latencyMs,
        discoveredModels
      }
    } catch (err: unknown) {
      const latencyMs = Date.now() - startTime
      const errorMessage = err instanceof Error ? err.message : String(err)
      return {
        success: false,
        message: `Connection failed: ${errorMessage}`,
        latencyMs
      }
    } finally {
      clearTimeout(timer)
    }
  }
}
