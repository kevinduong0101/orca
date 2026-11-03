import React, { useMemo, useState } from 'react'
import { Check, ChevronDown, Clock, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { AutomationListRow } from './automation-list-row-identity'
import type {
  AutomationRunsDashboardEntry,
  AutomationRunsDashboardFailure,
  AutomationRunsStatusFilter
} from './automation-runs-dashboard-model'

export type GroupByOption = 'day' | 'week' | 'month'

function formatTimeOnly(timestamp: number): string {
  const date = new Date(timestamp)
  const hours = String(date.getHours()).padStart(2, '0')
  const mins = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${mins}`
}

function formatFullTime(timestamp: number): string {
  const date = new Date(timestamp)
  const hours = String(date.getHours()).padStart(2, '0')
  const mins = String(date.getMinutes()).padStart(2, '0')
  const secs = String(date.getSeconds()).padStart(2, '0')
  return `${hours}:${mins}:${secs}`
}

function getGroupKey(
  timestamp: number,
  groupBy: GroupByOption,
  now: number
): { key: string; label: string } {
  const date = new Date(timestamp)
  const nowDate = new Date(now)

  if (groupBy === 'day') {
    const isToday =
      date.getFullYear() === nowDate.getFullYear() &&
      date.getMonth() === nowDate.getMonth() &&
      date.getDate() === nowDate.getDate()

    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const isYesterday =
      date.getFullYear() === yesterday.getFullYear() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getDate() === yesterday.getDate()

    if (isToday) {
      return { key: 'today', label: 'Today' }
    }
    if (isYesterday) {
      return { key: 'yesterday', label: 'Yesterday' }
    }

    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ]
    return {
      key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
      label: `${months[date.getMonth()]} ${date.getDate()}`
    }
  }

  if (groupBy === 'week') {
    const diffMs = now - timestamp
    const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000))
    if (diffWeeks <= 0) {
      return { key: 'this-week', label: 'This week' }
    }
    if (diffWeeks === 1) {
      return { key: 'last-week', label: 'Last week' }
    }
    return { key: `week-${diffWeeks}`, label: `${diffWeeks} weeks ago` }
  }

  // Month
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ]
  return {
    key: `${date.getFullYear()}-${date.getMonth()}`,
    label: `${months[date.getMonth()]} ${date.getFullYear()}`
  }
}

export function AutomationTimelineDashboard({
  entries,
  rows,
  _failures,
  loading,
  hasMore,
  onLoadMore,
  now,
  onOpenRun
}: {
  entries: readonly AutomationRunsDashboardEntry[]
  rows: readonly AutomationListRow[]
  _failures: readonly AutomationRunsDashboardFailure[]
  loading: boolean
  hasMore: boolean
  onLoadMore: () => void
  now: number
  onOpenRun: (entry: AutomationRunsDashboardEntry) => void
}): React.JSX.Element {
  const [groupBy, setGroupBy] = useState<GroupByOption>('day')
  const [selectedAutoName, setSelectedAutoName] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<AutomationRunsStatusFilter>('all')

  // Automation name options
  const autoOptions = useMemo(() => {
    const set = new Set<string>()
    for (const r of rows) {
      if (r.automation?.name) {
        set.add(r.automation.name)
      }
    }
    return Array.from(set).sort()
  }, [rows])

  // Filter entries
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // Filter by automation name
      if (selectedAutoName !== 'all' && entry.row.automation.name !== selectedAutoName) {
        return false
      }
      // Filter by status
      if (statusFilter === 'successful' && entry.run.status !== 'completed') {
        return false
      }
      if (statusFilter === 'failed' && entry.run.status !== 'dispatch_failed') {
        return false
      }
      if (statusFilter === 'active') {
        const isAct =
          entry.run.status === 'pending' ||
          entry.run.status === 'dispatching' ||
          entry.run.status === 'dispatched'
        if (!isAct) {
          return false
        }
      }
      if (statusFilter === 'skipped' && !entry.run.status.startsWith('skipped')) {
        return false
      }
      return true
    })
  }, [entries, selectedAutoName, statusFilter])

  // Group entries
  const groups = useMemo(() => {
    const map = new Map<string, { label: string; items: AutomationRunsDashboardEntry[] }>()

    for (const entry of filteredEntries) {
      const g = getGroupKey(entry.run.scheduledFor, groupBy, now)
      if (!map.has(g.key)) {
        map.set(g.key, { label: g.label, items: [] })
      }
      map.get(g.key)!.items.push(entry)
    }

    return Array.from(map.values())
  }, [filteredEntries, groupBy, now])

  return (
    <div className="flex flex-col gap-5 pb-8">
      {/* Filter and Grouping Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Grouping Pills */}
        <div className="inline-flex items-center rounded-xl border border-neutral-800 bg-neutral-900/60 p-1 text-xs font-medium">
          {(
            [
              { id: 'day', label: 'Group by day' },
              { id: 'week', label: 'Group by week' },
              { id: 'month', label: 'Group by month' }
            ] as const
          ).map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setGroupBy(g.id)}
              className={cn(
                'rounded-lg px-3 py-1 transition-all',
                groupBy === g.id
                  ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              )}
            >
              {g.label}
            </button>
          ))}
        </div>

        {/* Right: Dropdowns */}
        <div className="flex items-center gap-2">
          {/* Automation selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 rounded-xl border-neutral-800 bg-neutral-900/60 px-3 text-xs text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100 max-w-[200px]"
              >
                <span className="truncate">
                  {selectedAutoName === 'all' ? 'All automations' : selectedAutoName}
                </span>
                <ChevronDown className="size-3 shrink-0 text-neutral-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="scrollbar-sleek w-56 max-h-72 overflow-auto"
            >
              <DropdownMenuRadioGroup value={selectedAutoName} onValueChange={setSelectedAutoName}>
                <DropdownMenuRadioItem value="all">All automations</DropdownMenuRadioItem>
                {autoOptions.map((name) => (
                  <DropdownMenuRadioItem key={name} value={name} className="truncate">
                    {name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Status selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 rounded-xl border-neutral-800 bg-neutral-900/60 px-3 text-xs text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100"
              >
                <span className="capitalize">
                  {statusFilter === 'all'
                    ? 'All statuses'
                    : statusFilter === 'successful'
                      ? 'Successful'
                      : statusFilter === 'failed'
                        ? 'Failed'
                        : statusFilter === 'active'
                          ? 'In progress'
                          : 'Skipped'}
                </span>
                <ChevronDown className="size-3 text-neutral-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuRadioGroup
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as AutomationRunsStatusFilter)}
              >
                <DropdownMenuRadioItem value="all">All statuses</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="successful">Successful</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="failed">Failed</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="active">In progress</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="skipped">Skipped</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Timeline Content */}
      {groups.length > 0 ? (
        <div className="space-y-8">
          {groups.map((group) => (
            <div key={group.label} className="space-y-3">
              {/* Group Header */}
              <h2 className="text-base font-semibold text-neutral-100 tracking-tight">
                {group.label}
              </h2>

              {/* Vertical Rail List */}
              <div className="relative pl-6 space-y-4 before:absolute before:left-[11px] before:top-3 before:bottom-3 before:w-[2px] before:bg-neutral-800/80">
                {group.items.map((entry) => {
                  const run = entry.run
                  const isCompleted = run.status === 'completed'
                  const isFailed =
                    run.status === 'dispatch_failed' || run.status.startsWith('skipped')

                  // Trigger label
                  const triggerText =
                    run.trigger === 'manual'
                      ? 'Manual'
                      : run.title?.toLowerCase().includes('missed')
                        ? 'Missed-run recovery'
                        : 'Scheduled'

                  // Approximate duration
                  const durationSec = Math.max(
                    3,
                    Math.round(
                      ((run.outputSnapshot?.capturedAt ||
                        run.usage?.collectedAt ||
                        run.scheduledFor + 3000) -
                        (run.startedAt || run.dispatchedAt || run.scheduledFor)) /
                        1000
                    )
                  )

                  return (
                    <div
                      key={entry.key}
                      role="button"
                      tabIndex={0}
                      onClick={() => onOpenRun(entry)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          onOpenRun(entry)
                        }
                      }}
                      className={cn(
                        'group relative rounded-xl border border-transparent p-3.5 transition-all text-left cursor-pointer',
                        'hover:bg-neutral-900/60 hover:border-neutral-800/80'
                      )}
                    >
                      {/* Node on rail */}
                      <div
                        className={cn(
                          'absolute -left-6 top-4 size-4 rounded-full border-2 flex items-center justify-center transition-transform group-hover:scale-110',
                          isCompleted
                            ? 'border-emerald-500 bg-emerald-950 text-emerald-400'
                            : isFailed
                              ? 'border-rose-500 bg-rose-950 text-rose-400'
                              : 'border-sky-500 bg-sky-950 text-sky-400 animate-pulse'
                        )}
                      >
                        {isCompleted ? (
                          <Check className="size-2.5 stroke-[3]" />
                        ) : isFailed ? (
                          <X className="size-2.5 stroke-[3]" />
                        ) : (
                          <span className="size-1.5 rounded-full bg-sky-400" />
                        )}
                      </div>

                      {/* Line 1: Time, Name, Scope Badge */}
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="text-xs font-semibold text-neutral-300">
                          {formatTimeOnly(run.scheduledFor)}
                        </span>
                        <span className="text-neutral-500 text-xs">·</span>
                        <span className="text-sm font-semibold text-neutral-100 group-hover:text-white truncate">
                          {entry.row.automation.name}
                        </span>
                        <span className="inline-flex items-center rounded-md border border-neutral-800 bg-neutral-900/80 px-2 py-0.5 text-[11px] font-medium text-neutral-400">
                          {entry.scope === 'local' ? 'Local' : 'Remote'}
                        </span>
                      </div>

                      {/* Line 2: Start time, Duration, Trigger */}
                      <div className="mt-1 flex items-center gap-2 text-xs text-neutral-400">
                        <span>{formatFullTime(run.scheduledFor)}</span>
                        <span>·</span>
                        <span>{durationSec}s</span>
                        <span>·</span>
                        <span>{triggerText}</span>
                      </div>

                      {/* Failure Alert Box */}
                      {isFailed && (
                        <div className="mt-3 rounded-lg border border-neutral-800/90 bg-neutral-950/70 p-3 text-xs">
                          <p className="text-neutral-300">
                            The Agent task did not finish this run. Open the task for details.
                          </p>
                          <div className="mt-1.5 flex items-center gap-1.5 font-medium text-rose-400">
                            <X className="size-3.5" />
                            <span>Failed · {run.error || 'Session archived or deleted'}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-neutral-800 bg-neutral-900/60 text-xs text-neutral-300 hover:bg-neutral-800"
                onClick={onLoadMore}
                disabled={loading}
              >
                {loading ? 'Loading more runs…' : 'Load more runs'}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-800/80 py-16 text-center">
          <Clock className="size-8 text-neutral-600 mb-2" />
          <p className="text-sm font-medium text-neutral-300">No run history found</p>
          <p className="mt-1 text-xs text-neutral-500">
            Runs will automatically appear here as your scheduled automations execute.
          </p>
        </div>
      )}
    </div>
  )
}
