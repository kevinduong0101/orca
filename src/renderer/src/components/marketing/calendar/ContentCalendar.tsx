import React, { useState } from 'react'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Layers,
  Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CHANNEL_CONFIG, DAYS_OF_WEEK } from './calendar-config'
import { ContentCalendarCard } from './ContentCalendarCard'
import type { MarketingChannel, MarketingPost } from '../types/marketing-types'

export function ContentCalendar({
  posts,
  onSelectPost,
  onCreatePost
}: {
  posts: MarketingPost[]
  onSelectPost?: (post: MarketingPost) => void
  onCreatePost?: (channel?: MarketingChannel, date?: string) => void
}): React.JSX.Element {
  const [selectedChannel, setSelectedChannel] = useState<MarketingChannel | 'all'>('all')
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'list'>('week')

  const filteredPosts = posts.filter(
    (post) => selectedChannel === 'all' || post.channel === selectedChannel
  )

  return (
    <div className="space-y-4">
      {/* Top Professional Control Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 shadow-xl backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Navigation & Date Interval */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-xl bg-zinc-950/80 p-1 border border-zinc-800/80">
              <button
                type="button"
                className="flex size-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                title="Previous Week"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                className="px-2.5 py-1 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                Today
              </button>
              <button
                type="button"
                className="flex size-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                title="Next Week"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 pl-1">
              <CalendarIcon className="size-4 text-amber-400" />
              <span className="text-sm font-semibold text-zinc-100 tracking-tight">
                November 2 – November 8, 2026
              </span>
              <span className="rounded-full bg-zinc-800/80 px-2 py-0.5 text-[10px] font-medium text-zinc-400 border border-zinc-700/50">
                Week 45
              </span>
            </div>
          </div>

          {/* View Modes & Quick Action */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center rounded-xl bg-zinc-950/80 p-1 border border-zinc-800/80 text-xs">
              {(['week', 'month', 'list'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    'px-3 py-1 rounded-lg font-medium capitalize transition-all duration-150',
                    viewMode === mode
                      ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/60'
                      : 'text-zinc-400 hover:text-zinc-200'
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onCreatePost?.()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg shadow-rose-950/40 hover:from-amber-400 hover:to-rose-500 transition-all"
            >
              <Plus className="size-3.5 stroke-[2.5]" />
              New Post
            </button>
          </div>
        </div>

        {/* Channels Filter Pills */}
        <div className="flex items-center gap-2 border-t border-zinc-800/60 pt-3 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-medium text-zinc-400 shrink-0 flex items-center gap-1 pr-1">
            <Filter className="size-3 text-zinc-500" />
            Filter:
          </span>

          <button
            type="button"
            onClick={() => setSelectedChannel('all')}
            className={cn(
              'px-3 py-1 rounded-lg text-xs font-medium transition-all shrink-0 border flex items-center gap-1.5',
              selectedChannel === 'all'
                ? 'bg-zinc-800 text-zinc-100 border-zinc-600 shadow-sm'
                : 'bg-zinc-950/60 text-zinc-400 border-zinc-800/80 hover:border-zinc-700 hover:text-zinc-200'
            )}
          >
            <span>All Channels</span>
            <span className="rounded-full bg-zinc-900 px-1.5 py-0.2 text-[10px] text-zinc-400">
              {posts.length}
            </span>
          </button>

          {(['instagram', 'threads', 'pinterest', 'linkedin', 'website'] as const).map((ch) => {
            const conf = CHANNEL_CONFIG[ch]
            const isSelected = selectedChannel === ch
            const count = posts.filter((p) => p.channel === ch).length

            return (
              <button
                key={ch}
                type="button"
                onClick={() => setSelectedChannel(ch)}
                className={cn(
                  'px-3 py-1 rounded-lg text-xs font-medium transition-all shrink-0 border flex items-center gap-1.5',
                  isSelected
                    ? `${conf.badgeBg} ${conf.text} ${conf.border} shadow-sm font-semibold`
                    : 'bg-zinc-950/60 text-zinc-400 border-zinc-800/80 hover:border-zinc-700 hover:text-zinc-200'
                )}
              >
                <span>{conf.icon}</span>
                <span>{conf.label}</span>
                {count > 0 && (
                  <span className="rounded-full bg-zinc-900/80 px-1.5 py-0.2 text-[10px] text-zinc-400">
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Week Grid Layout */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {DAYS_OF_WEEK.map((day) => {
            const dayPosts = filteredPosts.filter((p) => {
              const postDay = Number.parseInt(
                p.scheduledFor.split('-')[2]?.split(' ')[0] || '0',
                10
              )
              return postDay === day.dayNum
            })

            return (
              <div
                key={day.short}
                className={cn(
                  'group/col flex flex-col rounded-2xl border transition-all duration-200 min-h-[340px] p-3',
                  day.isToday
                    ? 'border-amber-500/40 bg-zinc-900/80 shadow-lg shadow-amber-950/10 ring-1 ring-amber-500/20'
                    : 'border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700/80 hover:bg-zinc-900/60'
                )}
              >
                {/* Column Day Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800/60">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        'text-xs font-bold uppercase tracking-wider',
                        day.isToday ? 'text-amber-400' : 'text-zinc-400'
                      )}
                    >
                      {day.short}
                    </span>
                    <span
                      className={cn(
                        'flex size-5 items-center justify-center rounded-md text-xs font-bold',
                        day.isToday
                          ? 'bg-amber-500 text-zinc-950 shadow-sm'
                          : 'bg-zinc-800/90 text-zinc-300'
                      )}
                    >
                      {day.dayNum}
                    </span>
                  </div>

                  {day.isToday ? (
                    <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300 border border-amber-500/30">
                      Today
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onCreatePost?.(undefined, `2026-11-0${day.dayNum}`)}
                      className="opacity-0 group-hover/col:opacity-100 size-5 flex items-center justify-center rounded text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-opacity"
                      title="Add post to this day"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  )}
                </div>

                {/* Posts in Day */}
                <div className="space-y-2.5 flex-1">
                  {dayPosts.map((post) => (
                    <ContentCalendarCard
                      key={post.id}
                      post={post}
                      onClick={() => onSelectPost?.(post)}
                    />
                  ))}

                  {dayPosts.length === 0 && (
                    <div
                      onClick={() => onCreatePost?.(undefined, `2026-11-0${day.dayNum}`)}
                      className="group/empty flex h-24 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800/80 hover:border-zinc-700 bg-zinc-950/20 hover:bg-zinc-950/50 cursor-pointer transition-all duration-150 text-center p-3"
                    >
                      <Plus className="size-4 text-zinc-600 group-hover/empty:text-zinc-400 transition-colors mb-1" />
                      <span className="text-[11px] font-medium text-zinc-500 group-hover/empty:text-zinc-300 transition-colors">
                        Add Post
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* List Mode View */}
      {viewMode === 'list' &&
        (filteredPosts.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-12 text-center backdrop-blur-md">
            <CalendarIcon className="size-8 text-zinc-600 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-zinc-300">No scheduled posts found</h4>
            <p className="text-xs text-zinc-500 mt-1">
              There are no posts for this filter. Click New Post to get started.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 divide-y divide-zinc-800/80 overflow-hidden shadow-xl backdrop-blur-md">
            {filteredPosts.map((post) => {
              const conf = CHANNEL_CONFIG[post.channel]
              const isReview = post.status === 'needs_review'
              const isPublished = post.status === 'published'

              return (
                <div
                  key={post.id}
                  onClick={() => onSelectPost?.(post)}
                  className="group p-4 flex items-center justify-between hover:bg-zinc-800/40 cursor-pointer transition-all duration-150"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={cn(
                        'size-10 rounded-xl flex items-center justify-center text-lg border shadow-sm',
                        conf.badgeBg,
                        conf.border
                      )}
                    >
                      {conf.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={cn('text-xs font-bold', conf.text)}>{conf.label}</span>
                        <span className="text-zinc-600">•</span>
                        <span className="text-xs text-zinc-400 font-mono">{post.scheduledFor}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors">
                        {post.title}
                      </h4>
                      <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5 max-w-xl">
                        {post.content}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-zinc-400 hidden sm:inline">{post.authorAgent}</span>
                    <span
                      className={cn(
                        'px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border',
                        isReview
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : isPublished
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                      )}
                    >
                      {post.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        ))}

      {/* Month Mode Simple View */}
      {viewMode === 'month' && (
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-6 text-center backdrop-blur-md">
          <Layers className="size-8 text-purple-400 mx-auto mb-2 opacity-80" />
          <h4 className="text-sm font-semibold text-zinc-200">Month Calendar View</h4>
          <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
            Showing full 30-day editorial schedule across all channels. Switch to Week View for
            daily time-slot management.
          </p>
        </div>
      )}
    </div>
  )
}
