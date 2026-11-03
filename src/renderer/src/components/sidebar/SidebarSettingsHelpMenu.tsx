import React, { useState } from 'react'
import { CircleHelp, Keyboard, RotateCw, Settings } from 'lucide-react'
import { toast } from 'sonner'
import { useAppStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useMountedRef } from '@/hooks/useMountedRef'
import { useShortcutKeyDetails } from '@/hooks/useShortcutLabel'
import { ShortcutKeyCombo } from '@/components/ShortcutKeyCombo'
import { translate } from '@/i18n/i18n'

export function SidebarSettingsHelpMenu(): React.JSX.Element {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isRestartingOrca, setIsRestartingOrca] = useState(false)
  const openSettingsPage = useAppStore((s) => s.openSettingsPage)
  const openSettingsTarget = useAppStore((s) => s.openSettingsTarget)
  const settingsShortcut = useShortcutKeyDetails('settings.open')
  const mountedRef = useMountedRef()

  const handleMenuOpenChange = (open: boolean): void => {
    setMenuOpen(open)
  }

  const handleRestartOrca = (): void => {
    if (isRestartingOrca) {
      return
    }
    setIsRestartingOrca(true)
    void window.api.relaunchApp().catch(() => {
      if (mountedRef.current) {
        setIsRestartingOrca(false)
      }
      toast.error(
        translate(
          'auto.components.sidebar.SidebarSettingsHelpMenu.357d6e83ef',
          'Failed to restart app. Please try quitting and reopening.'
        )
      )
    })
  }

  const openShortcutsSettings = (): void => {
    openSettingsTarget({ pane: 'shortcuts', repoId: null })
    openSettingsPage()
  }

  return (
    <div className="flex items-center gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            type="button"
            aria-label={translate(
              'auto.components.sidebar.SidebarSettingsHelpMenu.a428c25998',
              'Settings'
            )}
            className="text-muted-foreground"
            onClick={openSettingsPage}
          >
            <Settings className="size-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={4} className="flex items-center gap-1.5">
          {translate('auto.components.sidebar.SidebarSettingsHelpMenu.a428c25998', 'Settings')}
          {settingsShortcut.keys.length > 0 ? (
            <ShortcutKeyCombo
              keys={settingsShortcut.keys}
              doubleTap={settingsShortcut.doubleTap}
              className="gap-0.5"
              keyCapClassName="min-w-0 border-background/20 bg-background/10 px-1 py-0 text-[10px] text-background shadow-none"
              separatorClassName="text-[10px] text-background/70"
            />
          ) : null}
        </TooltipContent>
      </Tooltip>
      <DropdownMenu modal={false} open={menuOpen} onOpenChange={handleMenuOpenChange}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                type="button"
                aria-label={translate(
                  'auto.components.sidebar.SidebarSettingsHelpMenu.2991a0106c',
                  'Help'
                )}
                className="text-muted-foreground"
              >
                <CircleHelp className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={4}>
            {translate('auto.components.sidebar.SidebarSettingsHelpMenu.2991a0106c', 'Help')}
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent side="top" align="start" sideOffset={8} className="w-52">
          <DropdownMenuItem onSelect={openShortcutsSettings}>
            <Keyboard className="size-3.5" />
            {translate(
              'auto.components.sidebar.SidebarSettingsHelpMenu.e565171a7c',
              'Keyboard Shortcuts'
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={handleRestartOrca} disabled={isRestartingOrca}>
            <RotateCw className="size-3.5" />
            Restart Kevin Studio
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
