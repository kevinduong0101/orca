import type { AutomationSchedulePreset } from '../../../../shared/automations-types'
import type { TuiAgent } from '../../../../shared/tui-agent'
import { translate } from '@/i18n/i18n'
import { createLocalizedCatalog } from '@/i18n/localized-catalog'

export type AutomationTemplate = {
  id: string
  category: string
  label: string
  description: string
  name: string
  prompt: string
  preset: AutomationSchedulePreset
  time?: string
  dayOfWeek?: string
  agentId?: TuiAgent
  missedRunGraceMinutes?: string
}

export const getAutomationTemplates = createLocalizedCatalog((): AutomationTemplate[] => [
  // --- Marketing OS Campaign Templates ---
  {
    id: 'marketing-weekly-planner',
    category: 'Marketing OS',
    label: 'Monday Content Strategy & Planner',
    description:
      'Autonomous 7-day multi-channel content strategy, captions, hashtags, and schedule.',
    name: 'Monday Content Planner (Marketing OS)',
    prompt:
      'Act as the Marketing Director Agent. Review current brand positioning, recent content performance, and upcoming campaign priorities. Plan a comprehensive 7-day content schedule across Instagram, Threads, Pinterest, LinkedIn, and Website Blog. For each post, prepare the draft title, body copy, hashtags, media format, and scheduled time in Marketing OS.',
    preset: 'weekly',
    dayOfWeek: '1',
    time: '08:00',
    missedRunGraceMinutes: '720'
  },
  {
    id: 'marketing-pinterest-daily',
    category: 'Marketing OS',
    label: 'Pinterest Daily Evergreen Publisher',
    description:
      'Curate portfolio photo concepts and generate 3 SEO-optimized Evergreen Pin variations.',
    name: 'Pinterest Daily Evergreen Publisher',
    prompt:
      'Act as the Pinterest Visual SEO Agent. Select high-quality portfolio images and project concepts. Generate 3 keyword-rich Evergreen Pin variations targeting high-volume searches. Provide board recommendations, searchable pin titles, keyword-dense descriptions, and outbound destination links.',
    preset: 'daily',
    time: '11:30',
    missedRunGraceMinutes: '360'
  },
  {
    id: 'marketing-linkedin-weekly',
    category: 'Marketing OS',
    label: 'Thursday LinkedIn Thought Leadership',
    description:
      'Craft authentic professional insights, studio case studies, and business lessons.',
    name: 'Thursday LinkedIn Thought Leadership',
    prompt:
      'Act as the LinkedIn Professional Agent. Draft an authentic, insightful industry post about creative studio operations, client onboarding, or modern photography techniques. Use conversational hook formatting, storytelling structure, and clear takeaways without corporate jargon.',
    preset: 'weekly',
    dayOfWeek: '4',
    time: '09:00',
    missedRunGraceMinutes: '720'
  },
  {
    id: 'marketing-blog-repurpose',
    category: 'Marketing OS',
    label: 'Blog-to-Social Multi-Channel Sync',
    description:
      'Repurpose latest published articles or photo galleries into an omnichannel social campaign.',
    name: 'Blog-to-Social Omnichannel Repurposer',
    prompt:
      'Act as the Multi-Channel Repurposing Director. Take the latest published blog article or portfolio gallery and repurpose it into: (1) One 5-slide Instagram carousel concept with slide-by-slide copy, (2) Two conversational Threads posts, (3) Three high-intent Pinterest pins with outbound links, (4) One LinkedIn business case post. Send all drafts into Marketing OS Approvals.',
    preset: 'weekdays',
    time: '10:00',
    missedRunGraceMinutes: '1440'
  },
  {
    id: 'marketing-sunday-review',
    category: 'Marketing OS',
    label: 'Sunday Marketing Performance Review',
    description:
      'Analyze weekly content output, review engagement, and propose next week recommendations.',
    name: 'Sunday Marketing Performance Review',
    prompt:
      'Act as the Marketing Analytics Agent. Summarize this week’s content output across all 5 channels. Identify which concepts drove the highest reach, review content gaps, and propose 3 proactive recommendations for next week’s campaign in Marketing OS.',
    preset: 'weekly',
    dayOfWeek: '0',
    time: '18:00',
    missedRunGraceMinutes: '720'
  },

  // --- Engineering & Codebase Templates ---
  {
    id: 'repo-health-weekday',
    category: translate(
      'auto.components.automations.automation.templates.repoHealth.category',
      'Repo health'
    ),
    label: translate(
      'auto.components.automations.automation.templates.b84757677d',
      'Weekday repo audit'
    ),
    description: translate(
      'auto.components.automations.automation.templates.a7fbd32ddb',
      'Check dependencies, failing tests, and risky open changes each weekday.'
    ),
    name: translate(
      'auto.components.automations.automation.templates.repoHealth.name',
      'Weekday repo audit'
    ),
    prompt: translate(
      'auto.components.automations.automation.templates.repoHealth.prompt',
      'Review the repository health. Check dependency updates, failing tests, lint/typecheck status, and risky open changes. Summarize findings and suggest the next action.'
    ),
    preset: 'weekdays',
    time: '09:00',
    missedRunGraceMinutes: '720'
  },
  {
    id: 'release-prep-weekly',
    category: translate(
      'auto.components.automations.automation.templates.releasePrep.category',
      'Release prep'
    ),
    label: translate(
      'auto.components.automations.automation.templates.39ed39280a',
      'Release readiness'
    ),
    description: translate(
      'auto.components.automations.automation.templates.513401db93',
      'Prepare a weekly release risk summary from the current project state.'
    ),
    name: translate(
      'auto.components.automations.automation.templates.releasePrep.name',
      'Release readiness review'
    ),
    prompt: translate(
      'auto.components.automations.automation.templates.releasePrep.prompt',
      'Prepare a release readiness summary. Look for blockers, unmerged risky changes, missing validation, and documentation gaps. End with a concise release/no-release recommendation.'
    ),
    preset: 'weekly',
    time: '14:00',
    dayOfWeek: '4',
    missedRunGraceMinutes: '1440'
  },
  {
    id: 'recurring-review-daily',
    category: translate(
      'auto.components.automations.automation.templates.recurringReview.category',
      'Recurring review'
    ),
    label: translate(
      'auto.components.automations.automation.templates.6023075b27',
      'Daily change review'
    ),
    description: translate(
      'auto.components.automations.automation.templates.3b7281c75f',
      'Scan recent work and call out correctness, UX, and test coverage risks.'
    ),
    name: translate(
      'auto.components.automations.automation.templates.recurringReview.name',
      'Daily change review'
    ),
    prompt: translate(
      'auto.components.automations.automation.templates.recurringReview.prompt',
      'Review recent changes in this workspace. Focus on correctness risks, UX regressions, missing tests, and follow-up tasks. Keep the report short and actionable.'
    ),
    preset: 'daily',
    time: '16:30',
    missedRunGraceMinutes: '180'
  },
  {
    id: 'maintenance-hourly',
    category: translate(
      'auto.components.automations.automation.templates.maintenance.category',
      'Maintenance'
    ),
    label: translate(
      'auto.components.automations.automation.templates.8a0228bea3',
      'Hourly queue check'
    ),
    description: translate(
      'auto.components.automations.automation.templates.37571fcb16',
      'Look for stuck work, stale generated files, and failed local validation.'
    ),
    name: translate(
      'auto.components.automations.automation.templates.maintenance.name',
      'Hourly maintenance check'
    ),
    prompt: translate(
      'auto.components.automations.automation.templates.maintenance.prompt',
      'Check for stuck work, stale generated files, failing validation, and anything that needs human attention. Report only actionable issues.'
    ),
    preset: 'hourly',
    time: '00:15',
    missedRunGraceMinutes: '30'
  }
])
