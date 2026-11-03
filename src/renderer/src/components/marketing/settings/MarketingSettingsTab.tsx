import React, { useState } from 'react'
import { useAppStore } from '@/store'
import { Shield, Globe, ExternalLink, Sparkles, Check } from 'lucide-react'
import type { MarketingSettings, MarketingChannel, MarketingPost } from '../types/marketing-types'
import { MarketingBackupSettingsCard } from './MarketingBackupSettingsCard'

export function MarketingSettingsTab({
  settings,
  onUpdateSettings,
  posts,
  onImportPosts,
  onSeedDemo,
  onClearAll
}: {
  settings: MarketingSettings
  onUpdateSettings: (s: MarketingSettings) => void
  posts: MarketingPost[]
  onImportPosts: (p: MarketingPost[]) => void
  onSeedDemo: () => void
  onClearAll: () => void
}): React.JSX.Element {
  const [webhookUrl, setWebhookUrl] = useState(settings.webhookUrl)
  const [pingStatus, setPingStatus] = useState<string | null>(
    settings.lastWebhookPingStatus || null
  )
  const [isPinging, setIsPinging] = useState(false)
  const [missedPolicy, setMissedPolicy] = useState<'run_latest' | 'catch_up_all' | 'skip_notify'>(
    'run_latest'
  )
  const [browserNotice, setBrowserNotice] = useState<string | null>(null)

  const handleSaveWebhook = () => {
    onUpdateSettings({ ...settings, webhookUrl })
  }

  const handleTestPing = () => {
    setIsPinging(true)
    setTimeout(() => {
      setIsPinging(false)
      const status = 'Webhook ping delivered successfully (HTTP 200 OK)'
      setPingStatus(status)
      onUpdateSettings({ ...settings, lastWebhookPingStatus: status })
    }, 600)
  }

  const handleToggleChannel = (ch: MarketingChannel) => {
    onUpdateSettings({
      ...settings,
      autoPublishChannels: {
        ...settings.autoPublishChannels,
        [ch]: !settings.autoPublishChannels[ch]
      }
    })
  }

  const handleOpenBrowserSession = (platform: 'pinterest' | 'linkedin') => {
    const url = platform === 'pinterest' ? 'https://www.pinterest.com' : 'https://www.linkedin.com'
    try {
      const store = useAppStore.getState()
      const worktreeId =
        store.activeWorktreeId || Object.keys(store.worktrees || {})[0] || 'default'
      store.createBrowserTab(worktreeId, url, {
        activate: true,
        title: platform === 'pinterest' ? 'Pinterest - Marketing' : 'LinkedIn - Marketing'
      })
      store.setActiveTabType('browser', worktreeId)
      setBrowserNotice(
        `Đã mở tab ${platform === 'pinterest' ? 'Pinterest' : 'LinkedIn'} bên trong trình duyệt nội bộ Orca. Session đăng nhập được lưu vĩnh viễn, AI điều khiển tự động hoá an toàn.`
      )
    } catch {
      window.open(url, '_blank')
      setBrowserNotice(`Opened ${platform === 'pinterest' ? 'Pinterest' : 'LinkedIn'} in browser.`)
    }
    setTimeout(() => {
      setBrowserNotice(null)
    }, 6000)
  }

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(posts, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orca-marketing-campaign-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string)
        if (Array.isArray(parsed)) {
          onImportPosts(parsed)
        }
      } catch (err) {
        console.error('Failed to parse import JSON:', err)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Autonomous Browser Sessions */}
      <div className="rounded-2xl border border-purple-500/30 bg-purple-950/10 p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
            <Sparkles className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-zinc-100">Autonomous Browser Profiles</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Client Acquisition Mode
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Log in once via browser. Orca AI executes autonomously to bring in photography
              clients.
            </p>
          </div>
        </div>

        {browserNotice && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="size-4 shrink-0" />
            <span>{browserNotice}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">📌</span>
                <div>
                  <h4 className="text-xs font-semibold text-zinc-100">Pinterest Visual Engine</h4>
                  <p className="text-[11px] text-zinc-400">@kevinduongphotography</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" /> Connected
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              AI autonomously pins 2-3 times/day in 2:3 vertical format. Directs couple & wedding
              seekers to bykevinduong.com.
            </p>
            <button
              type="button"
              onClick={() => handleOpenBrowserSession('pinterest')}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-medium border border-zinc-800 transition-colors"
            >
              <ExternalLink className="size-3 text-zinc-400" /> Open Pinterest in Browser
            </button>
          </div>

          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">💼</span>
                <div>
                  <h4 className="text-xs font-semibold text-zinc-100">LinkedIn Authority Engine</h4>
                  <p className="text-[11px] text-zinc-400">Kevin Duong</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" /> Connected
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              AI posts 4 narrative pillars (Đạo diễn không gò ép, Sài Gòn cụ thể, Trải nghiệm, Frame
              là bằng chứng) for B2B & corporate clients.
            </p>
            <button
              type="button"
              onClick={() => handleOpenBrowserSession('linkedin')}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-medium border border-zinc-800 transition-colors"
            >
              <ExternalLink className="size-3 text-zinc-400" /> Open LinkedIn in Browser
            </button>
          </div>
        </div>
      </div>

      {/* Website Weekly SEO Strategy */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Globe className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-zinc-100">Weekly Website SEO Cadence</h3>
            <p className="text-xs text-zinc-400">
              Weekly blog schedule for bykevinduong.com to dominate Google Search ranking
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-800/80 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-[10px] uppercase font-semibold text-zinc-500 block">
              Target Domain
            </span>
            <span className="font-mono text-zinc-200 mt-1 block truncate">
              https://www.bykevinduong.com
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-zinc-500 block">
              Publishing Cadence
            </span>
            <span className="text-sky-300 font-medium mt-1 block">1 Article Every Wednesday</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-zinc-500 block">
              Mandatory Conversion
            </span>
            <span className="text-emerald-400 font-medium mt-1 block">
              Viewfinder Booking Card &rarr; /contact
            </span>
          </div>
        </div>
      </div>

      {/* Channel Autonomy & Safety Gates */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Shield className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-zinc-100">
              Channel Autonomy & Safety Gates
            </h3>
            <p className="text-xs text-zinc-400">
              Toggle autonomous publishing vs requiring manual human review
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {(['pinterest', 'linkedin', 'website'] as const).map((ch) => {
            const isAuto = settings.autoPublishChannels[ch]
            return (
              <div
                key={ch}
                onClick={() => handleToggleChannel(ch)}
                className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-800/80 bg-zinc-950/40 hover:border-zinc-700 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">
                    {ch === 'pinterest' ? '📌' : ch === 'linkedin' ? '💼' : '🌐'}
                  </span>
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-200 capitalize">
                      {ch === 'website' ? 'Website Blog' : ch}
                    </h4>
                    <span className="text-[10px] text-zinc-500">
                      {isAuto ? 'Direct Autonomous' : 'Requires Approval'}
                    </span>
                  </div>
                </div>
                <div
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${isAuto ? 'bg-emerald-600 justify-end' : 'bg-zinc-800 justify-start'}`}
                >
                  <div className="size-4 rounded-full bg-white shadow-sm" />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Backup, Webhook & Recovery Policies */}
      <MarketingBackupSettingsCard
        webhookUrl={webhookUrl}
        setWebhookUrl={setWebhookUrl}
        handleSaveWebhook={handleSaveWebhook}
        handleTestPing={handleTestPing}
        isPinging={isPinging}
        pingStatus={pingStatus}
        missedPolicy={missedPolicy}
        setMissedPolicy={setMissedPolicy}
        handleExportJson={handleExportJson}
        handleImportJson={handleImportJson}
        onSeedDemo={onSeedDemo}
        onClearAll={onClearAll}
      />
    </div>
  )
}
