import React from 'react'
import { AlertCircle, ArrowRight, Lightbulb, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { OrcaRecommendation } from './types/marketing-types'

export function OrcaRecommendationsWidget({
  recommendations,
  onAction
}: {
  recommendations: OrcaRecommendation[]
  onAction?: (rec: OrcaRecommendation) => void
}): React.JSX.Element | null {
  if (!recommendations || recommendations.length === 0) {
    return null
  }
  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/20 via-zinc-900/60 to-purple-950/20 p-5 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
            <Sparkles className="size-4" />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-100 text-sm flex items-center gap-2">
              Orca Proactive Marketing Intelligence
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Live Suggestions
              </span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Autonomous insights based on content gaps, publishing history, and multi-channel
              coverage
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {recommendations.map((rec) => {
          const isHigh = rec.urgency === 'high'
          const isMed = rec.urgency === 'medium'
          return (
            <div
              key={rec.id}
              className={cn(
                'flex flex-col justify-between rounded-xl border p-3.5 transition-all duration-150',
                isHigh
                  ? 'border-rose-500/30 bg-rose-950/15 hover:border-rose-500/50 hover:bg-rose-950/30'
                  : isMed
                    ? 'border-amber-500/30 bg-amber-950/15 hover:border-amber-500/50 hover:bg-amber-950/30'
                    : 'border-sky-500/30 bg-sky-950/15 hover:border-sky-500/50 hover:bg-sky-950/30'
              )}
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span
                    className={cn(
                      'font-semibold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1',
                      isHigh
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : isMed
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    )}
                  >
                    {isHigh ? <AlertCircle className="size-3" /> : <Lightbulb className="size-3" />}
                    {rec.channel} • {rec.urgency}
                  </span>
                </div>
                <h4 className="font-semibold text-zinc-100 text-xs mb-1 line-clamp-1">
                  {rec.title}
                </h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-3">
                  {rec.description}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onAction?.(rec)}
                className="mt-3 inline-flex items-center justify-between w-full rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 px-2.5 py-1.5 text-[11px] font-medium text-zinc-200 transition-colors border border-zinc-700/50 hover:text-white"
              >
                <span>{rec.actionLabel}</span>
                <ArrowRight className="size-3 text-zinc-400 group-hover:text-white" />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
