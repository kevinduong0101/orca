import { translate } from '@/i18n/i18n'
import type { SkillSourceKind } from '../../../../shared/skills'
import type {
  ComposerAutocomplete,
  NativeChatPickerItem
} from '../../../../shared/native-chat-composer-autocomplete'

export function getPickerEmptyText(
  autocomplete: Extract<ComposerAutocomplete, { mode: 'slash' }>
): string {
  if (!autocomplete.commandsEnabled) {
    return translate('components.native-chat.composer.noSkills', 'No matching skills')
  }
  if (autocomplete.skillsEnabled) {
    return translate(
      'components.native-chat.composer.noCommandsOrSkills',
      'No matching commands or skills'
    )
  }
  return translate('components.native-chat.composer.noCommands', 'No matching commands')
}

export function getPickerAnnotation(item: NativeChatPickerItem): string | null {
  if (item.kind === 'skill' && item.location) {
    return item.location
  }
  if (item.kind === 'command' && item.skillCollision) {
    return translate(
      'components.native-chat.composer.skillCommandCollision',
      'Also a skill name - agent decides'
    )
  }
  if (item.kind === 'skill' && item.sources.length > 1) {
    // Use sourceCount because i18next treats count as pluralization input and these keys have no plural variants.
    return translate(
      'components.native-chat.composer.skillMultipleSources',
      '{{sourceCount}} sources - agent resolves',
      { sourceCount: item.sources.length }
    )
  }
  return null
}

export function scopeLabel(sourceKind: SkillSourceKind | undefined): string {
  const labels: Record<string, string> = {
    repo: translate('components.native-chat.composer.skillScopeProject', 'Project'),
    home: translate('components.native-chat.composer.skillScopePersonal', 'Personal'),
    bundled: translate('components.native-chat.composer.skillScopeBuiltIn', 'Built-in'),
    plugin: translate('components.native-chat.composer.skillScopePlugin', 'Plugin')
  }
  return sourceKind ? (labels[sourceKind] ?? '') : ''
}
