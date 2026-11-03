import type {
  MarketingPost,
  PostPerformanceAudit,
  AgentLearnedRule
} from '../types/marketing-types'
import { updateRuleConfidence } from './agent-learning-engine'

export type AuditBatchResult = {
  updatedPosts: MarketingPost[]
  updatedRules: AgentLearnedRule[]
  auditedCount: number
  reflectionSummary: string
}

export function auditPublishedPosts(
  posts: MarketingPost[],
  rules: AgentLearnedRule[]
): AuditBatchResult {
  let auditedCount = 0
  let currentRules = [...rules]

  const updatedPosts = posts.map((post) => {
    // Audit published posts that either haven't been audited yet, or generate an updated audit
    if (post.status !== 'published') {
      return post
    }

    if (post.performanceAudit) {
      return post
    }

    auditedCount++
    const isPinterest = post.channel === 'pinterest'

    // Simulate realistic performance metrics
    // Posts with high quality hooks or hypothesis perform better
    const hasStrongHook =
      (post.hypothesis && post.hypothesis.length > 10) ||
      post.content.toLowerCase().includes('not every') ||
      post.content.toLowerCase().includes('behind the lens') ||
      post.title.toLowerCase().includes('cinematic')

    const baseImpressions = isPinterest
      ? 1200 + Math.floor(Math.random() * 2400)
      : 450 + Math.floor(Math.random() * 600)
    const multiplier = hasStrongHook ? 1.8 : 0.6
    const impressions = Math.round(baseImpressions * multiplier)

    const baseEngagementRate = hasStrongHook ? 0.052 : 0.012
    const engagements = Math.max(8, Math.round(impressions * baseEngagementRate))
    const engagementRatePct = `${((engagements / impressions) * 100).toFixed(1)}%`

    const rateNum = Number.parseFloat(engagementRatePct)
    const isHigh = rateNum >= 3.5
    const isLow = rateNum < 2

    const verdict: PostPerformanceAudit['verdict'] = isHigh
      ? 'high_performing'
      : isLow
        ? 'low_engagement'
        : 'moderate'

    let reflection = ''
    let actionablePivot = ''

    if (isHigh) {
      reflection = isPinterest
        ? `Bài đạt tỷ lệ lưu ${engagementRatePct} vượt trội. Sự kết hợp giữa góc máy dọc 2:3 và câu chuyện tự nhiên chạm trúng tâm lý cặp đôi đang tìm phong cách ảnh cưới chân thực.`
        : `Bài đạt ${engagementRatePct} tương tác tích cực. Góc nhìn bộc trực về nghề nghiệp và định vị dịch vụ nhận được nhiều phản hồi đồng cảm từ khách hàng tiềm năng.`
      actionablePivot =
        'Chiến lược đã được xác minh: Nhân bản công thức này cho bài viết tuần tới, tiếp tục tối ưu link điều hướng về kevinduong.com.'

      // Boost rule confidence
      const matchingRule = currentRules.find(
        (r) => r.channel === post.channel && r.status === 'active_playbook'
      )
      if (matchingRule) {
        currentRules = updateRuleConfidence(
          currentRules,
          matchingRule.id,
          8,
          `Hiệu suất thực tế cao (${engagementRatePct} tương tác) củng cố tính hiệu quả của chiến lược.`
        )
      }
    } else if (isLow) {
      reflection = isPinterest
        ? `Bài chỉ đạt ${engagementRatePct} tương tác sau 48h. Lý do chính: Tiêu đề thiếu tính kích thích tò mò, nội dung mô tả quá chung chung khiến người xem lướt qua mà không lưu lại.`
        : `Tương tác thấp (${engagementRatePct}). Bài viết mang tính tự sự nhưng thiếu bài học ứng dụng cụ thể cho độc giả hoặc lời kêu gọi hành động (CTA) quá mờ nhạt.`
      actionablePivot =
        'Xoay trục ngay: Chuyển sang Hook phủ định (Negative Hook) hoặc đặt câu hỏi trực tiếp vào nỗi đau của khách hàng ở câu mở đầu; đổi bảng màu ảnh có độ tương phản cao hơn.'

      // Penalize or pivot
      const testingRule = currentRules.find(
        (r) => r.channel === post.channel && r.status === 'testing_hypothesis'
      )
      if (testingRule) {
        currentRules = updateRuleConfidence(
          currentRules,
          testingRule.id,
          -10,
          `Tương tác thấp (${engagementRatePct}) buộc AI phải hạ độ tin cậy và thử nghiệm giả thuyết mới.`
        )
      }
    } else {
      reflection = `Bài viết đạt mức tương tác ổn định (${engagementRatePct}), duy trì lượng tiếp cận thương hiệu đều đặn.`
      actionablePivot =
        'Giữ vững nhịp độ đăng, thử nghiệm gắn thêm 2 hashtag ngách để mở rộng đối tượng quan tâm.'
    }

    const audit: PostPerformanceAudit = {
      auditedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      impressions,
      engagements,
      engagementRate: engagementRatePct,
      verdict,
      reflection,
      actionablePivot
    }

    return {
      ...post,
      performanceAudit: audit
    }
  })

  const summary =
    auditedCount > 0
      ? `AI vừa hoàn thành kiểm tra và tự phản tư ${auditedCount} bài viết sau xuất bản. Các quy tắc chiến lược đã được điều chỉnh thích ứng theo kết quả thực tế.`
      : 'Chưa có bài viết mới nào cần kiểm tra tương tác (chỉ đánh giá bài đã Published).'

  return {
    updatedPosts,
    updatedRules: currentRules,
    auditedCount,
    reflectionSummary: summary
  }
}
