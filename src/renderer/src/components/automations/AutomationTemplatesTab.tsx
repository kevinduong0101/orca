import React from 'react'
import { Clock, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getAutomationTemplates, type AutomationTemplate } from './automation-templates'

export function AutomationTemplatesTab({
  onApplyTemplate
}: {
  onApplyTemplate: (template: AutomationTemplate) => void
}): React.JSX.Element {
  const templates = getAutomationTemplates()

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-neutral-100">Starter Templates</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Choose a battle-tested schedule template and let Orca Agents handle your recurring
            maintenance.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="flex flex-col justify-between rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-5 transition-all hover:border-neutral-700/80 hover:bg-neutral-900/90"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center rounded-md border border-neutral-800 bg-neutral-800/60 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
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
                className="gap-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-100 text-xs font-medium"
                onClick={() => onApplyTemplate(tpl)}
              >
                <Sparkles className="size-3.5 text-emerald-400" />
                <span>Use this template</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
