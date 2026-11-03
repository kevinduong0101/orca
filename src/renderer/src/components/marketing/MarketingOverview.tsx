import React from 'react'
import { Calendar, Clock, Layers, Zap } from 'lucide-react'
import { ChannelHealthCard } from './ChannelHealthCard'
import { OrcaRecommendationsWidget } from './OrcaRecommendationsWidget'
import type { ChannelAgentStatus, MarketingPost, OrcaRecommendation } from './types/marketing-types'

export function MarketingOverview({
  agents,
  posts,
  recommendations,
  onNavigateTab
}: {
  agents: ChannelAgentStatus[]
  posts: MarketingPost[]
  recommendations: OrcaRecommendation[]
  onNavigateTab: (tab: 'calendar' | 'studio' | 'approvals') => void
}): React.JSX.Element {
  const needsReviewCount = posts.filter((p) => p.status === 'needs_review').length
  const scheduledCount = posts.filter((p) => p.status === 'scheduled').length
  const publishedCount = posts.filter((p) => p.status === 'published').length

  return (
    <div className="space-y-6">
      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Posts This Week</span>
            <Layers className="size-4 text-purple-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-100">
              {publishedCount + scheduledCount}
            </span>
            {publishedCount + scheduledCount > 0 ? (
              <span className="text-[11px] font-semibold text-emerald-400">+28% vs prev</span>
            ) : (
              <span className="text-[11px] text-zinc-500">No activity yet</span>
            )}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            {publishedCount} published, {scheduledCount} queued
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('approvals')}
          className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 backdrop-blur-md cursor-pointer hover:border-amber-500/50 transition-colors"
        >
          <div className="flex items-center justify-between text-amber-300 text-xs font-medium">
            <span>Needs Approval</span>
            <span className="size-2 rounded-full bg-amber-400 animate-ping" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-200">{needsReviewCount}</span>
            <span className="text-[11px] font-medium text-amber-300/80">Pending human review</span>
          </div>
          <p className="text-[11px] text-amber-400/60 mt-1">Review & 1-click schedule &rarr;</p>
        </div>

        <div
          onClick={() => onNavigateTab('calendar')}
          className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 backdrop-blur-md cursor-pointer hover:border-zinc-700 transition-colors"
        >
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Scheduled Pipeline</span>
            <Calendar className="size-4 text-sky-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-100">{scheduledCount}</span>
            <span className="text-[11px] font-medium text-sky-400">Next 7 days</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">View unified calendar &rarr;</p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Autonomous Workflows</span>
            <Zap className="size-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-100">
              {agents.filter((a) => a.status === 'active').length}
            </span>
            <span className="text-[11px] font-medium text-zinc-400">
              {agents.filter((a) => a.status === 'active').length > 0 ? 'All Healthy' : 'Standby'}
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Connected with Antigravity AI</p>
        </div>
      </div>

      {/* Proactive Recommendations */}
      <OrcaRecommendationsWidget
        recommendations={recommendations}
        onAction={(rec) => {
          if (rec.urgency === 'info') {
            onNavigateTab('approvals')
          } else {
            onNavigateTab('calendar')
          }
        }}
      />

      {/* Channel Health Grid */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h3 className="font-semibold text-zinc-100 text-base">Channel Intelligence Agents</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Specialized autonomous agents running tailored marketing strategies for each platform
            </p>
          </div>
          <span className="text-xs text-zinc-400 flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-zinc-400" />
            {agents.length} Channel Agents Ready
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <ChannelHealthCard key={agent.channel} agent={agent} />
          ))}
        </div>
      </div>

      {/* Upcoming Content Timeline */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-zinc-400" />
            <h3 className="font-semibold text-zinc-100 text-sm">Upcoming Content Timeline (48h)</h3>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('calendar')}
            className="text-xs text-sky-400 hover:text-sky-300 font-medium transition-colors"
          >
            Open Full Calendar &rarr;
          </button>
        </div>

        <div className="space-y-2.5">
          {posts.length === 0 ? (
            <div className="py-8 text-center text-zinc-500 text-xs">
              No posts scheduled yet. Go to Content Calendar to create your first post.
            </div>
          ) : (
            posts.slice(0, 4).map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/60 hover:border-zinc-700/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">
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
                    <h4 className="text-xs font-semibold text-zinc-200 line-clamp-1">
                      {post.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-400">
                      <span className="capitalize text-zinc-300">{post.channel}</span>
                      <span>•</span>
                      <span>{post.scheduledFor}</span>
                      <span>•</span>
                      <span className="text-zinc-500">{post.authorAgent}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                      post.status === 'needs_review'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : post.status === 'scheduled'
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {post.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
