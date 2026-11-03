import React from 'react'
import {
  Brain,
  Sparkles,
  Zap,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  BookmarkCheck,
  Compass
} from 'lucide-react'
import type { MarketInsight, AgentLearnedRule, MarketingPost } from '../types/marketing-types'
import { AgentAuditLedgerCard } from './AgentAuditLedgerCard'

export function AgentBrainTab({
  insights,
  rules,
  posts,
  onRunDiscovery,
  onRunAudit,
  notice
}: {
  insights: MarketInsight[]
  rules: AgentLearnedRule[]
  posts: MarketingPost[]
  onRunDiscovery: () => void
  onRunAudit: () => void
  notice: string | null
}): React.JSX.Element {
  const activeRulesCount = rules.filter((r) => r.status === 'active_playbook').length
  const testingCount = rules.filter((r) => r.status === 'testing_hypothesis').length

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header Card */}
      <div className="rounded-2xl border border-purple-500/30 bg-purple-950/15 p-6 backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shadow-md shadow-purple-950/40">
              <Brain className="size-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-zinc-100">
                  Autonomous Agent Brain & Self-Learning Engine
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Active Feedback Loop
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                AI tự học hỏi từ các bài viral Pinterest & LinkedIn, đúc kết công thức, và tự phản
                tư sau 24-48h
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onRunDiscovery}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs text-white font-semibold shadow-lg shadow-purple-950 transition-colors"
            >
              <Compass className="size-3.5" />
              Scan Viral Patterns
            </button>
            <button
              type="button"
              onClick={onRunAudit}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 font-semibold border border-zinc-700 transition-colors"
            >
              <TrendingUp className="size-3.5 text-emerald-400" />
              Audit & Reflect 48h
            </button>
          </div>
        </div>

        {notice && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium animate-in fade-in">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {/* Brain Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-xl border border-zinc-800/80 bg-zinc-950/50">
            <span className="text-[10px] uppercase font-bold text-zinc-500">
              Active Playbook Rules
            </span>
            <div className="text-lg font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
              <ShieldCheck className="size-4" />
              {activeRulesCount} Verified
            </div>
          </div>
          <div className="p-3.5 rounded-xl border border-zinc-800/80 bg-zinc-950/50">
            <span className="text-[10px] uppercase font-bold text-zinc-500">
              Testing Hypotheses
            </span>
            <div className="text-lg font-bold text-amber-400 mt-1 flex items-center gap-1.5">
              <Zap className="size-4" />
              {testingCount} Experiments
            </div>
          </div>
          <div className="p-3.5 rounded-xl border border-zinc-800/80 bg-zinc-950/50">
            <span className="text-[10px] uppercase font-bold text-zinc-500">
              Absorbed Market Insights
            </span>
            <div className="text-lg font-bold text-purple-400 mt-1 flex items-center gap-1.5">
              <BookmarkCheck className="size-4" />
              {insights.length} Patterns
            </div>
          </div>
          <div className="p-3.5 rounded-xl border border-zinc-800/80 bg-zinc-950/50">
            <span className="text-[10px] uppercase font-bold text-zinc-500">
              Self-Adapting Velocity
            </span>
            <div className="text-lg font-bold text-sky-400 mt-1 flex items-center gap-1.5">
              <Sparkles className="size-4" />
              Daily Loop
            </div>
          </div>
        </div>
      </div>

      {/* Learned Rules & Playbook Evolution */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md space-y-4">
        <div>
          <h3 className="text-base font-semibold text-zinc-100">Learned Strategy Playbook</h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Các nguyên tắc và giả thuyết AI tự động điều chỉnh trọng số dựa trên dữ liệu tương tác
            thực tế
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {rules.map((rule) => {
            const isPlaybook = rule.status === 'active_playbook'
            return (
              <div
                key={rule.id}
                className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-950/40 space-y-2 hover:border-zinc-700 transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">{rule.channel === 'pinterest' ? '📌' : '💼'}</span>
                    <h4 className="text-xs font-semibold text-zinc-200">{rule.title}</h4>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      isPlaybook
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {isPlaybook ? 'Validated Rule' : 'Testing'}
                  </span>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed font-normal">{rule.rule}</p>

                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[10px] text-zinc-500">
                    <span>Confidence Score</span>
                    <span className="font-mono font-bold text-zinc-300">
                      {rule.confidenceScore}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        rule.confidenceScore >= 75 ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${rule.confidenceScore}%` }}
                    />
                  </div>
                </div>

                <div className="text-[10px] text-purple-300/80 bg-purple-950/20 px-2 py-1 rounded border border-purple-500/20">
                  {rule.impactDescription}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 48h Post Audit & Reflections */}
      <AgentAuditLedgerCard posts={posts} onRunAudit={onRunAudit} />

      {/* Market Intelligence Patterns */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md space-y-4">
        <div>
          <h3 className="text-base font-semibold text-zinc-100">Top-Performing Market Patterns</h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Dữ liệu khảo sát từ các bài viral trong ngành ảnh cưới, chân dung nghệ thuật và thương
            hiệu cá nhân
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {insights.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-950/40 space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs">
                    {item.channel === 'pinterest' ? '📌 Pinterest Viral' : '💼 LinkedIn Creator'}
                  </span>
                  <span className="text-[10px] font-mono text-purple-300 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-500/20">
                    {item.estimatedEngagement}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-zinc-200 leading-snug">
                  {item.topHeadline}
                </h4>
                <div className="text-[11px] text-zinc-400 space-y-1">
                  <div>
                    <strong className="text-zinc-500">Visual:</strong> {item.visualPattern}
                  </div>
                  <div>
                    <strong className="text-zinc-500">Copy Hook:</strong> {item.copywritingPattern}
                  </div>
                </div>
              </div>

              <div className="p-2 rounded bg-zinc-900/80 border border-zinc-800 text-[10px] text-emerald-300 mt-2">
                <strong>Extracted Rule:</strong> {item.extractedRule}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
