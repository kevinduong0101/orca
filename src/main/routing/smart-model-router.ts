import type {
  AnalyzeTaskInput,
  ComplexityTier,
  ModelRecommendation,
  RoutingStrategy
} from '../../shared/model-router-types'

const REASONING_KEYWORDS = [
  'race condition',
  'deadlock',
  'memory leak',
  'concurrency',
  'distributed',
  'cryptographic',
  'algorithm optimization',
  'complex bug',
  'intermittent failure',
  'mathematical'
]

const COMPLEX_KEYWORDS = [
  'refactor',
  'architect',
  'migration',
  'redesign',
  'security audit',
  'database schema',
  'pipeline',
  'workflow',
  'multi-file',
  'full-stack'
]

const TRIVIAL_KEYWORDS = [
  'typo',
  'rename',
  'format',
  'comment',
  'docstring',
  'readme',
  'syntax',
  'explain',
  'what is',
  'simple fix'
]

export class SmartModelRouter {
  public analyzeTask(input: AnalyzeTaskInput): ModelRecommendation {
    const prompt = input.prompt.toLowerCase()
    const strategy: RoutingStrategy = input.strategy ?? 'balanced'
    const fileCount = input.impactedFilesCount ?? 0
    const contextTokens = input.contextTokenCount ?? 1500

    let score = 4 // base standard score (1 to 10)
    let reason = 'Tác vụ lập trình tiêu chuẩn'

    // Check for reasoning keywords
    const hasReasoningMatch = REASONING_KEYWORDS.some((kw) => prompt.includes(kw))
    // Check for complex keywords
    const hasComplexMatch = COMPLEX_KEYWORDS.some((kw) => prompt.includes(kw))
    // Check for trivial keywords
    const hasTrivialMatch = TRIVIAL_KEYWORDS.some((kw) => prompt.includes(kw))

    if (hasReasoningMatch) {
      score += 4
      reason = 'Phát hiện bài toán suy luận sâu hoặc lỗi bất đồng bộ phức tạp'
    } else if (hasComplexMatch) {
      score += 2
      reason = 'Phát hiện tác vụ tái cấu trúc kiến trúc hoặc thay đổi nhiều module'
    } else if (hasTrivialMatch && fileCount <= 1 && prompt.length < 150) {
      score -= 2
      reason = 'Tác vụ chỉnh sửa đơn giản hoặc câu hỏi ngắn'
    }

    if (fileCount >= 5) {
      score += 3
      reason = `Phạm vi ảnh hưởng rộng trên ${fileCount} tệp tin`
    } else if (fileCount >= 2) {
      score += 1
    }

    if (input.hasGitDiff) {
      score += 1
    }

    // Clamp score 1 to 10
    const finalScore = Math.max(1, Math.min(10, score))

    let tier: ComplexityTier = 'standard'
    if (finalScore <= 3) {
      tier = 'trivial'
    } else if (finalScore <= 5) {
      tier = 'standard'
    } else if (finalScore <= 7) {
      tier = 'complex'
    } else {
      tier = 'expert_reasoning'
    }

    // Determine model and provider based on strategy and tier
    const recommendation = this.pickModel(tier, strategy)

    const estimatedInputTokens = contextTokens + Math.ceil(input.prompt.length / 3.5)
    const estimatedOutputTokens =
      tier === 'expert_reasoning' ? 3000 : tier === 'complex' ? 1500 : 500
    const estimatedCostUsd = this.estimateCost(
      recommendation.modelId,
      estimatedInputTokens,
      estimatedOutputTokens
    )

    return {
      recommendedModelId: recommendation.modelId,
      providerName: recommendation.provider,
      tier,
      complexityScore: finalScore,
      reason,
      estimatedInputTokens,
      estimatedOutputTokens,
      estimatedCostUsd,
      reasoningRecommended: tier === 'expert_reasoning'
    }
  }

  private pickModel(
    tier: ComplexityTier,
    strategy: RoutingStrategy
  ): { modelId: string; provider: string } {
    if (strategy === 'max_intelligence') {
      return {
        modelId: 'claude-3-7-sonnet-thinking',
        provider: 'Anthropic'
      }
    }

    if (strategy === 'cost_saving') {
      switch (tier) {
        case 'trivial':
        case 'standard': {
          return { modelId: 'deepseek-chat', provider: 'DeepSeek' }
        }
        case 'complex': {
          return { modelId: 'qwen2.5-coder-32b', provider: 'Qwen' }
        }
        case 'expert_reasoning': {
          return { modelId: 'deepseek-reasoner', provider: 'DeepSeek' }
        }
      }
    }

    // Default "balanced" strategy
    switch (tier) {
      case 'trivial': {
        return { modelId: 'gpt-4o-mini', provider: 'OpenAI' }
      }
      case 'standard': {
        return { modelId: 'claude-3-5-haiku', provider: 'Anthropic' }
      }
      case 'complex': {
        return { modelId: 'claude-3-5-sonnet', provider: 'Anthropic' }
      }
      case 'expert_reasoning': {
        return { modelId: 'claude-3-7-sonnet-thinking', provider: 'Anthropic' }
      }
    }
  }

  private estimateCost(modelId: string, inputTokens: number, outputTokens: number): number {
    // Pricing per 1M tokens (USD)
    const pricingMap: Record<string, { in: number; out: number }> = {
      'gpt-4o-mini': { in: 0.15, out: 0.6 },
      'deepseek-chat': { in: 0.14, out: 0.28 },
      'deepseek-reasoner': { in: 0.55, out: 2.19 },
      'qwen2.5-coder-32b': { in: 0.2, out: 0.5 },
      'claude-3-5-haiku': { in: 0.8, out: 4 },
      'claude-3-5-sonnet': { in: 3, out: 15 },
      'claude-3-7-sonnet-thinking': { in: 3, out: 15 }
    }

    const rates = pricingMap[modelId] ?? { in: 1, out: 3 }
    const cost = (inputTokens / 1_000_000) * rates.in + (outputTokens / 1_000_000) * rates.out
    return Math.round(cost * 10_000) / 10_000
  }
}

export const smartModelRouter = new SmartModelRouter()
