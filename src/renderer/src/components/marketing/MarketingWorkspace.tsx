import React, { useState } from 'react'
import { Calendar, CheckCircle2, Layers, Plus, Share2, Sparkles, Wand2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  INITIAL_CHANNEL_AGENTS,
  INITIAL_POSTS,
  INITIAL_RECOMMENDATIONS
} from './marketing-mock-data'
import { MarketingOverview } from './MarketingOverview'
import { ContentCalendar } from './calendar/ContentCalendar'
import { ApprovalsCenter } from './approvals/ApprovalsCenter'
import { ContentStudioModal } from './studio/ContentStudioModal'
import type { MarketingPost, MarketingTab } from './types/marketing-types'

export default function MarketingWorkspace(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<MarketingTab>('overview')
  const [posts, setPosts] = useState<MarketingPost[]>(INITIAL_POSTS)
  const [agents] = useState(INITIAL_CHANNEL_AGENTS)
  const [recommendations] = useState(INITIAL_RECOMMENDATIONS)
  const [selectedPostForStudio, setSelectedPostForStudio] = useState<MarketingPost | null>(null)

  const pendingApprovalsCount = posts.filter((p) => p.status === 'needs_review').length

  const handleApprove = (id: string) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'scheduled' as const } : p)))
  }

  const handleReject = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }

  const handleSavePost = (updated: MarketingPost) => {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
    setSelectedPostForStudio(null)
  }

  return (
    <div className="flex h-full w-full flex-col bg-worktree-workspace-background overflow-hidden text-worktree-workspace-foreground select-none">
      {/* Top Header & Navigation Bar */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 px-6 py-4 bg-zinc-950/40 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="size-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-950/40">
            <Sparkles className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-zinc-100 tracking-tight">Marketing OS</h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-purple-500/20 text-amber-300 border border-amber-500/30">
                Personal Content Director
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Autonomous multi-channel marketing, editorial calendar & approval hub
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              const sampleBlog = posts.find((p) => p.channel === 'website')
              if (sampleBlog) {
                setSelectedPostForStudio(sampleBlog)
                setActiveTab('studio')
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-200 font-medium transition-colors border border-zinc-800 shadow-sm"
          >
            <Share2 className="size-3.5 text-purple-400" />
            Repurpose Blog / Work
          </button>

          <button
            type="button"
            onClick={() => {
              const newPost: MarketingPost = {
                id: `post-${Date.now()}`,
                title: 'New Creative Concept',
                channel: 'instagram',
                status: 'draft',
                scheduledFor: '2026-11-07 18:00',
                content: 'Write your caption or let the AI Agent draft it...',
                tags: [],
                authorAgent: 'Manual Creator'
              }
              setPosts((prev) => [newPost, ...prev])
              setSelectedPostForStudio(newPost)
              setActiveTab('studio')
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-xs text-white font-semibold shadow-lg shadow-rose-950/50 transition-all"
          >
            <Plus className="size-3.5" />
            New Campaign / Post
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-zinc-800/60 px-6 py-2 bg-zinc-950/20">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2',
              activeTab === 'overview'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            )}
          >
            <Layers className="size-3.5" />
            Overview
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2',
              activeTab === 'calendar'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            )}
          >
            <Calendar className="size-3.5" />
            Content Calendar
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('studio')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2',
              activeTab === 'studio'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            )}
          >
            <Wand2 className="size-3.5" />
            Content Studio
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('approvals')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2',
              activeTab === 'approvals'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            )}
          >
            <CheckCircle2 className="size-3.5" />
            Approvals
            {pendingApprovalsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {pendingApprovalsCount}
              </span>
            )}
          </button>
        </div>

        <div className="text-[11px] text-zinc-500 flex items-center gap-2">
          <span>Synced with Kevin Duong Photography & LinearThinking</span>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 overflow-y-auto scrollbar-sleek p-6">
        <div className="mx-auto max-w-7xl">
          {activeTab === 'overview' && (
            <MarketingOverview
              agents={agents}
              posts={posts}
              recommendations={recommendations}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'calendar' && (
            <ContentCalendar
              posts={posts}
              onSelectPost={(post) => {
                setSelectedPostForStudio(post)
                setActiveTab('studio')
              }}
            />
          )}

          {activeTab === 'studio' && (
            <ContentStudioModal post={selectedPostForStudio || posts[0]} onSave={handleSavePost} />
          )}

          {activeTab === 'approvals' && (
            <ApprovalsCenter posts={posts} onApprove={handleApprove} onReject={handleReject} />
          )}
        </div>
      </div>
    </div>
  )
}
