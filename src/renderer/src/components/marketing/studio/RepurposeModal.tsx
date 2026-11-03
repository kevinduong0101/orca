import React, { useState } from 'react'
import { Sparkles, X, CheckCheck, Send, Wand2, Layers } from 'lucide-react'
import type { MarketingPost, MarketingChannel } from '../types/marketing-types'

type RepurposedVariant = {
  channel: MarketingChannel
  title: string
  content: string
  tags: string[]
  scheduledOffsetDays: number
  scheduledTime: string
  mediaType: 'carousel' | 'image' | 'article'
}

export function RepurposeModal({
  isOpen,
  onClose,
  onSaveBatch
}: {
  isOpen: boolean
  onClose: () => void
  onSaveBatch: (posts: MarketingPost[]) => void
}): React.JSX.Element | null {
  const [sourceConcept, setSourceConcept] = useState(
    'Saigon Golden Hour: Natural Light Portraiture with Flagged Bounce Technique'
  )
  const [isGenerating, setIsGenerating] = useState(false)

  const [variants, setVariants] = useState<RepurposedVariant[]>([
    {
      channel: 'instagram',
      title: 'Saigon Golden Hour Editorial — 3-Frame Carousel',
      content:
        'The secret to golden hour isn’t the sun — it’s how you flag the bounce.\n\nSlide 1: The Raw Directional Light\nSlide 2: Flagging the Ambient Spill\nSlide 3: The Final Grade (Leica M11 + 50mm Summilux)\n\nWhich frame resonates most with your aesthetic: 1, 2, or 3?',
      tags: ['#saigonphotographer', '#editorialportrait', '#goldenhour', '#filmtones'],
      scheduledOffsetDays: 1,
      scheduledTime: '18:00',
      mediaType: 'carousel'
    },
    {
      channel: 'threads',
      title: 'The Truth About Golden Hour Lighting',
      content:
        'Most photographers wait all day for golden hour, only to let ambient flare wash out all their contrast.\n\nGolden hour only works if you create shadow opposite the sun.\n\nAre you flagging your natural light or shooting wide open into the glare?',
      tags: ['#photographybusiness', '#portraiture'],
      scheduledOffsetDays: 1,
      scheduledTime: '14:30',
      mediaType: 'article'
    },
    {
      channel: 'pinterest',
      title: 'Minimalist 1-Light & Natural Bounce Portrait Diagram',
      content:
        'Step-by-step lighting diagram and camera settings for cinematic Saigon natural light editorial portraiture. Ideal for boutique studios and portrait moodboards.',
      tags: ['#lightingdiagram', '#studioportrait', '#editorialinspiration'],
      scheduledOffsetDays: 2,
      scheduledTime: '09:00',
      mediaType: 'image'
    },
    {
      channel: 'linkedin',
      title: 'Why Creative Direction Requires Systems Architecture',
      content:
        'Mastering natural light isn’t an accident — it’s a repeatable protocol.\n\nIn our recent Saigon editorial series:\n• 100% natural light with negative fill\n• Rapid client review with edge storage\n• Zero cloud egress fees on RAW asset batches\n\nTrue creative freedom comes from rock-solid operational discipline.',
      tags: ['#creativestrategy', '#architecture', '#leadership'],
      scheduledOffsetDays: 3,
      scheduledTime: '09:30',
      mediaType: 'article'
    }
  ])

  if (!isOpen) {
    return null
  }

  const handleRegenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
    }, 400)
  }

  const handlePublishAll = (asScheduled: boolean) => {
    const today = new Date()
    const posts: MarketingPost[] = variants.map((v, idx) => {
      const targetDate = new Date(today)
      targetDate.setDate(today.getDate() + v.scheduledOffsetDays)
      const dateStr = targetDate.toISOString().split('T')[0]

      return {
        id: `repurposed-${Date.now()}-${idx}`,
        title: v.title,
        channel: v.channel,
        status: asScheduled ? 'scheduled' : 'needs_review',
        scheduledFor: `${dateStr} ${v.scheduledTime}`,
        content: v.content,
        tags: v.tags,
        authorAgent: 'Marketing Director Agent',
        mediaType: v.mediaType,
        repurposedFrom: sourceConcept
      }
    })

    onSaveBatch(posts)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="flex flex-col w-full max-w-4xl max-h-[90vh] rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-gradient-to-tr from-purple-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-purple-950/40">
              <Sparkles className="size-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                Omnichannel Content Repurposing Engine
              </h3>
              <p className="text-xs text-zinc-400">
                Transform 1 core article, photoshoot, or project into 4 tailored platform variants
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Source Concept Input */}
        <div className="p-6 border-b border-zinc-800/80 bg-zinc-900/20 space-y-2">
          <label className="text-xs font-semibold text-zinc-300 block">
            Source Story / Core Topic / Blog Link
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={sourceConcept}
              onChange={(e) => setSourceConcept(e.target.value)}
              placeholder="e.g. Next.js 15 & Cloudflare R2 architecture case study..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700/80 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-purple-500"
            />
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={isGenerating}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-purple-950 transition-all disabled:opacity-50"
            >
              <Wand2 className="size-3.5" />
              {isGenerating ? 'Synthesizing...' : 'Re-synthesize All'}
            </button>
          </div>
        </div>

        {/* 4 Multi-Channel Cards Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4 scrollbar-sleek">
          {variants.map((v, i) => (
            <div
              key={v.channel}
              className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4 space-y-2.5 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {v.channel === 'instagram'
                        ? '📸'
                        : v.channel === 'threads'
                          ? '🧵'
                          : v.channel === 'pinterest'
                            ? '📌'
                            : '💼'}
                    </span>
                    <span className="text-xs font-bold text-zinc-200 capitalize">{v.channel}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                      {v.mediaType}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    +{v.scheduledOffsetDays}d at {v.scheduledTime}
                  </span>
                </div>

                <input
                  type="text"
                  value={v.title}
                  onChange={(e) => {
                    const val = e.target.value
                    setVariants((prev) =>
                      prev.map((item, idx) => (idx === i ? { ...item, title: val } : item))
                    )
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950/80 border border-zinc-800 text-xs font-semibold text-zinc-200 focus:outline-none focus:border-purple-500"
                />

                <textarea
                  rows={4}
                  value={v.content}
                  onChange={(e) => {
                    const val = e.target.value
                    setVariants((prev) =>
                      prev.map((item, idx) => (idx === i ? { ...item, content: val } : item))
                    )
                  }}
                  className="w-full px-2.5 py-2 rounded-lg bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-300 font-mono leading-relaxed focus:outline-none focus:border-purple-500 resize-none"
                />

                <div className="flex flex-wrap gap-1">
                  {v.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] text-zinc-400 bg-zinc-800/80 px-1.5 py-0.5 rounded"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-zinc-800 px-6 py-4 bg-zinc-900/60">
          <div className="text-xs text-zinc-400 flex items-center gap-1.5">
            <Layers className="size-3.5 text-zinc-400" />
            <span>4 tailored variants ready for approval</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handlePublishAll(false)}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Send className="size-3.5 text-amber-400" />
              Send All to Approval Queue
            </button>

            <button
              type="button"
              onClick={() => handlePublishAll(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-950 transition-colors"
            >
              <CheckCheck className="size-3.5" />
              Approve & Schedule All (Staggered)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
