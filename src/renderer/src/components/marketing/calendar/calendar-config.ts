import type { MarketingChannel } from '../types/marketing-types'

export const CHANNEL_CONFIG: Record<
  MarketingChannel,
  { label: string; icon: string; badgeBg: string; text: string; border: string; glow: string }
> = {
  instagram: {
    label: 'Instagram',
    icon: '📸',
    badgeBg: 'bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20',
    text: 'text-pink-300',
    border: 'border-pink-500/30 hover:border-pink-500/60',
    glow: 'hover:shadow-pink-950/30'
  },
  threads: {
    label: 'Threads',
    icon: '🧵',
    badgeBg: 'bg-zinc-800/80',
    text: 'text-zinc-200',
    border: 'border-zinc-700/60 hover:border-zinc-600',
    glow: 'hover:shadow-zinc-900/40'
  },
  pinterest: {
    label: 'Pinterest',
    icon: '📌',
    badgeBg: 'bg-rose-950/40',
    text: 'text-rose-300',
    border: 'border-rose-500/30 hover:border-rose-500/60',
    glow: 'hover:shadow-rose-950/30'
  },
  linkedin: {
    label: 'LinkedIn',
    icon: '💼',
    badgeBg: 'bg-blue-950/40',
    text: 'text-blue-300',
    border: 'border-blue-500/30 hover:border-blue-500/60',
    glow: 'hover:shadow-blue-950/30'
  },
  website: {
    label: 'Website Blog',
    icon: '🌐',
    badgeBg: 'bg-emerald-950/40',
    text: 'text-emerald-300',
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
