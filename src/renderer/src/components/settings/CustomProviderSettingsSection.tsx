import { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { Badge } from '../ui/badge'
import { SearchableSetting } from './SearchableSetting'
import {
  POPULAR_PROVIDER_PRESETS,
  type CustomProviderConfig,
  type CustomProviderPreset
} from '../../../../shared/custom-provider-types'

export type CustomProviderSettingsSectionProps = {
  providers?: CustomProviderConfig[]
  onSaveProvider?: (provider: CustomProviderConfig) => void
  onDeleteProvider?: (providerId: string) => void
}

const DEFAULT_PROVIDERS: CustomProviderConfig[] = []

export function CustomProviderSettingsSection({
  providers = DEFAULT_PROVIDERS,
  onSaveProvider,
  onDeleteProvider
}: CustomProviderSettingsSectionProps): React.JSX.Element {
  const [selectedPreset, setSelectedPreset] = useState<string>('deepseek')
  const [name, setName] = useState('DeepSeek AI')
  const [baseUrl, setBaseUrl] = useState('https://api.deepseek.com/v1')
  const [apiKey, setApiKey] = useState('')
  const [defaultModel, setDefaultModel] = useState('deepseek-chat')
  const [contextWindow, setContextWindow] = useState('64000')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleApplyPreset = (preset: CustomProviderPreset): void => {
    setSelectedPreset(preset.id)
    setName(preset.name)
    setBaseUrl(preset.baseUrl)
    const firstModel = preset.suggestedModels[0]
    if (firstModel) {
      setDefaultModel(firstModel.id)
      setContextWindow(String(firstModel.contextWindow))
    }
    setTestResult(null)
  }

  const handleTestConnection = async (): Promise<void> => {
    if (!baseUrl.trim()) {
      setTestResult({ success: false, message: 'Base URL không được để trống' })
      return
    }

    setTesting(true)
    setTestResult(null)

    try {
      const url = baseUrl.endsWith('/') ? `${baseUrl}models` : `${baseUrl}/models`
      const headers: Record<string, string> = { Accept: 'application/json' }
      if (apiKey.trim()) {
        headers.Authorization = `Bearer ${apiKey.trim()}`
      }

      const res = await fetch(url, { method: 'GET', headers })
      if (res.ok) {
        setTestResult({
          success: true,
          message: 'Kết nối thành công! Server sẵn sàng phục vụ.'
        })
      } else {
        setTestResult({
          success: false,
          message: `Lỗi kết nối: HTTP ${res.status} (${res.statusText})`
        })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setTestResult({
        success: false,
        message: `Không thể kết nối tới endpoint: ${msg}`
      })
    } finally {
      setTesting(false)
    }
  }

  const handleSave = (): void => {
    if (!name.trim() || !baseUrl.trim()) {
      return
    }

    const newProvider: CustomProviderConfig = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      protocol: 'openai',
      baseUrl: baseUrl.trim(),
      apiKey: apiKey.trim(),
      defaultModel: defaultModel.trim(),
      contextWindow: Number.parseInt(contextWindow, 10) || 128000,
      enabled: true,
      models: [
        {
          id: defaultModel.trim(),
          displayName: defaultModel.trim(),
          contextWindow: Number.parseInt(contextWindow, 10) || 128000
        }
      ]
    }

    if (onSaveProvider) {
      onSaveProvider(newProvider)
    }

    setTestResult({ success: true, message: 'Đã lưu cấu hình nhà cung cấp thành công!' })
  }

  return (
    <section id="accounts-custom-providers" className="space-y-6 scroll-mt-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">
            Universal AI Providers & BYOK (Orca Next)
          </h3>
          <Badge
            variant="outline"
            className="text-[10px] font-medium border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
          >
            Multi-Provider Ready
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Thêm bất kỳ API key và endpoint OpenAI-compatible nào để sử dụng linh hoạt Claude, Codex,
          Gemini, DeepSeek, Qwen hoặc Local LLM.
        </p>
      </div>

      {/* Preset Cards */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Chọn mẫu nhà cung cấp nhanh:</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {POPULAR_PROVIDER_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className={`flex flex-col items-start rounded-lg border p-2.5 text-left transition-all ${
                selectedPreset === preset.id
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-border/60 hover:border-border hover:bg-muted/50'
              }`}
            >
              <span className="text-xs font-semibold">{preset.name}</span>
              <span className="text-[10px] text-muted-foreground truncate w-full">
                {preset.baseUrl}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Configuration Form */}
      <div className="rounded-xl border border-border/60 bg-card p-4 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="provider-name" className="text-xs font-medium">
              Tên hiển thị
            </Label>
            <Input
              id="provider-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: DeepSeek R1 Custom"
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="provider-base-url" className="text-xs font-medium">
              Base URL (API Endpoint)
            </Label>
            <Input
              id="provider-base-url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.deepseek.com/v1"
              className="h-8 text-xs font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="provider-api-key" className="text-xs font-medium">
              API Key (Tùy chọn cho local Ollama)
            </Label>
            <Input
              id="provider-api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="h-8 text-xs font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="provider-default-model" className="text-xs font-medium">
              Mô hình mặc định
            </Label>
            <Input
              id="provider-default-model"
              value={defaultModel}
              onChange={(e) => setDefaultModel(e.target.value)}
              placeholder="deepseek-reasoner"
              className="h-8 text-xs"
            />
          </div>
        </div>

        {testResult && (
          <div
            className={`rounded-lg p-2.5 text-xs ${
              testResult.success
                ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                : 'border border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300'
            }`}
          >
            {testResult.message}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-border/40">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleTestConnection}
            disabled={testing}
            className="text-xs h-8"
          >
            {testing ? 'Đang kiểm tra kết nối...' : 'Kiểm tra kết nối (Test Connection)'}
          </Button>

          <Button type="button" size="sm" onClick={handleSave} className="text-xs h-8 font-medium">
            Lưu nhà cung cấp
          </Button>
        </div>
      </div>

      {/* Existing Configured Providers List */}
      {providers.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Nhà cung cấp đã lưu:</Label>
          <div className="space-y-2">
            {providers.map((p) => (
              <SearchableSetting
                key={p.id}
                title={p.name}
                description={`${p.baseUrl} — Mặc định: ${p.defaultModel}`}
                keywords={['provider', p.name.toLowerCase(), p.defaultModel.toLowerCase()]}
                className="flex items-center justify-between gap-4 py-2 border rounded-lg px-3 bg-muted/20"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {p.protocol}
                  </Badge>
                  {onDeleteProvider && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteProvider(p.id)}
                      className="text-xs text-destructive hover:bg-destructive/10 h-7 px-2"
                    >
                      Xóa
                    </Button>
                  )}
                  <Switch checked={p.enabled} aria-label={`Bật/tắt ${p.name}`} />
                </div>
              </SearchableSetting>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
