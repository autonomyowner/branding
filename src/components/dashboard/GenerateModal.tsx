import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useData, PLATFORMS, type Platform } from '../../context/DataContext'
import { generateContent, AVAILABLE_MODELS, CONTENT_STYLES, type ContentStyle } from '../../services/openrouter'
import { Button } from '../ui/button'
import { Card } from '../ui/card'

interface GenerateModalProps {
  isOpen: boolean
  onClose: () => void
}

export function GenerateModal({ isOpen, onClose }: GenerateModalProps) {
  const { t } = useTranslation()
  const { brands, selectedBrandId, settings, addPost, updateSettings } = useData()
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('Instagram')
  const [selectedStyle, setSelectedStyle] = useState<ContentStyle>('viral')
  const [topic, setTopic] = useState('')
  const [generatedContent, setGeneratedContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'configure' | 'result'>('configure')

  const selectedBrand = brands.find(b => b.id === selectedBrandId) || brands[0]

  const handleGenerate = async () => {
    if (!settings.openRouterApiKey) {
      setError(t('generateModal.apiKeyMissing'))
      return
    }

    if (!selectedBrand) {
      setError(t('generateModal.selectBrand'))
      return
    }

    setIsGenerating(true)
    setError('')

    try {
      const content = await generateContent({
        brand: selectedBrand,
        platform: selectedPlatform,
        topic: topic || undefined,
        apiKey: settings.openRouterApiKey,
        model: settings.selectedModel,
        style: selectedStyle
      })
      setGeneratedContent(content)
      setStep('result')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('generateModal.error'))
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveAsDraft = () => {
    if (!selectedBrand || !generatedContent) return

    addPost({
      brandId: selectedBrand.id,
      platform: selectedPlatform,
      content: generatedContent,
      status: 'draft'
    })

    handleClose()
  }

  const handleSaveAndSchedule = () => {
    if (!selectedBrand || !generatedContent) return

    // For now, schedule for tomorrow at 9am
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(9, 0, 0, 0)

    addPost({
      brandId: selectedBrand.id,
      platform: selectedPlatform,
      content: generatedContent,
      status: 'scheduled',
      scheduledFor: tomorrow.toISOString()
    })

    handleClose()
  }

  const handleClose = () => {
    setStep('configure')
    setGeneratedContent('')
    setTopic('')
    setError('')
    onClose()
  }

  const handleRegenerate = () => {
    setStep('configure')
    setGeneratedContent('')
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl mx-4"
        >
          <Card className="p-6 bg-card border-border">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {step === 'configure' ? t('generateModal.title') : t('generateModal.title')}
              </h2>
              <button
                onClick={handleClose}
                className="text-muted-foreground hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* API Key Warning */}
            {!settings.openRouterApiKey && (
              <div className="mb-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <p className="text-sm text-yellow-400 mb-2">{t('generateModal.apiKeyMissing')}</p>
                <input
                  type="password"
                  placeholder="Enter your OpenRouter API key"
                  className="w-full px-3 py-2 rounded-md bg-background border border-border text-sm"
                  onChange={(e) => updateSettings({ openRouterApiKey: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Get your key at <a href="https://openrouter.ai/keys" target="_blank" className="text-primary hover:underline">openrouter.ai/keys</a>
                </p>
              </div>
            )}

            {step === 'configure' ? (
              <>
                {/* Brand Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">{t('generateModal.selectBrand')}</label>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border">
                    <div
                      className="w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold text-white"
                      style={{ backgroundColor: selectedBrand?.color || '#8b5cf6' }}
                    >
                      {selectedBrand?.initials || '?'}
                    </div>
                    <span>{selectedBrand?.name || t('generateModal.selectBrand')}</span>
                  </div>
                </div>

                {/* Platform Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">{t('generateModal.platform')}</label>
                  <div className="grid grid-cols-5 gap-2">
                    {PLATFORMS.map((platform) => (
                      <button
                        key={platform}
                        onClick={() => setSelectedPlatform(platform)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedPlatform === platform
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background border border-border hover:border-white/20'
                        }`}
                      >
                        {t(`posts.platform.${platform.toLowerCase()}`)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content Style Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">{t('generateModal.style')}</label>
                  <div className="grid grid-cols-5 gap-2">
                    {CONTENT_STYLES.map((style) => (
                      <button
                        key={style.value}
                        onClick={() => setSelectedStyle(style.value)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedStyle === style.value
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background border border-border hover:border-white/20'
                        }`}
                        title={style.description}
                      >
                        {t(`generateModal.styleOptions.${style.value}`)}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {CONTENT_STYLES.find(s => s.value === selectedStyle)?.description}
                  </p>
                </div>

                {/* Topic Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">{t('generateModal.topic')}</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder={t('generateModal.topicPlaceholder')}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave empty to let AI choose from brand topics
                  </p>
                </div>

                {/* Model Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">AI Model</label>
                  <select
                    value={settings.selectedModel}
                    onChange={(e) => updateSettings({ selectedModel: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-primary"
                  >
                    {AVAILABLE_MODELS.map((model) => (
                      <option key={model.value} value={model.value}>
                        {model.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Error */}
                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !settings.openRouterApiKey}
                  className="w-full"
                >
                  {isGenerating ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {t('generateModal.generating')}
                    </span>
                  ) : (
                    t('generateModal.generate')
                  )}
                </Button>
              </>
            ) : (
              <>
                {/* Generated Content Display */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm text-muted-foreground">For {selectedPlatform}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10">
                      {selectedBrand?.name}
                    </span>
                  </div>
                  <div className="p-4 rounded-lg bg-background border border-border min-h-[150px] whitespace-pre-wrap">
                    {generatedContent}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleRegenerate} className="flex-1">
                    {t('generateModal.generate')}
                  </Button>
                  <Button variant="outline" onClick={handleSaveAsDraft} className="flex-1">
                    {t('generateModal.saveDraft')}
                  </Button>
                  <Button onClick={handleSaveAndSchedule} className="flex-1">
                    {t('generateModal.schedule')}
                  </Button>
                </div>
              </>
            )}
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
