import React from 'react'
import { Bookmark, Heart, MessageCircle, MoreHorizontal, Send } from 'lucide-react'

export function InstagramPreview({
  title,
  content,
  tags
}: {
  title: string
  content: string
  tags?: string[]
}): React.JSX.Element {
  return (
    <div className="w-full max-w-[340px] rounded-2xl border border-zinc-800 bg-black text-white shadow-2xl overflow-hidden font-sans">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-zinc-900">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[1.5px]">
            <div className="size-full rounded-full bg-black flex items-center justify-center text-[10px] font-bold text-white">
              KD
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold leading-tight flex items-center gap-1">
              kevinduong.photo
              <span className="size-1 rounded-full bg-sky-400" />
            </p>
            <p className="text-[10px] text-zinc-400 leading-tight">Saigon, Vietnam</p>
          </div>
        </div>
        <button type="button" className="text-zinc-400 hover:text-white">
          <MoreHorizontal className="size-4" />
        </button>
      </div>

      {/* Image / Carousel Mock Canvas (4:5 Ratio) */}
      <div className="aspect-[4/5] w-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950 flex flex-col items-center justify-center p-6 text-center border-y border-zinc-900 relative">
        <div className="size-12 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-xl mb-3 shadow-lg">
          📸
        </div>
        <p className="text-xs font-medium text-zinc-300 max-w-[200px] line-clamp-2">
          {title || 'Visual Media Frame'}
        </p>
        <span className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider font-mono">
          4:5 Aspect Ratio • Editorial
        </span>
      </div>

      {/* Action Icons */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Heart className="size-5 text-zinc-100 hover:text-rose-500 cursor-pointer transition-colors" />
            <MessageCircle className="size-5 text-zinc-100 hover:text-zinc-300 cursor-pointer transition-colors" />
            <Send className="size-5 text-zinc-100 hover:text-zinc-300 cursor-pointer transition-colors" />
          </div>
          <Bookmark className="size-5 text-zinc-100 hover:text-zinc-300 cursor-pointer transition-colors" />
        </div>

        <p className="text-xs font-semibold text-zinc-200 mb-1.5">1,248 likes</p>

        {/* Caption */}
        <div className="text-xs text-zinc-200 leading-relaxed space-y-1">
          <p>
            <span className="font-semibold mr-1.5">kevinduong.photo</span>
            <span className="whitespace-pre-line text-zinc-300">
              {content || 'Your captivating caption copy will render here...'}
            </span>
          </p>
          {(tags ?? []).length > 0 && (
            <p className="text-sky-400 text-[11px] font-medium leading-normal">
              {(tags ?? []).join(' ')}
            </p>
          )}
        </div>
        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-2">2 HOURS AGO</p>
      </div>
    </div>
  )
}
