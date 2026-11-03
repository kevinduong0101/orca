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

export const SAMPLE_DEMO_CAMPAIGN: MarketingPost[] = [
  {
    id: 'demo-post-1',
    title: 'Saigon Golden Hour Editorial — 3-Frame Story',
    channel: 'instagram',
    status: 'needs_review',
    scheduledFor: '2026-11-06 18:00',
    content:
      'The secret to golden hour isn’t the sun — it’s how you flag the bounce.\n\nShot on Leica M11 + 50mm Summilux f/1.4. ISO 64, 1/1000s.\nNotice how the warm rim light carves the subject while keeping the skin tones velvety and natural.\n\nWhich slide has your favorite mood: 1, 2, or 3?',
    tags: ['#saigonphotographer', '#editorialportrait', '#goldenhour', '#filmtones'],
    authorAgent: 'Social Media Agent',
    mediaType: 'carousel'
  },
  {
    id: 'demo-post-2',
    title: '3 Things Boutique Studios Overlook in Client Onboarding',
    channel: 'threads',
    status: 'needs_review',
    scheduledFor: '2026-11-03 14:30',
    content:
      'Most photographers over-deliver 200 raw photos when the client only wanted 12 unforgettable ones.\n\n1. Moodboard alignment before contracts.\n2. Wardrobe texture guide (not just color palette).\n3. A 48h preview gallery to maintain momentum.\n\nWhat’s your golden rule for creative clients?',
    tags: ['#photographybusiness', '#creativestudio'],
    authorAgent: 'Conversation Agent',
    mediaType: 'article'
  },
  {
    id: 'demo-post-3',
    title: 'Minimalist Studio Lighting Moodboard & Gear Blueprint',
    channel: 'pinterest',
    status: 'scheduled',
    scheduledFor: '2026-11-04 09:00',
    content:
      'A clean 1-light setup guide for dramatic, natural-looking portraiture. Includes exact diffusion angles, flag positioning, and aperture settings for editorial studio shoots.',
    destinationUrl: 'https://kevinduongphotography.com/journal/minimalist-lighting',
    boardName: 'Studio Lighting & Techniques',
    tags: ['#studiolighting', '#minimalistportrait', '#lightingdiagram'],
    authorAgent: 'Visual SEO Agent',
    mediaType: 'image'
  },
  {
    id: 'demo-post-4',
    title: 'Why We Transitioned to an AI-Native Media Pipeline',
    channel: 'linkedin',
    status: 'needs_review',
    scheduledFor: '2026-11-05 09:30',
    content:
      'We cut our client proofing delivery time by 75% without compromising image fidelity.\n\nBy coupling Cloudflare R2 edge storage with local autonomous agents in Orca:\n• Instant metadata indexing & alt-text extraction\n• Zero cloud egress fees on multi-gigabyte raw catalogs\n• Seamless human-in-the-loop approvals before client publishing\n\nCreative excellence isn’t just aesthetic — it’s architectural.',
    tags: ['#creativetech', '#artificialintelligence', '#digitalassetmanagement'],
    authorAgent: 'Professional Agent',
    mediaType: 'article'
  },
  {
    id: 'demo-post-5',
    title: 'Next.js 15 & Cloudflare R2: Delivering 50MB Full-Frame Portfolios Under 100ms',
    channel: 'website',
    status: 'published',
    scheduledFor: '2026-11-02 10:00',
    content:
      '# Next.js 15 & Cloudflare R2 for High-Res Photography\n\nBuilding a high-end photography portfolio requires handling massive 50MB+ lossless RAW derivatives while maintaining sub-second Time to First Byte (TTFB).\n\n## The Architecture\n1. **Cloudflare R2** for S3-compatible, zero-egress asset storage.\n2. **Next.js 15 Partial Prerendering (PPR)** for instantaneous shell delivery.\n3. **WebP/AVIF On-the-fly Transformation** via edge workers.\n\nThe result: crystal-clear zoomable galleries that load instantaneously anywhere in the world.',
    destinationUrl: 'https://kevinduongphotography.com/journal/nextjs-cloudflare-r2',
    tags: ['#nextjs15', '#cloudflarer2', '#webperf', '#architecture'],
    authorAgent: 'SEO & Journal Agent',
    mediaType: 'article'
  }
]

export const SAMPLE_DEMO_RECOMMENDATIONS: OrcaRecommendation[] = [
  {
    id: 'rec-1',
    title: '3 Drafts Require Your Editorial Sign-off',
    description: 'Instagram, Threads, and LinkedIn drafts are ready in the Approval Queue.',
    urgency: 'high',
    channel: 'general',
    actionLabel: 'Review Queue'
  },
  {
    id: 'rec-2',
    title: 'Optimal Weekend Window for Pinterest',
    description:
      'Pinterest search volume for "Editorial Wedding Inspiration" spikes on Thursday evening.',
    urgency: 'medium',
    channel: 'pinterest',
    actionLabel: 'Schedule Pin'
  }
]
