export type KnowledgeCategory =
  | 'schema_change'
  | 'api_contract'
  | 'bug_discovery'
  | 'dependency_added'
  | 'general_insight'

export type KnowledgeSeverity = 'info' | 'warning' | 'critical'

export type KnowledgeItem = {
  id: string
  sourceAgentId: string
  sourceWorktreeId?: string
  category: KnowledgeCategory
  severity: KnowledgeSeverity
  title: string
  summary: string
  impactedFiles: string[]
  timestamp: number
  ttlMs?: number
}

export type PublishKnowledgeInput = {
  sourceAgentId: string
  sourceWorktreeId?: string
  category: KnowledgeCategory
  severity?: KnowledgeSeverity
  title: string
  summary: string
  impactedFiles?: string[]
  ttlMs?: number
}

export type QueryKnowledgeOptions = {
  category?: KnowledgeCategory
  severity?: KnowledgeSeverity
  sinceTimestamp?: number
  excludeAgentId?: string
  filePattern?: string
  limit?: number
}

export type KnowledgeListener = (item: KnowledgeItem) => void
