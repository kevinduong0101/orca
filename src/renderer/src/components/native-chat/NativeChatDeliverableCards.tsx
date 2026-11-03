import { useMemo, type JSX } from 'react'
import { MoreHorizontal, Copy, ExternalLink, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { basename } from '@/lib/path'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import type { CommentMarkdownLinkClickHandler } from '@/components/sidebar/CommentMarkdown'

export type DeliverableFile = {
  path: string
  name: string
  extension: string
}

const SUPPORTED_EXTS = new Set([
  'html',
  'md',
  'markdown',
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
  'txt'
])

export function extractDeliverablesFromMarkdown(markdown: string): DeliverableFile[] {
  if (!markdown) {
    return []
  }
  const found = new Map<string, DeliverableFile>()

  // 1. Match Markdown file links: [label](file:///path/to/file.ext) or [label](path/to/file.ext)
  const linkRegex = /\[([^\]]+)\]\((?:file:\/\/)?([^)]+)\)/gi
  let match: RegExpExecArray | null
  while ((match = linkRegex.exec(markdown)) !== null) {
    const rawPath = match[2]
    if (rawPath) {
      const cleanPath = rawPath.split('#')[0]?.split('?')[0]?.trim()
      const ext = cleanPath?.split('.').pop()?.toLowerCase() ?? ''
      if (cleanPath && SUPPORTED_EXTS.has(ext)) {
        found.set(cleanPath, {
          path: cleanPath,
          name: basename(cleanPath),
          extension: ext.toUpperCase()
        })
      }
    }
  }

  // 2. Match backticked file paths: `path/to/file.ext`
  const codeRegex = /`([a-zA-Z0-9_\-./]+\.([a-zA-Z0-9]+))`(?:\s|\.||$)/g
  while ((match = codeRegex.exec(markdown)) !== null) {
    const cleanPath = match[1]?.trim()
    const ext = match[2]?.toLowerCase() ?? ''
    if (cleanPath && SUPPORTED_EXTS.has(ext) && !found.has(cleanPath)) {
      found.set(cleanPath, {
        path: cleanPath,
        name: basename(cleanPath),
        extension: ext.toUpperCase()
      })
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
    default:
      return {
        bg: 'bg-muted/40 text-muted-foreground border-border/50',
        icon: <FileText className="size-4" />,
        label: ext.toUpperCase()
      }
  }
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

  const handleOpen = (path: string) => {
    if (onLinkClick) {
      onLinkClick(path.startsWith('file://') ? path : `file://${path}`)
    } else {
      toast.info(`Opening ${basename(path)}`)
    }
  }

  return (
    <div className="mt-3.5 flex flex-col gap-2" data-testid="native-chat-deliverables">
      {deliverables.map((item) => {
        const badge = getBadgeStyle(item.extension)
        return (
          <div
            key={item.path}
            onClick={() => handleOpen(item.path)}
            className="group flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-card/60 p-2.5 shadow-xs transition-all hover:border-primary/40 hover:bg-accent/30 hover:shadow-sm"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleOpen(item.path)
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
                    handleOpen(item.path)
                  }}
                >
                  <ExternalLink className="mr-2 size-3.5" />
                  <span>Open in editor</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    void navigator.clipboard.writeText(item.path)
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
