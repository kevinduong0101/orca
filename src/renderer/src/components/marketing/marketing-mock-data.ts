import type { ChannelAgentStatus, MarketingPost, OrcaRecommendation } from './types/marketing-types'

export const INITIAL_CHANNEL_AGENTS: ChannelAgentStatus[] = [
  {
    channel: 'pinterest',
    name: 'Visual SEO & Inbound Pin Agent',
    role: 'Visual Search, 2:3 Vertical Pins & Destination Traffic',
    status: 'idle',
    nextRun: 'Standby',
    queuedPosts: 0,
    successRate: '—',
    avatarColor: 'from-red-600 to-rose-700'
  },
  {
    channel: 'linkedin',
    name: 'B2B Authority & Commercial Agent',
    role: 'Editorial Direction Pillars, Creative Cases & Direct Inbound',
    status: 'idle',
    nextRun: 'Standby',
    queuedPosts: 0,
    successRate: '—',
    avatarColor: 'from-blue-600 to-cyan-700'
  },
  {
    channel: 'website',
    name: 'SEO Pillar & Booking Journal Agent',
    role: 'Weekly High-Ranking Articles & Viewfinder Booking Card',
    status: 'idle',
    nextRun: 'Standby',
    queuedPosts: 0,
    successRate: '—',
    avatarColor: 'from-emerald-600 to-teal-800'
  }
]

export const INITIAL_POSTS: MarketingPost[] = []

export const INITIAL_RECOMMENDATIONS: OrcaRecommendation[] = []

export const SAMPLE_DEMO_CAMPAIGN: MarketingPost[] = [
  {
    id: 'demo-post-1',
    title: 'Saigon Couple Editorial — 1000x1500 Lighting Diagram & Moodboard',
    channel: 'pinterest',
    status: 'needs_review',
    scheduledFor: '2026-11-04 09:00',
    content: `A cinematic 2:3 editorial pin for couples looking for authentic Saigon portraiture without stiff posing.

• Focus: Golden hour natural rim light + negative fill in District 1 alleyways.
• Destination: Direct link to Saigon Couples & Weddings package with full gallery.`,
    destinationUrl:
      'https://www.bykevinduong.com/chup-anh-couple?utm_source=pinterest&utm_medium=visual_seo&utm_campaign=saigon_couples',
    boardName: 'Saigon Couples & Weddings',
    tags: ['#saigonphotographer', '#editorialportrait', '#saigoncouples', '#vietnamwedding'],
    authorAgent: 'Visual SEO & Inbound Pin Agent',
    mediaType: 'image',
    targetClient: 'couples'
  },
  {
    id: 'demo-post-2',
    title: 'The Director’s Rule: Why We Never Ask Couples to "Look Here and Smile"',
    channel: 'linkedin',
    status: 'needs_review',
    scheduledFor: '2026-11-05 09:30',
    content: `A family of 18 people. Three generations. One Saigon park.

Conventional photography says: line them up, force a smile, snap.
What we do instead: we move the grandparents into the soft shade under the tamarind tree, let the kids run around their knees, and step back 3 meters.

When you direct natural movement instead of rigid poses:
1. People stop feeling self-conscious in front of the lens.
2. The frames capture real human memory, not a department store catalog.
3. Turnaround takes 3–4 days with zero upfront deposit.

Whether for editorial brand campaigns or intimate family archives, authentic presence is built on trust, not performance.

Planning an editorial campaign or family session in Saigon? Drop me a message or explore our recent work at bykevinduong.com.`,
    tags: ['#visualstorytelling', '#creativedirection', '#saigoneditorial', '#photographybusiness'],
    authorAgent: 'B2B Authority & Commercial Agent',
    mediaType: 'article',
    targetClient: 'b2b_commercial'
  },
  {
    id: 'demo-post-3',
    title: 'Chụp Ảnh Couple Sài Gòn: Hướng Dẫn Địa Điểm & Ánh Sáng Tự Nhiên (Weekly SEO Pillar)',
    channel: 'website',
    status: 'scheduled',
    scheduledFor: '2026-11-05 10:00',
    content: `# Chụp Ảnh Couple Sài Gòn: Ánh Sáng Tự Nhiên & Phong Cách Điện Ảnh

Sài Gòn có một thứ ánh sáng rất riêng vào khoảng 5:30 chiều — khi mặt trời lọt qua những tán me cổ thụ trên các con đường Quận 1 và Quận 3, tạo nên những dải viền sáng ấm áp tuyệt đẹp.

## 1. Không gò ép dáng chụp — Đạo diễn khoảnh khắc thật
Thay vì yêu cầu cặp đôi tạo những tư thế cứng nhắc, buổi chụp bắt đầu bằng việc đi dạo, trò chuyện và để các bạn hoàn toàn thoải mái.

## 2. Lựa chọn khung giờ và địa điểm
• Bến tàu Bạch Đằng lúc hoàng hôn
• Những con hẻm cổ kính khu Chợ Lớn
• Không gian studio tối giản với ánh sáng tự nhiên

## Đặt lịch buổi chụp cùng Kevin Duong
Tất cả các buổi chụp đều giao ảnh trong 3–4 ngày làm việc, không yêu cầu đặt cọc trước.`,
    destinationUrl: 'https://www.bykevinduong.com/chup-anh-cuoi-sai-gon',
    tags: ['#chupanhecouple', '#chupanhecuoisai-gon', '#photography', '#bykevinduong'],
    authorAgent: 'SEO Pillar & Booking Journal Agent',
    mediaType: 'article',
    targetClient: 'couples',
    seoKeyword: 'chụp ảnh couple sài gòn',
    seoMetaTitle: 'Chụp Ảnh Couple Sài Gòn — Tự Nhiên, Điện Ảnh | Kevin Duong',
    seoMetaDescription:
      'Dịch vụ chụp ảnh couple phong cách điện ảnh tại Sài Gòn. Hướng dẫn ánh sáng tự nhiên, không gò ép pose, trả ảnh 3-4 ngày không cần cọc.',
    bookingHeadline: 'Lưu Giữ Khoảnh Khắc Tình Yêu Tự Nhiên Tại Sài Gòn',
    bookingQuote: 'Ánh sáng chân thật nhất là ánh sáng khi bạn quên đi sự hiện diện của máy ảnh.'
  }
]

export const SAMPLE_DEMO_RECOMMENDATIONS: OrcaRecommendation[] = [
  {
    id: 'rec-1',
    title: 'Weekly SEO Blog Scheduled for Thursday',
    description: 'Weekly SEO Anchor "Chụp Ảnh Couple Sài Gòn" is ready for Google indexation.',
    urgency: 'info',
    channel: 'website',
    actionLabel: 'View Calendar'
  },
  {
    id: 'rec-2',
    title: '2 Client-Acquisition Drafts Awaiting Approval',
    description: 'Pinterest Visual Pin & LinkedIn Authority Story ready in Approval Queue.',
    urgency: 'high',
    channel: 'general',
    actionLabel: 'Review Queue'
  }
]
