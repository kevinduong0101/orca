import React from 'react'
import type { AutomationListRow } from './automation-list-row-identity'
import type {
  AutomationRunsDashboardEntry,
  AutomationRunsDashboardFailure
} from './automation-runs-dashboard-model'
import { AutomationTimelineDashboard } from './AutomationTimelineDashboard'

export function AutomationRunsDashboard({
  rows,
  entries,
  failures,
  loading,
  hasMore,
  onLoadMore,
  now,
  _onRefresh,
  onOpenRun
}: {
  rows: readonly AutomationListRow[]
  entries: readonly AutomationRunsDashboardEntry[]
  failures: readonly AutomationRunsDashboardFailure[]
  loading: boolean
  hasMore: boolean
  onLoadMore: () => void
  now: number
  _onRefresh: () => void
  onOpenRun: (entry: AutomationRunsDashboardEntry) => void
}): React.JSX.Element {
  return (
    <div className="scrollbar-sleek min-h-0 flex-1 overflow-auto px-3 pb-4 md:px-5">
      <AutomationTimelineDashboard
        entries={entries}
        rows={rows}
        failures={failures}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={onLoadMore}
        now={now}
        onOpenRun={onOpenRun}
      />
    </div>
  )
}
