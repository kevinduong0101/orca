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
        'group/card relative flex flex-col justify-between rounded-xl border p-3 cursor-pointer transition-all duration-200 shadow-sm backdrop-blur-md hover:-translate-y-0.5 hover:shadow-md',
        conf.border,
        conf.glow,
        isReview ? 'bg-amber-950/15' : 'bg-zinc-950/70 hover:bg-zinc-950/90'
      )}
    >
      {/* 1. Header: Channel Pill (Left) & Scheduled Time (Right) */}
      <div className="flex items-center justify-between gap-1 mb-2.5">
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
            conf.badgeBg,
            conf.text
          )}
        >
          <span>{conf.icon}</span>
          <span>{conf.label}</span>
        </span>

        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-zinc-400 bg-zinc-900/80 px-1.5 py-0.5 rounded border border-zinc-800/80">
          <Clock className="size-3 text-zinc-400" />
          <span>{time}</span>
        </span>
      </div>

      {/* 2. Body: Title + Media Format Pill */}
      <div className="space-y-1.5">
        <h4 className="text-xs font-semibold text-zinc-100 leading-snug line-clamp-2 group-hover/card:text-white transition-colors">
          {post.title}
        </h4>

        {post.mediaType && (
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="text-[10px] capitalize font-medium text-zinc-300 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
              {post.mediaType}
            </span>
            {post.destinationUrl && (
              <ExternalLink className="size-3 text-zinc-500 hover:text-zinc-300 transition-colors" />
            )}
          </div>
        )}
      </div>

      {/* 3. Footer: Author Agent + Status Badge */}
      <div className="mt-3 flex items-center justify-between gap-1 pt-2 border-t border-zinc-800/60 text-[10px]">
        <span className="text-zinc-400 font-medium truncate">
          {post.authorAgent.replace(' Agent', '')}
        </span>

        <span
          className={cn(
            'inline-flex items-center gap-1.5 font-semibold capitalize px-2 py-0.5 rounded-full border shrink-0',
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
