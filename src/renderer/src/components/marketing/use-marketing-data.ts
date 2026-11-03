import { useState, useEffect, useCallback } from 'react'
import type {
  MarketingPost,
  ChannelAgentStatus,
  OrcaRecommendation,
  MarketingSettings,
  MarketInsight,
  AgentLearnedRule
} from './types/marketing-types'
import {
  loadMarketInsights,
  saveMarketInsights,
  loadLearnedRules,
  saveLearnedRules
} from './services/agent-learning-engine'
import { runAutonomousMarketDiscovery } from './services/market-intelligence-service'
import { auditPublishedPosts } from './services/performance-reflection-engine'
import {
  INITIAL_CHANNEL_AGENTS,
  INITIAL_POSTS,
  INITIAL_RECOMMENDATIONS,
  SAMPLE_DEMO_CAMPAIGN,
  SAMPLE_DEMO_RECOMMENDATIONS
} from './marketing-mock-data'

const STORAGE_KEY_POSTS = 'orca_marketing_posts_v1'
const STORAGE_KEY_SETTINGS = 'orca_marketing_settings_v1'
const VALID_CHANNELS = new Set<string>(['pinterest', 'linkedin', 'website'])

const DEFAULT_SETTINGS: MarketingSettings = {
  webhookUrl: '',
  autoPublishChannels: {
    pinterest: false,
    linkedin: false,
    website: false
  },
  notifyOnFailure: true,
  autonomousBrowserMode: true,
  browserAccounts: {
    pinterest: { connected: true, username: 'kevinduongphotography' },
    linkedin: { connected: true, username: 'kevin-duong-studio' }
  }
}

export function useMarketingData() {
  const [posts, setPosts] = useState<MarketingPost[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_POSTS)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          return parsed.filter((p) => VALID_CHANNELS.has(p.channel))
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_POSTS
  })

  const [settings, setSettings] = useState<MarketingSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS
  })

  const [insights, setInsights] = useState<MarketInsight[]>(() => loadMarketInsights())
  const [learnedRules, setLearnedRules] = useState<AgentLearnedRule[]>(() => loadLearnedRules())
  const [learningNotice, setLearningNotice] = useState<string | null>(null)

  useEffect(() => {
    saveMarketInsights(insights)
  }, [insights])

  useEffect(() => {
    saveLearnedRules(learnedRules)
  }, [learnedRules])

  const [recommendations, setRecommendations] = useState<OrcaRecommendation[]>(() => {
    return posts.filter((p) => p.status === 'needs_review').length > 0
      ? SAMPLE_DEMO_RECOMMENDATIONS
      : INITIAL_RECOMMENDATIONS
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(posts))
    } catch (e) {
      console.error('Failed to save marketing posts:', e)
    }
  }, [posts])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings))
    } catch (e) {
      console.error('Failed to save marketing settings:', e)
    }
  }, [settings])

  const savePost = useCallback((post: MarketingPost) => {
    const cleanPost: MarketingPost = {
      ...post,
      channel: VALID_CHANNELS.has(post.channel) ? post.channel : 'pinterest'
    }
    setPosts((prev) => {
      const idx = prev.findIndex((p) => p.id === cleanPost.id)
      if (idx !== -1) {
        return prev.map((p) => (p.id === cleanPost.id ? cleanPost : p))
      }
      return [cleanPost, ...prev]
    })
  }, [])

  const deletePost = useCallback((id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const approvePost = useCallback((id: string) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'scheduled' as const } : p)))
  }, [])

  const approveAll = useCallback(() => {
    setPosts((prev) =>
      prev.map((p) => (p.status === 'needs_review' ? { ...p, status: 'scheduled' as const } : p))
    )
  }, [])

  const batchAddPosts = useCallback((newPosts: MarketingPost[]) => {
    const valid = newPosts.filter((p) => VALID_CHANNELS.has(p.channel))
    setPosts((prev) => [...valid, ...prev])
  }, [])

  const seedDemoCampaign = useCallback(() => {
    setPosts(SAMPLE_DEMO_CAMPAIGN)
    setRecommendations(SAMPLE_DEMO_RECOMMENDATIONS)
  }, [])

  const runMarketDiscovery = useCallback(() => {
    const result = runAutonomousMarketDiscovery(insights, learnedRules)
    setInsights(result.newInsights)
    setLearnedRules(result.newRules)
    setLearningNotice(result.discoverySummary)
    setTimeout(() => setLearningNotice(null), 6000)
    return result.discoverySummary
  }, [insights, learnedRules])

  const runAudit = useCallback(() => {
    const result = auditPublishedPosts(posts, learnedRules)
    setPosts(result.updatedPosts)
    setLearnedRules(result.updatedRules)
    setLearningNotice(result.reflectionSummary)
    setTimeout(() => setLearningNotice(null), 6000)
    return result.reflectionSummary
  }, [posts, learnedRules])

  const clearAllPosts = useCallback(() => {
    setPosts([])
    setRecommendations([])
    try {
      localStorage.removeItem(STORAGE_KEY_POSTS)
    } catch {
      // ignore
    }
  }, [])

  const agents: ChannelAgentStatus[] = INITIAL_CHANNEL_AGENTS.map((agent) => {
    const queuedCount = posts.filter(
      (p) =>
        p.channel === agent.channel && (p.status === 'scheduled' || p.status === 'needs_review')
    ).length
    const publishedCount = posts.filter(
      (p) => p.channel === agent.channel && p.status === 'published'
    ).length
    return {
      ...agent,
      queuedPosts: queuedCount,
      status: queuedCount > 0 ? ('active' as const) : ('idle' as const),
      successRate: publishedCount > 0 ? '98.5%' : '—',
      nextRun: queuedCount > 0 ? 'Scheduled' : 'Standby'
    }
  })

  return {
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
  }
}
