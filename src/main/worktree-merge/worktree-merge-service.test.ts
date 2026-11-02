import { describe, it, expect } from 'vitest'
import { WorktreeMergeService } from './worktree-merge-service'

describe('WorktreeMergeService', () => {
  const service = new WorktreeMergeService()

  it('correctly parses git diff --numstat output', () => {
    const rawNumstat = `
15\t3\tsrc/components/App.tsx
45\t0\tsrc/hooks/useAuth.ts
0\t20\tsrc/old-service.ts
-\t-\tassets/logo.png
`
    const files = service.parseNumstat(rawNumstat)
    expect(files.length).toBe(4)

    expect(files[0]?.path).toBe('src/components/App.tsx')
    expect(files[0]?.additions).toBe(15)
    expect(files[0]?.deletions).toBe(3)
    expect(files[0]?.changeType).toBe('modified')

    expect(files[1]?.path).toBe('src/hooks/useAuth.ts')
    expect(files[1]?.changeType).toBe('added')

    expect(files[2]?.path).toBe('src/old-service.ts')
    expect(files[2]?.changeType).toBe('deleted')

    expect(files[3]?.path).toBe('assets/logo.png')
    expect(files[3]?.additions).toBe(0)
    expect(files[3]?.deletions).toBe(0)
  })

  it('calculates total additions and deletions accurately', () => {
    const files = [
      { path: 'a.ts', changeType: 'modified' as const, additions: 10, deletions: 2 },
      { path: 'b.ts', changeType: 'added' as const, additions: 25, deletions: 0 }
    ]
    const totals = service.calculateTotals(files)
    expect(totals.totalAdditions).toBe(35)
    expect(totals.totalDeletions).toBe(2)
  })

  it('builds appropriate git merge arguments per strategy', () => {
    expect(service.buildMergeArgs('squash', 'feature/auth')).toEqual([
      'merge',
      '--squash',
      'feature/auth'
    ])
    expect(service.buildMergeArgs('rebase', 'feature/auth')).toEqual(['rebase', 'feature/auth'])
    expect(service.buildMergeArgs('merge-commit', 'feature/auth')).toEqual([
      'merge',
      '--no-ff',
      'feature/auth'
    ])
  })

  it('handles invalid path gracefully when generating preview', async () => {
    const preview = await service.getMergePreview('/invalid/nonexistent/path', 'feature/test')
    expect(preview.canMergeCleanly).toBe(false)
    expect(preview.conflicts.length).toBeGreaterThan(0)
  })
})
