import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { useData } from "../../context/DataContext"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { t } = useTranslation()
  const { settings, updateSettings } = useData()
  const [apiKey, setApiKey] = useState(settings.openRouterApiKey)
  const [showKey, setShowKey] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setApiKey(settings.openRouterApiKey)
  }, [settings.openRouterApiKey])

  if (!isOpen) return null

  const handleSave = () => {
    setIsSaving(true)
    updateSettings({ openRouterApiKey: apiKey })
    setTimeout(() => {
      setIsSaving(false)
      onClose()
    }, 300)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{t('settings.title')}</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* OpenRouter API Key Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('settings.apiKey.title')}</h3>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-400 mb-2">
                {t('settings.apiKey.info')}
              </p>
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                {t('settings.apiKey.getKey')} →
              </a>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">
                {t('settings.apiKey.label')}
              </label>
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-or-v1-..."
                  className="w-full px-4 py-2 bg-card border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary pr-24"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs text-muted-foreground hover:text-white transition-colors"
                >
                  {showKey ? t('settings.apiKey.hide') : t('settings.apiKey.show')}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('settings.apiKey.description')}
              </p>
            </div>

            {apiKey && (
              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-sm text-green-400">
                  ✓ {t('settings.apiKey.connected')}
                </p>
              </div>
            )}

            {!apiKey && (
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-sm text-yellow-400">
                  ⚠ {t('settings.apiKey.notSet')}
                </p>
              </div>
            )}
          </div>

          {/* Usage Stats */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('settings.usage.title')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 bg-card/50">
                <p className="text-sm text-muted-foreground mb-1">
                  {t('settings.usage.creditsUsed')}
                </p>
                <p className="text-2xl font-bold">
                  {settings.creditsUsed} <span className="text-sm text-muted-foreground">/ 1000</span>
                </p>
              </Card>
              <Card className="p-4 bg-card/50">
                <p className="text-sm text-muted-foreground mb-1">
                  {t('settings.usage.creditsRemaining')}
                </p>
                <p className="text-2xl font-bold text-primary">
                  {Math.max(0, 1000 - settings.creditsUsed)}
                </p>
              </Card>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {t('settings.usage.resetInfo')}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving ? t('common.saving') : t('common.save')}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
