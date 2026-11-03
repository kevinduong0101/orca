import type { MarketInsight, AgentLearnedRule } from '../types/marketing-types'

const STORAGE_KEY_INSIGHTS = 'orca_marketing_market_insights_v1'
const STORAGE_KEY_RULES = 'orca_marketing_learned_rules_v1'

export const INITIAL_MARKET_INSIGHTS: MarketInsight[] = [
  {
    id: 'insight-pin-01',
    channel: 'pinterest',
    sourceUrl: 'https://www.pinterest.com/search/pins/?q=saigon%20editorial%20photography',
    topHeadline: 'Film-Toned Couple Moments in Old Cho Lon (Top 1% Repins)',
    estimatedEngagement: '18.6k Saves • 3.2k Outbound Clicks',
    visualPattern: 'Aspect Ratio 2:3, Warm 35mm Grain, Candid Motion Blur, Natural Laughs',
    copywritingPattern:
      "Hook: 'Not every couple photoshoot needs stiff poses.' + 3 Location Tips + Destination Link",
    extractedRule:
      'Candid emotional hooks paired with cinematic 2:3 vertical framing deliver 4.2x higher click-throughs to booking pages than staged wedding portraits.',
    discoveredAt: '2026-11-01 10:30'
  },
  {
    id: 'insight-pin-02',
    channel: 'pinterest',
    sourceUrl: 'https://www.pinterest.com/search/pins/?q=wedding%20photography%20pricing%20guide',
    topHeadline: '5 Things to Ask Your Destination Photographer Before Booking',
    estimatedEngagement: '9.4k Saves • 1.8k Clicks',
    visualPattern: 'Carousel Pin with typography overlay on first slide, editorial clean shot',
    copywritingPattern: 'Educational listicle with bold numbers, transparent pricing expectations',
    extractedRule:
      'Educational listicles with transparent value frameworks build trust 60% faster with expat & overseas couples.',
    discoveredAt: '2026-11-02 14:15'
  },
  {
    id: 'insight-li-01',
    channel: 'linkedin',
    sourceUrl: 'https://www.linkedin.com/feed/',
    topHeadline: 'Why Creative Founders Lose Clients When They Compete on Price Alone',
    estimatedEngagement: '420 Reactions • 88 Reposts • 65 Inbound DMs',
    visualPattern: 'High-contrast black & white behind-the-scenes portrait of artist at work',
    copywritingPattern:
      'Narrative 4-pillar breakdown: Hook -> Vulnerable Mistake -> The Shift -> Direct Principle',
    extractedRule:
      'Vulnerable case studies on positioning and craft generate 3x more premium inbound client inquiries than portfolio showcase posts.',
    discoveredAt: '2026-11-02 16:45'
  }
]

export const INITIAL_LEARNED_RULES: AgentLearnedRule[] = [
  {
    id: 'rule-01',
    channel: 'pinterest',
    title: 'Cinematic 2:3 Vertical Storytelling Over Generic Poses',
    rule: 'Always enforce aspect ratio 2:3 with warm cinematic tone. First line must challenge conventional portrait posing.',
    confidenceScore: 92,
    status: 'active_playbook',
    impactDescription: '+42% outbound traffic to kevinduong.com'
  },
  {
    id: 'rule-02',
    channel: 'pinterest',
    title: 'Explicit Destination URL In First 300 Chars',
    rule: 'Include destination URL directly in caption summary and set boardName to niche location to match search intent.',
    confidenceScore: 88,
    status: 'active_playbook',
    impactDescription: '+28% save-to-click conversion rate'
  },
  {
    id: 'rule-03',
    channel: 'linkedin',
    title: 'Founder Narrative: The Price vs Value Epiphany',
    rule: 'Structure posts around the 4 pillars: Creative Vision, Business Reality, Technical Craft, and Inbound Call-to-Action.',
    confidenceScore: 94,
    status: 'active_playbook',
    impactDescription: '+3.5x inbound client consultation requests'
  },
  {
    id: 'rule-04',
    channel: 'pinterest',
    title: 'Hypothesis: Staged Glamour Studio Shots',
    rule: 'Testing if polished studio flash lighting outperforms street natural light for high-budget commercial clients.',
    confidenceScore: 45,
    status: 'testing_hypothesis',
    impactDescription: 'Under observation: lower save velocity than natural street portraits'
  }
]

export function loadMarketInsights(): MarketInsight[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_INSIGHTS)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch {
    // fallback
  }
  return INITIAL_MARKET_INSIGHTS
}

export function saveMarketInsights(insights: MarketInsight[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_INSIGHTS, JSON.stringify(insights))
  } catch (err) {
    console.error('Failed to save market insights:', err)
  }
}

export function loadLearnedRules(): AgentLearnedRule[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RULES)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch {
    // fallback
  }
  return INITIAL_LEARNED_RULES
}

export function saveLearnedRules(rules: AgentLearnedRule[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_RULES, JSON.stringify(rules))
  } catch (err) {
    console.error('Failed to save learned rules:', err)
  }
}

export function updateRuleConfidence(
  rules: AgentLearnedRule[],
  ruleId: string,
  delta: number,
  reason: string
): AgentLearnedRule[] {
  return rules.map((r) => {
    if (r.id === ruleId) {
      const nextScore = Math.min(100, Math.max(10, r.confidenceScore + delta))
      const status: AgentLearnedRule['status'] =
        nextScore >= 75
          ? 'active_playbook'
          : nextScore <= 40
            ? 'deprecated_low_ctr'
            : 'testing_hypothesis'
      return {
        ...r,
        confidenceScore: nextScore,
        status,
        impactDescription: reason
      }
    }
    return r
  })
}
