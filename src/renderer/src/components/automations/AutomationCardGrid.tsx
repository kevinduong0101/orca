import React, { useMemo, useState } from 'react'
import { ArrowUpDown, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type {
  ExternalAutomationAction,
  ExternalAutomationJob
} from '../../../../shared/automations-types'
import { AutomationCard } from './AutomationCard'
import type { AutomationListRow } from './automation-list-row-identity'
import type { AutomationListViewItem } from './automation-list-view'

export type ScopeFilter = 'all' | 'local' | 'remote'
export type SortOption = 'newest' | 'oldest' | 'name' | 'schedule'

const SORT_LABELS: Record<SortOption, string> = {
  newest: 'Newest first',
  oldest: 'Oldest first',
  name: 'Name A-Z',
  schedule: 'Schedule'
}

export function AutomationCardGrid({
  items,
  selectedRowKey,
  selectedExternalKey,
  now,
  onSelectRow,
  onSelectExternal,
  onToggle,
  onRunNow,
  onEdit,
  onDelete,
  onRequestExternalAction,
  onOpenCreate
}: {
  items: readonly AutomationListViewItem[]
  selectedRowKey: string | null
  selectedExternalKey: string | null
  now: number
  onSelectRow: (rowKey: string) => void
  onSelectExternal: (key: string) => void
  onToggle: (row: AutomationListRow) => void
  onRunNow: (row: AutomationListRow) => void
  onEdit: (row: AutomationListRow) => void
  onDelete: (row: AutomationListRow) => void
  onRequestExternalAction?: (action: ExternalAutomationAction, entry: ExternalAutomationJob) => void
  onOpenCreate: () => void
}): React.JSX.Element {
  const [scope, setScope] = useState<ScopeFilter>('all')
  const [sort, setSort] = useState<SortOption>('newest')

  // Filter by scope
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (scope === 'all') {
        return true
      }
      if (scope === 'local') {
        if (item.kind === 'local') {
          return item.row.automation.executionTargetType !== 'ssh'
        }
        return false
      }
      if (scope === 'remote') {
        if (item.kind === 'local') {
          return item.row.automation.executionTargetType === 'ssh'
        }
        return true
      }
      return true
    })
  }, [items, scope])

  // Sort items
  const sortedItems = useMemo(() => {
    const list = [...filteredItems]
    if (sort === 'newest') {
      list.sort((a, b) => {
        const timeA = a.kind === 'local' ? a.row.automation.createdAt || 0 : 0
        const timeB = b.kind === 'local' ? b.row.automation.createdAt || 0 : 0
        return timeB - timeA
      })
    } else if (sort === 'oldest') {
      list.sort((a, b) => {
        const timeA = a.kind === 'local' ? a.row.automation.createdAt || 0 : 0
        const timeB = b.kind === 'local' ? b.row.automation.createdAt || 0 : 0
        return timeA - timeB
      })
    } else if (sort === 'name') {
      list.sort((a, b) => {
        const nameA = a.kind === 'local' ? a.row.automation.name : a.entry.name
        const nameB = b.kind === 'local' ? b.row.automation.name : b.entry.name
        return nameA.localeCompare(nameB)
      })
    }
    return list
  }, [filteredItems, sort])

  return (
    <div className="flex flex-col gap-4">
      {/* Controls Bar */}
      <div className="flex items-center justify-end gap-2.5">
        {/* Scope Pill Filter */}
        <div className="inline-flex items-center rounded-xl border border-neutral-800 bg-neutral-900/60 p-1 text-xs font-medium">
          {(['all', 'local', 'remote'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScope(s)}
              className={cn(
                'rounded-lg px-3 py-1 transition-all capitalize',
                scope === s
                  ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              )}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 rounded-xl border-neutral-800 bg-neutral-900/60 px-3 text-xs text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100"
            >
              <ArrowUpDown className="size-3 text-neutral-400" />
              <span>{SORT_LABELS[sort]}</span>
              <ChevronDown className="size-3 text-neutral-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuRadioGroup value={sort} onValueChange={(v) => setSort(v as SortOption)}>
              <DropdownMenuRadioItem value="newest">Newest first</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="oldest">Oldest first</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="name">Name A-Z</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="schedule">Schedule</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 2-Column Responsive Card Grid */}
      {sortedItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-8">
          {sortedItems.map((item) => {
            const isSelected =
              item.kind === 'local' ? selectedRowKey === item.id : selectedExternalKey === item.id

            return (
              <AutomationCard
                key={item.id}
                item={item}
                now={now}
                isSelected={isSelected}
                onSelect={() => {
                  if (item.kind === 'local') {
                    onSelectRow(item.id)
                  } else {
                    onSelectExternal(item.id)
                  }
                }}
                onToggle={onToggle}
                onRunNow={onRunNow}
                onEdit={onEdit}
                onDelete={onDelete}
                onRequestExternalAction={onRequestExternalAction}
              />
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-800/80 py-16 text-center">
          <p className="text-sm font-medium text-neutral-300">No automations found</p>
          <p className="mt-1 text-xs text-neutral-500">
            {items.length === 0
              ? 'Create your first automation to run agent workflows on a schedule.'
              : 'No automations match the selected filter.'}
          </p>
          {items.length === 0 && (
            <Button
              size="sm"
              className="mt-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium"
              onClick={onOpenCreate}
            >
              + Create automation
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
