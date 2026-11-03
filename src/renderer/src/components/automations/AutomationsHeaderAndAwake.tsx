import React from 'react'
import { Info, Plus, RefreshCw, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useAppStore } from '@/store'
import {
  computerAwakeSettingsForMode,
  normalizeComputerAwakeMode
} from '../../../../shared/computer-awake-mode'

export function AutomationsHeaderAndAwake({
  onRefresh,
  isRefreshing,
  onOpenCreate,
  onCreateWithAI
}: {
  onRefresh: () => void
  isRefreshing: boolean
  onOpenCreate: () => void
  onCreateWithAI?: () => void
}): React.JSX.Element {
  const settings = useAppStore((s) => s.settings)
  const updateSettings = useAppStore((s) => s.updateSettings)

  const isAwake =
    normalizeComputerAwakeMode(
      settings.computerAwakeMode,
      settings.keepComputerAwakeWhileAgentsRun
    ) !== 'off'

  const handleToggleAwake = (checked: boolean): void => {
    void updateSettings(computerAwakeSettingsForMode(checked ? 'on' : 'off'))
  }

  return (
    <div className="flex flex-col gap-4 pb-2">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-100">Automations</h1>
          <p className="text-xs text-neutral-400 sm:text-sm">
            Start Agent work automatically on a schedule and review every run in one place.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-9 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/60 rounded-xl"
                onClick={onRefresh}
                disabled={isRefreshing}
                aria-label="Refresh"
              >
                <RefreshCw
                  className={isRefreshing ? 'size-4 animate-spin text-emerald-400' : 'size-4'}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh automations and runs</TooltipContent>
          </Tooltip>

          {onCreateWithAI && (
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 rounded-xl border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800 text-neutral-200 hover:text-white px-3.5 text-xs font-medium"
              onClick={onCreateWithAI}
            >
              <Sparkles className="size-3.5 text-amber-400" />
              <span>Create with Qoder</span>
            </Button>
          )}

          <Button
            size="sm"
            className="h-9 gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 text-xs shadow-sm transition-all"
            onClick={onOpenCreate}
          >
            <Plus className="size-4 stroke-[2.5]" />
            <span>New automation</span>
          </Button>
        </div>
      </div>

      {/* Keep Device Awake Banner */}
      <div className="flex items-center justify-between rounded-xl border border-sky-900/40 bg-sky-950/20 px-4 py-2.5 text-xs sm:text-sm text-sky-200 transition-colors hover:border-sky-800/50">
        <div className="flex items-center gap-2.5 min-w-0 pr-4">
          <Info className="size-4 shrink-0 text-sky-400" />
          <div className="truncate">
            <span className="font-semibold text-sky-200">Keep device awake</span>
            <span className="ml-2 text-sky-300/80">
              Prevent system sleep while Orca is running so schedules and active Agent tasks are not
              interrupted.
            </span>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <Switch
            checked={isAwake}
            onCheckedChange={handleToggleAwake}
            className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-neutral-800"
            aria-label="Keep device awake toggle"
          />
        </div>
      </div>
    </div>
  )
}
