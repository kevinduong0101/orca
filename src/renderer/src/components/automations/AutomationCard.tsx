import React from 'react'
import { Clock, Laptop, MoreHorizontal, Pencil, Play, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import type {
  ExternalAutomationAction,
  ExternalAutomationJob
} from '../../../../shared/automations-types'
import { formatUiAutomationSchedule } from './automation-schedule-label'
import type { AutomationListRow } from './automation-list-row-identity'
import type { AutomationListViewItem } from './automation-list-view'

function formatNextRunCountdown(
  nextRunAt: number | string | null | undefined,
  now: number
): string {
  if (!nextRunAt) {
    return 'No upcoming run'
  }
  const target = typeof nextRunAt === 'string' ? Date.parse(nextRunAt) : nextRunAt
  if (Number.isNaN(target)) {
    return 'No upcoming run'
  }
  const diffMs = target - now
  if (diffMs <= 0) {
    return 'Next: due soon'
  }
  const diffMins = Math.round(diffMs / (60 * 1000))
  if (diffMins < 60) {
    return `Next: in ${Math.max(1, diffMins)}m`
  }
  const diffHours = Math.round(diffMs / (60 * 60 * 1000))
  if (diffHours < 24) {
    return `Next: in ${diffHours} hours`
  }
  const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000))
  return `Next: in ${diffDays} days`
}

export function AutomationCard({
  item,
  now,
  isSelected,
  onSelect,
  onToggle,
  onRunNow,
  onEdit,
  onDelete,
  onRequestExternalAction
}: {
  item: AutomationListViewItem
  now: number
  isSelected: boolean
  onSelect: () => void
  onToggle: (row: AutomationListRow) => void
  onRunNow: (row: AutomationListRow) => void
  onEdit: (row: AutomationListRow) => void
  onDelete: (row: AutomationListRow) => void
  onRequestExternalAction?: (action: ExternalAutomationAction, entry: ExternalAutomationJob) => void
}): React.JSX.Element {
  if (item.kind === 'local') {
    const row = item.row
    const auto = row.automation
    const isEnabled = auto.enabled
    const scheduleStr = auto.schedule
      ? `${formatUiAutomationSchedule(auto.schedule)} · ${auto.timeZone || 'Asia/Ho_Chi_Minh'}`
      : 'No schedule'
    const countdown = isEnabled ? formatNextRunCountdown(auto.nextRunAt, now) : 'Paused'

    // Status display
    const lastStatus = auto.lastRunStatus
    const statusText =
      lastStatus === 'completed'
        ? 'Completed'
        : lastStatus === 'dispatch_failed' || lastStatus === 'failed'
          ? 'Failed'
          : lastStatus === 'dispatched' || lastStatus === 'dispatching'
            ? 'Running'
            : lastStatus
              ? 'Completed'
              : 'Never run'

    const statusColor =
      lastStatus === 'completed'
        ? 'text-emerald-400'
        : lastStatus === 'dispatch_failed' || lastStatus === 'failed'
          ? 'text-rose-400'
          : lastStatus === 'dispatched' || lastStatus === 'dispatching'
            ? 'text-sky-400'
            : 'text-neutral-500'

    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onSelect()
          }
        }}
        className={cn(
          'group relative flex flex-col justify-between rounded-2xl border p-5 text-left transition-all duration-150 cursor-pointer',
          'bg-neutral-900/60 hover:bg-neutral-900/90 hover:border-neutral-700/80',
          isSelected ? 'border-emerald-500/80 ring-1 ring-emerald-500/50' : 'border-neutral-800/80'
        )}
      >
        {/* Top Header: Toggle on left, menu on right */}
        <div>
          <div className="flex items-center justify-between gap-2 pb-2.5">
            <div
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              className="inline-flex items-center"
            >
              <Switch
                checked={isEnabled}
                onCheckedChange={() => onToggle(row)}
                className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-neutral-800"
                aria-label={`Toggle schedule for ${auto.name}`}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/80"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="More options"
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onRunNow(row)
                  }}
                  className="gap-2"
                >
                  <Play className="size-3.5 text-emerald-400" />
                  <span>Run now</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(row)
                  }}
                  className="gap-2"
                >
                  <Pencil className="size-3.5" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(row)
                  }}
                  className="gap-2 text-destructive focus:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Title and Status Badge */}
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="truncate text-[15px] font-semibold text-neutral-100 group-hover:text-white">
              {auto.name}
            </h3>
            <span className={cn('shrink-0 text-xs font-medium', statusColor)}>{statusText}</span>
          </div>

          {/* Prompt / Description Preview */}
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-neutral-400">
            {auto.prompt || 'No prompt description provided.'}
          </p>
        </div>

        {/* Divider & Footer */}
        <div>
          <div className="my-3 border-t border-dashed border-neutral-800/80" />
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <div className="flex items-center gap-1.5 truncate pr-2">
              <Laptop className="size-3.5 shrink-0 text-neutral-500" />
              <span className="truncate">{scheduleStr}</span>
            </div>
            <span className="shrink-0 font-medium text-neutral-400">{countdown}</span>
          </div>
        </div>
      </div>
    )
  }

  // External automation card
  const entry = item.entry
  const isEnabled = entry.enabled
  const countdown = isEnabled ? formatNextRunCountdown(entry.nextRunAt, now) : 'Paused'
  const statusColor =
    entry.lastStatus === 'completed'
      ? 'text-emerald-400'
      : entry.lastStatus === 'failed'
        ? 'text-rose-400'
        : 'text-neutral-500'

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
      className={cn(
        'group relative flex flex-col justify-between rounded-2xl border p-5 text-left transition-all duration-150 cursor-pointer',
        'bg-neutral-900/60 hover:bg-neutral-900/90 hover:border-neutral-700/80',
        isSelected ? 'border-emerald-500/80 ring-1 ring-emerald-500/50' : 'border-neutral-800/80'
      )}
    >
      <div>
        <div className="flex items-center justify-between gap-2 pb-2.5">
          <div
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            className="inline-flex items-center"
          >
            <Switch
              checked={isEnabled}
              onCheckedChange={() => {
                onRequestExternalAction?.(isEnabled ? 'pause' : 'resume', entry)
              }}
              className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-neutral-800"
              aria-label={`Toggle schedule for ${entry.name}`}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/80"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onRequestExternalAction?.('run', entry)
                }}
                className="gap-2"
              >
                <Play className="size-3.5 text-emerald-400" />
                <span>Run now</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onRequestExternalAction?.('delete', entry)
                }}
                className="gap-2 text-destructive focus:text-destructive"
              >
                <Trash2 className="size-3.5" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-baseline justify-between gap-3">
          <h3 className="truncate text-[15px] font-semibold text-neutral-100 group-hover:text-white">
            {entry.name}
          </h3>
          <span className={cn('shrink-0 text-xs font-medium capitalize', statusColor)}>
            {entry.lastStatus || 'Unknown'}
          </span>
        </div>

        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-neutral-400">
          {entry.promptPreview || 'No prompt preview'}
        </p>
      </div>

      <div>
        <div className="my-3 border-t border-dashed border-neutral-800/80" />
        <div className="flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-1.5 truncate pr-2">
            <Clock className="size-3.5 shrink-0 text-neutral-500" />
            <span className="truncate">{entry.schedule || 'Scheduled'}</span>
          </div>
          <span className="shrink-0 font-medium text-neutral-400">{countdown}</span>
        </div>
      </div>
    </div>
  )
}
