import { useEffect, useRef } from 'react'
import { Badge } from '../ui/badge'
import type { SlashCommandEntry } from '../../../../shared/slash-command-types'

export type SlashCommandPaletteProps = {
  commands: SlashCommandEntry[]
  selectedIndex: number
  onSelectCommand: (command: SlashCommandEntry) => void
  onClose?: () => void
}

export function SlashCommandPalette({
  commands,
  selectedIndex,
  onSelectCommand
}: SlashCommandPaletteProps): React.JSX.Element | null {
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!listRef.current) {
      return
    }

    const activeItem = listRef.current.querySelector('[data-selected="true"]') as HTMLElement | null
    if (activeItem) {
      activeItem.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  if (commands.length === 0) {
    return null
  }

  return (
    <div
      ref={listRef}
      className="absolute bottom-full left-0 mb-2 w-full max-w-lg overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl backdrop-blur-md z-50 animate-in fade-in-0 zoom-in-95"
    >
      <div className="border-b border-border/40 px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground flex items-center justify-between">
        <span>Gợi ý lệnh Slash Commands (Orca Next)</span>
        <span className="text-[10px] text-muted-foreground/80 lowercase">
          ↑↓ để chọn · Enter/Tab để chèn
        </span>
      </div>

      <div className="max-h-64 overflow-y-auto p-1.5 scrollbar-sleek space-y-0.5">
        {commands.map((cmd, idx) => {
          const isSelected = idx === selectedIndex

          return (
            <button
              key={cmd.id}
              type="button"
              data-selected={isSelected ? 'true' : undefined}
              onClick={() => onSelectCommand(cmd)}
              className={`flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${
                isSelected
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-muted/60 text-foreground'
              }`}
            >
              <div className="flex flex-1 flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-primary">{cmd.name}</span>
                  {cmd.argumentHint && (
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {cmd.argumentHint}
                    </span>
                  )}
                  <Badge
                    variant="outline"
                    className={`ml-auto text-[9px] px-1 py-0 uppercase font-mono ${
                      cmd.source === 'project'
                        ? 'border-blue-500/30 text-blue-600 bg-blue-500/10'
                        : 'border-border/60 text-muted-foreground'
                    }`}
                  >
                    {cmd.source}
                  </Badge>
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-1">
                  {cmd.description}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
