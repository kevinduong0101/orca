import React from 'react'
import {
  Webhook,
  Send,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Clock
} from 'lucide-react'

export function MarketingBackupSettingsCard({
  webhookUrl,
  setWebhookUrl,
  handleSaveWebhook,
  handleTestPing,
  isPinging,
  pingStatus,
  missedPolicy,
  setMissedPolicy,
  handleExportJson,
  handleImportJson,
  onSeedDemo,
  onClearAll
}: {
  webhookUrl: string
  setWebhookUrl: (url: string) => void
  handleSaveWebhook: () => void
  handleTestPing: () => void
  isPinging: boolean
  pingStatus: string | null
  missedPolicy: 'run_latest' | 'catch_up_all' | 'skip_notify'
  setMissedPolicy: (p: 'run_latest' | 'catch_up_all' | 'skip_notify') => void
  handleExportJson: () => void
  handleImportJson: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSeedDemo: () => void
  onClearAll: () => void
}): React.JSX.Element {
  return (
    <>
      {/* Outbound Webhook Fallback */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Webhook className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-zinc-100">Outbound Webhook Fallback</h3>
            <p className="text-xs text-zinc-400">
              Send scheduled payloads to n8n, Make.com or Buffer webhooks
            </p>
          </div>
        </div>
        <div className="flex gap-2 pt-1">
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
            <Download className="size-3.5" /> Export Campaign (JSON)
          </button>
          <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium cursor-pointer transition-colors">
            <Upload className="size-3.5" /> Import Campaign (JSON)
            <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
          </label>
          <button
            type="button"
            onClick={onSeedDemo}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-medium transition-colors"
          >
            <RefreshCw className="size-3.5" /> Load Sample Campaign
          </button>
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-medium transition-colors ml-auto"
          >
            <Trash2 className="size-3.5" /> Clear All Posts
          </button>
        </div>
      </div>
    </>
  )
}
