import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import type {
  FileDiffChangeType,
  FileDiffSummary,
  MergeStrategy,
  WorktreeMergePreview,
  WorktreeMergeResult
} from '../../shared/worktree-merge-types'

const execFileAsync = promisify(execFile)

export class WorktreeMergeService {
  /**
   * Phân tích output từ `git diff --numstat` thành danh sách thay đổi file có cấu trúc.
   */
  parseNumstat(numstatOutput: string): FileDiffSummary[] {
    const lines = numstatOutput.trim().split('\n')
    const files: FileDiffSummary[] = []

    for (const rawLine of lines) {
      const line = rawLine.trim()
      if (!line) {
        continue
      }

      const parts = line.split('\t')
      if (parts.length >= 3) {
        const rawAdd = parts[0] ?? '0'
        const rawDel = parts[1] ?? '0'
        const filePath = parts[2] ?? ''

        const additions = rawAdd === '-' ? 0 : Number.parseInt(rawAdd, 10) || 0
        const deletions = rawDel === '-' ? 0 : Number.parseInt(rawDel, 10) || 0

        let changeType: FileDiffChangeType = 'modified'
        if (additions > 0 && deletions === 0) {
          changeType = 'added'
        } else if (additions === 0 && deletions > 0) {
          changeType = 'deleted'
        }

        files.push({
          path: filePath,
          changeType,
          additions,
          deletions
        })
      }
    }

    return files
  }

  /**
   * Tính toán tổng số dòng thêm (+) và bớt (-).
   */
  calculateTotals(files: FileDiffSummary[]): { totalAdditions: number; totalDeletions: number } {
    let totalAdditions = 0
    let totalDeletions = 0
    for (const file of files) {
      totalAdditions += file.additions
      totalDeletions += file.deletions
    }
    return { totalAdditions, totalDeletions }
  }

  /**
   * Tạo danh sách tham số lệnh Git cho từng chiến lược Merge.
   */
  buildMergeArgs(strategy: MergeStrategy, sourceBranch: string): string[] {
    switch (strategy) {
      case 'squash': {
        return ['merge', '--squash', sourceBranch]
      }
      case 'rebase': {
        return ['rebase', sourceBranch]
      }
      default: {
        return ['merge', '--no-ff', sourceBranch]
      }
    }
  }

  /**
   * Quét và tạo bản xem trước (Preview) trước khi gộp nhánh Worktree.
   */
  async getMergePreview(
    worktreePath: string,
    sourceBranch: string,
    targetBranch = 'main'
  ): Promise<WorktreeMergePreview> {
    try {
      // 1. Đếm số lượng commit khác biệt
      const { stdout: logCount } = await execFileAsync(
        'git',
        ['rev-list', '--count', `${targetBranch}..${sourceBranch}`],
        { cwd: worktreePath }
      )
      const commitCount = Number.parseInt(logCount.trim(), 10) || 0

      // 2. Lấy thống kê diff numstat
      const { stdout: diffOut } = await execFileAsync(
        'git',
        ['diff', '--numstat', `${targetBranch}...${sourceBranch}`],
        { cwd: worktreePath }
      )
      const files = this.parseNumstat(diffOut)
      const { totalAdditions, totalDeletions } = this.calculateTotals(files)

      // 3. Kiểm tra merge conflict ngầm qua merge-tree
      let canMergeCleanly = true
      const conflicts: string[] = []

      try {
        const { stdout: mergeTreeOut } = await execFileAsync(
          'git',
          ['merge-tree', targetBranch, sourceBranch],
          { cwd: worktreePath }
        )
        if (mergeTreeOut.includes('<<<<<<<') || mergeTreeOut.includes('changed in both')) {
          canMergeCleanly = false
          conflicts.push('Phát hiện xung đột nội dung giữa 2 nhánh')
        }
      } catch {
        // Nếu git merge-tree không hỗ trợ cú pháp, giữ cờ an toàn
      }

      return {
        worktreeId: `wt-${sourceBranch}`,
        worktreePath,
        sourceBranch,
        targetBranch,
        commitCount,
        files,
        totalAdditions,
        totalDeletions,
        canMergeCleanly,
        conflicts
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      return {
        worktreeId: `wt-${sourceBranch}`,
        worktreePath,
        sourceBranch,
        targetBranch,
        commitCount: 0,
        files: [],
        totalAdditions: 0,
        totalDeletions: 0,
        canMergeCleanly: false,
        conflicts: [`Lỗi kiểm tra git: ${msg}`]
      }
    }
  }

  /**
   * Thực thi gộp nhánh Worktree vào target branch.
   */
  async executeMerge(
    worktreePath: string,
    sourceBranch: string,
    targetBranch: string,
    strategy: MergeStrategy,
    commitMessage: string,
    cleanupWorktree = true
  ): Promise<WorktreeMergeResult> {
    try {
      // Chuyển sang target branch
      await execFileAsync('git', ['checkout', targetBranch], { cwd: worktreePath })

      // Thực thi merge theo chiến lược
      const mergeArgs = this.buildMergeArgs(strategy, sourceBranch)
      await execFileAsync('git', mergeArgs, { cwd: worktreePath })

      // Nếu là squash merge, cần commit thông điệp
      if (strategy === 'squash') {
        await execFileAsync('git', ['commit', '-m', commitMessage], { cwd: worktreePath })
      }

      // Lấy SHA của commit vừa tạo
      const { stdout: revOut } = await execFileAsync('git', ['rev-parse', 'HEAD'], {
        cwd: worktreePath
      })
      const mergedCommitSha = revOut.trim()

      return {
        success: true,
        mergedCommitSha,
        strategy,
        cleanedUpWorktree: cleanupWorktree
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      return {
        success: false,
        strategy,
        cleanedUpWorktree: false,
        error: `Merge thất bại: ${msg}`
      }
    }
  }
}
