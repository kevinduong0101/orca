import { useState } from 'react'
import { AlertCircle, AlertTriangle, ChevronDown, ChevronUp, X } from 'lucide-react'
import type { FileConflictAlert } from '../../../../shared/worktree-watcher-types'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'

type WorktreeConflictBannerProps = {
  conflicts: FileConflictAlert[]
  onDismiss?: () => void
  onSelectConflict?: (conflict: FileConflictAlert) => void
}

export const WorktreeConflictBanner = ({
  conflicts,
  onDismiss,
  onSelectConflict
}: WorktreeConflictBannerProps): JSX.Element | null => {
  const [expanded, setExpanded] = useState(false)

  if (conflicts.length === 0) {
    return null
  }

  const hasCritical = conflicts.some((c) => c.severity === 'critical')

  return (
    <div
      className={`w-full border-b px-4 py-2.5 text-sm transition-colors ${
        hasCritical
          ? 'border-destructive/40 bg-destructive/10 text-destructive-foreground'
          : 'border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {hasCritical ? (
            <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
          ) : (
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
          )}
          <span className="font-medium">
            Phát hiện {conflicts.length} file đang chỉnh sửa đồng thời trên các Worktree khác nhau
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs px-2 gap-1"
            onClick={() => {
              setExpanded(!expanded)
            }}
          >
            {expanded ? 'Thu gọn' : 'Xem chi tiết'}
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>

          {onDismiss && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={onDismiss}
              aria-label="Đóng cảnh báo xung đột"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-2.5 space-y-1.5 border-t border-border/40 pt-2 text-xs">
          <p className="text-muted-foreground">
            Các file sau đang được nhiều nhánh sửa cùng lúc. Nên xem xét trao đổi hoặc đồng bộ sớm:
          </p>
          <div className="max-h-36 overflow-y-auto scrollbar-sleek space-y-1">
            {conflicts.map((conflict) => (
              <div
                key={conflict.filePath}
                className="flex items-center justify-between rounded bg-background/50 px-2 py-1 border border-border/30 hover:bg-background/80 cursor-pointer"
                onClick={() => {
                  if (onSelectConflict) {
                    onSelectConflict(conflict)
                  }
                }}
              >
                <span className="font-mono text-xs">{conflict.filePath}</span>
                <div className="flex items-center gap-1">
                  {conflict.conflictingWorktrees.map((wt) => (
                    <Badge
                      key={wt.worktreeId}
                      variant={conflict.severity === 'critical' ? 'destructive' : 'secondary'}
                      className="text-[10px] px-1.5 py-0"
                    >
                      {wt.branchName}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
