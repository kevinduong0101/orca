import React, { useState } from 'react'
import { Calendar, Check, Hash, Sparkles, Wand2, Globe, Compass, Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MarketingChannel, MarketingPost } from '../types/marketing-types'
import { PinterestPreview } from './previews/PinterestPreview'
import { LinkedInPreview } from './previews/LinkedInPreview'
import { WebsitePreview } from './previews/WebsitePreview'
import { WebsiteSeoAssistant } from './WebsiteSeoAssistant'

const DEFAULT_EMPTY_POST: MarketingPost = {
  id: 'draft-new',
  title: '',
  channel: 'pinterest',
  status: 'needs_review',
  scheduledFor: '2026-11-04 09:00',
  content: '',
  mediaType: 'image',
  tags: [],
  authorAgent: 'Visual SEO & Inbound Pin Agent',
  destinationUrl: 'https://www.bykevinduong.com/chup-anh-couple',
  boardName: 'Saigon Couples & Weddings'
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
  const [channel, setChannel] = useState<MarketingChannel>(
    activePost.channel === 'pinterest' ||
      activePost.channel === 'linkedin' ||
      activePost.channel === 'website'
      ? activePost.channel
      : 'pinterest'
  )
  const [scheduledFor, setScheduledFor] = useState(activePost.scheduledFor || '2026-11-04 09:00')
  const [tagsInput, setTagsInput] = useState((activePost.tags || []).join(' '))
  const [destinationUrl, setDestinationUrl] = useState(
    activePost.destinationUrl || 'https://www.bykevinduong.com/chup-anh-couple'
  )
  const [boardName, setBoardName] = useState(activePost.boardName || 'Saigon Couples & Weddings')
  const [targetClient, setTargetClient] = useState<MarketingPost['targetClient']>(
    activePost.targetClient || 'couples'
  )
  const [seoKeyword, setSeoKeyword] = useState(activePost.seoKeyword || 'chụp ảnh couple sài gòn')
  const [bookingHeadline, setBookingHeadline] = useState(
    activePost.bookingHeadline || 'Lưu Giữ Khoảnh Khắc Tình Yêu Tự Nhiên Tại Sài Gòn'
  )
  const [bookingQuote, setBookingQuote] = useState(
    activePost.bookingQuote ||
      'Ánh sáng chân thật nhất là ánh sáng khi bạn quên đi sự hiện diện của máy ảnh.'
  )
  const [isPolishing, setIsPolishing] = useState(false)

  const parsedTags = tagsInput
    .split(' ')
    .map((t) => t.trim())
    .filter((t) => t.length > 0)

  const handleAiPolish = () => {
    setIsPolishing(true)
    setTimeout(() => {
      setIsPolishing(false)
      if (channel === 'pinterest') {
        if (!content.includes('2:3') && !content.includes('bykevinduong.com')) {
          setContent(
            (prev) =>
              `${prev.trim()}\n\nCinematic 2:3 editorial photography in Saigon without stiff posing. Explore full portfolio and packages at bykevinduong.com.`
          )
        }
      } else if (channel === 'linkedin') {
        if (!content.includes('bykevinduong.com')) {
          setContent(
            (prev) =>
              `${prev.trim()}\n\nPlanning an editorial commercial shoot or intimate portrait session in Saigon? Drop me a message or explore our recent work at bykevinduong.com.`
          )
        }
      } else if (channel === 'website') {
        if (!content.startsWith('#')) {
          setContent(
            (prev) =>
              `# ${title || 'Chụp Ảnh Phong Cách Điện Ảnh Tại Sài Gòn'}\n\n${prev.trim()}\n\n## 1. Ánh sáng tự nhiên và cảm xúc thật\nKhông áp đặt tư thế gò bó, chúng tôi ghi lại câu chuyện của chính bạn.\n\n## Đặt lịch buổi chụp\nTất cả các buổi chụp đều trả ảnh trong 3-4 ngày làm việc, không yêu cầu đặt cọc.`
          )
        }
      }
    }, 400)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 rounded-2xl border border-zinc-800 bg-zinc-900/90 backdrop-blur-xl">
      {/* Editor Side */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <Wand2 className="size-4 text-purple-400" />
            Client Acquisition Studio
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Optimize Pins (2:3 vertical), LinkedIn authority stories, and weekly SEO journal
            articles for bykevinduong.com
          </p>
        </div>

        {/* Channel Selector */}
        <div>
          <label className="text-xs font-semibold text-zinc-300 block mb-1">
            Target Conversion Channel
          </label>
          <div className="flex gap-2">
            {[
              {
                id: 'pinterest' as const,
                label: 'Pinterest (Visual SEO)',
                icon: Compass,
                color: 'text-rose-400'
              },
              {
                id: 'linkedin' as const,
                label: 'LinkedIn (B2B Authority)',
                icon: Briefcase,
                color: 'text-blue-400'
              },
              {
                id: 'website' as const,
                label: 'Website Blog (Weekly SEO)',
                icon: Globe,
                color: 'text-emerald-400'
              }
            ].map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setChannel(item.id)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all flex-1 justify-center',
                    channel === item.id
                      ? 'bg-zinc-800 text-white border-zinc-600 shadow-md font-semibold ring-1 ring-zinc-500'
                      : 'bg-zinc-950/60 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                  )}
                >
                  <Icon className={cn('size-3.5', item.color)} />
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Client Target Segment */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              Target Audience
            </label>
            <select
              value={targetClient}
              onChange={(e) => setTargetClient(e.target.value as MarketingPost['targetClient'])}
              className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-purple-500"
            >
              <option value="couples">Couples & Weddings</option>
              <option value="families">Families & Newborn</option>
              <option value="travel_expat">Travel & Expats in Saigon</option>
              <option value="b2b_commercial">B2B Commercial & Brand Directors</option>
            </select>
          </div>

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
        </div>

        {/* Title */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-zinc-300">
              {channel === 'website'
                ? 'SEO Article Title (Max 56 chars for Google)'
                : 'Headline / Concept'}
            </label>
            {channel === 'website' && (
              <span
                className={cn(
                  'text-[11px] font-mono',
                  isTitleLengthOk ? 'text-emerald-400' : 'text-amber-400'
                )}
              >
                {title.length}/56 chars
              </span>
            )}
          </div>
          <input
            type="text"
            value={title}
            placeholder={
              channel === 'website'
                ? 'Chụp Ảnh Couple Sài Gòn: Hướng Dẫn Ánh Sáng'
                : 'Saigon Golden Hour: Natural Rim Light Without Stiff Posing'
            }
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Pinterest Specific Fields */}
        {channel === 'pinterest' && (
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
            <div>
              <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                Target Board
              </label>
              <select
                value={boardName}
                onChange={(e) => setBoardName(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-purple-500"
              >
                <option value="Saigon Couples & Weddings">Saigon Couples & Weddings</option>
                <option value="Editorial Street & Lifestyle">Editorial Street & Lifestyle</option>
                <option value="Vietnam Travel & Locations">Vietnam Travel & Locations</option>
                <option value="Studio Lighting & Moodboards">Studio Lighting & Moodboards</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                Destination URL (UTM)
              </label>
              <input
                type="text"
                value={destinationUrl}
                onChange={(e) => setDestinationUrl(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        )}

        {/* Website Blog SEO Quality Assistant */}
        {channel === 'website' && (
          <WebsiteSeoAssistant
            title={title}
            content={content}
            destinationUrl={destinationUrl}
            seoKeyword={seoKeyword}
            bookingHeadline={bookingHeadline}
            bookingQuote={bookingQuote}
            onSeoKeywordChange={setSeoKeyword}
            onBookingHeadlineChange={setBookingHeadline}
            onBookingQuoteChange={setBookingQuote}
          />
        )}

        {/* Body Copy */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-zinc-300">
              {channel === 'website' ? 'Markdown Article Body' : 'Post Copy & Narrative Hook'}
            </label>
            <span className="text-[11px] text-zinc-500 font-mono">
              {content.length} chars • {content.split(' ').filter(Boolean).length} words
            </span>
          </div>
          <textarea
            rows={channel === 'website' ? 8 : 6}
            value={content}
            placeholder={
              channel === 'website'
                ? '# Article Header\n\nWrite clean, high-ranking prose without cover image repetition...'
                : 'Write cinematic visual hook and call to action...'
            }
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-purple-500 font-mono leading-relaxed resize-none placeholder:text-zinc-600"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="text-xs font-semibold text-zinc-300 block mb-1 flex items-center gap-1">
            <Hash className="size-3 text-zinc-400" />
            Tags / Keywords
          </label>
          <input
            type="text"
            value={tagsInput}
            placeholder="#saigonphotographer #editorialportrait #bykevinduong"
            onChange={(e) => setTagsInput(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleAiPolish}
            disabled={isPolishing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 font-medium transition-colors disabled:opacity-50"
          >
            <Sparkles className="size-3.5 text-purple-400" />
            {isPolishing ? 'Agent Polishing...' : 'AI Client CTA & Hook'}
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
                tags: parsedTags,
                destinationUrl,
                boardName: channel === 'pinterest' ? boardName : undefined,
                targetClient,
                seoKeyword: channel === 'website' ? seoKeyword : undefined,
                bookingHeadline: channel === 'website' ? bookingHeadline : undefined,
                bookingQuote: channel === 'website' ? bookingQuote : undefined
              })
            }
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs text-white font-semibold transition-colors shadow-lg shadow-purple-950"
          >
            <Check className="size-3.5" />
            Save to Pipeline
          </button>
        </div>
      </div>

      {/* Live Social Preview Side */}
      <div className="flex flex-col items-center justify-center p-6 rounded-xl border border-zinc-800 bg-zinc-950/60 overflow-y-auto max-h-[580px] scrollbar-sleek">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs uppercase font-bold tracking-wider text-zinc-400">
            Live {channel === 'website' ? 'Website Blog' : channel} Preview
          </span>
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {channel === 'pinterest' && (
          <PinterestPreview
            title={title}
            content={content}
            destinationUrl={destinationUrl}
            boardName={boardName}
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
            destinationUrl={destinationUrl}
          />
        )}
      </div>
    </div>
  )
}
