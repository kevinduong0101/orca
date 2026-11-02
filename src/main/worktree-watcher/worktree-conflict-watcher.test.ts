import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CrossAgentBus } from '../knowledge/cross-agent-bus'
import { WorktreeConflictWatcher } from './worktree-conflict-watcher'

describe('WorktreeConflictWatcher', () => {
  let bus: CrossAgentBus
  let watcher: WorktreeConflictWatcher

  beforeEach(() => {
    bus = new CrossAgentBus()
    watcher = new WorktreeConflictWatcher({ autoPublishToBus: true }, bus)
  })

  it('detects no conflict when worktrees modify different files', () => {
    watcher.registerWorktree({
      worktreeId: 'wt-1',
      branchName: 'feat/auth',
      directoryPath: '/path/wt-1',
      modifiedFiles: ['src/auth/login.ts']
    })

    watcher.registerWorktree({
      worktreeId: 'wt-2',
      branchName: 'feat/billing',
      directoryPath: '/path/wt-2',
      modifiedFiles: ['src/billing/checkout.ts']
    })

    expect(watcher.getActiveConflicts()).toHaveLength(0)
  })

  it('detects conflict when two worktrees modify the same file and marks severity', () => {
    watcher.registerWorktree({
      worktreeId: 'wt-auth',
      branchName: 'feat/auth',
      directoryPath: '/path/wt-auth',
      modifiedFiles: ['src/models/user.ts', 'package.json']
    })

    watcher.registerWorktree({
      worktreeId: 'wt-profile',
      branchName: 'feat/profile',
      directoryPath: '/path/wt-profile',
      modifiedFiles: ['src/models/user.ts', 'package.json']
    })

    const conflicts = watcher.getActiveConflicts()
    expect(conflicts).toHaveLength(2)

    const userModelConflict = conflicts.find((c) => c.filePath === 'src/models/user.ts')
    expect(userModelConflict).toBeDefined()
    expect(userModelConflict?.conflictingWorktrees).toHaveLength(2)
    expect(userModelConflict?.severity).toBe('warning')

    const packageJsonConflict = conflicts.find((c) => c.filePath === 'package.json')
    expect(packageJsonConflict).toBeDefined()
    expect(packageJsonConflict?.severity).toBe('critical')
  })

  it('publishes potential conflict event to CrossAgentBus', () => {
    const busListener = vi.fn()
    bus.subscribe(busListener)

    watcher.registerWorktree({
      worktreeId: 'wt-a',
      branchName: 'branch-a',
      directoryPath: '/path/a',
      modifiedFiles: ['src/shared/config.ts']
    })

    watcher.registerWorktree({
      worktreeId: 'wt-b',
      branchName: 'branch-b',
      directoryPath: '/path/b',
      modifiedFiles: ['src/shared/config.ts']
    })

    expect(busListener).toHaveBeenCalledTimes(1)
    expect(busListener).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Potential Conflict on src/shared/config.ts',
        category: 'bug_discovery',
        impactedFiles: ['src/shared/config.ts']
      })
    )
  })

  it('updates conflict state dynamically when files change or worktree unregisters', () => {
    watcher.registerWorktree({
      worktreeId: 'wt-1',
      branchName: 'feat/1',
      directoryPath: '/path/1',
      modifiedFiles: ['common.ts']
    })

    watcher.registerWorktree({
      worktreeId: 'wt-2',
      branchName: 'feat/2',
      directoryPath: '/path/2',
      modifiedFiles: ['common.ts']
    })

    expect(watcher.getActiveConflicts()).toHaveLength(1)

    // wt-2 commits or reverts common.ts
    watcher.updateWorktreeModifiedFiles('wt-2', ['other.ts'])
    expect(watcher.getActiveConflicts()).toHaveLength(0)

    // wt-2 modifies common.ts again
    watcher.updateWorktreeModifiedFiles('wt-2', ['common.ts'])
    expect(watcher.getActiveConflicts()).toHaveLength(1)

    // unregister wt-1
    watcher.unregisterWorktree('wt-1')
    expect(watcher.getActiveConflicts()).toHaveLength(0)
  })

  it('reports accurate watcher metrics', () => {
    watcher.registerWorktree({
      worktreeId: 'wt-1',
      branchName: 'b1',
      directoryPath: '/p1',
      modifiedFiles: ['file1.ts']
    })

    watcher.registerWorktree({
      worktreeId: 'wt-2',
      branchName: 'b2',
      directoryPath: '/p2',
      modifiedFiles: ['file1.ts']
    })

    const metrics = watcher.getMetrics()
    expect(metrics.trackedWorktreeCount).toBe(2)
    expect(metrics.activeConflictCount).toBe(1)
    expect(metrics.totalConflictsDetected).toBe(1)
  })
})
