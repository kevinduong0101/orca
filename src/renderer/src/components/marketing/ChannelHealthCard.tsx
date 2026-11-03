import React from 'react'
import { Activity, ArrowUpRight, CheckCircle2, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ChannelAgentStatus } from './types/marketing-types'

const CHANNEL_ICONS: Record<string, string> = {
  instagram: '📸',
  threads: '🧵',
  pinterest: '📌',
  linkedin: '💼',
  website: '🌐'
}

export function ChannelHealthCard({ agent }: { agent: ChannelAgentStatus }): React.JSX.Element {
  return (
    <div className="relative group overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-md transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900/90 hover:shadow-xl hover:shadow-black/20">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'size-11 rounded-xl flex items-center justify-center text-xl shadow-inner bg-gradient-to-br',
              agent.avatarColor
            )}
          >
            {CHANNEL_ICONS[agent.channel] || '✨'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-zinc-100 text-sm tracking-tight capitalize">
                {agent.channel}
              </h4>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {agent.status}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">{agent.role}</p>
          </div>
        </div>

        <button
          type="button"
          aria-label="View channel details"
          className="size-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
        >
          <ArrowUpRight className="size-4" />
        </button>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 py-3 px-3 rounded-lg bg-zinc-950/40 border border-zinc-800/40 text-xs">
        <div>
          <span className="text-[10px] uppercase font-semibold text-zinc-500 flex items-center gap-1">
            <Clock className="size-3 text-zinc-400" />
            Next Run
          </span>
          <p className="font-medium text-zinc-200 mt-0.5 text-xs truncate">{agent.nextRun}</p>
        </div>

        <div>
          <span className="text-[10px] uppercase font-semibold text-zinc-500 flex items-center gap-1">
            <Activity className="size-3 text-sky-400" />
            Queued
          </span>
          <p className="font-medium text-sky-300 mt-0.5 text-xs">{agent.queuedPosts} posts</p>
        </div>

        <div>
          <span className="text-[10px] uppercase font-semibold text-zinc-500 flex items-center gap-1">
            <CheckCircle2 className="size-3 text-emerald-400" />
            Success
          </span>
          <p className="font-medium text-emerald-300 mt-0.5 text-xs">{agent.successRate}</p>
        </div>
      </div>
    </div>
  )
}
