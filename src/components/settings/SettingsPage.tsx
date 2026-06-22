import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, CheckCircle, XCircle, Loader2, RefreshCw } from "lucide-react"
import { Button, Input, Label, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Slider, Switch } from "@/components/ui"
import { useSettingsStore } from "@/stores"
import type { AIProvider } from "@/types/ai"

interface ConnectionStatus {
  success: boolean
  message: string
  models?: string[]
}

export function SettingsPage() {
  const navigate = useNavigate()
  const { settings, updateSettings, updateAIConfig } = useSettingsStore()
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null)
  const [isTesting, setIsTesting] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)

  const testConnection = async () => {
    setIsTesting(true)
    setConnectionStatus(null)

    try {
      const { ai } = settings
      const response = await fetch(`${ai.endpoint}/models`, {
        headers: ai.apiKey ? { Authorization: `Bearer ${ai.apiKey}` } : {},
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      const models = data.data?.map((m: { id: string }) => m.id).sort() || []

      setConnectionStatus({
        success: true,
        message: `Connected. ${models.length} model(s) available.`,
        models,
      })

      if (models.length > 0 && !ai.model) {
        updateAIConfig({ model: models[0] })
      }
    } catch (err) {
      setConnectionStatus({
        success: false,
        message: err instanceof Error ? err.message : "Connection failed",
      })
    } finally {
      setIsTesting(false)
    }
  }

  const handleProviderChange = (provider: AIProvider) => {
    const endpoints: Record<AIProvider, string> = {
      "openai-compatible": "http://localhost:1234/v1",
      "lm-studio": "http://localhost:1234/v1",
      ollama: "http://localhost:11434/v1",
      openai: "https://api.openai.com/v1",
      custom: settings.ai.endpoint,
    }
    updateAIConfig({ provider, endpoint: endpoints[provider] })
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h2 className="text-xl font-semibold text-text-primary">Settings</h2>
        </div>

        <section className="space-y-4">
          <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wide">AI Configuration</h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Provider</Label>
              <Select
                value={settings.ai.provider}
                onValueChange={(v) => handleProviderChange(v as AIProvider)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai-compatible">OpenAI Compatible</SelectItem>
                  <SelectItem value="lm-studio">LM Studio</SelectItem>
                  <SelectItem value="ollama">Ollama</SelectItem>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>API Endpoint</Label>
              <Input
                value={settings.ai.endpoint}
                onChange={(e) => updateAIConfig({ endpoint: e.target.value })}
                placeholder="http://localhost:1234/v1"
              />
            </div>

            <div className="space-y-2">
              <Label>API Key</Label>
              <div className="relative">
                <Input
                  type={showApiKey ? "text" : "password"}
                  value={settings.ai.apiKey}
                  onChange={(e) => updateAIConfig({ apiKey: e.target.value })}
                  placeholder="Enter API key..."
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                >
                  {showApiKey ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Model</Label>
              <div className="flex gap-2">
                <Select
                  value={settings.ai.model}
                  onValueChange={(v) => updateAIConfig({ model: v })}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select model..." />
                  </SelectTrigger>
                  <SelectContent>
                    {connectionStatus?.models?.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                    {!connectionStatus?.models?.length && (
                      <SelectItem value="unknown" disabled>
                        {settings.ai.model || "No models loaded"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={testConnection}
                  disabled={isTesting}
                >
                  {isTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {connectionStatus && (
              <div className={`flex items-center gap-2 p-3 rounded-md ${
                connectionStatus.success ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
              }`}>
                {connectionStatus.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <span className="text-sm">{connectionStatus.message}</span>
              </div>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wide">AI Behavior</h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Default System Prompt</Label>
              <Textarea
                value={settings.ai.systemPrompt}
                onChange={(e) => updateAIConfig({ systemPrompt: e.target.value })}
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Temperature: {settings.ai.temperature.toFixed(1)}</Label>
              <Slider
                value={[settings.ai.temperature]}
                onValueChange={([v]) => updateAIConfig({ temperature: v })}
                min={0}
                max={2}
                step={0.1}
              />
            </div>

            <div className="space-y-2">
              <Label>Max Tokens</Label>
              <Input
                type="number"
                value={settings.ai.maxTokens}
                onChange={(e) => updateAIConfig({ maxTokens: parseInt(e.target.value) || 1024 })}
                min={100}
                max={4096}
              />
            </div>

            <div className="space-y-2">
              <Label>Max Context Size</Label>
              <Input
                type="number"
                value={settings.ai.maxContextSize}
                onChange={(e) => updateAIConfig({ maxContextSize: parseInt(e.target.value) || 32768 })}
                min={1024}
                step={512}
              />
              <p className="text-xs text-text-secondary">
                Maximum context window in tokens (used for AI Lorebook generation budget). Estimated ~{Math.floor(settings.ai.maxContextSize / 4)} characters.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Retries per Entry on Failure</Label>
              <Input
                type="number"
                value={settings.ai.maxRetriesPerEntry}
                onChange={(e) => updateAIConfig({ maxRetriesPerEntry: Math.max(0, parseInt(e.target.value) || 0) })}
                min={0}
                max={10}
              />
              <p className="text-xs text-text-secondary">
                How many times to automatically retry a failed concept, persona, or character entry before aborting. Set to 0 to disable retries.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wide">App Preferences</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Theme</Label>
                <p className="text-xs text-text-secondary">Current: {settings.theme}</p>
              </div>
              <Select
                value={settings.theme}
                onValueChange={(v) => updateSettings({ theme: v as "dark" | "light" | "system" })}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Sidebar Default</Label>
                <p className="text-xs text-text-secondary">Expanded or collapsed on load</p>
              </div>
              <Select
                value={settings.sidebarExpanded ? "expanded" : "collapsed"}
                onValueChange={(v) => updateSettings({ sidebarExpanded: v === "expanded" })}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expanded">Expanded</SelectItem>
                  <SelectItem value="collapsed">Collapsed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-save</Label>
                <p className="text-xs text-text-secondary">Automatically save drafts</p>
              </div>
              <Select
                value={settings.autoSave}
                onValueChange={(v) => updateSettings({ autoSave: v as "off" | "5s" | "10s" | "30s" })}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="off">Off</SelectItem>
                  <SelectItem value="5s">After 5s</SelectItem>
                  <SelectItem value="10s">After 10s</SelectItem>
                  <SelectItem value="30s">After 30s</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Show Token Count</Label>
                <p className="text-xs text-text-secondary">Display token counts in editor</p>
              </div>
              <Switch
                checked={settings.showTokenCount}
                onCheckedChange={(checked) => updateSettings({ showTokenCount: checked })}
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wide">Danger Zone</h3>

          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm("Clear all app data? This will remove all settings and draft data.")) {
                  localStorage.removeItem("loregenius-settings")
                  localStorage.removeItem("lorebook-draft")
                  window.location.reload()
                }
              }}
            >
              Clear All App Data
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (confirm("Reset all settings to defaults?")) {
                  useSettingsStore.getState().resetToDefaults()
                }
              }}
            >
              Reset Settings
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}