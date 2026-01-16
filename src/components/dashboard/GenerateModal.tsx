import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useData, PLATFORMS, type Platform } from '../../context/DataContext'
import { useSubscription } from '../../context/SubscriptionContext'
import { api } from '../../lib/api'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { DateTimePicker } from '../ui/calendar'

// Content styles available
const CONTENT_STYLES = [
  { value: 'viral', label: 'Viral', description: 'Optimized for maximum engagement and shares' },
  { value: 'storytelling', label: 'Story', description: 'Narrative-driven content that connects' },
  { value: 'educational', label: 'Educational', description: 'Informative and valuable content' },
  { value: 'controversial', label: 'Controversial', description: 'Bold takes that spark discussion' },
  { value: 'inspirational', label: 'Inspirational', description: 'Motivating and uplifting messages' },
] as const

type ContentStyle = typeof CONTENT_STYLES[number]['value']

interface GenerateModalProps {
  isOpen: boolean
  onClose: () => void
}

export function GenerateModal({ isOpen, onClose }: GenerateModalProps) {
  const { t } = useTranslation()
  const { brands, selectedBrandId, addPost } = useData()
  const { canCreatePost, incrementPostCount, openUpgradeModal, getUsagePercentage, getRemainingCount } = useSubscription()
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('Instagram')
  const [selectedStyle, setSelectedStyle] = useState<ContentStyle>('viral')
  const [topic, setTopic] = useState('')
  const [generatedContent, setGeneratedContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'configure' | 'result' | 'schedule'>('configure')
  const [scheduledDateTime, setScheduledDateTime] = useState<Date | null>(null)
  const [availableModels, setAvailableModels] = useState<Array<{ value: string; label: string }>>([])
  const [selectedModel, setSelectedModel] = useState('anthropic/claude-3-haiku')

  const selectedBrand = brands.find(b => b.id === selectedBrandId) || brands[0]

  // Load available models from backend
  useEffect(() => {
    if (isOpen) {
      api.getAIModels().then(models => {
        setAvailableModels(models)
        if (models.length > 0 && !models.find(m => m.value === selectedModel)) {
          setSelectedModel(models[0].value)
        }
      }).catch(console.error)
    }
  }, [isOpen])

  const handleGenerate = async () => {
    // Check post limit before generating
    if (!canCreatePost()) {
      handleClose()
      openUpgradeModal('post')
      return
    }

    if (!selectedBrand) {
      setError(t('generateModal.selectBrand'))
      return
    }

    setIsGenerating(true)
    setError('')

    try {
      const result = await api.generateContent({
        brandId: selectedBrand.id,
        platform: selectedPlatform,
        topic: topic || undefined,
        style: selectedStyle,
        model: selectedModel
      })
      setGeneratedContent(result.content)
      setStep('result')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('generateModal.error'))
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveAsDraft = async () => {
    if (!selectedBrand || !generatedContent) return

    try {
      await addPost({
        brandId: selectedBrand.id,
        platform: selectedPlatform,
        content: generatedContent,
        status: 'draft'
      })

      // Increment post count for subscription tracking
      incrementPostCount()
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save post')
    }
  }

  const handleOpenScheduler = () => {
    // Set default to tomorrow at 9am
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(9, 0, 0, 0)
    setScheduledDateTime(tomorrow)
    setStep('schedule')
  }

  const handleConfirmSchedule = async () => {
    if (!selectedBrand || !generatedContent || !scheduledDateTime) return

    try {
      await addPost({
        brandId: selectedBrand.id,
        platform: selectedPlatform,
        content: generatedContent,
        status: 'scheduled',
        scheduledFor: scheduledDateTime.toISOString()
      })

      // Increment post count for subscription tracking
      incrementPostCount()
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule post')
    }
  }

  const handleBackToResult = () => {
    setStep('result')
  }

  const handleClose = () => {
    setStep('configure')
    setGeneratedContent('')
    setTopic('')
    setError('')
    setScheduledDateTime(null)
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
          className={`relative w-full mx-4 ${step === 'schedule' ? 'max-w-4xl' : 'max-w-2xl'}`}
        >
          <Card className="p-4 sm:p-6 bg-card border-border max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {step === 'schedule' ? t('generateModal.scheduleTitle') : t('generateModal.title')}
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

            {step === 'configure' && (
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
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
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-primary"
                  >
                    {availableModels.map((model) => (
                      <option key={model.value} value={model.value}>
                        {model.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Usage Warning */}
                {getUsagePercentage('posts', 0) >= 80 && (
                  <div className={`mb-4 p-3 rounded-lg flex items-center justify-between ${
                    getUsagePercentage('posts', 0) >= 100
                      ? 'bg-red-500/10 border border-red-500/20'
                      : 'bg-yellow-500/10 border border-yellow-500/20'
                  }`}>
                    <div className="flex items-center gap-2">
                      <svg className={`w-4 h-4 ${getUsagePercentage('posts', 0) >= 100 ? 'text-red-400' : 'text-yellow-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span className={`text-sm ${getUsagePercentage('posts', 0) >= 100 ? 'text-red-400' : 'text-yellow-400'}`}>
                        {getRemainingCount('posts', 0)} posts remaining this month
                      </span>
                    </div>
                    <button
                      onClick={() => { handleClose(); openUpgradeModal('post'); }}
                      className="text-xs text-primary hover:underline"
                    >
                      Upgrade
                    </button>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !selectedBrand}
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
            )}

            {step === 'result' && (
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
                  <Button onClick={handleOpenScheduler} className="flex-1">
                    {t('generateModal.schedule')}
                  </Button>
                </div>
              </>
            )}

            {step === 'schedule' && (
              <>
                {/* Schedule Step */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <button
                      onClick={handleBackToResult}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-white"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <span className="text-lg font-semibold">{t('generateModal.scheduleTitle')}</span>
                  </div>

                  {/* Content Preview */}
                  <div className="mb-6 p-3 rounded-lg bg-background/50 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-muted-foreground">{selectedPlatform}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/10">
                        {selectedBrand?.name}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{generatedContent}</p>
                  </div>

                  {/* Date Time Picker */}
                  <DateTimePicker
                    selectedDateTime={scheduledDateTime}
                    onDateTimeSelect={setScheduledDateTime}
                    minDate={new Date()}
                  />
                </div>

                {/* Confirm Button */}
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleBackToResult} className="flex-1">
                    {t('generateModal.back')}
                  </Button>
                  <Button
                    onClick={handleConfirmSchedule}
                    disabled={!scheduledDateTime}
                    className="flex-1"
                  >
                    {t('generateModal.confirmSchedule')}
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
