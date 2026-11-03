import React, { useRef } from 'react'
import { cn } from '@/lib/utils'
import type {
  ExternalAutomationAction,
  ExternalAutomationJob
} from '../../../../shared/automations-types'
import type { AutomationHostFilter } from '../../../../shared/automation-host-filter'
import type { SshConnectionState } from '../../../../shared/ssh-types'
import type { ProjectHostSetup } from '../../../../shared/project-types'
import type { Repo } from '../../../../shared/repo-types'
import type { Worktree } from '../../../../shared/worktree/types'
import type { RuntimeEnvironmentStatus } from '../../../../shared/runtime-host-status'
import type { TaskSourceHostAvailability } from '../task-source-context-summary'
import type { AutomationHostTarget } from './automation-host-client'
import type { AutomationListRow } from './automation-list-row-identity'
import type { AutomationPaneTab } from './automation-page-state'
import {
  isAutomationListFilterActive,
  type AutomationListFilter,
  type AutomationListSort,
  type AutomationListSortField,
  type AutomationListViewItem
} from './automation-list-view'
import type { ExternalAutomationListEntry } from './external-automation-list-entries'
import { AutomationHostFilterNotice } from './AutomationHostFilterNotice'
import { AutomationListEmptyView } from './AutomationListEmptyView'
import { resolveAutomationListEmptyState } from './automation-list-empty-state'
import type { AutomationListSearchCounts } from './use-automation-list-search'
import type { AutomationHostCatalogView } from './use-automation-host-catalog'
import type { AutomationHostRecoveryAction } from './automation-host-status-descriptors'
import type { AutomationHostCatalogEntry } from './automation-host-catalog-types'
import { useAutomationListFocusRecovery } from './use-automation-list-focus-recovery'
import { AutomationTemplateEmptyState } from './AutomationTemplateEmptyState'
import { AutomationCardGrid } from './AutomationCardGrid'

const TEMPLATE_EMPTY_STATES: ReadonlySet<string> = new Set(['host-empty', 'all-hosts-empty'])

export type AutomationsListPanelProps = {
  hasListItems: boolean
  hasFilteredListItems: boolean
  listSearchQuery: string
  isListSearchQueryTooLarge: boolean
  onListSearchQueryChange: (query: string) => void
  listFilter: AutomationListFilter
  onListFilterChange: (filter: AutomationListFilter) => void
  searchCounts: AutomationListSearchCounts
  hostCatalog: AutomationHostCatalogView
  externalManagersUncheckedNotice: string | null
  onSelectHost: (filter: AutomationHostFilter) => void
  onRecoverHost: (
    action: AutomationHostRecoveryAction,
    entry?: AutomationHostCatalogEntry | null
  ) => void
  sortedListItems: readonly AutomationListViewItem[]
  listSort: AutomationListSort | null
  onListSortChange: (field: AutomationListSortField) => void
  selectedRowKey: string | null
  selectedExternalKey: string | null
  selectedExternal?: ExternalAutomationListEntry | null
  relativeNow: number
  repoMap: ReadonlyMap<string, Repo>
  worktreeMap: ReadonlyMap<string, Worktree>
  repoForRow: (row: AutomationListRow) => Repo | null
  worktreeForRow: (row: AutomationListRow) => Worktree | null
  projectHostSetups: readonly ProjectHostSetup[]
  sshConnectionStates: ReadonlyMap<string, SshConnectionState>
  sshStateByEnvironment: ReadonlyMap<string, SshConnectionState>
  runtimeStatusByEnvironmentId: ReadonlyMap<string, RuntimeEnvironmentStatus>
  hostTargetFor: (row: AutomationListRow) => AutomationHostTarget
  automationSourceHostAvailabilityByRowKey: ReadonlyMap<string, TaskSourceHostAvailability>
  hostLabelById: ReadonlyMap<string, string>
  isActionEnabled: (action: 'run' | 'edit' | 'toggle' | 'delete', row: AutomationListRow) => boolean
  externalActionKey: string | null
  selectAutomationRow: (rowKey: string | null) => void
  selectExternalKey: (key: string | null) => void
  setActivePaneTab: (tab: AutomationPaneTab) => void
  runNow: (row: AutomationListRow) => void
  openEditDialog: (row: AutomationListRow) => void
  toggleAutomation: (row: AutomationListRow) => void
  requestDeleteAutomation: (row: AutomationListRow) => void
  requestExternalAction?: (action: ExternalAutomationAction, entry: ExternalAutomationJob) => void
  openCreateDialog: () => void
  canCreateAutomation: boolean
  onOpenDetail: () => void
  onRefresh: () => void
  isRefreshing: boolean
  onOpenRuns: () => void
}

