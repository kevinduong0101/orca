import { basename, joinPath, getRelativePathInsideRoot } from '@/lib/path'
import { useAppStore } from '@/store'
import type { AppState } from '@/store/types'
import { resolveWorkspaceDirectory } from '@/lib/workspace-directory'

export type ResolvedDeliverableFile = {
  absolutePath: string
  relativePath: string
  exists: boolean
}

function getCandidateRoots(state: AppState): string[] {
  const roots: string[] = []
  const currentWorktreeId = state.activeWorktreeId || ''
  const currentRoot = resolveWorkspaceDirectory(state, currentWorktreeId)
  if (currentRoot) {
    roots.push(currentRoot)
  }

  if (Array.isArray(state.repos)) {
    for (const repo of state.repos) {
      if (repo.path && !roots.includes(repo.path)) {
        roots.push(repo.path)
      }
    }
  }

  if (state.worktreesByRepo) {
    for (const list of Object.values(state.worktreesByRepo)) {
      if (Array.isArray(list)) {
        for (const wt of list) {
          if (wt.path && !roots.includes(wt.path)) {
            roots.push(wt.path)
          }
        }
      }
    }
  }

  const knownLocations = [
    '/Users/kevinduong/antigravity/Kevin-Duong-Photography-2026-06-19-fa1f2',
    '/Users/kevinduong/Documents/WORKPLACE/orca',
    '/Users/kevinduong/Documents/WORKPLACE/linearthinking_english',
    '/Users/kevinduong/orca/workspaces/orca/cod'
  ]
  for (const loc of knownLocations) {
    if (!roots.includes(loc)) {
      roots.push(loc)
    }
  }

  return roots
}

export async function resolveDeliverableFilePath(
  rawPath: string,
  fileName: string
): Promise<ResolvedDeliverableFile> {
  // 1. Direct absolute path check
  if (rawPath.startsWith('/') || /^[A-Za-z]:[\\/]/.test(rawPath)) {
    try {
      if (await window.api.fs.pathExists({ filePath: rawPath })) {
        return { absolutePath: rawPath, relativePath: rawPath, exists: true }
      }
    } catch {}
  }

  const state = useAppStore.getState()
  const roots = getCandidateRoots(state)

  // 2. Check open files in store
  const openFile = state.openFiles.find(
    (f) =>
      f.filePath === rawPath ||
      f.relativePath === rawPath ||
      f.relativePath.endsWith(`/${rawPath}`) ||
      basename(f.filePath).toLowerCase() === fileName.toLowerCase()
  )
  if (openFile) {
    return { absolutePath: openFile.filePath, relativePath: openFile.relativePath, exists: true }
  }

  // 3. For each candidate root, check direct relative path
  for (const root of roots) {
    const candidate = joinPath(root, rawPath)
    try {
      if (await window.api.fs.pathExists({ filePath: candidate })) {
        const rel = getRelativePathInsideRoot(candidate, root) ?? rawPath
        return { absolutePath: candidate, relativePath: rel, exists: true }
      }
    } catch {}
  }

  // 4. For each candidate root, search with listFiles (nameFilter)
  for (const root of roots) {
    try {
      const matches = await window.api.fs.listFiles({
        rootPath: root,
        nameFilter: fileName,
        maxResults: 10
      })
      if (matches && matches.length > 0) {
        const match =
          matches.find(
            (m) =>
              m === rawPath ||
              m.endsWith(`/${rawPath}`) ||
              basename(m).toLowerCase() === fileName.toLowerCase()
          ) || matches[0]
        if (match) {
          const abs = joinPath(root, match)
          const rel = getRelativePathInsideRoot(abs, root) ?? match
          return { absolutePath: abs, relativePath: rel, exists: true }
        }
      }
    } catch {}
  }

  // 5. If not found anywhere on disk
  const defaultRoot = roots[0] || ''
  const fallbackAbs = defaultRoot ? joinPath(defaultRoot, rawPath) : rawPath
  return { absolutePath: fallbackAbs, relativePath: rawPath, exists: false }
}
