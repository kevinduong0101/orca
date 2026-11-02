export type TrackedWorktree = {
  worktreeId: string
  branchName: string
  directoryPath: string
  modifiedFiles: string[]
  lastScannedTimestamp: number
}

export type ConflictingWorktreeRef = {
  worktreeId: string
  branchName: string
  directoryPath: string
}

export type FileConflictAlert = {
  filePath: string
  conflictingWorktrees: ConflictingWorktreeRef[]
  firstDetectedAt: number
  severity: 'warning' | 'critical'
}

export type ConflictWatcherConfig = {
  pollIntervalMs: number
  autoPublishToBus: boolean
}

export type ConflictWatcherMetrics = {
  trackedWorktreeCount: number
  activeConflictCount: number
  totalConflictsDetected: number
}

export type ConflictListener = (conflicts: FileConflictAlert[]) => void
