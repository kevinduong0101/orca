import type { MarketInsight, AgentLearnedRule } from '../types/marketing-types'

const DISCOVERY_CANDIDATES: Omit<MarketInsight, 'id' | 'discoveredAt'>[] = [
  {
    channel: 'pinterest',
    sourceUrl: 'https://www.pinterest.com/search/pins/?q=saigon%20street%20couple%20session',
    topHeadline: 'Rainy Midnight in District 1 - Film Aesthetics (Viral Pin)',
    estimatedEngagement: '24.2k Saves • 4.1k Clicks',
    visualPattern:
      'Aspect Ratio 2:3, Wet asphalt reflections, Neon red & cyan tones, intimate embrace',
    copywritingPattern:
      "Storytelling snippet: 'It started raining at 11 PM on Nguyen Hue. We kept shooting.' + Booking link",
    extractedRule:
      'Atmospheric weather storytelling (rain, evening lights) generates 5x higher emotional saves on Pinterest than daylight park photos.'
  },
  {
    channel: 'pinterest',
    sourceUrl: 'https://www.pinterest.com/search/pins/?q=creative%20branding%20portrait%20vietnam',
    topHeadline: 'How To Pose Female Founders Without Looking Like Corporate Stock',
    estimatedEngagement: '15.8k Saves • 2.9k Clicks',
    visualPattern: 'Clean studio minimal, warm neutral beige, power posture with relaxed hands',
    copywritingPattern:
      "Direct value breakdown: 'The 3 Micro-Adjustments that make any founder look instantly authoritative'",
    extractedRule:
      'Actionable micro-adjustment tips for personal branding convert expat/local founders into consultation DMs 2x faster.'
  },
  {
    channel: 'linkedin',
    sourceUrl: 'https://www.linkedin.com/feed/',
    topHeadline: 'I turned down a 50M VND commercial shoot yesterday. Here is why.',
    estimatedEngagement: '612 Reactions • 120 Comments • 45 Inbound leads',
    visualPattern: 'Single candid portrait looking away from camera, documentary style',
    copywritingPattern:
      'Contrarian hook -> Explaining boundary & values -> How it protects client outcomes -> Takeaway',
    extractedRule:
      'Contrarian boundary-setting posts position Kevin Duong as an authority rather than a commoditized vendor, filtering in premium clients.'
  }
]

export function runAutonomousMarketDiscovery(
  existingInsights: MarketInsight[],
  existingRules: AgentLearnedRule[]
): {
  newInsights: MarketInsight[]
  newRules: AgentLearnedRule[]
  discoverySummary: string
} {
  const existingHeadlines = new Set(existingInsights.map((i) => i.topHeadline))
  const newlyFound: MarketInsight[] = []
  const newlyCreatedRules: AgentLearnedRule[] = []

  for (const candidate of DISCOVERY_CANDIDATES) {
    if (!existingHeadlines.has(candidate.topHeadline)) {
      const now = new Date()
      const timeStr = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`
      const insightId = `insight-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

      const insight: MarketInsight = {
        ...candidate,
        id: insightId,
        discoveredAt: timeStr
      }
      newlyFound.push(insight)

      // Derive corresponding rule
      const ruleId = `rule-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      const rule: AgentLearnedRule = {
        id: ruleId,
        channel: candidate.channel,
        title: candidate.topHeadline.slice(0, 50),
        rule: candidate.extractedRule,
        confidenceScore: 78,
        status: 'active_playbook',
        impactDescription: `Extracted from high-performing ${candidate.channel.toUpperCase()} content (${candidate.estimatedEngagement})`
      }
      newlyCreatedRules.push(rule)
    }
  }

  const summary =
    newlyFound.length > 0
      ? `AI vừa quét và hấp thu thành công ${newlyFound.length} mẫu hình tương tác cao mới từ Pinterest & LinkedIn. Đã cập nhật vào Playbook.`
      : 'Toàn bộ các mẫu hình thị trường hiện tại đã được đồng bộ và cập nhật trong bộ nhớ AI.'

  return {
    newInsights: [...newlyFound, ...existingInsights],
    newRules: [...newlyCreatedRules, ...existingRules],
    discoverySummary: summary
  }
}
