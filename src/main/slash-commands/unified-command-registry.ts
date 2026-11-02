import { existsSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import { join, basename } from 'node:path'
import { parse } from 'smol-toml'
import type { SlashCommandEntry, SlashCommandSource } from '../../shared/slash-command-types'

export type UnifiedCommandRegistryConfig = {
  globalDirs?: string[]
  projectRoot?: string
}

export class UnifiedCommandRegistry {
  private cachedCommands: SlashCommandEntry[] = []
  private lastScannedAt = 0

  constructor(private readonly config: UnifiedCommandRegistryConfig = {}) {}

  /**
   * Quét và nạp tất cả các lệnh .toml từ các thư mục được cấu hình.
   */
  async loadCommands(forceRefresh = false): Promise<SlashCommandEntry[]> {
    const now = Date.now()
    if (!forceRefresh && this.cachedCommands.length > 0 && now - this.lastScannedAt < 10000) {
      return this.cachedCommands
    }

    const commandMap = new Map<string, SlashCommandEntry>()

    // 1. Quét các thư mục Global
    const globalDirs = this.config.globalDirs ?? []
    for (const dir of globalDirs) {
      await this.scanDirectory(dir, 'global', commandMap)
    }

    // 2. Quét các thư mục Project
    if (this.config.projectRoot) {
      const projectDirs = [
        join(this.config.projectRoot, '.orca', 'commands'),
        join(this.config.projectRoot, '.gemini', 'commands')
      ]
      for (const dir of projectDirs) {
        await this.scanDirectory(dir, 'project', commandMap)
      }
    }

    this.cachedCommands = Array.from(commandMap.values()).sort((a, b) => a.id.localeCompare(b.id))
    this.lastScannedAt = now
    return this.cachedCommands
  }

  private async scanDirectory(
    dirPath: string,
    source: SlashCommandSource,
    collector: Map<string, SlashCommandEntry>
  ): Promise<void> {
    if (!existsSync(dirPath)) {
      return
    }

    try {
      const files = await readdir(dirPath)
      for (const file of files) {
        if (!file.endsWith('.toml')) {
          continue
        }

        const fullPath = join(dirPath, file)
        try {
          const content = await readFile(fullPath, 'utf-8')
          const parsed = parse(content) as Record<string, unknown>

          const id = basename(file, '.toml')
          const description =
            typeof parsed.description === 'string' ? parsed.description : 'Tùy chỉnh slash command'
          const prompt = typeof parsed.prompt === 'string' ? parsed.prompt : ''
          const argumentHint =
            typeof parsed.argumentHint === 'string' ? parsed.argumentHint : undefined

          if (prompt.trim()) {
            collector.set(id, {
              id,
              name: `/${id}`,
              description,
              prompt,
              source,
              sourcePath: fullPath,
              argumentHint
            })
          }
        } catch {
          // Bỏ qua các file .toml lỗi cú pháp mà không làm gãy toàn bộ scanner
        }
      }
    } catch {
      // Bỏ qua lỗi đọc thư mục
    }
  }

  /**
   * Lọc danh sách lệnh theo từ khóa tìm kiếm (khi người dùng gõ /test, /ponytail...).
   */
  filterCommands(query: string): SlashCommandEntry[] {
    const cleanQuery = query.startsWith('/')
      ? query.slice(1).toLowerCase().trim()
      : query.toLowerCase().trim()
    if (!cleanQuery) {
      return this.cachedCommands
    }

    return this.cachedCommands.filter(
      (cmd) =>
        cmd.id.toLowerCase().includes(cleanQuery) ||
        cmd.description.toLowerCase().includes(cleanQuery) ||
        cmd.prompt.toLowerCase().includes(cleanQuery)
    )
  }

  /**
   * Biên dịch nội dung prompt từ lệnh gõ tắt và thay thế placeholder {{args}}.
   */
  resolveCommandPrompt(commandId: string, args = ''): string | null {
    const cmd = this.cachedCommands.find((c) => c.id === commandId)
    if (!cmd) {
      return null
    }

    return cmd.prompt.replace(/\{\{args\}\}/g, args.trim())
  }
}
