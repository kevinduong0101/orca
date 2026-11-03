import type { MarketingChannel } from '../types/marketing-types'

export const CHANNEL_CONFIG: Record<
  MarketingChannel,
  {
    label: string
    icon: string
    badgeBg: string
    text: string
    accentColor: string
    border: string
    glow: string
  }
> = {
  instagram: {
    label: 'Instagram',
    icon: '📸',
    badgeBg: 'bg-pink-500/15',
    text: 'text-pink-300',
    accentColor: '#ec4899',
    border: 'border-pink-500/30 hover:border-pink-500/60',
    glow: 'hover:shadow-pink-950/30'
  },
  threads: {
    label: 'Threads',
    icon: '🧵',
    badgeBg: 'bg-zinc-800',
    text: 'text-zinc-200',
    accentColor: '#a1a1aa',
    border: 'border-zinc-700 hover:border-zinc-500',
    glow: 'hover:shadow-zinc-900/40'
  },
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
    label: 'Website',
    icon: '🌐',
    badgeBg: 'bg-emerald-500/15',
    text: 'text-emerald-300',
    accentColor: '#10b981',
    border: 'border-emerald-500/30 hover:border-emerald-500/60',
    glow: 'hover:shadow-emerald-950/30'
  }
}

export const DAYS_OF_WEEK = [
  { name: 'Monday', short: 'Mon', dayNum: 2 },
  { name: 'Tuesday', short: 'Tue', dayNum: 3, isToday: true },
  { name: 'Wednesday', short: 'Wed', dayNum: 4 },
  { name: 'Thursday', short: 'Thu', dayNum: 5 },
  { name: 'Friday', short: 'Fri', dayNum: 6 },
  { name: 'Saturday', short: 'Sat', dayNum: 7 },
  { name: 'Sunday', short: 'Sun', dayNum: 8 }
]
