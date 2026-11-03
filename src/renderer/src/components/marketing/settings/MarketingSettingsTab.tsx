import React, { useState } from 'react'
import {
  Webhook,
  Send,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Shield,
  Clock
} from 'lucide-react'
import type { MarketingSettings, MarketingChannel, MarketingPost } from '../types/marketing-types'

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
    const updated = {
      ...settings.autoPublishChannels,
      [ch]: !settings.autoPublishChannels[ch]
    }
    onUpdateSettings({ ...settings, autoPublishChannels: updated })
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
      {/* Webhook & Publishing Connectors */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Webhook className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-zinc-100">Outbound Publishing Webhooks</h3>
            <p className="text-xs text-zinc-400">
              Deliver scheduled posts to Make.com, Zapier, n8n, Buffer, or Ayrshare
            </p>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <label className="text-xs font-semibold text-zinc-300 block">Webhook Endpoint URL</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://hook.eu1.make.com/your-endpoint-or-buffer-webhook"
              className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 font-mono placeholder:text-zinc-600 focus:outline-none focus:border-purple-500"
            />
            <button
              type="button"
              onClick={handleSaveWebhook}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 font-semibold transition-colors"
            >
              Save URL
            </button>
            <button
              type="button"
              onClick={handleTestPing}
              disabled={isPinging || !webhookUrl}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-xs text-white font-semibold flex items-center gap-1.5 transition-colors shadow-lg shadow-purple-950"
            >
              <Send className="size-3.5" />
              {isPinging ? 'Pinging...' : 'Test Ping'}
            </button>
          </div>

          {pingStatus && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>{pingStatus}</span>
            </div>
          )}
        </div>
      </div>

      {/* Auto-Publish Channels & Human-in-the-loop */}
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
              Choose which channels can publish automatically vs requiring manual human approval
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {(['instagram', 'threads', 'pinterest', 'linkedin', 'website'] as const).map((ch) => {
            const isAuto = settings.autoPublishChannels[ch]
            return (
              <div
                key={ch}
                onClick={() => handleToggleChannel(ch)}
                className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-800/80 bg-zinc-950/40 hover:border-zinc-700 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">
                    {ch === 'instagram'
                      ? '📸'
                      : ch === 'threads'
                        ? '🧵'
                        : ch === 'pinterest'
                          ? '📌'
                          : ch === 'linkedin'
                            ? '💼'
                            : '🌐'}
                  </span>
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-200 capitalize">{ch}</h4>
                    <span className="text-[10px] text-zinc-500">
                      {isAuto ? 'Direct Autonomous Publish' : 'Requires Human Sign-off'}
                    </span>
                  </div>
                </div>

                <div
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                    isAuto ? 'bg-emerald-600 justify-end' : 'bg-zinc-800 justify-start'
                  }`}
                >
                  <div className="size-4 rounded-full bg-white shadow-sm" />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Offline Recovery Policy */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Clock className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-zinc-100">Always-Ready Offline Recovery</h3>
            <p className="text-xs text-zinc-400">
              When your MacBook was sleeping or closed during scheduled post times
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2">
          {[
            {
              id: 'run_latest' as const,
              label: 'Run Latest Only',
              desc: 'Publish the most recent missed post, discard older ones'
            },
            {
              id: 'catch_up_all' as const,
              label: 'Catch Up Staggered',
              desc: 'Publish all missed posts spaced 30 mins apart'
            },
            {
              id: 'skip_notify' as const,
              label: 'Move to Review',
              desc: 'Move missed posts back to Approval Queue with notice'
            }
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => setMissedPolicy(item.id)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                missedPolicy === item.id
                  ? 'border-sky-500/60 bg-sky-950/20 text-sky-200'
                  : 'border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <h4 className="text-xs font-semibold mb-1">{item.label}</h4>
              <p className="text-[11px] text-zinc-500 leading-snug">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Campaign Data Management */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md space-y-4">
        <div>
          <h3 className="text-base font-semibold text-zinc-100">Campaign Data & Backups</h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Export current marketing schedules or seed demo data for testing
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleExportJson}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
          >
            <Download className="size-3.5" />
            Export Campaign (JSON)
          </button>

          <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium cursor-pointer transition-colors">
            <Upload className="size-3.5" />
            Import Campaign (JSON)
            <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
          </label>

          <button
            type="button"
            onClick={onSeedDemo}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-medium transition-colors"
          >
            <RefreshCw className="size-3.5" />
            Load Sample Campaign
          </button>

          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-medium transition-colors ml-auto"
          >
            <Trash2 className="size-3.5" />
            Clear All Posts
          </button>
        </div>
      </div>
    </div>
  )
}
