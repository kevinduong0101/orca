import React, { useState } from 'react'
import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MarketingChannel, MarketingPost } from '../types/marketing-types'

const CHANNEL_COLORS: Record<MarketingChannel, { bg: string; text: string; border: string }> = {
  instagram: { bg: 'bg-pink-950/40', text: 'text-pink-300', border: 'border-pink-500/30' },
  threads: { bg: 'bg-zinc-800/60', text: 'text-zinc-200', border: 'border-zinc-700' },
  pinterest: { bg: 'bg-rose-950/40', text: 'text-rose-300', border: 'border-rose-500/30' },
  linkedin: { bg: 'bg-blue-950/40', text: 'text-blue-300', border: 'border-blue-500/30' },
  website: { bg: 'bg-emerald-950/40', text: 'text-emerald-300', border: 'border-emerald-500/30' }
}

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function ContentCalendar({
  posts,
  onSelectPost
}: {
  posts: MarketingPost[]
  onSelectPost?: (post: MarketingPost) => void
}): React.JSX.Element {
  const [selectedChannel, setSelectedChannel] = useState<MarketingChannel | 'all'>('all')
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'list'>('week')

  const filteredPosts = posts.filter(
    (post) => selectedChannel === 'all' || post.channel === selectedChannel
  )

  return (
    <div className="space-y-4">
      {/* Calendar Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs font-medium">
            <button
              type="button"
              onClick={() => setViewMode('week')}
              className={cn(
                'px-3 py-1.5 rounded-md transition-colors',
                viewMode === 'week'
                  ? 'bg-zinc-800 text-zinc-100 shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              )}
            >
              Week View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('month')}
              className={cn(
                'px-3 py-1.5 rounded-md transition-colors',
                viewMode === 'month'
                  ? 'bg-zinc-800 text-zinc-100 shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              )}
            >
              Month View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={cn(
                'px-3 py-1.5 rounded-md transition-colors',
                viewMode === 'list'
                  ? 'bg-zinc-800 text-zinc-100 shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              )}
            >
              List View
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-zinc-300 font-semibold pl-2">
            <CalendarIcon className="size-4 text-purple-400" />
            <span>Nov 2 – Nov 8, 2026</span>
          </div>
        </div>

        {/* Channel Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {(['all', 'instagram', 'threads', 'pinterest', 'linkedin', 'website'] as const).map(
            (channel) => (
              <button
                key={channel}
                type="button"
                onClick={() => setSelectedChannel(channel)}
                className={cn(
                  'px-2.5 py-1 rounded-lg capitalize font-medium transition-colors border',
                  selectedChannel === channel
                    ? 'bg-zinc-100 text-zinc-950 border-zinc-100'
                    : 'bg-zinc-950/60 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
                )}
              >
                {channel === 'all' ? 'All Channels' : channel}
              </button>
            )
          )}
        </div>
      </div>

      {/* Week Grid */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-7 gap-3">
          {DAYS_OF_WEEK.map((day, idx) => {
            const dayNum = 2 + idx
            const dayPosts = filteredPosts.filter((p) => {
              const postDay = Number.parseInt(
                p.scheduledFor.split('-')[2]?.split(' ')[0] || '0',
                10
              )
              return postDay === dayNum
            })

            return (
              <div
                key={day}
                className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3 min-h-[360px] flex flex-col"
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800/60 text-xs">
                  <span className="font-semibold text-zinc-400">{day}</span>
                  <span className="text-[11px] font-bold text-zinc-200 bg-zinc-800 px-1.5 py-0.5 rounded">
                    Nov {dayNum}
                  </span>
                </div>

                <div className="space-y-2 flex-1">
                  {dayPosts.map((post) => {
                    const color = CHANNEL_COLORS[post.channel]
                    return (
                      <div
                        key={post.id}
                        onClick={() => onSelectPost?.(post)}
                        className={cn(
                          'p-2.5 rounded-lg border text-xs cursor-pointer transition-all hover:scale-[1.02] shadow-sm',
                          color.bg,
                          color.border
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={cn(
                              'text-[10px] font-bold uppercase tracking-wider',
                              color.text
                            )}
                          >
                            {post.channel}
                          </span>
                          <span className="text-[10px] text-zinc-400">
                            {post.scheduledFor.split(' ')[1] || ''}
                          </span>
                        </div>
                        <p className="font-medium text-zinc-100 text-[11px] line-clamp-2 leading-snug">
                          {post.title}
                        </p>
                      </div>
                    )
                  })}

                  {dayPosts.length === 0 && (
                    <div className="h-full flex items-center justify-center text-[11px] text-zinc-600 italic py-6">
                      No posts
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* List Grid fallback */}
      {viewMode !== 'week' && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 divide-y divide-zinc-800">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => onSelectPost?.(post)}
              className="p-4 flex items-center justify-between hover:bg-zinc-800/40 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">
                  {post.channel === 'instagram'
                    ? '📸'
                    : post.channel === 'threads'
                      ? '🧵'
                      : post.channel === 'pinterest'
                        ? '📌'
                        : post.channel === 'linkedin'
                          ? '💼'
                          : '🌐'}
                </span>
                <div>
                  <h4 className="text-xs font-semibold text-zinc-100">{post.title}</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">{post.content}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <span className="text-zinc-400">{post.scheduledFor}</span>
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase',
                    post.status === 'needs_review'
                      ? 'bg-amber-500/20 text-amber-300'
                      : post.status === 'scheduled'
                        ? 'bg-sky-500/20 text-sky-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                  )}
                >
                  {post.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
