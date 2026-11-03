import React, { useState } from 'react'
import { Globe2, MessageSquare, MoreHorizontal, Send, ThumbsUp, TrendingUp } from 'lucide-react'

export function LinkedInPreview({
  content,
  tags
}: {
  title?: string
  content: string
  tags?: string[]
}): React.JSX.Element {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="w-full max-w-[380px] rounded-2xl border border-zinc-800 bg-zinc-950 text-white shadow-2xl p-4 font-sans">
      {/* Author Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="size-10 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-inner">
            KD
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold text-zinc-100">Kevin Duong</h4>
              <span className="text-[10px] text-zinc-400">• 1st</span>
            </div>
            <p className="text-[10px] text-zinc-400 line-clamp-1">
              Founder & Director @ Kevin Duong Photography • AI-Native Studio
            </p>
            <p className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
              <span>3h</span>
              <span>•</span>
              <Globe2 className="size-2.5" />
            </p>
          </div>
        </div>

        <button type="button" className="text-zinc-500 hover:text-zinc-300">
          <MoreHorizontal className="size-4" />
        </button>
      </div>

      {/* Post Body */}
      <div className="text-xs text-zinc-200 leading-relaxed mb-3">
        <p className={expanded ? 'whitespace-pre-line' : 'line-clamp-4 whitespace-pre-line'}>
          {content ||
            'Thought leadership and industry insights render here. Write your compelling point of view for professional peers and collaborators.'}
        </p>
        {content && content.length > 180 && !expanded && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="text-[11px] font-semibold text-zinc-400 hover:text-blue-400 transition-colors mt-0.5"
          >
            ...see more
          </button>
        )}

        {(tags ?? []).length > 0 && (
          <p className="text-blue-400 text-[11px] font-semibold mt-2">{(tags ?? []).join(' ')}</p>
        )}
      </div>

      {/* Reactions Bar */}
      <div className="flex items-center justify-between text-[11px] text-zinc-500 pb-2 border-b border-zinc-900">
        <span className="flex items-center gap-1">
          <span className="flex -space-x-1">
            <span className="size-4 rounded-full bg-blue-500 flex items-center justify-center text-[8px] text-white">
              👍
            </span>
            <span className="size-4 rounded-full bg-red-500 flex items-center justify-center text-[8px] text-white">
              ❤️
            </span>
          </span>
          <span>86 • 19 comments</span>
        </span>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-4 gap-1 pt-2 text-zinc-400 text-[11px] font-medium text-center">
        <button
          type="button"
          className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg hover:bg-zinc-900 transition-colors"
        >
          <ThumbsUp className="size-3.5" />
          <span>Like</span>
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg hover:bg-zinc-900 transition-colors"
        >
          <MessageSquare className="size-3.5" />
          <span>Comment</span>
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg hover:bg-zinc-900 transition-colors"
        >
          <TrendingUp className="size-3.5" />
          <span>Repost</span>
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg hover:bg-zinc-900 transition-colors"
        >
          <Send className="size-3.5" />
          <span>Send</span>
        </button>
      </div>
    </div>
  )
}
