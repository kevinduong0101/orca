import { basename, getRelativePathInsideRoot } from '@/lib/path'
import { isPathInsideWorktree } from '../../../../shared/terminal-links'
import { createBrowserUuid } from '@/lib/browser-uuid'
import { emptySplitGroup, insertSplitGroup } from '@/store/slices/tabs/tabs-group-actions'
import { detectLanguage } from '@/lib/language-detect'
import { resolveWorkspaceDirectory } from '@/lib/workspace-directory'
import { useAppStore } from '@/store'

export function openDeliverableFileInSplit(
  absolutePath: string,
  _fileName?: string
): void {
  const state = useAppStore.getState()
  const currentWorktreeId = state.activeWorktreeId || ''
  if (!currentWorktreeId) {
    return
  }

  const groups = state.groupsByWorktree?.[currentWorktreeId] ?? []
  const activeGroupId =
    state.activeGroupIdByWorktree?.[currentWorktreeId] || groups[0]?.id || ''

  let targetGroupId: string | undefined = undefined

  // Reuse existing adjacent / secondary group if present
  const otherGroup = groups.find((g) => g.id !== activeGroupId)
  if (otherGroup) {
    targetGroupId = otherGroup.id
  } else if (activeGroupId) {
    // Only 1 group exists: create a split to the right
    const newGroupId = createBrowserUuid()
    useAppStore.setState((s) => ({
      ...insertSplitGroup(
        s,
        currentWorktreeId,
        { sourceGroupId: activeGroupId, splitDirection: 'right', activate: false },
        emptySplitGroup(currentWorktreeId, newGroupId)
      )
    }))
    targetGroupId = newGroupId
  }

  const currentRoot = resolveWorkspaceDirectory(state, currentWorktreeId)
  const isInside =
    Boolean(currentRoot) && isPathInsideWorktree(absolutePath, currentRoot)
  // Keeping relativePath === absolutePath for outside files grants USER_FILE_ACCESS
  const relativePath = isInside
    ? (getRelativePathInsideRoot(absolutePath, currentRoot) ?? basename(absolutePath))
    : absolutePath

  const ext = absolutePath.split('.').pop()?.toLowerCase() ?? ''
  let language = detectLanguage(absolutePath)
  if (ext === 'csv') {
    language = 'csv'
  } else if (ext === 'tsv') {
    language = 'tsv'
  } else if (ext === 'md' || ext === 'markdown') {
    language = 'markdown'
  }

  const fileId = useAppStore.getState().openFile(
    {
      filePath: absolutePath,
      relativePath,
      worktreeId: currentWorktreeId,
      language,
      mode: 'edit',
      readOnly: false
    },
    {
      targetGroupId,
      preview: false,
      focusEditor: true,
      forceContentReload: true
    }
  )

  if (
    language === 'markdown' ||
    language === 'csv' ||
    language === 'tsv' ||
    ext === 'md' ||
    ext === 'markdown' ||
    ext === 'csv' ||
    ext === 'tsv'
  ) {
    useAppStore.getState().setMarkdownViewMode(fileId, 'rich')
  }

  if (targetGroupId) {
    useAppStore.getState().focusGroup?.(currentWorktreeId, targetGroupId)
  }
}
