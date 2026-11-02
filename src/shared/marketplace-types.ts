export type MarketplaceItemType = 'skill' | 'mcp_server' | 'plugin'

export type MarketplaceCategory =
  | 'testing'
  | 'productivity'
  | 'devtools'
  | 'database'
  | 'code_review'
  | 'workflow'

export type MarketplaceItem = {
  id: string
  name: string
  type: MarketplaceItemType
  category: MarketplaceCategory
  author: string
  description: string
  installed: boolean
  enabled: boolean
  tags: string[]
  installCommand?: string
  configTemplate?: Record<string, unknown>
}

export type MarketplaceQueryOptions = {
  type?: MarketplaceItemType
  category?: MarketplaceCategory
  search?: string
  onlyInstalled?: boolean
}

export type MarketplaceActionResult = {
  success: boolean
  item: MarketplaceItem
  message?: string
}
