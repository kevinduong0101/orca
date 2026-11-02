import { useState } from 'react'
import { Boxes, Database, Download, Globe, Power, Search, Sparkles, Trash2 } from 'lucide-react'
import type { MarketplaceItem } from '../../../../shared/marketplace-types'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

type SkillsMcpMarketplaceProps = {
  items: MarketplaceItem[]
  onInstall?: (id: string) => void
  onUninstall?: (id: string) => void
  onToggle?: (id: string, enabled: boolean) => void
}

type FilterTab = 'all' | 'skill' | 'mcp_server' | 'installed'

export const SkillsMcpMarketplace = ({
  items,
  onInstall,
  onUninstall,
  onToggle
}: SkillsMcpMarketplaceProps): JSX.Element => {
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredItems = items.filter((item) => {
    if (activeTab === 'skill' && item.type !== 'skill') {
      return false
    }
    if (activeTab === 'mcp_server' && item.type !== 'mcp_server') {
      return false
    }
    if (activeTab === 'installed' && !item.installed) {
      return false
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchName = item.name.toLowerCase().includes(q)
      const matchDesc = item.description.toLowerCase().includes(q)
      const matchTag = item.tags.some((t) => t.toLowerCase().includes(q))
      if (!matchName && !matchDesc && !matchTag) {
        return false
      }
    }

    return true
  })

  const getItemIcon = (item: MarketplaceItem) => {
    if (item.type === 'skill') {
      return <Sparkles className="h-4 w-4 text-amber-500" />
    }
    if (item.category === 'database') {
      return <Database className="h-4 w-4 text-emerald-500" />
    }
    if (item.category === 'testing') {
      return <Globe className="h-4 w-4 text-blue-500" />
    }
    return <Boxes className="h-4 w-4 text-violet-500" />
  }

  return (
    <div className="flex h-full flex-col space-y-4 p-4 text-foreground">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Skills & MCP Marketplace</h2>
          <p className="text-xs text-muted-foreground">
            Mở rộng năng lực Agent với bộ công cụ kỹ năng và giao thức Model Context Protocol.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm tiện ích, công cụ..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
            }}
            className="pl-8 h-9 text-xs"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 border-b border-border/40 pb-2">
        <Button
          variant={activeTab === 'all' ? 'secondary' : 'ghost'}
          size="sm"
          className="h-7 text-xs px-2.5"
          onClick={() => {
            setActiveTab('all')
          }}
        >
          Tất cả ({items.length})
        </Button>
        <Button
          variant={activeTab === 'skill' ? 'secondary' : 'ghost'}
          size="sm"
          className="h-7 text-xs px-2.5"
          onClick={() => {
            setActiveTab('skill')
          }}
        >
          Skills ({items.filter((i) => i.type === 'skill').length})
        </Button>
        <Button
          variant={activeTab === 'mcp_server' ? 'secondary' : 'ghost'}
          size="sm"
          className="h-7 text-xs px-2.5"
          onClick={() => {
            setActiveTab('mcp_server')
          }}
        >
          MCP Servers ({items.filter((i) => i.type === 'mcp_server').length})
        </Button>
        <Button
          variant={activeTab === 'installed' ? 'secondary' : 'ghost'}
          size="sm"
          className="h-7 text-xs px-2.5"
          onClick={() => {
            setActiveTab('installed')
          }}
        >
          Đã cài đặt ({items.filter((i) => i.installed).length})
        </Button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto scrollbar-sleek pr-1">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="flex flex-col justify-between rounded-lg border border-border/60 bg-card p-3 shadow-sm hover:border-border transition-all"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted/30">
                    {getItemIcon(item)}
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold leading-none">{item.name}</h3>
                    <span className="text-[10px] text-muted-foreground">bởi {item.author}</span>
                  </div>
                </div>

                <Badge variant="outline" className="text-[9px] px-1 py-0 uppercase tracking-wider">
                  {item.type === 'skill' ? 'Skill' : 'MCP'}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {item.description}
              </p>

              <div className="flex flex-wrap gap-1 pt-1">
                {item.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[9px] px-1 py-0">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2.5">
              {!item.installed ? (
                <Button
                  size="sm"
                  className="h-7 text-xs gap-1 w-full"
                  onClick={() => {
                    if (onInstall) {
                      onInstall(item.id)
                    }
                  }}
                >
                  <Download className="h-3 w-3" /> Cài đặt 1-Click
                </Button>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-7 text-xs gap-1 px-2 ${
                      item.enabled
                        ? 'text-emerald-500 hover:text-emerald-600'
                        : 'text-muted-foreground'
                    }`}
                    onClick={() => {
                      if (onToggle) {
                        onToggle(item.id, !item.enabled)
                      }
                    }}
                  >
                    <Power className="h-3 w-3" />
                    {item.enabled ? 'Đang bật' : 'Đã tắt'}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-destructive hover:bg-destructive/10 px-2 gap-1"
                    onClick={() => {
                      if (onUninstall) {
                        onUninstall(item.id)
                      }
                    }}
                  >
                    <Trash2 className="h-3 w-3" /> Gỡ bỏ
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="col-span-full py-12 text-center text-xs text-muted-foreground">
            Không tìm thấy tiện ích nào phù hợp với bộ lọc hiện tại.
          </div>
        )}
      </div>
    </div>
  )
}
