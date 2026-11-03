import React from 'react'
import { AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react'

export type WebsiteSeoAssistantProps = {
  title: string
  content: string
  destinationUrl: string
  seoKeyword: string
  bookingHeadline: string
  bookingQuote: string
  onSeoKeywordChange: (val: string) => void
  onBookingHeadlineChange: (val: string) => void
  onBookingQuoteChange: (val: string) => void
}

export function WebsiteSeoAssistant({
  title,
  content,
  destinationUrl,
  seoKeyword,
  bookingHeadline,
  bookingQuote,
  onSeoKeywordChange,
  onBookingHeadlineChange,
  onBookingQuoteChange
}: WebsiteSeoAssistantProps): React.JSX.Element {
  const isTitleLengthOk = title.length > 0 && title.length <= 56
  const wordCount = content.split(' ').filter(Boolean).length
  const isContentLongEnough = wordCount >= 600
  const hasBookingCard = bookingHeadline.length > 0 && bookingQuote.length > 0
  const hasValidDestination = destinationUrl.includes('bykevinduong.com')

  return (
    <div className="p-3 rounded-xl bg-zinc-950/60 border border-emerald-500/30 space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
          <CheckCircle2 className="size-3.5" />
          SEO On-Page Quality Checklist (bykevinduong.com)
        </span>
        <span className="text-[10px] text-zinc-400">Weekly Cadence Active</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
        <div className="flex items-center gap-1.5">
          {isTitleLengthOk ? (
            <CheckCircle2 className="size-3 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="size-3 text-amber-400 shrink-0" />
          )}
          <span className={isTitleLengthOk ? 'text-zinc-300' : 'text-amber-300'}>
            Title ≤ 56 chars ({title.length})
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {isContentLongEnough ? (
            <CheckCircle2 className="size-3 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="size-3 text-zinc-500 shrink-0" />
          )}
          <span className={isContentLongEnough ? 'text-zinc-300' : 'text-zinc-500'}>
            Body length ≥ 600 words ({wordCount} words)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {hasBookingCard ? (
            <CheckCircle2 className="size-3 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="size-3 text-amber-400 shrink-0" />
          )}
          <span className={hasBookingCard ? 'text-zinc-300' : 'text-amber-300'}>
            Viewfinder Booking Card Attached
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {hasValidDestination ? (
            <CheckCircle2 className="size-3 text-emerald-400 shrink-0" />
          ) : (
            <ShieldAlert className="size-3 text-rose-400 shrink-0" />
          )}
          <span className="text-zinc-300 truncate">Domain: bykevinduong.com</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-zinc-800">
        <input
          type="text"
          value={seoKeyword}
          placeholder="Target SEO Keyword..."
          onChange={(e) => onSeoKeywordChange(e.target.value)}
          className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-200"
        />
        <input
          type="text"
          value={bookingHeadline}
          placeholder="Booking Card Headline..."
          onChange={(e) => onBookingHeadlineChange(e.target.value)}
          className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-200"
        />
        <input
          type="text"
          value={bookingQuote}
          placeholder="Emotional handwritten quote..."
          onChange={(e) => onBookingQuoteChange(e.target.value)}
          className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-200 font-serif italic"
        />
      </div>
    </div>
  )
}
