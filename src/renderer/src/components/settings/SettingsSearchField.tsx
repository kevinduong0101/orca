import type { RefObject } from 'react'
import { Search, X } from 'lucide-react'
import { useShortcutKeyComboDetails } from '@/hooks/useShortcutLabel'
import { ShortcutKeyCombo } from '../ShortcutKeyCombo'
import { Input } from '../ui/input'
import { translate } from '@/i18n/i18n'
import { useAppStore } from '@/store'

export type SettingsSearchFieldProps = {
  searchInputRef?: RefObject<HTMLInputElement | null>
  searchAutoFocus?: boolean
}

export function SettingsSearchField({
  searchInputRef,
  searchAutoFocus = false
}: SettingsSearchFieldProps): React.JSX.Element {
  const searchQuery = useAppStore((state) => state.settingsSearchInputQuery)
  const onSearchChange = useAppStore((state) => state.setSettingsSearchQuery)
  const searchShortcutCombos = useShortcutKeyComboDetails('settings.search')

  return (
    <div className="border-b border-border/40 px-3 py-2.5">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/70" />
        <Input
          ref={searchInputRef}
          autoFocus={searchAutoFocus}
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={translate(
            'auto.components.settings.SettingsSidebar.dbceaa8840',
            'Tìm kiếm cài đặt...'
          )}
          className="h-8 bg-muted/30 pl-8 pr-12 text-xs rounded-lg border-border/50 focus-visible:bg-background transition-colors"
        />
        {searchQuery === '' ? (
          <span className="pointer-events-none absolute right-2 top-1/2 flex -translate-y-1/2 items-center">
            {searchShortcutCombos.map((combo) => (
              <ShortcutKeyCombo
                key={combo.keys.join('-')}
                keys={combo.keys}
                doubleTap={combo.doubleTap}
                className="inline-flex gap-0.5"
                separatorClassName="text-[10px] text-muted-foreground"
              />
            ))}
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
