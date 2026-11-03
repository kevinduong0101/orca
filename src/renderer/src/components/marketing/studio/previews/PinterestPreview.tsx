import React from 'react'
import { ArrowUpRight } from 'lucide-react'

export function PinterestPreview({
  title,
  content,
  destinationUrl,
  boardName
}: {
  title: string
  content: string
  destinationUrl?: string
  boardName?: string
}): React.JSX.Element {
  return (
    <div className="w-full max-w-[300px] rounded-3xl border border-zinc-800 bg-zinc-950 text-white shadow-2xl overflow-hidden font-sans group">
      {/* 2:3 Vertical Pin Image Canvas */}
      <div className="relative aspect-[2/3] w-full bg-gradient-to-b from-zinc-900 via-rose-950/20 to-zinc-950 p-5 flex flex-col justify-between">
        {/* Top Controls */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-zinc-300 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 truncate max-w-[150px]">
            {boardName || 'Studio Moodboard'}
          </span>
          <button
            type="button"
            className="rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-3.5 py-1.5 shadow-lg shadow-red-950 transition-colors"
          >
            Save
          </button>
        </div>

        {/* Center Visual Mock */}
        <div className="text-center my-auto">
          <div className="size-14 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-2xl mx-auto mb-2 shadow-inner">
            📌
          </div>
          <h4 className="text-xs font-bold text-zinc-200 px-2 line-clamp-2">
            {title || 'Evergreen Visual Pin'}
          </h4>
        </div>

        {/* Destination Link Pill */}
        <div className="flex items-center justify-between bg-black/70 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/10 text-[11px] text-zinc-300">
          <span className="truncate max-w-[180px]">
            {destinationUrl
              ? destinationUrl.replace(/^https?:\/\//, '').split('/')[0]
              : 'kevinduongphotography.com'}
          </span>
          <ArrowUpRight className="size-3.5 text-zinc-400 shrink-0" />
        </div>
      </div>

      {/* Pin Description & Profile Footer */}
      <div className="p-3.5 border-t border-zinc-900">
        <h3 className="font-semibold text-xs text-zinc-100 line-clamp-1 mb-1">
          {title || 'Untitled Pin'}
        </h3>
        <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed mb-3">
          {content || 'Pinterest SEO description and searchable keywords will be displayed here.'}
        </p>

        <div className="flex items-center gap-2">
          <div className="size-6 rounded-full bg-red-700 flex items-center justify-center text-[10px] font-bold text-white">
            KD
          </div>
          <div className="text-[11px] leading-tight">
            <p className="font-semibold text-zinc-200">Kevin Duong Photo</p>
            <p className="text-[10px] text-zinc-500">24.5k monthly views</p>
          </div>
        </div>
      </div>
    </div>
  )
}
