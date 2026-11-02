export type TerminalState = 'active' | 'hibernated'

export type HibernationConfig = {
  idleThresholdMs: number
  cacheDir: string
}

export type TerminalSessionInfo = {
  terminalId: string
  worktreeId?: string
  state: TerminalState
  lastActiveTimestamp: number
  bufferLineCount: number
  hibernatedAt?: number
  diskCachePath?: string
}

export type HibernationMetrics = {
  totalSessions: number
  activeSessions: number
  hibernatedSessions: number
  estimatedSavedMemoryBytes: number
}
