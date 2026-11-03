import React from 'react'
import { cn } from '@/lib/utils'

export type AutomationsMainTab = 'automations' | 'templates' | 'runs'

export function AutomationsNavigationTabs({
  activeTab,
  onTabChange,
  rightControls
}: {
  activeTab: AutomationsMainTab
  onTabChange: (tab: AutomationsMainTab) => void
  rightControls?: React.ReactNode
}): React.JSX.Element {
  const tabs: { key: AutomationsMainTab; label: string }[] = [
    { key: 'automations', label: 'Automations' },
    { key: 'templates', label: 'Templates' },
    { key: 'runs', label: 'Run history' }
  ]

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800/60 pb-3 pt-1">
      {/* Tabs */}
      <div className="flex items-center gap-6 text-sm">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={cn(
                'relative py-1 font-medium transition-colors hover:text-neutral-100',
                isActive ? 'text-emerald-400 font-semibold' : 'text-neutral-400'
              )}
            >
              {tab.label}
              {isActive && (
                <span className="absolute -bottom-3 left-0 right-0 h-0.5 rounded-full bg-emerald-500" />
              )}
            </button>
          )
        })}
      </div>

      {/* Right controls */}
      {rightControls && <div className="flex items-center gap-2">{rightControls}</div>}
    </div>
  )
}
