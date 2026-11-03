import { useMemo, type JSX } from 'react'
import { MoreHorizontal, Copy, ExternalLink, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { basename, joinPath, getRelativePathInsideRoot } from '@/lib/path'
import { detectLanguage } from '@/lib/language-detect'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import type { CommentMarkdownLinkClickHandler } from '@/components/sidebar/CommentMarkdown'
import { createNativeChatFileHref } from '../../../../shared/native-chat/native-chat-href-routing'
import { useAppStore } from '@/store'
import { resolveWorkspaceDirectory } from '@/lib/workspace-directory'
import { openDetectedFilePath } from '@/components/terminal-pane/terminal-file-open-routing'

export type DeliverableFile = {
  path: string
  name: string
  extension: string
}

const SUPPORTED_EXTS = new Set([
  'html',
  'md',
  'markdown',
  'csv',
  'ts',
  'tsx',
  'js',
  'jsx',
  'json',
  'css',
  'py',
  'rs',
  'go',
  'sh',
  'yml',
  'yaml',
  'sql',
  'txt',
  'svg',
  'png',
  'jpg',
  'jpeg'
])

export function extractDeliverablesFromMarkdown(markdown: string): DeliverableFile[] {
  if (!markdown) {
    return []
  }
  const found = new Map<string, DeliverableFile>()

  const addCandidate = (cleanPath: string) => {
    if (!cleanPath) {
      return
    }
    const ext = cleanPath.split('.').pop()?.toLowerCase() ?? ''
    if (!SUPPORTED_EXTS.has(ext)) {
      return
    }

    const name = basename(cleanPath)
    // Avoid non-file noise
    if (name.length < 3 || name.startsWith('.')) {
      return
    }

    // If an entry with this name exists, prefer the one with directory path
    let existingKey: string | null = null
    for (const [key, val] of found.entries()) {
      if (val.name.toLowerCase() === name.toLowerCase() || key === cleanPath) {
        existingKey = key
        break
      }
    }

    if (existingKey) {
      if (cleanPath.includes('/') && !existingKey.includes('/')) {
        found.delete(existingKey)
        found.set(cleanPath, {
          path: cleanPath,
          name,
          extension: ext.toUpperCase()
        })
      }
    } else {
      found.set(cleanPath, {
        path: cleanPath,
        name,
        extension: ext.toUpperCase()
      })
    }
  }

  // 1. Match Markdown file links: [label](file:///path/to/file.ext) or [label](path/to/file.ext)
  const linkRegex = /\[([^\]]+)\]\((?:file:\/\/)?([^)]+)\)/gi
  let match: RegExpExecArray | null
  while ((match = linkRegex.exec(markdown)) !== null) {
    const rawPath = match[2]
    if (rawPath) {
      const cleanPath = rawPath.split('#')[0]?.split('?')[0]?.trim()
      if (cleanPath) {
        addCandidate(cleanPath)
      }
    }
  }

  // 2. Match backticked file paths: `path/to/file.ext`
  const codeRegex = /`([a-zA-Z0-9_\-./]+\.([a-zA-Z0-9]+))`(?:\s|\.||$)/g
  while ((match = codeRegex.exec(markdown)) !== null) {
    const cleanPath = match[1]?.trim()
    if (cleanPath) {
      addCandidate(cleanPath)
    }
  }

  // 3. Match bare filenames/paths with supported extensions: e.g. check-2026-11-03.md, METRICS.csv
  const wordRegex = /(?:^|[\s(])([a-zA-Z0-9_\-./]+\.([a-zA-Z0-9]+))(?=[,\s;:!?)]|$)/g
  while ((match = wordRegex.exec(markdown)) !== null) {
    const cleanPath = match[1]?.trim()
    if (cleanPath) {
      addCandidate(cleanPath)
    }
  }

  return Array.from(found.values()).slice(0, 6)
}

function getBadgeStyle(ext: string): { bg: string; icon: JSX.Element; label: string } {
  switch (ext.toLowerCase()) {
    case 'html':
      return {
        bg: 'bg-amber-600/15 text-amber-500 border-amber-500/30',
        icon: <span className="font-extrabold text-xs tracking-tight">5</span>,
        label: 'HTML'
      }
    case 'md':
    case 'markdown':
      return {
        bg: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
        icon: <span className="font-extrabold text-2xs tracking-tighter">M↓</span>,
        label: 'MD'
      }
    case 'csv':
      return {
        bg: 'bg-emerald-600/15 text-emerald-500 border-emerald-500/30',
        icon: <span className="font-black text-xs">X</span>,
        label: 'CSV'
      }
    case 'ts':
    case 'tsx':
      return {
        bg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
        icon: <span className="font-extrabold text-2xs">TS</span>,
        label: 'TS'
      }
    case 'js':
    case 'jsx':
      return {
        bg: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
        icon: <span className="font-extrabold text-2xs">JS</span>,
        label: 'JS'
      }
    case 'json':
      return {
        bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        icon: <span className="font-bold text-xs">{}</span>,
        label: 'JSON'
      }
    case 'py':
      return {
        bg: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
        icon: <span className="font-extrabold text-2xs">PY</span>,
        label: 'PYTHON'
      }
    case 'css':
      return {
        bg: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
        icon: <span className="font-bold text-xs">#</span>,
        label: 'CSS'
      }
    case 'sh':
      return {
        bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        icon: <span className="font-mono text-2xs font-bold">$_</span>,
        label: 'SHELL'
      }
    case 'sql':
      return {
        bg: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
        icon: <span className="font-bold text-2xs">SQL</span>,
        label: 'SQL'
      }
    default:
      return {
        bg: 'bg-muted/40 text-muted-foreground border-border/50',
        icon: <FileText className="size-4" />,
        label: ext.toUpperCase()
      }
  }
}

