import React, { useState } from 'react'
import { Clock, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getAutomationTemplates, type AutomationTemplate } from './automation-templates'

export function AutomationTemplatesTab({
  onApplyTemplate
}: {
  onApplyTemplate: (template: AutomationTemplate) => void
}): React.JSX.Element {
  const templates = getAutomationTemplates()
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'marketing' | 'engineering'>('all')

  const filteredTemplates = templates.filter((tpl) => {
    if (selectedFilter === 'marketing') {
      return tpl.category === 'Marketing OS'
    }
    if (selectedFilter === 'engineering') {
      return tpl.category !== 'Marketing OS'
    }
    return true
  })

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-neutral-100">Starter Templates</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Choose a battle-tested schedule template and let Orca Agents handle your recurring
            workflows.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 rounded-xl bg-neutral-900/80 p-1 border border-neutral-800 text-xs shrink-0">
          <button
            type="button"
            onClick={() => setSelectedFilter('all')}
            className={cn(
              'px-2.5 py-1 rounded-lg font-medium transition-colors',
              selectedFilter === 'all'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            )}
          >
            All ({templates.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('marketing')}
            className={cn(
              'px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1',
              selectedFilter === 'marketing'
                ? 'bg-purple-950/60 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            )}
          >
            <span>Marketing OS</span>
            <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1 rounded-full">
              5
            </span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('engineering')}
            className={cn(
              'px-2.5 py-1 rounded-lg font-medium transition-colors',
              selectedFilter === 'engineering'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            )}
          >
            Engineering (4)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map((tpl) => {
          const isMarketing = tpl.category === 'Marketing OS'

          return (
            <div
              key={tpl.id}
              className={cn(
                'flex flex-col justify-between rounded-2xl border p-5 transition-all duration-200 backdrop-blur-md',
                isMarketing
                  ? 'border-purple-500/30 bg-neutral-900/70 hover:border-purple-500/50 hover:bg-neutral-900/90 hover:shadow-lg hover:shadow-purple-950/20'
                  : 'border-neutral-800/80 bg-neutral-900/60 hover:border-neutral-700/80 hover:bg-neutral-900/90'
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      'inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium',
                      isMarketing
                        ? 'border-purple-500/30 bg-purple-500/10 text-purple-300'
                        : 'border-neutral-800 bg-neutral-800/60 text-emerald-400'
                    )}
                  >
                    {tpl.category}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-neutral-400 capitalize">
                    <Clock className="size-3 text-neutral-500" />
                    {tpl.preset}
                    {tpl.time ? ` at ${tpl.time}` : ''}
                  </span>
                </div>

                <h3 className="mt-3 text-[15px] font-semibold text-neutral-100">{tpl.label}</h3>
                <p className="mt-1 text-xs text-neutral-400 leading-relaxed">{tpl.description}</p>

                <div className="mt-3 rounded-xl border border-neutral-800/60 bg-neutral-950/60 p-3">
                  <p className="line-clamp-3 text-xs text-neutral-400 font-mono leading-relaxed">
                    {tpl.prompt}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end border-t border-neutral-800/60 pt-3">
                <Button
                  size="sm"
                  className={cn(
                    'gap-1.5 rounded-xl text-xs font-medium transition-colors',
                    isMarketing
                      ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-950'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-100'
                  )}
                  onClick={() => onApplyTemplate(tpl)}
                >
                  <Sparkles
                    className={cn('size-3.5', isMarketing ? 'text-amber-300' : 'text-emerald-400')}
                  />
                  <span>Use this template</span>
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
