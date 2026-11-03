import React, { useState } from 'react'
import { Check, Sparkles, Wand2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MarketingChannel, MarketingPost } from '../types/marketing-types'

export function ContentStudioModal({
  post,
  onSave
}: {
  post: MarketingPost
  onSave?: (updated: MarketingPost) => void
}): React.JSX.Element {
  const [content, setContent] = useState(post.content)
  const [title, setTitle] = useState(post.title)
  const [channel, setChannel] = useState<MarketingChannel>(post.channel)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 rounded-2xl border border-zinc-800 bg-zinc-900/90 backdrop-blur-xl">
      {/* Editor Side */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <Wand2 className="size-4 text-purple-400" />
            Content Studio & Editor
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Refine captions, hashtags, and media variants with AI assistance
          </p>
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-300 block mb-1">Target Channel</label>
          <div className="flex gap-2">
            {(['instagram', 'threads', 'pinterest', 'linkedin', 'website'] as const).map((ch) => (
              <button
                key={ch}
                type="button"
                onClick={() => setChannel(ch)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs capitalize font-medium border transition-colors',
                  channel === ch
                    ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-950'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                )}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-300 block mb-1">
            Post Title / Concept
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-zinc-300">Body & Copy</label>
            <span className="text-[11px] text-zinc-500">{content.length} characters</span>
          </div>
          <textarea
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-purple-500 font-mono leading-relaxed resize-none"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 font-medium transition-colors"
          >
            <Sparkles className="size-3.5 text-purple-400" />
            AI Polish & Enhance
          </button>

          <button
            type="button"
            onClick={() => onSave?.({ ...post, title, content, channel })}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs text-white font-semibold transition-colors shadow-lg shadow-purple-950"
          >
            <Check className="size-3.5" />
            Save Changes
          </button>
        </div>
      </div>

      {/* Live Social Preview Side */}
      <div className="flex flex-col items-center justify-center p-6 rounded-xl border border-zinc-800 bg-zinc-950/60">
        <span className="text-xs uppercase font-bold tracking-wider text-zinc-500 mb-4">
          Live {channel} Preview
        </span>

        {/* Platform Mockup Frame */}
        <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-4 shadow-2xl">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="size-8 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-xs font-bold text-white shadow-inner">
              KD
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-100 leading-none">Kevin Duong</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                {channel === 'instagram'
                  ? '@kevinduong.photo'
                  : channel === 'linkedin'
                    ? 'Founder & Photographer'
                    : '@kevinduong'}
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-zinc-950 border border-zinc-800/80 p-3 mb-3 text-xs text-zinc-200 whitespace-pre-line leading-relaxed">
            {content || 'Preview copy will appear here...'}
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 border-t border-zinc-800/60">
            <span>Orca Content Engine</span>
            <span className="text-purple-400 font-medium">Ready to Publish</span>
          </div>
        </div>
      </div>
    </div>
  )
}
