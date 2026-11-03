import React from 'react'
import { Clock, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CHANNEL_CONFIG } from './calendar-config'
import type { MarketingPost } from '../types/marketing-types'

export function ContentCalendarCard({
  post,
  onClick
}: {
  post: MarketingPost
  onClick?: () => void
}): React.JSX.Element {
  const conf = CHANNEL_CONFIG[post.channel]
  const time = post.scheduledFor.split(' ')[1] || '12:00'
  const isReview = post.status === 'needs_review'
  const isPublished = post.status === 'published'

  return (
    <div
      onClick={onClick}
      className={cn(
        'group/card relative flex flex-col justify-between rounded-xl border p-3 cursor-pointer transition-all duration-200 shadow-sm backdrop-blur-md hover:-translate-y-0.5 hover:shadow-lg',
        conf.border,
        conf.glow,
        isReview ? 'bg-amber-950/10' : 'bg-zinc-950/70 hover:bg-zinc-950/90'
      )}
      style={{
        borderLeftWidth: '3px',
        borderLeftColor: conf.accentColor
      }}
    >
      {/* 1. Header: Channel Name (Left) & Scheduled Time (Right) */}
      <div className="flex items-center justify-between gap-1.5 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs">{conf.icon}</span>
          <span
            className={cn('text-[11px] font-bold uppercase tracking-wider truncate', conf.text)}
          >
            {conf.label}
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-mono font-medium text-zinc-400 shrink-0 bg-zinc-900/90 px-1.5 py-0.5 rounded border border-zinc-800">
          <Clock className="size-3 text-zinc-400" />
          <span>{time}</span>
        </div>
      </div>

      {/* 2. Body: Title */}
      <div className="space-y-1 mb-2.5">
        <h4 className="text-xs font-semibold text-zinc-100 leading-snug line-clamp-2 group-hover/card:text-white transition-colors">
          {post.title}
        </h4>
      </div>

      {/* 3. Footer: Format Tag + Status Tag */}
      <div className="flex items-center justify-between gap-1 pt-2 border-t border-zinc-800/60 text-[10px]">
        {/* Format / Media Pill */}
        <div className="flex items-center gap-1 min-w-0">
          <span className="capitalize font-medium text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 truncate">
            {post.mediaType || 'Post'}
          </span>
          {post.destinationUrl && <ExternalLink className="size-3 text-zinc-500 shrink-0" />}
        </div>

        {/* Status Pill */}
        <span
          className={cn(
            'inline-flex items-center gap-1 font-semibold capitalize px-2 py-0.5 rounded-full border shrink-0',
            isReview
              ? 'text-amber-300 bg-amber-500/15 border-amber-500/30'
              : isPublished
                ? 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30'
                : 'text-sky-300 bg-sky-500/15 border-sky-500/30'
          )}
        >
          <span
            className={cn(
              'size-1.5 rounded-full',
              isReview
                ? 'bg-amber-400 animate-pulse'
                : isPublished
                  ? 'bg-emerald-400'
                  : 'bg-sky-400'
            )}
          />
          {post.status.replace('_', ' ')}
        </span>
      </div>
    </div>
  )
}
