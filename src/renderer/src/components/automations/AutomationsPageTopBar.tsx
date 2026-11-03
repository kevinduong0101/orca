import React from 'react'
import { AutomationOwnerConflictNotice } from './AutomationOwnerConflictNotice'
import { AutomationsPageBreadcrumb } from './AutomationsPageBreadcrumb'
import type { AutomationHostRecoveryAction } from './automation-host-status-descriptors'
import type { AutomationActionNotice } from './automation-row-action-dispatch'

export function AutomationsPageTopBar({
  pageView,
  isDetailOpen,
  selectedAutomationName,
  runPageOrigin,
  ownerNotice,
  recoverOwnerAction,
  dismissOwnerAction,
  showAutomationsList,
  showRunsDashboard,
  showAutomationDetails
}: {
  pageView: 'automations' | 'runs' | 'run'
  isDetailOpen: boolean
  selectedAutomationName?: string
  runPageOrigin: 'automation' | 'runs'
  ownerNotice: AutomationActionNotice | null
  recoverOwnerAction: (action: AutomationHostRecoveryAction) => void
  dismissOwnerAction: () => void
  showAutomationsList: () => void
  showRunsDashboard: () => void
  showAutomationDetails: () => void
}): React.JSX.Element | null {
  const showBreadcrumb = pageView === 'run' || (isDetailOpen && Boolean(selectedAutomationName))

  return (
    <>
      {showBreadcrumb && (
        <header
          className="flex shrink-0 items-center px-3 pb-3 md:px-5"
          style={{ paddingRight: 'max(0.75rem, var(--window-controls-width, 0px))' }}
        >
          {pageView === 'run' ? (
            <AutomationsPageBreadcrumb
              current="run"
              onBackToAutomations={showAutomationsList}
              onBackToRuns={showRunsDashboard}
              automationName={runPageOrigin === 'automation' ? selectedAutomationName : undefined}
              onBackToAutomation={showAutomationDetails}
            />
          ) : (
            <AutomationsPageBreadcrumb
              current="automation"
              automationName={selectedAutomationName}
              onBackToAutomations={showAutomationsList}
            />
          )}
        </header>
      )}
      <AutomationOwnerConflictNotice
        notice={ownerNotice}
        className="mx-4 mb-2"
        onRecover={recoverOwnerAction}
        onDismiss={dismissOwnerAction}
      />
    </>
  )
}
