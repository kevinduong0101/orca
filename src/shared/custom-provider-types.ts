export type CustomProviderProtocol = 'openai' | 'anthropic'

export type CustomProviderModel = {
  id: string
  displayName: string
  contextWindow: number
  supportsStreaming?: boolean
  supportsThinking?: boolean
}

export type CustomProviderConfig = {
  id: string
  name: string
  protocol: CustomProviderProtocol
  baseUrl: string
  apiKey: string
  defaultModel: string
  contextWindow?: number
  enabled: boolean
  models: CustomProviderModel[]
}

export type CustomProviderPreset = {
  id: string
  name: string
  protocol: CustomProviderProtocol
  baseUrl: string
  suggestedModels: CustomProviderModel[]
}

export const POPULAR_PROVIDER_PRESETS: CustomProviderPreset[] = [
  {
    id: 'deepseek',
    name: 'DeepSeek AI',
    protocol: 'openai',
    baseUrl: 'https://api.deepseek.com/v1',
    suggestedModels: [
      {
        id: 'deepseek-chat',
        displayName: 'DeepSeek V3 (Chat)',
        contextWindow: 64000,
        supportsStreaming: true,
        supportsThinking: false
      },
      {
        id: 'deepseek-reasoner',
        displayName: 'DeepSeek R1 (Reasoner)',
        contextWindow: 64000,
        supportsStreaming: true,
        supportsThinking: true
      }
    ]
  },
  {
    id: 'qwen',
    name: 'Alibaba Qwen (DashScope)',
    protocol: 'openai',
    baseUrl: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
    suggestedModels: [
      {
        id: 'qwen-plus',
        displayName: 'Qwen Plus',
        contextWindow: 128000,
        supportsStreaming: true
      },
      {
        id: 'qwen-max',
        displayName: 'Qwen Max',
        contextWindow: 128000,
        supportsStreaming: true
      },
      {
        id: 'qwen-coder-plus',
        displayName: 'Qwen 2.5 Coder Plus',
        contextWindow: 128000,
        supportsStreaming: true
      }
    ]
  },
  {
    id: 'openrouter',
    name: 'OpenRouter (Universal Gateway)',
    protocol: 'openai',
    baseUrl: 'https://openrouter.ai/api/v1',
    suggestedModels: [
      {
        id: 'anthropic/claude-3.7-sonnet',
        displayName: 'Claude 3.7 Sonnet (via OpenRouter)',
        contextWindow: 200000,
        supportsStreaming: true,
        supportsThinking: true
      },
      {
        id: 'deepseek/deepseek-r1',
        displayName: 'DeepSeek R1 (via OpenRouter)',
        contextWindow: 128000,
        supportsStreaming: true,
        supportsThinking: true
      }
    ]
  },
  {
    id: 'ollama',
    name: 'Local Ollama / vLLM',
    protocol: 'openai',
    baseUrl: 'http://localhost:11434/v1',
    suggestedModels: [
      {
        id: 'qwen2.5-coder:latest',
        displayName: 'Qwen 2.5 Coder (Local)',
        contextWindow: 32000,
        supportsStreaming: true
      },
      {
        id: 'deepseek-r1:latest',
        displayName: 'DeepSeek R1 (Local)',
        contextWindow: 32000,
        supportsStreaming: true
      }
    ]
  }
]
