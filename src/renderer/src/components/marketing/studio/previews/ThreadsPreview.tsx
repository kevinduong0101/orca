import React from 'react'
import { Heart, MessageCircle, MoreHorizontal, Repeat2, Send } from 'lucide-react'

export function ThreadsPreview({
  content,
  tags
}: {
  title?: string
  content: string
  tags?: string[]
}): React.JSX.Element {
  return (
    <div className="w-full max-w-[360px] rounded-2xl border border-zinc-800 bg-zinc-950 text-white shadow-2xl p-4 font-sans">
      <div className="flex items-start gap-3">
        {/* Left Avatar Column with Thread Line */}
        <div className="flex flex-col items-center">
          <div className="size-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
            KD
          </div>
          <div className="w-[1.5px] bg-zinc-800 grow my-2 min-h-12" />
        </div>

        {/* Right Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-zinc-100">kevinduong</span>
              <span className="text-[11px] text-zinc-500">2h</span>
            </div>
            <button type="button" className="text-zinc-500 hover:text-zinc-300">
              <MoreHorizontal className="size-4" />
            </button>
          </div>

          <p className="text-xs text-zinc-200 whitespace-pre-line leading-relaxed mb-2.5">
            {content || 'What is on your mind? Threads post copy renders here seamlessly...'}
          </p>

          {(tags ?? []).length > 0 && (
            <p className="text-sky-400 text-[11px] font-medium mb-3">{(tags ?? []).join(' ')}</p>
          )}

          {/* Interaction Icons */}
          <div className="flex items-center gap-4 text-zinc-400 pt-1">
            <Heart className="size-4 hover:text-rose-500 cursor-pointer transition-colors" />
            <MessageCircle className="size-4 hover:text-zinc-200 cursor-pointer transition-colors" />
            <Repeat2 className="size-4 hover:text-emerald-400 cursor-pointer transition-colors" />
            <Send className="size-4 hover:text-zinc-200 cursor-pointer transition-colors" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-3 mt-2 border-t border-zinc-900 pl-12">
        <span>32 replies • 140 likes</span>
        <span className="font-mono text-[10px]">Threads Engine</span>
      </div>
    </div>
  )
}
