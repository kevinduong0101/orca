export type MarketingChannel = 'pinterest' | 'linkedin' | 'website'

export type MarketingTab = 'overview' | 'calendar' | 'studio' | 'approvals' | 'settings' | 'brain'

export type PostStatus = 'draft' | 'needs_review' | 'scheduled' | 'published'

export type PostPerformanceAudit = {
  auditedAt: string
  impressions: number
  engagements: number
  engagementRate: string
  verdict: 'high_performing' | 'moderate' | 'low_engagement'
  reflection: string
  actionablePivot: string
}

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
  targetClient?: 'couples' | 'families' | 'travel_expat' | 'b2b_commercial'
  seoKeyword?: string
  seoMetaTitle?: string
  seoMetaDescription?: string
  bookingHeadline?: string
  bookingQuote?: string
  hypothesis?: string
  learnedFromId?: string
  performanceAudit?: PostPerformanceAudit
}

export type MarketInsight = {
  id: string
  channel: MarketingChannel
  sourceUrl?: string
  topHeadline: string
  estimatedEngagement: string
  visualPattern: string
  copywritingPattern: string
  extractedRule: string
  discoveredAt: string
}

export type AgentLearnedRule = {
  id: string
  channel: MarketingChannel
  title: string
  rule: string
  confidenceScore: number
  status: 'active_playbook' | 'testing_hypothesis' | 'deprecated_low_ctr'
  impactDescription: string
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
  browserAccounts?: {
    pinterest: { connected: boolean; username: string }
    linkedin: { connected: boolean; username: string }
  }
  autonomousBrowserMode?: boolean
}
