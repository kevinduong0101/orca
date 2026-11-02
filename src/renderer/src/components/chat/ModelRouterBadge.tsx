import { Brain, Check, Layers, Sparkles, Zap } from 'lucide-react'
import type { ModelRecommendation } from '../../../../shared/model-router-types'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'

type ModelRouterBadgeProps = {
  recommendation: ModelRecommendation | null
  currentModelId?: string
  onApplyModel?: (modelId: string) => void
}

export const ModelRouterBadge = ({
  recommendation,
  currentModelId,
  onApplyModel
}: ModelRouterBadgeProps): JSX.Element | null => {
  if (!recommendation) {
    return null
  }

  const isCurrent = currentModelId === recommendation.recommendedModelId

  const getTierIcon = () => {
    switch (recommendation.tier) {
      case 'trivial': {
        return <Zap className="h-3 w-3 text-emerald-500" />
      }
      case 'standard': {
        return <Sparkles className="h-3 w-3 text-blue-500" />
      }
      case 'complex': {
        return <Layers className="h-3 w-3 text-violet-500" />
      }
      case 'expert_reasoning': {
        return <Brain className="h-3 w-3 text-rose-500 animate-pulse" />
      }
    }
  }

  const getTierLabel = () => {
    switch (recommendation.tier) {
      case 'trivial': {
        return 'Nhẹ & Nhanh'
      }
      case 'standard': {
        return 'Tiêu chuẩn'
      }
      case 'complex': {
        return 'Tái cấu trúc phức tạp'
      }
      case 'expert_reasoning': {
        return 'Suy luận sâu'
      }
    }
  }

  return (
    <div className="flex items-center gap-2 rounded-md border border-border/40 bg-muted/30 px-2 py-1 text-xs text-muted-foreground transition-all">
      <div className="flex items-center gap-1.5">
        {getTierIcon()}
        <span className="font-medium text-foreground">{recommendation.recommendedModelId}</span>
        <Badge variant="outline" className="text-[10px] px-1 py-0 border-border/60">
          {getTierLabel()}
        </Badge>
      </div>

      <div className="hidden sm:flex items-center gap-1 text-[11px] text-muted-foreground/80">
        <span>•</span>
        <span>Ước tính: ${recommendation.estimatedCostUsd.toFixed(4)}</span>
      </div>

      {!isCurrent && onApplyModel && (
        <Button
          variant="ghost"
          size="sm"
          className="h-5 px-1.5 text-[11px] font-medium text-primary hover:bg-primary/10"
          onClick={() => {
            onApplyModel(recommendation.recommendedModelId)
          }}
          title={recommendation.reason}
        >
          Áp dụng
        </Button>
      )}

      {isCurrent && (
        <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
          <Check className="h-2.5 w-2.5" /> Đang dùng
        </span>
      )}
    </div>
  )
}
