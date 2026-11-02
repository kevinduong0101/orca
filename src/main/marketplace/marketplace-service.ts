import type {
  MarketplaceActionResult,
  MarketplaceItem,
  MarketplaceQueryOptions
} from '../../shared/marketplace-types'

const CURATED_MARKETPLACE_ITEMS: Omit<MarketplaceItem, 'installed' | 'enabled'>[] = [
  {
    id: 'skill-ponytail',
    name: 'Ponytail Senior Dev Mode',
    type: 'skill',
    category: 'productivity',
    author: 'DietrichGebert',
    description:
      'Bộ quy tắc tinh gọn: code ngắn nhất, rõ ràng nhất, chống over-engineering và nợ kỹ thuật.',
    tags: ['ponytail', 'yagni', 'refactor', 'code-review'],
    installCommand: 'npx @agents/cli add DietrichGebert/ponytail'
  },
  {
    id: 'skill-code-review',
    name: 'Code Review & Quality Gate',
    type: 'skill',
    category: 'code_review',
    author: 'addyosmani',
    description:
      'Rà soát đa chiều (bảo mật, hiệu năng, style guide) trước khi tạo pull request hoặc merge.',
    tags: ['review', 'quality', 'security', 'linter'],
    installCommand: 'npx @agents/cli add addyosmani/agent-skills/code-review-and-quality'
  },
  {
    id: 'skill-test-driven-development',
    name: 'Test-Driven Development (TDD)',
    type: 'skill',
    category: 'testing',
    author: 'addyosmani',
    description: 'Quy trình phát triển theo chu trình Red-Green-Refactor bảo đảm 100% test pass.',
    tags: ['tdd', 'unit-test', 'vitest', 'coverage'],
    installCommand: 'npx @agents/cli add addyosmani/agent-skills/test-driven-development'
  },
  {
    id: 'mcp-github',
    name: 'GitHub Official MCP Server',
    type: 'mcp_server',
    category: 'devtools',
    author: 'modelcontextprotocol',
    description: 'Quản lý PRs, issues, commits, repositories trực tiếp từ Agent prompt.',
    tags: ['github', 'pr', 'issues', 'git'],
    configTemplate: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-github'],
      env: { GITHUB_PERSONAL_ACCESS_TOKEN: '' }
    }
  },
  {
    id: 'mcp-postgres',
    name: 'PostgreSQL Database Explorer',
    type: 'mcp_server',
    category: 'database',
    author: 'modelcontextprotocol',
    description: 'Truy vấn, xem cấu trúc schema và quan hệ bảng dữ liệu PostgreSQL an toàn.',
    tags: ['postgres', 'sql', 'database', 'schema'],
    configTemplate: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-postgres', 'postgresql://localhost/mydb']
    }
  },
  {
    id: 'mcp-playwright',
    name: 'Playwright Headless Browser MCP',
    type: 'mcp_server',
    category: 'testing',
    author: 'microsoft',
    description:
      'Cho phép AI điều khiển trình duyệt, chụp ảnh screenshot, click và kiểm thử E2E tự động.',
    tags: ['playwright', 'browser', 'e2e', 'scraping'],
    configTemplate: {
      command: 'npx',
      args: ['-y', '@playwright/mcp-server']
    }
  }
]

export class MarketplaceService {
  private items = new Map<string, MarketplaceItem>()

  public constructor() {
    this.initDefaultItems()
  }

  private initDefaultItems(): void {
    for (const item of CURATED_MARKETPLACE_ITEMS) {
      this.items.set(item.id, {
        ...item,
        installed: false,
        enabled: false
      })
    }
  }

  public getItems(options: MarketplaceQueryOptions = {}): MarketplaceItem[] {
    let result = Array.from(this.items.values())

    if (options.type) {
      result = result.filter((i) => i.type === options.type)
    }

    if (options.category) {
      result = result.filter((i) => i.category === options.category)
    }

    if (options.onlyInstalled) {
      result = result.filter((i) => i.installed)
    }

    if (options.search) {
      const q = options.search.toLowerCase()
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.tags.some((t) => t.toLowerCase().includes(q))
      )
    }

    return result
  }

  public getItem(id: string): MarketplaceItem | undefined {
    return this.items.get(id)
  }

  public installItem(id: string): MarketplaceActionResult {
    const item = this.items.get(id)
    if (!item) {
      return {
        success: false,
        item: {
          id,
          name: id,
          type: 'skill',
          category: 'productivity',
          author: 'unknown',
          description: 'Not found',
          installed: false,
          enabled: false,
          tags: []
        },
        message: `Không tìm thấy tiện ích với ID: ${id}`
      }
    }

    item.installed = true
    item.enabled = true

    return {
      success: true,
      item: { ...item },
      message: `Đã cài đặt thành công ${item.name}`
    }
  }

  public uninstallItem(id: string): MarketplaceActionResult {
    const item = this.items.get(id)
    if (!item) {
      return {
        success: false,
        item: {
          id,
          name: id,
          type: 'skill',
          category: 'productivity',
          author: 'unknown',
          description: 'Not found',
          installed: false,
          enabled: false,
          tags: []
        },
        message: `Không tìm thấy tiện ích với ID: ${id}`
      }
    }

    item.installed = false
    item.enabled = false

    return {
      success: true,
      item: { ...item },
      message: `Đã gỡ bỏ ${item.name}`
    }
  }

  public toggleItem(id: string, enabled?: boolean): MarketplaceActionResult {
    const item = this.items.get(id)
    if (!item) {
      return {
        success: false,
        item: {
          id,
          name: id,
          type: 'skill',
          category: 'productivity',
          author: 'unknown',
          description: 'Not found',
          installed: false,
          enabled: false,
          tags: []
        },
        message: `Không tìm thấy tiện ích với ID: ${id}`
      }
    }

    if (!item.installed) {
      return {
        success: false,
        item: { ...item },
        message: 'Phải cài đặt tiện ích trước khi bật/tắt'
      }
    }

    item.enabled = enabled !== undefined ? enabled : !item.enabled

    return {
      success: true,
      item: { ...item },
      message: item.enabled ? `Đã kích hoạt ${item.name}` : `Đã vô hiệu hóa ${item.name}`
    }
  }

  public registerCustomItem(item: Omit<MarketplaceItem, 'installed' | 'enabled'>): MarketplaceItem {
    const created: MarketplaceItem = {
      ...item,
      installed: false,
      enabled: false
    }
    this.items.set(item.id, created)
    return created
  }

  public syncWithLocalEnvironment(installedSkillIds: string[], installedMcpIds: string[]): void {
    const allInstalledIds = new Set([...installedSkillIds, ...installedMcpIds])

    for (const [id, item] of this.items.entries()) {
      if (allInstalledIds.has(id)) {
        item.installed = true
        item.enabled = true
      }
    }
  }

  public clear(): void {
    this.items.clear()
    this.initDefaultItems()
  }
}

export const marketplaceService = new MarketplaceService()
