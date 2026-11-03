import React from 'react'
import { BookOpen, Calendar, Clock, Globe } from 'lucide-react'

export function WebsitePreview({
  title,
  content,
  tags,
  destinationUrl
}: {
  title: string
  content: string
  tags?: string[]
  destinationUrl?: string
}): React.JSX.Element {
  return (
    <div className="w-full max-w-[400px] rounded-2xl border border-zinc-800 bg-zinc-950 text-white shadow-2xl p-5 font-sans">
      {/* Blog Browser Mock Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-900 text-[11px] text-zinc-500">
        <div className="flex items-center gap-1.5">
          <Globe className="size-3.5 text-emerald-400" />
          <span className="font-mono text-zinc-300">kevinduongphotography.com</span>
        </div>
        <span className="text-zinc-600 font-mono text-[10px]">Next.js 15 • SEO</span>
      </div>

      {/* Article Meta */}
      <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-medium uppercase tracking-wider mb-2">
        <BookOpen className="size-3" />
        <span>Engineering & Studio Journal</span>
      </div>

      <h2 className="text-base font-bold text-zinc-100 leading-snug mb-2">
        {title || 'Deep-Dive Article Title'}
      </h2>

      <div className="flex items-center gap-3 text-[11px] text-zinc-500 mb-4 pb-3 border-b border-zinc-900">
        <span className="flex items-center gap-1">
          <Calendar className="size-3 text-zinc-400" />
          Nov 2026
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Clock className="size-3 text-zinc-400" />5 min read
        </span>
      </div>

      {/* Article Excerpt */}
      <div className="rounded-xl bg-zinc-900/60 p-3.5 border border-zinc-800/80 text-xs text-zinc-300 whitespace-pre-line leading-relaxed mb-4">
        {content || 'Article excerpt and comprehensive technical overview will be published here.'}
      </div>

      {/* Tags */}
      {(tags ?? []).length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {(tags ?? []).map((tag) => (
            <span
              key={tag}
              className="text-[10px] text-emerald-400 bg-emerald-950/30 border border-emerald-500/20 px-2 py-0.5 rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {destinationUrl && (
        <p className="text-[10px] text-zinc-500 font-mono truncate mt-3 pt-2 border-t border-zinc-900">
          Target: {destinationUrl}
        </p>
      )}
    </div>
  )
}
