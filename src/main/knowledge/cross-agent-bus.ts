import crypto from 'node:crypto'
import type {
  KnowledgeCategory,
  KnowledgeItem,
  KnowledgeListener,
  KnowledgeSeverity,
  PublishKnowledgeInput,
  QueryKnowledgeOptions
} from '../../shared/cross-agent-bus-types'

export class CrossAgentBus {
  private items: KnowledgeItem[] = []
  private listeners = new Set<KnowledgeListener>()

  public publish(input: PublishKnowledgeInput): KnowledgeItem {
    const id = `k-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`
    const severity: KnowledgeSeverity = input.severity ?? 'info'
    const impactedFiles = input.impactedFiles ?? []

    const item: KnowledgeItem = {
      id,
      sourceAgentId: input.sourceAgentId,
      sourceWorktreeId: input.sourceWorktreeId,
      category: input.category,
      severity,
      title: input.title.trim(),
      summary: input.summary.trim(),
      impactedFiles,
      timestamp: Date.now(),
      ttlMs: input.ttlMs
    }

    this.items.push(item)

    for (const listener of this.listeners) {
      try {
        listener(item)
      } catch (err) {
        console.error('CrossAgentBus listener error:', err)
      }
    }

    return item
  }

  public subscribe(listener: KnowledgeListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  public query(options: QueryKnowledgeOptions = {}): KnowledgeItem[] {
    const now = Date.now()

    let filtered = this.items.filter((item) => {
      if (item.ttlMs && now > item.timestamp + item.ttlMs) {
        return false
      }
      if (options.category && item.category !== options.category) {
        return false
      }
      if (options.severity && item.severity !== options.severity) {
        return false
      }
      if (options.excludeAgentId && item.sourceAgentId === options.excludeAgentId) {
        return false
      }
      if (options.sinceTimestamp !== undefined && item.timestamp < options.sinceTimestamp) {
        return false
      }
      if (options.filePattern) {
        const pattern = options.filePattern.toLowerCase()
        const hasMatch = item.impactedFiles.some((f) => f.toLowerCase().includes(pattern))
        if (!hasMatch) {
          return false
        }
      }
      return true
    })

    filtered.sort((a, b) => b.timestamp - a.timestamp)

    if (options.limit && options.limit > 0) {
      filtered = filtered.slice(0, options.limit)
    }

    return filtered
  }

  public formatForPromptContext(
    targetAgentId: string,
    options: { maxItems?: number; sinceTimestamp?: number } = {}
  ): string {
    const relevantItems = this.query({
      excludeAgentId: targetAgentId,
      sinceTimestamp: options.sinceTimestamp,
      limit: options.maxItems ?? 10
    })

    if (relevantItems.length === 0) {
      return ''
    }

    const categoryIcons: Record<KnowledgeCategory, string> = {
      schema_change: '[Schema]',
      api_contract: '[API Contract]',
      bug_discovery: '[Bug/Fix]',
      dependency_added: '[Dependency]',
      general_insight: '[Insight]'
    }

    const lines: string[] = [
      '### Cross-Agent Discoveries & Shared Context',
      'The following insights and changes were registered by parallel agents in other worktrees:'
    ]

    for (const item of relevantItems) {
      const tag = categoryIcons[item.category] || '[Note]'
      const filesInfo =
        item.impactedFiles.length > 0 ? ` (Files: ${item.impactedFiles.join(', ')})` : ''
      lines.push(
        `- ${tag} **${item.title}**: ${item.summary}${filesInfo} [from agent ${item.sourceAgentId}]`
      )
    }

    return lines.join('\n')
  }

  public clearExpired(): number {
    const now = Date.now()
    const initialCount = this.items.length
    this.items = this.items.filter((item) => {
      if (!item.ttlMs) {
        return true
      }
      return now <= item.timestamp + item.ttlMs
    })
    return initialCount - this.items.length
  }

  public getSubscriberCount(): number {
    return this.listeners.size
  }

  public getAll(): KnowledgeItem[] {
    return [...this.items]
  }

  public clear(): void {
    this.items = []
    this.listeners.clear()
  }
}

export const crossAgentBus = new CrossAgentBus()
