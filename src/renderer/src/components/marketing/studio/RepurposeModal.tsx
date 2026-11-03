import React, { useState } from 'react'
import {
  Sparkles,
  X,
  CheckCheck,
  Send,
  Wand2,
  Layers,
  Compass,
  Briefcase,
  Globe
} from 'lucide-react'
import type { MarketingPost, MarketingChannel } from '../types/marketing-types'

type RepurposedVariant = {
  channel: MarketingChannel
  title: string
  content: string
  tags: string[]
  scheduledOffsetDays: number
  scheduledTime: string
  mediaType: 'image' | 'article'
  destinationUrl: string
  boardName?: string
  targetClient?: 'couples' | 'families' | 'travel_expat' | 'b2b_commercial'
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
    'Saigon Golden Hour: Natural Rim Light & Authentic Movement for Couples in District 1'
  )
  const [isGenerating, setIsGenerating] = useState(false)

  const [variants, setVariants] = useState<RepurposedVariant[]>([
    {
      channel: 'pinterest',
      title: 'Saigon Couple Editorial — Natural Golden Hour Lighting Diagram (2:3 Pin)',
      content:
        'A cinematic 2:3 vertical moodboard for couples seeking authentic, candid memories in Saigon. Explains natural light bounce flags, golden hour timing, and genuine chemistry without stiff posing.',
      tags: ['#saigonphotographer', '#chupanhecouple', '#editorialinspiration', '#saigonwedding'],
      scheduledOffsetDays: 1,
      scheduledTime: '09:00',
      mediaType: 'image',
      destinationUrl:
        'https://www.bykevinduong.com/chup-anh-couple?utm_source=pinterest&utm_medium=pin_repurpose',
      boardName: 'Saigon Couples & Weddings',
      targetClient: 'couples'
    },
    {
      channel: 'linkedin',
      title: 'The Director’s Rule: Why We Never Tell Creative Clients to "Just Smile"',
      content:
        'A family of 18 people. Three generations. One Saigon park.\n\nConventional photography says: line them up, force a smile, snap.\nWhat we do instead: we move the grandparents into soft open shade under the tamarind tree, let the kids play, and step back 3 meters.\n\nWhen you direct natural movement instead of rigid poses:\n1. People stop feeling self-conscious in front of the lens.\n2. The frames capture real human memory, not a department store catalog.\n3. Turnaround takes 3–4 days with zero upfront deposit.\n\nPlanning an editorial commercial shoot or family archive in Saigon? Drop me a message or explore our portfolio at bykevinduong.com.',
      tags: [
        '#visualstorytelling',
        '#creativedirection',
        '#saigoneditorial',
        '#photographybusiness'
      ],
      scheduledOffsetDays: 2,
      scheduledTime: '09:30',
      mediaType: 'article',
      destinationUrl: 'https://www.bykevinduong.com/services',
      targetClient: 'b2b_commercial'
    },
    {
      channel: 'website',
      title:
        'Chụp Ảnh Couple Sài Gòn: Hướng Dẫn Ánh Sáng & Không Gian Tự Nhiên (Weekly SEO Article)',
      content:
        '# Chụp Ảnh Couple Sài Gòn: Hướng Dẫn Ánh Sáng & Không Gian Tự Nhiên\n\nSài Gòn có một thứ ánh sáng rất riêng vào khoảng 5:30 chiều — khi mặt trời lọt qua những tán me cổ thụ trên các con đường Quận 1 và Quận 3, tạo nên những dải viền sáng ấm áp tuyệt đẹp.\n\n## 1. Không gò ép dáng chụp — Đạo diễn khoảnh khắc thật\nThay vì yêu cầu cặp đôi tạo những tư thế cứng nhắc, buổi chụp bắt đầu bằng việc đi dạo, trò chuyện và để các bạn hoàn toàn thoải mái.\n\n## 2. Lựa chọn khung giờ và địa điểm\n• Bến tàu Bạch Đằng lúc hoàng hôn\n• Những con hẻm cổ kính khu Chợ Lớn\n• Không gian studio tối giản với ánh sáng tự nhiên\n\n## Đặt lịch buổi chụp cùng Kevin Duong\nTất cả các buổi chụp đều giao ảnh trong 3–4 ngày làm việc, không yêu cầu đặt cọc trước.',
      tags: ['#chupanhecouple', '#chupanhecuoisai-gon', '#bykevinduong', '#photography'],
      scheduledOffsetDays: 3,
      scheduledTime: '10:00',
      mediaType: 'article',
      destinationUrl: 'https://www.bykevinduong.com/chup-anh-cuoi-sai-gon',
      targetClient: 'couples'
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
        destinationUrl: v.destinationUrl,
        boardName: v.boardName,
        targetClient: v.targetClient,
        repurposedFrom: sourceConcept,
        bookingHeadline: 'Lưu Giữ Khoảnh Khắc Tự Nhiên Tại Sài Gòn',
        bookingQuote:
          'Ánh sáng chân thật nhất là ánh sáng khi bạn quên đi sự hiện diện của máy ảnh.'
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
                Client Acquisition Repurposing Engine
              </h3>
              <p className="text-xs text-zinc-400">
                Transform 1 photoshoot or journal story into 3 high-converting assets (Pinterest 2:3
                Pin, LinkedIn B2B Story, Website SEO Post)
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
            Photoshoot Story / Journal Subject / Client Case
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={sourceConcept}
              onChange={(e) => setSourceConcept(e.target.value)}
              placeholder="e.g. Saigon golden hour natural portrait shoot in District 1..."
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

        {/* 3 Multi-Channel Cards Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-4 scrollbar-sleek">
          {variants.map((v, i) => (
            <div
              key={v.channel}
              className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4 space-y-2.5 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {v.channel === 'pinterest' && <Compass className="size-4 text-rose-400" />}
                    {v.channel === 'linkedin' && <Briefcase className="size-4 text-blue-400" />}
                    {v.channel === 'website' && <Globe className="size-4 text-emerald-400" />}
                    <span className="text-xs font-bold text-zinc-200 capitalize">
                      {v.channel === 'website' ? 'Website Blog' : v.channel}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    +{v.scheduledOffsetDays}d at {v.scheduledTime}
                  </span>
                </div>

                <div className="text-[10px] uppercase font-semibold text-zinc-400 flex items-center gap-1">
                  <span>Target Client:</span>
                  <span className="text-zinc-200 capitalize">
                    {v.targetClient?.replace('_', ' ')}
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
                  rows={6}
                  value={v.content}
                  onChange={(e) => {
                    const val = e.target.value
                    setVariants((prev) =>
                      prev.map((item, idx) => (idx === i ? { ...item, content: val } : item))
                    )
                  }}
                  className="w-full px-2.5 py-2 rounded-lg bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-300 font-mono leading-relaxed focus:outline-none focus:border-purple-500 resize-none"
                />

                <div className="text-[10px] text-zinc-500 truncate">
                  Link: <span className="text-sky-400">{v.destinationUrl}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-zinc-800 px-6 py-4 bg-zinc-900/60">
          <div className="text-xs text-zinc-400 flex items-center gap-1.5">
            <Layers className="size-3.5 text-zinc-400" />
            <span>3 tailored client-acquisition assets ready</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handlePublishAll(false)}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Send className="size-3.5 text-amber-400" />
              Send to Approval Queue
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