export function AutomationsListPanel(props: AutomationsListPanelProps): React.JSX.Element {
  const {
    hasListItems,
    hasFilteredListItems,
    listFilter,
    searchCounts,
    hostCatalog,
    externalManagersUncheckedNotice,
    onRecoverHost,
    sortedListItems,
    selectedRowKey,
    selectedExternalKey,
    relativeNow,
    selectAutomationRow,
    selectExternalKey,
    setActivePaneTab,
    runNow,
    openEditDialog,
    toggleAutomation,
    requestDeleteAutomation,
    requestExternalAction,
    openCreateDialog,
    onOpenDetail
  } = props

  const listRef = useRef<HTMLDivElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)

  const rowKeys = React.useMemo(
    () => sortedListItems.filter((item) => item.kind === 'local').map((item) => item.id),
    [sortedListItems]
  )

  useAutomationListFocusRecovery({
    rowKeys,
    containerRef: listRef,
    fallbackRef: toolbarRef
  })

  const listFilterActive = isAutomationListFilterActive(listFilter)
  const emptyStateInput = {
    resolution: hostCatalog.resolution,
    ...searchCounts,
    filterActive: listFilterActive
  }
  const emptyState = resolveAutomationListEmptyState(emptyStateInput)

  return (
    <section
      className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 pb-4 md:px-5"
      data-contextual-tour-target="automations-list"
    >
      <AutomationHostFilterNotice
        resolution={hostCatalog.resolution}
        onRecover={(action) => onRecoverHost(action)}
        className="mb-2"
      />
      {externalManagersUncheckedNotice ? (
        <p className="pb-2 text-[11px] text-muted-foreground" data-external-managers="unchecked">
          {externalManagersUncheckedNotice}
        </p>
      ) : null}

      <div ref={listRef} className={cn('scrollbar-sleek min-h-0 flex-1 overflow-auto')}>
        {hasFilteredListItems ? (
          <AutomationCardGrid
            items={sortedListItems}
            selectedRowKey={selectedRowKey}
            selectedExternalKey={selectedExternalKey}
            now={relativeNow}
            onSelectRow={(rowKey) => {
              selectExternalKey(null)
              selectAutomationRow(rowKey)
              onOpenDetail()
            }}
            onSelectExternal={(key) => {
              selectAutomationRow(null)
              selectExternalKey(key)
              setActivePaneTab('overview')
              onOpenDetail()
            }}
            onToggle={toggleAutomation}
            onRunNow={runNow}
            onEdit={openEditDialog}
            onDelete={requestDeleteAutomation}
            onRequestExternalAction={requestExternalAction}
            onOpenCreate={openCreateDialog}
          />
        ) : (
          <AutomationListEmptyView
            {...emptyStateInput}
            onRecover={(action) => onRecoverHost(action)}
          />
        )}

        {!hasListItems && TEMPLATE_EMPTY_STATES.has(emptyState.kind) ? (
          <AutomationTemplateEmptyState onOpenCreate={openCreateDialog} />
        ) : null}
      </div>
    </section>
  )
}
