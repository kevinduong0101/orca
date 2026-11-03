import React, { useState } from 'react'
import {
  Brain,
  Calendar,
  CheckCircle2,
  Layers,
  Plus,
  Settings,
  Share2,
  Sparkles,
  Wand2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMarketingData } from './use-marketing-data'
import { MarketingOverview } from './MarketingOverview'
import { ContentCalendar } from './calendar/ContentCalendar'
import { ApprovalsCenter } from './approvals/ApprovalsCenter'
import { ContentStudioModal } from './studio/ContentStudioModal'
import { RepurposeModal } from './studio/RepurposeModal'
import { MarketingSettingsTab } from './settings/MarketingSettingsTab'
import { AgentBrainTab } from './brain/AgentBrainTab'
import { publishPostViaOrcaBrowser } from './services/orca-browser-publisher'
import type { MarketingPost, MarketingTab } from './types/marketing-types'

export default function MarketingWorkspace(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<MarketingTab>('overview')
  const [selectedPostForStudio, setSelectedPostForStudio] = useState<MarketingPost | null>(null)
  const [isRepurposeOpen, setIsRepurposeOpen] = useState(false)

  const {
    posts,
    agents,
    recommendations,
    settings,
    setSettings,
    savePost,
    deletePost,
    approvePost,
    approveAll,
    batchAddPosts,
    seedDemoCampaign,
    clearAllPosts,
    insights,
    learnedRules,
    learningNotice,
    runMarketDiscovery,
    runAudit
  } = useMarketingData()

  const pendingApprovalsCount = posts.filter((p) => p.status === 'needs_review').length

  const handleSavePost = (updated: MarketingPost) => {
    savePost(updated)
    setSelectedPostForStudio(null)
    setActiveTab('calendar')
  }

  const handlePublishInBrowser = async (post: MarketingPost) => {
    savePost({ ...post, status: 'published' })
    await publishPostViaOrcaBrowser(post)
  }

  const handleQuickRewrite = (id: string, style: string) => {
    const post = posts.find((p) => p.id === id)
    if (!post) {
      return
    }

    let rewritten = post.content
    if (style.includes('Punchier')) {
      rewritten = `${post.content.split('\n\n')[0]}\n\nLess is always more.`
    } else if (style.includes('Professional')) {
      rewritten = `Strategic Industry Insight:\n${post.content}\n\nExecution is how strategy becomes reality.`
    } else if (style.includes('Hook')) {
      rewritten = `The single most important rule:\n${post.content}`
    } else {
      rewritten = `${post.content}\n\nWhat is your perspective on this?`
    }

    savePost({ ...post, content: rewritten })
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
            onClick={() => setIsRepurposeOpen(true)}
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
                channel: 'pinterest',
                status: 'draft',
                scheduledFor: '2026-11-07 18:00',
                content: 'Write your caption or let the AI Agent draft it...',
                tags: [],
                authorAgent: 'Manual Creator'
              }
              savePost(newPost)
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

          <button
            type="button"
            onClick={() => setActiveTab('brain')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2',
              activeTab === 'brain'
                ? 'bg-purple-900/40 text-purple-200 border border-purple-500/30 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            )}
          >
            <Brain className="size-3.5 text-purple-400" />
            Agent Brain
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {learnedRules.filter((r) => r.status === 'active_playbook').length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2',
              activeTab === 'settings'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            )}
          >
            <Settings className="size-3.5" />
            Settings & Webhooks
          </button>
        </div>

        <div className="text-[11px] text-zinc-500 flex items-center gap-2">
          <span>Synced with Kevin Duong Photography & LinearThinking</span>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 overflow-y-auto scrollbar-sleek p-6">
        <div className={activeTab === 'calendar' ? 'w-full px-2' : 'mx-auto max-w-7xl'}>
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
              onCreatePost={(channel, scheduledDate) => {
                const newPost: MarketingPost = {
                  id: `post-${Date.now()}`,
                  title: '',
                  channel: channel || 'pinterest',
                  status: 'needs_review',
                  scheduledFor: scheduledDate ? `${scheduledDate} 12:00` : '2026-11-03 12:00',
                  content: '',
                  mediaType: 'image',
                  tags: [],
                  authorAgent: 'Kevin Duong Visual AI'
                }
                savePost(newPost)
                setSelectedPostForStudio(newPost)
                setActiveTab('studio')
              }}
            />
          )}

          {activeTab === 'studio' && (
            <ContentStudioModal
              post={selectedPostForStudio}
              onSave={handleSavePost}
              onPublishInBrowser={handlePublishInBrowser}
            />
          )}

          {activeTab === 'approvals' && (
            <ApprovalsCenter
              posts={posts}
              onApprove={approvePost}
              onApproveAll={approveAll}
              onReject={deletePost}
              onEditInStudio={(post) => {
                setSelectedPostForStudio(post)
                setActiveTab('studio')
              }}
              onQuickRewrite={handleQuickRewrite}
              onPublishInBrowser={handlePublishInBrowser}
            />
          )}

          {activeTab === 'brain' && (
            <AgentBrainTab
              insights={insights}
              rules={learnedRules}
              posts={posts}
              onRunDiscovery={runMarketDiscovery}
              onRunAudit={runAudit}
              notice={learningNotice}
            />
          )}

          {activeTab === 'settings' && (
            <MarketingSettingsTab
              settings={settings}
              onUpdateSettings={setSettings}
              posts={posts}
              onImportPosts={(imported) => {
                imported.forEach((p) => savePost(p))
                setActiveTab('calendar')
              }}
              onSeedDemo={() => {
                seedDemoCampaign()
                setActiveTab('calendar')
              }}
              onClearAll={clearAllPosts}
            />
          )}
        </div>
      </div>

      {/* Repurpose Modal */}
      <RepurposeModal
        isOpen={isRepurposeOpen}
        onClose={() => setIsRepurposeOpen(false)}
        onSaveBatch={(batch) => {
          batchAddPosts(batch)
          setActiveTab('approvals')
        }}
      />
    </div>
  )
}
