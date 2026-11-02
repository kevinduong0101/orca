export type ComplexityTier = 'trivial' | 'standard' | 'complex' | 'expert_reasoning'

export type RoutingStrategy = 'cost_saving' | 'balanced' | 'max_intelligence'

export type ModelRecommendation = {
  recommendedModelId: string
  providerName: string
  tier: ComplexityTier
  complexityScore: number
  reason: string
  estimatedInputTokens: number
  estimatedOutputTokens: number
  estimatedCostUsd: number
  reasoningRecommended: boolean
}

export type AnalyzeTaskInput = {
  prompt: string
  impactedFilesCount?: number
  hasGitDiff?: boolean
  contextTokenCount?: number
  strategy?: RoutingStrategy
}
