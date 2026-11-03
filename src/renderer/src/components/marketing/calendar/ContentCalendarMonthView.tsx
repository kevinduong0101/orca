import React from 'react'
import { cn } from '@/lib/utils'
import { getChannelConfig } from './calendar-config'
import type { MarketingChannel, MarketingPost } from '../types/marketing-types'

export function ContentCalendarMonthView({
  filteredPosts,
  selectedChannel,
  onSelectPost,
  onCreatePost
}: {
  filteredPosts: MarketingPost[]
  selectedChannel: MarketingChannel | 'all'
  onSelectPost?: (post: MarketingPost) => void
  onCreatePost?: (channel?: MarketingChannel, date?: string) => void
}): React.JSX.Element {
  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4 shadow-xl backdrop-blur-md space-y-3">
      <div className="grid grid-cols-7 gap-2 pb-2 border-b border-zinc-800/80 text-center text-xs font-semibold text-zinc-400 uppercase">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={`empty-${idx}`}
            className="h-24 rounded-xl border border-zinc-900/40 bg-zinc-950/10 opacity-30"
          />
        ))}

        {Array.from({ length: 30 }).map((_, idx) => {
          const dayNum = idx + 1
          const dateStr = `2026-11-${String(dayNum).padStart(2, '0')}`
          const isToday = dateStr === '2026-11-03'
          const dayPosts = filteredPosts.filter(
            (p) => p.scheduledFor && p.scheduledFor.startsWith(dateStr)
          )

          return (
            <div
              key={dateStr}
              onClick={() =>
                onCreatePost?.(selectedChannel === 'all' ? undefined : selectedChannel, dateStr)
              }
              className={cn(
                'h-24 rounded-xl border p-2 flex flex-col justify-between cursor-pointer transition-all hover:border-zinc-700 bg-zinc-950/30 hover:bg-zinc-950/60',
                isToday ? 'border-amber-500/50 bg-amber-950/10' : 'border-zinc-800/60'
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'size-5 flex items-center justify-center rounded text-xs font-bold',
                    isToday ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400'
                  )}
                >
                  {dayNum}
                </span>
                {dayPosts.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-300">
                    {dayPosts.length}
                  </span>
                )}
              </div>

              <div className="space-y-1 overflow-hidden">
                {dayPosts.slice(0, 2).map((post) => {
                  const conf = getChannelConfig(post.channel)
                  return (
                    <div
                      key={post.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectPost?.(post)
                      }}
                      className={cn(
                        'text-[10px] px-1.5 py-0.5 rounded truncate font-medium flex items-center gap-1 border',
                        conf.badgeBg,
                        conf.text,
                        conf.border
                      )}
                    >
                      <span>{conf.icon}</span>
                      <span className="truncate">{post.title}</span>
                    </div>
                  )
                })}
                {dayPosts.length > 2 && (
                  <span className="text-[9px] text-zinc-500 block truncate">
                    +{dayPosts.length - 2} more
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
