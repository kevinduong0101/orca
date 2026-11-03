import React, { useState } from 'react'
import { Calendar, Check, Hash, Sparkles, Wand2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MarketingChannel, MarketingPost } from '../types/marketing-types'
import { InstagramPreview } from './previews/InstagramPreview'
import { ThreadsPreview } from './previews/ThreadsPreview'
import { PinterestPreview } from './previews/PinterestPreview'
import { LinkedInPreview } from './previews/LinkedInPreview'
import { WebsitePreview } from './previews/WebsitePreview'

const DEFAULT_EMPTY_POST: MarketingPost = {
  id: 'draft-new',
  title: '',
  channel: 'instagram',
  status: 'needs_review',
  scheduledFor: '2026-11-03 12:00',
  content: '',
  mediaType: 'image',
  tags: [],
  authorAgent: 'Social Media Agent'
}

export function ContentStudioModal({
  post,
  onSave
}: {
  post?: MarketingPost | null
  onSave?: (updated: MarketingPost) => void
}): React.JSX.Element {
  const activePost = post || DEFAULT_EMPTY_POST
  const [content, setContent] = useState(activePost.content)
  const [title, setTitle] = useState(activePost.title)
  const [channel, setChannel] = useState<MarketingChannel>(activePost.channel)
  const [scheduledFor, setScheduledFor] = useState(activePost.scheduledFor || '2026-11-03 12:00')
  const [tagsInput, setTagsInput] = useState((activePost.tags || []).join(' '))

  const parsedTags = tagsInput
    .split(' ')
    .map((t) => t.trim())
    .filter((t) => t.length > 0)

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
          <div className="flex flex-wrap gap-2">
            {(['instagram', 'threads', 'pinterest', 'linkedin', 'website'] as const).map((ch) => (
              <button
                key={ch}
                type="button"
                onClick={() => setChannel(ch)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs capitalize font-medium border transition-colors',
                  channel === ch
                    ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-950 font-semibold'
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
            placeholder="e.g. Minimalist Studio Lighting Setup"
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1 flex items-center gap-1">
              <Calendar className="size-3 text-zinc-400" />
              Schedule Time
            </label>
            <input
              type="text"
              value={scheduledFor}
              placeholder="YYYY-MM-DD HH:MM"
              onChange={(e) => setScheduledFor(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 font-mono focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1 flex items-center gap-1">
              <Hash className="size-3 text-zinc-400" />
              Hashtags / Tags
            </label>
            <input
              type="text"
              value={tagsInput}
              placeholder="#portrait #saigon"
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-zinc-300">Body & Copy</label>
            <span className="text-[11px] text-zinc-500 font-mono">{content.length} characters</span>
          </div>
          <textarea
            rows={7}
            value={content}
            placeholder="Write compelling platform copy..."
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-purple-500 font-mono leading-relaxed resize-none placeholder:text-zinc-600"
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
            onClick={() =>
              onSave?.({
                ...activePost,
                id: activePost.id === 'draft-new' ? `post-${Date.now()}` : activePost.id,
                title,
                content,
                channel,
                scheduledFor,
                tags: parsedTags
              })
            }
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs text-white font-semibold transition-colors shadow-lg shadow-purple-950"
          >
            <Check className="size-3.5" />
            Save Post
          </button>
        </div>
      </div>

      {/* Live Social Preview Side */}
      <div className="flex flex-col items-center justify-center p-6 rounded-xl border border-zinc-800 bg-zinc-950/60 overflow-y-auto max-h-[560px] scrollbar-sleek">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs uppercase font-bold tracking-wider text-zinc-400">
            Live {channel} Preview
          </span>
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {channel === 'instagram' && (
          <InstagramPreview title={title} content={content} tags={parsedTags} />
        )}
        {channel === 'threads' && (
          <ThreadsPreview title={title} content={content} tags={parsedTags} />
        )}
        {channel === 'pinterest' && (
          <PinterestPreview
            title={title}
            content={content}
            destinationUrl={activePost.destinationUrl}
            boardName={activePost.boardName}
          />
        )}
        {channel === 'linkedin' && (
          <LinkedInPreview title={title} content={content} tags={parsedTags} />
        )}
        {channel === 'website' && (
          <WebsitePreview
            title={title}
            content={content}
            tags={parsedTags}
            destinationUrl={activePost.destinationUrl}
          />
        )}
      </div>
    </div>
  )
}
