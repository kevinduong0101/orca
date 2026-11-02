import { useState } from 'react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import type {
  MergeStrategy,
  WorktreeMergePreview,
  WorktreeMergeResult
} from '../../../../shared/worktree-merge-types'

export type WorktreeMergeDialogProps = {
  preview: WorktreeMergePreview
  isOpen: boolean
  onClose: () => void
  onConfirmMerge: (
    strategy: MergeStrategy,
    commitMessage: string,
    cleanupWorktree: boolean
  ) => Promise<WorktreeMergeResult>
}

export function WorktreeMergeDialog({
  preview,
  isOpen,
  onClose,
  onConfirmMerge
}: WorktreeMergeDialogProps): React.JSX.Element | null {
  const [strategy, setStrategy] = useState<MergeStrategy>('squash')
  const [commitMessage, setCommitMessage] = useState(
    `feat: merge ${preview.sourceBranch} via Orca Next`
  )
  const [cleanupWorktree, setCleanupWorktree] = useState(true)
  const [isMerging, setIsMerging] = useState(false)
  const [mergeError, setMergeError] = useState<string | null>(null)

  if (!isOpen) {
    return null
  }

  const handleMerge = async (): Promise<void> => {
    setIsMerging(true)
    setMergeError(null)

    try {
      const result = await onConfirmMerge(strategy, commitMessage, cleanupWorktree)
      if (result.success) {
        onClose()
      } else {
        setMergeError(result.error ?? 'Merge thất bại')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setMergeError(msg)
    } finally {
      setIsMerging(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in-0">
      <div className="flex w-full max-w-xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl animate-in zoom-in-95">
        {/* Header */}
        <div className="border-b border-border/60 bg-muted/20 p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm font-semibold text-foreground">
              Review & Merge Worktree Branch (Orca Next)
            </h3>
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <Badge
                variant="outline"
                className="text-[10px] bg-primary/10 text-primary border-primary/20"
              >
                {preview.sourceBranch}
              </Badge>
              <span>➔</span>
              <Badge variant="outline" className="text-[10px]">
                {preview.targetBranch}
              </Badge>
            </div>
          </div>

          <Badge
            variant="outline"
            className={`text-xs px-2 py-0.5 ${
              preview.canMergeCleanly
                ? 'border-emerald-500/30 text-emerald-600 bg-emerald-500/10'
                : 'border-red-500/30 text-red-600 bg-red-500/10'
            }`}
          >
            {preview.canMergeCleanly ? 'Sẵn sàng Merge' : 'Có xung đột'}
          </Badge>
        </div>

        {/* Diff Stats & File List */}
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto scrollbar-sleek">
          {/* Summary Metric Bar */}
          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-2.5 text-xs">
            <span className="text-muted-foreground">
              {preview.files.length} files thay đổi ({preview.commitCount} commits)
            </span>
            <div className="flex items-center gap-3 font-mono font-medium">
              <span className="text-emerald-600">+{preview.totalAdditions}</span>
              <span className="text-red-500">-{preview.totalDeletions}</span>
            </div>
          </div>

          {/* Files Changed */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              Các file thay đổi trong Worktree:
            </Label>
            <div className="max-h-36 overflow-y-auto scrollbar-sleek rounded-lg border border-border/60 bg-background p-2 space-y-1 text-xs font-mono">
              {preview.files.map((file) => (
                <div
                  key={file.path}
                  className="flex items-center justify-between py-0.5 hover:bg-muted/40 rounded px-1"
                >
                  <span className="truncate flex-1 text-foreground">{file.path}</span>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-emerald-600 text-[11px]">+{file.additions}</span>
                    <span className="text-red-500 text-[11px]">-{file.deletions}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strategy Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Chiến lược Merge:</Label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setStrategy('squash')}
                className={`rounded-lg border p-2 text-left transition-colors ${
                  strategy === 'squash'
                    ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                    : 'border-border/60 text-muted-foreground hover:bg-muted/40'
                }`}
              >
                <div className="font-semibold text-foreground">Squash Merge</div>
                <div className="text-[10px] text-muted-foreground">
                  Gộp thành 1 commit duy nhất (Khuyến nghị)
                </div>
              </button>

              <button
                type="button"
                onClick={() => setStrategy('merge-commit')}
                className={`rounded-lg border p-2 text-left transition-colors ${
                  strategy === 'merge-commit'
                    ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                    : 'border-border/60 text-muted-foreground hover:bg-muted/40'
                }`}
              >
                <div className="font-semibold text-foreground">Merge Commit</div>
                <div className="text-[10px] text-muted-foreground">
                  Giữ lại toàn bộ lịch sử commit
                </div>
              </button>

              <button
                type="button"
                onClick={() => setStrategy('rebase')}
                className={`rounded-lg border p-2 text-left transition-colors ${
                  strategy === 'rebase'
                    ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                    : 'border-border/60 text-muted-foreground hover:bg-muted/40'
                }`}
              >
                <div className="font-semibold text-foreground">Rebase</div>
                <div className="text-[10px] text-muted-foreground">
                  Tái định vị commit tuyến tính
                </div>
              </button>
            </div>
          </div>

          {/* Commit Message */}
          {strategy === 'squash' && (
            <div className="space-y-1.5">
              <Label htmlFor="merge-commit-message" className="text-xs font-medium">
                Thông điệp commit (Squash Message)
              </Label>
              <Input
                id="merge-commit-message"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>
          )}

          {/* Cleanup Worktree Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              id="cleanup-worktree-toggle"
              type="checkbox"
              checked={cleanupWorktree}
              onChange={(e) => setCleanupWorktree(e.target.checked)}
              className="size-4 rounded border-border"
            />
            <Label
              htmlFor="cleanup-worktree-toggle"
              className="text-xs text-muted-foreground cursor-pointer"
            >
              Tự động đóng và dọn dẹp Git Worktree sau khi merge an toàn
            </Label>
          </div>

          {mergeError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-600 dark:text-red-400">
              {mergeError}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-border/40 p-4 bg-muted/10 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isMerging}
            className="text-xs h-8"
          >
            Hủy bỏ
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleMerge}
            disabled={isMerging || !preview.canMergeCleanly}
            className="text-xs h-8 font-medium gap-1.5"
          >
            {isMerging ? 'Đang gộp nhánh...' : 'Xác nhận Merge & Gộp nhánh'}
          </Button>
        </div>
      </div>
    </div>
  )
}
