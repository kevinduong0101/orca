import type { CrossAgentBus } from '../knowledge/cross-agent-bus'
import { crossAgentBus } from '../knowledge/cross-agent-bus'
import type {
  ConflictingWorktreeRef,
  ConflictListener,
  ConflictWatcherConfig,
  ConflictWatcherMetrics,
  FileConflictAlert,
  TrackedWorktree
} from '../../shared/worktree-watcher-types'

export class WorktreeConflictWatcher {
  private config: ConflictWatcherConfig
  private trackedWorktrees = new Map<string, TrackedWorktree>()
  private activeConflicts: FileConflictAlert[] = []
  private listeners = new Set<ConflictListener>()
  private totalConflictsDetected = 0
  private bus: CrossAgentBus

  public constructor(config?: Partial<ConflictWatcherConfig>, customBus?: CrossAgentBus) {
    this.config = {
      pollIntervalMs: config?.pollIntervalMs ?? 15000,
      autoPublishToBus: config?.autoPublishToBus ?? true
    }
    this.bus = customBus ?? crossAgentBus
  }

  public registerWorktree(worktree: Omit<TrackedWorktree, 'lastScannedTimestamp'>): void {
    this.trackedWorktrees.set(worktree.worktreeId, {
      ...worktree,
      lastScannedTimestamp: Date.now()
    })
    this.detectConflicts()
  }

  public unregisterWorktree(worktreeId: string): void {
    this.trackedWorktrees.delete(worktreeId)
    this.detectConflicts()
  }

  public updateWorktreeModifiedFiles(worktreeId: string, files: string[]): FileConflictAlert[] {
    const existing = this.trackedWorktrees.get(worktreeId)
    if (!existing) {
      return []
    }

    existing.modifiedFiles = [...files]
    existing.lastScannedTimestamp = Date.now()

    return this.detectConflicts()
  }

  public detectConflicts(): FileConflictAlert[] {
    const fileToWorktrees = new Map<string, ConflictingWorktreeRef[]>()

    for (const wt of this.trackedWorktrees.values()) {
      for (const file of wt.modifiedFiles) {
        const normalized = file.trim()
        if (!normalized) {
          continue
        }

        const list = fileToWorktrees.get(normalized) ?? []
        list.push({
          worktreeId: wt.worktreeId,
          branchName: wt.branchName,
          directoryPath: wt.directoryPath
        })
        fileToWorktrees.set(normalized, list)
      }
    }

    const previousConflictFiles = new Set(this.activeConflicts.map((c) => c.filePath))
    const newConflicts: FileConflictAlert[] = []

    for (const [filePath, refs] of fileToWorktrees.entries()) {
      if (refs.length >= 2) {
        const isCritical =
          refs.length >= 3 ||
          filePath.includes('package.json') ||
          filePath.includes('schema.prisma') ||
          filePath.includes('schema.sql')

        newConflicts.push({
          filePath,
          conflictingWorktrees: refs,
          firstDetectedAt: Date.now(),
          severity: isCritical ? 'critical' : 'warning'
        })
      }
    }

    this.activeConflicts = newConflicts

    // Check for newly surfaced conflicts to publish to knowledge bus
    for (const conflict of newConflicts) {
      if (!previousConflictFiles.has(conflict.filePath)) {
        this.totalConflictsDetected += 1

        if (this.config.autoPublishToBus) {
          const branches = conflict.conflictingWorktrees.map((w) => w.branchName).join(', ')
          this.bus.publish({
            sourceAgentId: 'worktree-conflict-watcher',
            sourceWorktreeId: conflict.conflictingWorktrees[0].worktreeId,
            category: 'bug_discovery',
            severity: conflict.severity,
            title: `Potential Conflict on ${conflict.filePath}`,
            summary: `File is concurrently modified across branches: ${branches}`,
            impactedFiles: [conflict.filePath]
          })
        }
      }
    }

    for (const listener of this.listeners) {
      try {
        listener(this.activeConflicts)
      } catch (err) {
        console.error('ConflictListener error:', err)
      }
    }

    return this.activeConflicts
  }

  public getActiveConflicts(): FileConflictAlert[] {
    return [...this.activeConflicts]
  }

  public subscribe(listener: ConflictListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  public getMetrics(): ConflictWatcherMetrics {
    return {
      trackedWorktreeCount: this.trackedWorktrees.size,
      activeConflictCount: this.activeConflicts.length,
      totalConflictsDetected: this.totalConflictsDetected
    }
  }

  public clear(): void {
    this.trackedWorktrees.clear()
    this.activeConflicts = []
    this.listeners.clear()
    this.totalConflictsDetected = 0
  }
}

export const worktreeConflictWatcher = new WorktreeConflictWatcher()
