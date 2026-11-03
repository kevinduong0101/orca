export type MarketingChannel = 'instagram' | 'threads' | 'pinterest' | 'linkedin' | 'website'

export type MarketingTab = 'overview' | 'calendar' | 'studio' | 'approvals' | 'settings'

export type PostStatus = 'draft' | 'needs_review' | 'scheduled' | 'published'

export type MarketingPost = {
  id: string
  title: string
  channel: MarketingChannel
  status: PostStatus
  scheduledFor: string
  content: string
  mediaUrl?: string
  mediaType?: 'image' | 'carousel' | 'reel' | 'article'
  tags: string[]
  authorAgent: string
  destinationUrl?: string
  boardName?: string
  repurposedFrom?: string
}

export type ChannelAgentStatus = {
  channel: MarketingChannel
  name: string
  role: string
  status: 'active' | 'idle' | 'running' | 'warning'
  nextRun: string
  queuedPosts: number
  successRate: string
  avatarColor: string
}

export type OrcaRecommendation = {
  id: string
  title: string
  description: string
  urgency: 'high' | 'medium' | 'info'
  channel: MarketingChannel | 'general'
  actionLabel: string
}

export type MarketingSettings = {
  webhookUrl: string
  autoPublishChannels: Record<MarketingChannel, boolean>
  notifyOnFailure: boolean
  lastWebhookPingStatus?: string
}
