import { useState, useEffect, useCallback } from 'react'
import type {
  MarketingPost,
  ChannelAgentStatus,
  OrcaRecommendation,
  MarketingSettings
} from './types/marketing-types'
import {
  INITIAL_CHANNEL_AGENTS,
  INITIAL_POSTS,
  INITIAL_RECOMMENDATIONS,
  SAMPLE_DEMO_CAMPAIGN,
  SAMPLE_DEMO_RECOMMENDATIONS
} from './marketing-mock-data'

const STORAGE_KEY_POSTS = 'orca_marketing_posts_v1'
const STORAGE_KEY_SETTINGS = 'orca_marketing_settings_v1'

const DEFAULT_SETTINGS: MarketingSettings = {
  webhookUrl: '',
  autoPublishChannels: {
    instagram: false,
    threads: false,
    pinterest: false,
    linkedin: false,
    website: false
  },
  notifyOnFailure: true
}

export function useMarketingData() {
  const [posts, setPosts] = useState<MarketingPost[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_POSTS)
      if (saved) {
        return JSON.parse(saved)
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
    setPosts((prev) => {
      const idx = prev.findIndex((p) => p.id === post.id)
      if (idx !== -1) {
        return prev.map((p) => (p.id === post.id ? post : p))
      }
      return [post, ...prev]
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
    setPosts((prev) => [...newPosts, ...prev])
  }, [])

  const seedDemoCampaign = useCallback(() => {
    setPosts(SAMPLE_DEMO_CAMPAIGN)
    setRecommendations(SAMPLE_DEMO_RECOMMENDATIONS)
  }, [])

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
    clearAllPosts
  }
}
