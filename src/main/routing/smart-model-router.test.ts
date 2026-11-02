import { describe, expect, it } from 'vitest'
import { SmartModelRouter } from './smart-model-router'

describe('SmartModelRouter', () => {
  const router = new SmartModelRouter()

  it('routes trivial tasks to cost-efficient lightweight models', () => {
    const recommendation = router.analyzeTask({
      prompt: 'Fix typo in readme',
      impactedFilesCount: 1,
      strategy: 'balanced'
    })

    expect(recommendation.tier).toBe('trivial')
    expect(recommendation.recommendedModelId).toBe('gpt-4o-mini')
    expect(recommendation.providerName).toBe('OpenAI')
    expect(recommendation.reasoningRecommended).toBe(false)
    expect(recommendation.estimatedCostUsd).toBeLessThan(0.01)
  })

  it('routes complex multi-file refactoring to advanced coding models', () => {
    const recommendation = router.analyzeTask({
      prompt: 'Refactor database schema and authentication pipeline across services',
      impactedFilesCount: 5,
      hasGitDiff: true,
      strategy: 'balanced'
    })

    expect(['complex', 'expert_reasoning']).toContain(recommendation.tier)
    expect(recommendation.complexityScore).toBeGreaterThanOrEqual(7)
    expect(recommendation.recommendedModelId).toMatch(
      /claude-3-5-sonnet|claude-3-7-sonnet-thinking/
    )
  })

  it('identifies race conditions and recommends deep reasoning models', () => {
    const recommendation = router.analyzeTask({
      prompt:
        'Debug intermittent race condition and memory leak causing deadlock in worker thread pool',
      strategy: 'balanced'
    })

    expect(recommendation.tier).toBe('expert_reasoning')
    expect(recommendation.reasoningRecommended).toBe(true)
    expect(recommendation.recommendedModelId).toBe('claude-3-7-sonnet-thinking')
  })

  it('respects cost_saving routing strategy', () => {
    const trivialRec = router.analyzeTask({
      prompt: 'explain what is a promise',
      strategy: 'cost_saving'
    })
    expect(trivialRec.recommendedModelId).toBe('deepseek-chat')

    const reasoningRec = router.analyzeTask({
      prompt: 'solve algorithmic deadlock race condition',
      strategy: 'cost_saving'
    })
    expect(reasoningRec.recommendedModelId).toBe('deepseek-reasoner')
  })

  it('always picks top reasoning model for max_intelligence strategy', () => {
    const recommendation = router.analyzeTask({
      prompt: 'simple rename variable',
      strategy: 'max_intelligence'
    })

    expect(recommendation.recommendedModelId).toBe('claude-3-7-sonnet-thinking')
    expect(recommendation.providerName).toBe('Anthropic')
  })
})