async function resolveDeliverableFilePath(
  rawPath: string,
  fileName: string
): Promise<{ absolutePath: string; relativePath: string }> {
  const state = useAppStore.getState()
  const worktreeId = state.activeWorktreeId || ''
  const rootPath = resolveWorkspaceDirectory(state, worktreeId) || ''

  // 1. If already an absolute path that exists
  if (rawPath.startsWith('/') || /^[A-Za-z]:[\\/]/.test(rawPath)) {
    try {
      if (await window.api.fs.pathExists({ filePath: rawPath })) {
        const rel = rootPath ? (getRelativePathInsideRoot(rawPath, rootPath) ?? rawPath) : rawPath
        return { absolutePath: rawPath, relativePath: rel }
      }
    } catch {}
  }

  // 2. If relative to rootPath and exists on disk
  if (rootPath) {
    const candidate = joinPath(rootPath, rawPath)
    try {
      if (await window.api.fs.pathExists({ filePath: candidate })) {
        const rel = getRelativePathInsideRoot(candidate, rootPath) ?? rawPath
        return { absolutePath: candidate, relativePath: rel }
      }
    } catch {}
  }

  // 3. Check open files in store
  const openFile = state.openFiles.find(
    (f) =>
      f.filePath === rawPath ||
      f.relativePath === rawPath ||
      f.relativePath.endsWith(`/${rawPath}`) ||
      basename(f.filePath).toLowerCase() === fileName.toLowerCase()
  )
  if (openFile) {
    return { absolutePath: openFile.filePath, relativePath: openFile.relativePath }
  }

  // 4. Search in rootPath via listFiles
  if (rootPath) {
    try {
      const matches = await window.api.fs.listFiles({
        rootPath,
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
          const abs = joinPath(rootPath, match)
          const rel = getRelativePathInsideRoot(abs, rootPath) ?? match
          return { absolutePath: abs, relativePath: rel }
        }
      }
    } catch {}
  }

  // 5. Default fallback
  const fallbackAbs =
    rawPath.startsWith('/') || /^[A-Za-z]:[\\/]/.test(rawPath)
      ? rawPath
      : rootPath
        ? joinPath(rootPath, rawPath)
        : rawPath
  const fallbackRel = rootPath
    ? (getRelativePathInsideRoot(fallbackAbs, rootPath) ?? rawPath)
    : rawPath
  return { absolutePath: fallbackAbs, relativePath: fallbackRel }
}

export function NativeChatDeliverableCards({
  markdown,
  onLinkClick
}: {
  markdown: string
  onLinkClick?: CommentMarkdownLinkClickHandler
}): JSX.Element | null {
  const deliverables = useMemo(() => extractDeliverablesFromMarkdown(markdown), [markdown])

  if (deliverables.length === 0) {
    return null
  }

  const handleOpen = async (e: React.MouseEvent<HTMLElement>, item: DeliverableFile) => {
    e.preventDefault()
    e.stopPropagation()

    const { absolutePath, relativePath } = await resolveDeliverableFilePath(item.path, item.name)

    const isMac = window.api.platform?.get().platform === 'darwin'
    const syntheticEvent = {
      preventDefault: () => {},
      stopPropagation: () => {},
      metaKey: isMac,
      ctrlKey: !isMac,
      button: 0,
      shiftKey: false,
      currentTarget: e.currentTarget
    } as unknown as React.MouseEvent<HTMLElement>

    if (onLinkClick) {
      const href = createNativeChatFileHref(absolutePath, 'literal')
      onLinkClick(syntheticEvent, href)
      return
    }

    // Direct store open fallback
    const state = useAppStore.getState()
    const worktreeId = state.activeWorktreeId || ''
    const rootPath = resolveWorkspaceDirectory(state, worktreeId) || ''

    try {
      openDetectedFilePath(absolutePath, null, null, {
        worktreeId,
        worktreePath: rootPath,
        runtimeEnvironmentId: null,
        hostFileOnly: true
      })
    } catch {
      state.openFile(
        {
          filePath: absolutePath,
          relativePath,
          worktreeId,
          language: detectLanguage(absolutePath),
          mode: 'edit'
        },
        {
          preview: true,
          focusEditor: true
        }
      )
    }
  }

  return (
    <div className="mt-3.5 flex flex-col gap-2" data-testid="native-chat-deliverables">
      {deliverables.map((item) => {
        const badge = getBadgeStyle(item.extension)
        return (
          <div
            key={item.path}
            onClick={(e) => void handleOpen(e, item)}
            className="group flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-border/70 bg-card/60 p-2.5 shadow-xs transition-all hover:border-primary/40 hover:bg-accent/30 hover:shadow-sm"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                void handleOpen(e as unknown as React.MouseEvent<HTMLElement>, item)
              }
            }}
          >
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-lg border font-mono shadow-2xs',
                  badge.bg
                )}
              >
                {badge.icon}
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                  {item.name}
                </span>
                <span className="text-2xs font-medium text-muted-foreground">{badge.label}</span>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  onClick={(e) => e.stopPropagation()}
                  className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  aria-label="More options"
                >
                  <MoreHorizontal className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    void handleOpen(e, item)
                  }}
                >
                  <ExternalLink className="mr-2 size-3.5" />
                  <span>Open in editor</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async (e) => {
                    e.stopPropagation()
                    const { absolutePath } = await resolveDeliverableFilePath(item.path, item.name)
                    void navigator.clipboard.writeText(absolutePath)
                    toast.success('Path copied to clipboard')
                  }}
                >
                  <Copy className="mr-2 size-3.5" />
                  <span>Copy file path</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      })}
    </div>
  )
}
