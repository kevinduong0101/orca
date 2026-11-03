import type { ChannelAgentStatus, MarketingPost, OrcaRecommendation } from './types/marketing-types'

export const INITIAL_CHANNEL_AGENTS: ChannelAgentStatus[] = [
  {
    channel: 'instagram',
    name: 'Social Media Agent',
    role: 'Visual Storytelling & Reels Strategy',
    status: 'idle',
    nextRun: 'Standby',
    queuedPosts: 0,
    successRate: '—',
    avatarColor: 'from-pink-500 via-purple-500 to-indigo-500'
  },
  {
    channel: 'threads',
    name: 'Conversation Agent',
    role: 'Real-time Dialog & Creative Insights',
    status: 'idle',
    nextRun: 'Standby',
    queuedPosts: 0,
    successRate: '—',
    avatarColor: 'from-zinc-700 to-zinc-900'
  },
  {
    channel: 'pinterest',
    name: 'Visual SEO Agent',
    role: 'Evergreen Discovery & Board Curator',
    status: 'idle',
    nextRun: 'Standby',
    queuedPosts: 0,
    successRate: '—',
    avatarColor: 'from-red-600 to-rose-700'
  },
  {
    channel: 'linkedin',
    name: 'Professional Agent',
    role: 'Industry Thought Leadership & Cases',
    status: 'idle',
    nextRun: 'Standby',
    queuedPosts: 0,
    successRate: '—',
    avatarColor: 'from-blue-600 to-cyan-700'
  },
  {
    channel: 'website',
    name: 'SEO & Journal Agent',
    role: 'Deep Articles, Alt-Text & R2 Pipeline',
    status: 'idle',
    nextRun: 'Standby',
    queuedPosts: 0,
    successRate: '—',
    avatarColor: 'from-emerald-600 to-teal-800'
  }
]

export const INITIAL_POSTS: MarketingPost[] = []

export const INITIAL_RECOMMENDATIONS: OrcaRecommendation[] = []
