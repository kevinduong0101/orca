import type { ChannelAgentStatus, MarketingPost, OrcaRecommendation } from './types/marketing-types'

export const INITIAL_CHANNEL_AGENTS: ChannelAgentStatus[] = [
  {
    channel: 'instagram',
    name: 'Social Media Agent',
    role: 'Visual Storytelling & Reels Strategy',
    status: 'active',
    nextRun: 'Today 18:00',
    queuedPosts: 6,
    successRate: '98.5%',
    avatarColor: 'from-pink-500 via-purple-500 to-indigo-500'
  },
  {
    channel: 'threads',
    name: 'Conversation Agent',
    role: 'Real-time Dialog & Creative Insights',
    status: 'active',
    nextRun: 'Today 14:30',
    queuedPosts: 4,
    successRate: '99.0%',
    avatarColor: 'from-zinc-700 to-zinc-900'
  },
  {
    channel: 'pinterest',
    name: 'Visual SEO Agent',
    role: 'Evergreen Discovery & Board Curator',
    status: 'active',
    nextRun: 'Tomorrow 09:00',
    queuedPosts: 14,
    successRate: '97.2%',
    avatarColor: 'from-red-600 to-rose-700'
  },
  {
    channel: 'linkedin',
    name: 'Professional Agent',
    role: 'Industry Thought Leadership & Cases',
    status: 'active',
    nextRun: 'Thu 09:30',
    queuedPosts: 3,
    successRate: '100%',
    avatarColor: 'from-blue-600 to-cyan-700'
  },
  {
    channel: 'website',
    name: 'SEO & Journal Agent',
    role: 'Deep Articles, Alt-Text & R2 Pipeline',
    status: 'active',
    nextRun: 'Wed 10:00',
    queuedPosts: 2,
    successRate: '100%',
    avatarColor: 'from-emerald-600 to-teal-800'
  }
]

export const INITIAL_POSTS: MarketingPost[] = [
  {
    id: 'post-1',
    title: 'Editorial Natural Light Setup — High-Key Portraits',
    channel: 'instagram',
    status: 'needs_review',
    scheduledFor: '2026-11-03 18:00',
    content:
      'Mastering high-key portraits with single diffusion scrim and bounce. Swipe through for the lighting diagram and camera settings.\n\nISO 100 • 85mm f/1.4 • 1/250s',
    mediaType: 'carousel',
    tags: [
      '#portraitphotography',
      '#lightingtechniques',
      '#saigonphotographer',
      '#editorialportrait'
    ],
    authorAgent: 'Social Media Agent'
  },
  {
    id: 'post-2',
    title: '3 Things Boutique Studios Overlook in Client Onboarding',
    channel: 'threads',
    status: 'scheduled',
    scheduledFor: '2026-11-03 14:30',
    content:
      'Most photographers lose 40% of their referral momentum in the first 48 hours after delivery. Here is how automating the thank-you brief changed our client retention rate completely.',
    mediaType: 'article',
    tags: ['#businessofphotography', '#creativestudio'],
    authorAgent: 'Conversation Agent'
  },
  {
    id: 'post-3',
    title: 'Minimalist Studio Lighting Moodboard (Evergreen Pin)',
    channel: 'pinterest',
    status: 'scheduled',
    scheduledFor: '2026-11-04 09:00',
    content:
      'Curated collection of soft-box and grid setups for moody portrait sessions. High dynamic range capture for creative directors.',
    mediaType: 'image',
    tags: ['photography lighting', 'studio setup', 'editorial moodboard'],
    authorAgent: 'Visual SEO Agent',
    destinationUrl: 'https://kevinduongphotography.com/journal/lighting-moodboard',
    boardName: 'Studio Lighting & Techniques'
  },
  {
    id: 'post-4',
    title: 'Why We Transitioned from Manual Posting to Autonomous AI Agents',
    channel: 'linkedin',
    status: 'needs_review',
    scheduledFor: '2026-11-05 09:30',
    content:
      'Running a photography brand shouldn’t mean spending 3 hours every morning formatting the same concept for 4 social networks.\n\nHere is how our personal AI director turns 1 technical article into tailored platform narratives without losing brand authenticity.',
    mediaType: 'article',
    tags: ['#PersonalBranding', '#AIAgents', '#CreativeEntrepreneurship'],
    authorAgent: 'Professional Agent'
  },
  {
    id: 'post-5',
    title: 'Next.js 15 & Cloudflare R2 for High-Res Photography Portfolios',
    channel: 'website',
    status: 'published',
    scheduledFor: '2026-11-02 10:00',
    content:
      'A comprehensive engineering guide on image optimization, WebP/AVIF transformations, and sub-100ms global latency for full-frame portfolio galleries.',
    mediaType: 'article',
    tags: ['Web Development', 'Next.js', 'Cloudflare R2', 'SEO'],
    authorAgent: 'SEO & Journal Agent',
    destinationUrl: 'https://kevinduongphotography.com/journal/nextjs-cloudflare-r2'
  },
  {
    id: 'post-6',
    title: 'Saigon Golden Hour Editorial — 3-Frame Story',
    channel: 'instagram',
    status: 'scheduled',
    scheduledFor: '2026-11-06 18:00',
    content:
      'The magic of 5:30 PM golden hour along District 1 rooftops. Color graded with our signature Fuji-inspired film recipe.',
    mediaType: 'carousel',
    tags: ['#saigonvibes', '#goldenhour', '#cinematicportrait'],
    authorAgent: 'Social Media Agent'
  }
]

export const INITIAL_RECOMMENDATIONS: OrcaRecommendation[] = [
  {
    id: 'rec-1',
    title: 'Pinterest Evergreen Deficit Detected',
    description:
      'You only have 1 Pin scheduled for Thursday & Friday. The Visual SEO Agent can automatically generate 4 Pin variations from your recent Portrait shoot.',
    urgency: 'high',
    channel: 'pinterest',
    actionLabel: 'Generate 4 Pins Now'
  },
  {
    id: 'rec-2',
    title: 'Blog-to-Social Multi-Channel Gap',
    description:
      'Published article "Next.js 15 & Cloudflare R2" has not been shared on LinkedIn or Threads yet. Repurposing can drive 150+ targeted reads.',
    urgency: 'medium',
    channel: 'website',
    actionLabel: 'Repurpose to 3 Channels'
  },
  {
    id: 'rec-3',
    title: 'Instagram Carousel Peak Engagement Opportunity',
    description:
      'Tuesday high-key lighting post is ready in Approvals. Approving before 16:00 will optimize delivery for peak 18:00 audience window.',
    urgency: 'info',
    channel: 'instagram',
    actionLabel: 'Review & Approve'
  }
]
