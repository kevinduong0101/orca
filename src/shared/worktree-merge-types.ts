export type MergeStrategy = 'squash' | 'merge-commit' | 'rebase'

export type FileDiffChangeType = 'added' | 'modified' | 'deleted'

export type FileDiffSummary = {
  path: string
  changeType: FileDiffChangeType
  additions: number
  deletions: number
}

export type WorktreeMergePreview = {
  worktreeId: string
  worktreePath: string
  sourceBranch: string
  targetBranch: string
  commitCount: number
  files: FileDiffSummary[]
  totalAdditions: number
  totalDeletions: number
  canMergeCleanly: boolean
  conflicts: string[]
}

export type WorktreeMergeResult = {
  success: boolean
  mergedCommitSha?: string
  strategy: MergeStrategy
  cleanedUpWorktree: boolean
  error?: string
}
