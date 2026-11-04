import type { RefObject } from 'react'
import { useMemo } from 'react'
import { ArrowLeft, Search, X } from 'lucide-react'
import type { RepoIcon } from '../../../../shared/repo-icon'
import type { GitHubRepositoryIdentity } from '../../../../shared/github/pull-request-types'
import type { GlobalSettings } from '../../../../shared/global-settings-types'
import { useShortcutKeyComboDetails } from '@/hooks/useShortcutLabel'
import { ShortcutKeyCombo } from '../ShortcutKeyCombo'
import { cn } from '@/lib/utils'
import { RepoIconGlyph } from '../repo/repo-icon'
import { RepoForkIndicator } from '../repo/repo-fork-indicator'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { SetupGuideProgressRing } from '../setup-guide/SetupGuideProgressRing'
import { useSettingsSetupGuideProgress } from './settings-setup-guide-progress'
import type { SettingsSetupGuideProgress } from './settings-setup-guide-progress'
import { translate } from '@/i18n/i18n'
import { resolveLeftSidebarStyleVariables } from '@/lib/left-sidebar-appearance'
import { useAppStore } from '@/store'
import {
  groupSectionsByModernCategory,
  type NavGroup,
  type NavSection
} from './settings-sidebar-groups'

type RepoNavSection = NavSection & {
  badgeColor?: string
  isRemote?: boolean
  repoIcon?: RepoIcon | null
  upstream?: GitHubRepositoryIdentity | null
}

type SettingsSidebarProps = {
  activeSectionId: string
  settings: GlobalSettings | null
  generalGroups: NavGroup[]
  repoSections: RepoNavSection[]
  hasRepos: boolean
  searchInputRef?: RefObject<HTMLInputElement | null>
  searchAutoFocus?: boolean
  onBack: () => void
  onSelectSection: (sectionId: string) => void
}

function SettingsSearchField({
  searchInputRef,
  searchAutoFocus = false
}: Pick<SettingsSidebarProps, 'searchInputRef' | 'searchAutoFocus'>): React.JSX.Element {
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

function SettingsSetupGuideNavRow({
  progress,
  setupActive,
  onSelect
}: {
  progress: SettingsSetupGuideProgress
  setupActive: boolean
  onSelect: () => void
}): React.JSX.Element {
  return (
    <button
      type="button"
      aria-current={setupActive ? 'page' : undefined}
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left outline-none transition-colors',
        setupActive
          ? 'bg-primary/10 font-medium text-primary'
          : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
      )}
    >
      <SetupGuideProgressRing
        done={progress.doneCount}
        total={progress.total}
        sizeClassName="size-4"
        tooltipLabel={`${progress.doneCount}/${progress.total} hoàn thành`}
      />
      <span className="truncate text-xs font-medium">Hướng dẫn thiết lập ban đầu</span>
    </button>
  )
}

