import { useState } from 'react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import type { PlanDocument, PlanTask, PlanTaskStatus } from '../../../../shared/plan-board-types'

export type InteractivePlanBoardProps = {
  initialPlan: PlanDocument
  onTaskStatusChange?: (taskId: string, newStatus: PlanTaskStatus) => void
  onAssignTaskToWorktree?: (task: PlanTask) => void
}

export function InteractivePlanBoard({
  initialPlan,
  onTaskStatusChange,
  onAssignTaskToWorktree
}: InteractivePlanBoardProps): React.JSX.Element {
  const [plan, setPlan] = useState<PlanDocument>(initialPlan)
  const [collapsedPhases, setCollapsedPhases] = useState<Record<string, boolean>>({})

  // Tính toán metrics tiến độ
  let totalTasks = 0
  let completedTasks = 0
  for (const phase of plan.phases) {
    for (const task of phase.tasks) {
      totalTasks += 1
      if (task.status === 'completed') {
        completedTasks += 1
      }
    }
  }
  const percentComplete = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const togglePhase = (phaseId: string): void => {
    setCollapsedPhases((prev) => ({
      ...prev,
      [phaseId]: !prev[phaseId]
    }))
  }

  const handleToggleTask = (taskId: string, currentStatus: PlanTaskStatus): void => {
    let nextStatus: PlanTaskStatus = 'completed'
    if (currentStatus === 'completed') {
      nextStatus = 'pending'
    } else if (currentStatus === 'pending') {
      nextStatus = 'in_progress'
    }

    const updatedPhases = plan.phases.map((phase) => ({
      ...phase,
      tasks: phase.tasks.map((task) => {
        if (task.id === taskId) {
          return { ...task, status: nextStatus }
        }
        return task
      })
    }))

    const updatedPlan: PlanDocument = {
      ...plan,
      phases: updatedPhases
    }

    setPlan(updatedPlan)
    if (onTaskStatusChange) {
      onTaskStatusChange(taskId, nextStatus)
    }
  }

  const getStatusBadge = (status: PlanTaskStatus): React.JSX.Element => {
    switch (status) {
      case 'completed': {
        return (
          <Badge
            variant="outline"
            className="text-[10px] border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
          >
            Hoàn thành
          </Badge>
        )
      }
      case 'in_progress': {
        return (
          <Badge
            variant="outline"
            className="text-[10px] border-amber-500/30 text-amber-600 bg-amber-500/10 animate-pulse"
          >
            Đang chạy
          </Badge>
        )
      }
      default: {
        return (
          <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">
            Chờ thực thi
          </Badge>
        )
      }
    }
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Header & Overall Progress */}
      <div className="border-b border-border/60 bg-muted/20 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">{plan.title}</h2>
            {plan.goal && <p className="text-xs text-muted-foreground line-clamp-1">{plan.goal}</p>}
          </div>
          <Badge variant="outline" className="font-mono text-xs font-semibold px-2.5 py-1">
            {percentComplete}% Hoàn thành
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${percentComplete}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            {completedTasks} / {totalTasks} task đã hoàn tất
          </span>
          <span>{plan.phases.length} Giai đoạn (Phases)</span>
        </div>
      </div>

      {/* Phase and Tasks List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-sleek">
        {plan.phases.map((phase, pIdx) => {
          const isCollapsed = Boolean(collapsedPhases[phase.id])
          const phaseDoneCount = phase.tasks.filter((t) => t.status === 'completed').length

          return (
            <div
              key={phase.id}
              className="rounded-xl border border-border/60 bg-background overflow-hidden transition-all shadow-xs"
            >
              {/* Phase Header */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => togglePhase(phase.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    togglePhase(phase.id)
                  }
                }}
                className="flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 cursor-pointer select-none transition-colors border-b border-border/40"
              >
                <div className="flex items-center gap-2">
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                    {pIdx + 1}
                  </span>
                  <span className="text-xs font-semibold text-foreground">{phase.title}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">
                    {phaseDoneCount}/{phase.tasks.length}
                  </span>
                  <span className="text-xs text-muted-foreground">{isCollapsed ? '▼' : '▲'}</span>
                </div>
              </div>

              {/* Tasks List */}
              {!isCollapsed && (
                <div className="p-2 space-y-1">
                  {phase.tasks.map((task) => {
                    const isDone = task.status === 'completed'

                    return (
                      <div
                        key={task.id}
                        className={`flex items-center justify-between rounded-lg p-2 transition-colors ${
                          isDone ? 'bg-muted/20 opacity-75' : 'hover:bg-muted/40 bg-card'
                        }`}
                      >
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => handleToggleTask(task.id, task.status)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              handleToggleTask(task.id, task.status)
                            }
                          }}
                          className="flex items-center gap-3 flex-1 cursor-pointer select-none"
                        >
                          <div
                            className={`flex size-4 items-center justify-center rounded border text-[10px] transition-colors ${
                              isDone
                                ? 'border-primary bg-primary text-primary-foreground'
                                : task.status === 'in_progress'
                                  ? 'border-amber-500 bg-amber-500/20 text-amber-600'
                                  : 'border-muted-foreground/40 bg-background'
                            }`}
                          >
                            {isDone ? '✓' : task.status === 'in_progress' ? '…' : ''}
                          </div>

                          <span
                            className={`text-xs ${
                              isDone
                                ? 'line-through text-muted-foreground'
                                : 'font-medium text-foreground'
                            }`}
                          >
                            {task.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {getStatusBadge(task.status)}
                          {onAssignTaskToWorktree && !isDone && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => onAssignTaskToWorktree(task)}
                              className="text-[10px] h-6 px-2 text-muted-foreground hover:text-foreground"
                            >
                              Giao việc Agent
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
