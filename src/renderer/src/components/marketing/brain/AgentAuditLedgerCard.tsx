import React from 'react'
import { AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react'
import type { MarketingPost } from '../types/marketing-types'

export function AgentAuditLedgerCard({
  posts,
  onRunAudit
}: {
  posts: MarketingPost[]
  onRunAudit: () => void
}): React.JSX.Element {
  const auditedPosts = posts.filter((p) => p.status === 'published' && p.performanceAudit)
  const unauditedPublishedCount = posts.filter(
    (p) => p.status === 'published' && !p.performanceAudit
  ).length

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-zinc-100">
              48h Post Audit & AI Reflections
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Continuous Loop
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            AI tự động kiểm tra tương tác bài đã xuất bản, mổ xẻ nguyên nhân và điều chỉnh chiến
            thuật
          </p>
        </div>

        <button
          type="button"
          onClick={onRunAudit}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 font-medium transition-colors border border-zinc-700/60"
        >
          <TrendingUp className="size-3.5 text-emerald-400" />
          {unauditedPublishedCount > 0
            ? `Audit ${unauditedPublishedCount} Published Posts`
            : 'Re-Audit Performance'}
        </button>
      </div>

      {auditedPosts.length === 0 ? (
        <div className="p-8 text-center rounded-xl border border-dashed border-zinc-800 bg-zinc-950/30">
          <p className="text-xs text-zinc-400">
            Chưa có dữ liệu kiểm tra 48h. Hãy xuất bản bài viết và bấm &quot;Audit Published
            Posts&quot; để kích hoạt vòng lặp tự phản tư.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {auditedPosts.map((post) => {
            const audit = post.performanceAudit
            if (!audit) {
              return null
            }

            const isHigh = audit.verdict === 'high_performing'
            const isLow = audit.verdict === 'low_engagement'

            return (
              <div
                key={post.id}
                className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-950/40 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {post.channel === 'pinterest'
                        ? '📌'
                        : post.channel === 'linkedin'
                          ? '💼'
                          : '🌐'}
                    </span>
                    <span className="text-xs font-semibold text-zinc-200">{post.title}</span>
                    <span className="text-[11px] text-zinc-500">• {audit.auditedAt}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono text-zinc-300">
                      {audit.impressions.toLocaleString()} views • {audit.engagements} saves/clicks
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                        isHigh
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : isLow
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {isHigh ? (
                        <CheckCircle2 className="size-3" />
                      ) : (
                        <AlertCircle className="size-3" />
                      )}
                      {audit.engagementRate} ({isHigh ? 'High' : isLow ? 'Low' : 'Moderate'})
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block mb-1">
                      🧠 AI Reflection (Tự Phản Tư)
                    </span>
                    <p className="text-zinc-300 leading-relaxed font-normal">{audit.reflection}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                      ⚡ Actionable Pivot (Điều Chỉnh Ngay)
                    </span>
                    <p className="text-zinc-300 leading-relaxed font-normal">
                      {audit.actionablePivot}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