export function SettingsSidebar({
  activeSectionId,
  settings,
  generalGroups,
  repoSections,
  hasRepos: _hasRepos,
  searchInputRef,
  searchAutoFocus = false,
  onBack,
  onSelectSection
}: SettingsSidebarProps): React.JSX.Element {
  const setupGuideProgress = useSettingsSetupGuideProgress(true)
  const leftSidebarStyle = useMemo(() => resolveLeftSidebarStyleVariables(settings), [settings])
  const searchQuery = useAppStore((state) => state.settingsSearchInputQuery)
  const isSearching = searchQuery.trim().length > 0

  const modernGroups = useMemo(() => {
    if (isSearching) {
      return generalGroups.map((g) => ({
        category: { id: g.id, title: g.title, subtitle: '', icon: Search },
        sections: g.sections
      }))
    }
    return groupSectionsByModernCategory(generalGroups)
  }, [generalGroups, isSearching])

  const showSetupGuideTopRow =
    setupGuideProgress.ready && setupGuideProgress.doneCount < setupGuideProgress.total

  const renderSectionBadge = (section: NavSection): React.JSX.Element | null => {
    if (section.id === 'accounts') {
      return (
        <span className="ml-auto rounded-full bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.2 text-[9px] font-semibold text-emerald-500">
          Multi-Account
        </span>
      )
    }
    if (section.badge) {
      return (
        <span className="ml-auto rounded-full bg-muted/60 px-1.5 py-0.2 text-[9px] font-medium text-muted-foreground">
          {section.badge}
        </span>
      )
    }
    return null
  }

  return (
    <aside
      className="flex w-[290px] shrink-0 flex-col border-r border-border/50 bg-background/95 backdrop-blur-sm"
      style={leftSidebarStyle}
    >
      <div className="border-b border-border/40 px-3 py-2.5 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="h-8 gap-2 px-2 text-xs text-muted-foreground hover:text-foreground font-medium"
        >
          <ArrowLeft className="size-3.5" />
          <span>Quay lại ứng dụng</span>
        </Button>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
          Kevin Studio
        </span>
      </div>

      <SettingsSearchField searchInputRef={searchInputRef} searchAutoFocus={searchAutoFocus} />

      {showSetupGuideTopRow ? (
        <div className="border-b border-border/40 px-3 py-2">
          <SettingsSetupGuideNavRow
            progress={setupGuideProgress}
            setupActive={activeSectionId === 'setup-guide'}
            onSelect={() => onSelectSection('setup-guide')}
          />
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-sleek px-3 py-3 space-y-5">
        {modernGroups.map(({ category, sections }) => {
          const GroupIcon = category.icon
          return (
            <div key={category.id} className="space-y-1.5">
              <div className="px-2 flex items-center gap-1.5 text-muted-foreground">
                <GroupIcon className="size-3.5 text-primary/70" />
                <span className="text-[11px] font-semibold tracking-wide uppercase">
                  {category.title}
                </span>
                {category.subtitle ? (
                  <span className="text-[10px] text-muted-foreground/60 font-normal">
                    · {category.subtitle}
                  </span>
                ) : null}
              </div>

              <div className="space-y-0.5">
                {sections.map((section) => {
                  const Icon = section.icon
                  const isActive = activeSectionId === section.id
                  return (
                    <button
                      key={section.id}
                      type="button"
                      aria-current={isActive ? 'page' : undefined}
                      onClick={() => onSelectSection(section.id)}
                      className={cn(
                        'relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs outline-none transition-all duration-150',
                        isActive
                          ? 'bg-primary/10 text-primary font-medium shadow-xs before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:rounded-r before:bg-primary'
                          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                      )}
                    >
                      <div
                        className={cn(
                          'flex size-6 items-center justify-center rounded-md transition-colors',
                          isActive ? 'bg-primary/15 text-primary' : 'bg-muted/40 text-muted-foreground'
                        )}
                      >
                        <Icon className="size-3.5 shrink-0" />
                      </div>
                      <span className="truncate">{section.title}</span>
                      {renderSectionBadge(section)}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}

        {repoSections.length > 0 ? (
          <div className="space-y-1.5 pt-2 border-t border-border/40">
            <div className="px-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Dự án (Projects)
            </div>
            <div className="space-y-0.5">
              {repoSections.map((section) => {
                const isActive = activeSectionId === section.id
                return (
                  <button
                    key={section.id}
                    type="button"
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => onSelectSection(section.id)}
                    className={cn(
                      'relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary font-medium before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:rounded-r before:bg-primary'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    )}
                  >
                    <RepoIconGlyph
                      repoIcon={section.repoIcon}
                      color={section.badgeColor}
                      className="size-4 shrink-0"
                    />
                    <span className="truncate flex-1">{section.title}</span>
                    {section.upstream ? (
                      <RepoForkIndicator upstream={section.upstream} className="shrink-0" />
                    ) : null}
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  )
}
