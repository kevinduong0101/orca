import type { MarketingChannel } from '../types/marketing-types'

export type ChannelVisualConfig = {
  label: string
  icon: string
  badgeBg: string
  text: string
  accentColor: string
  border: string
  glow: string
}

export const CHANNEL_CONFIG: Record<MarketingChannel, ChannelVisualConfig> = {
  pinterest: {
    label: 'Pinterest',
    icon: '📌',
    badgeBg: 'bg-rose-500/15',
    text: 'text-rose-300',
    accentColor: '#f43f5e',
    border: 'border-rose-500/30 hover:border-rose-500/60',
    glow: 'hover:shadow-rose-950/30'
  },
  linkedin: {
    label: 'LinkedIn',
    icon: '💼',
    badgeBg: 'bg-blue-500/15',
    text: 'text-blue-300',
    accentColor: '#3b82f6',
    border: 'border-blue-500/30 hover:border-blue-500/60',
    glow: 'hover:shadow-blue-950/30'
  },
  website: {
    label: 'Website Blog',
    icon: '🌐',
    badgeBg: 'bg-emerald-500/15',
    text: 'text-emerald-300',
    accentColor: '#10b981',
    border: 'border-emerald-500/30 hover:border-emerald-500/60',
    glow: 'hover:shadow-emerald-950/30'
  }
}

export const DEFAULT_CHANNEL_CONFIG: ChannelVisualConfig = {
  label: 'Marketing Post',
  icon: '📌',
  badgeBg: 'bg-zinc-800',
  text: 'text-zinc-300',
  accentColor: '#a1a1aa',
  border: 'border-zinc-700 hover:border-zinc-500',
  glow: 'hover:shadow-zinc-900/30'
}

export function getChannelConfig(channel?: string): ChannelVisualConfig {
  if (!channel) {
    return DEFAULT_CHANNEL_CONFIG
  }
  if (channel in CHANNEL_CONFIG) {
    return CHANNEL_CONFIG[channel as MarketingChannel]
  }
  if (channel === 'instagram') {
    return {
      label: 'Instagram',
      icon: '📸',
      badgeBg: 'bg-pink-500/15',
      text: 'text-pink-300',
      accentColor: '#ec4899',
      border: 'border-pink-500/30 hover:border-pink-500/60',
      glow: 'hover:shadow-pink-950/30'
    }
  }
  if (channel === 'threads') {
    return {
      label: 'Threads',
      icon: '🧵',
      badgeBg: 'bg-zinc-800',
      text: 'text-zinc-300',
      accentColor: '#71717a',
      border: 'border-zinc-700 hover:border-zinc-500',
      glow: 'hover:shadow-zinc-900/30'
    }
  }
  return DEFAULT_CHANNEL_CONFIG
}

export type DayInfo = {
  name: string
  short: string
  dayNum: number
  fullDate: string
  isToday: boolean
}

export function getWeekDays(weekOffset = 0): DayInfo[] {
  // Base Monday is Nov 2, 2026
  const baseMonday = new Date(2026, 10, 2 + weekOffset * 7)
  const dayNames = [
    { name: 'Monday', short: 'Mon' },
    { name: 'Tuesday', short: 'Tue' },
    { name: 'Wednesday', short: 'Wed' },
    { name: 'Thursday', short: 'Thu' },
    { name: 'Friday', short: 'Fri' },
    { name: 'Saturday', short: 'Sat' },
    { name: 'Sunday', short: 'Sun' }
  ]

  return dayNames.map((d, i) => {
    const cur = new Date(baseMonday.getFullYear(), baseMonday.getMonth(), baseMonday.getDate() + i)
    const y = cur.getFullYear()
    const m = String(cur.getMonth() + 1).padStart(2, '0')
    const day = String(cur.getDate()).padStart(2, '0')
    const fullDate = `${y}-${m}-${day}`
    return {
      name: d.name,
      short: d.short,
      dayNum: cur.getDate(),
      fullDate,
      isToday: fullDate === '2026-11-03'
    }
  })
}
