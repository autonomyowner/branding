import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useData, type Platform } from '../../context/DataContext'
import { generateFromVideo, AVAILABLE_MODELS, CONTENT_STYLES, type ContentStyle } from '../../services/openrouter'
import { extractVideoId, fetchVideoInfo, fetchTranscript, type VideoInfo } from '../../services/youtube'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { DateTimePicker } from '../ui/calendar'

interface VideoToPostsModalProps {
  isOpen: boolean
  onClose: () => void
}

type Step = 'url' | 'configure' | 'generating' | 'results'
type InputMode = 'url' | 'manual'

interface PostSelection {
  selected: boolean
  scheduledFor: Date | null
  status: 'draft' | 'scheduled'
}

const POST_COUNT_OPTIONS = [5, 10, 15]
const SUPPORTED_PLATFORMS: Platform[] = ['Facebook', 'Instagram', 'Twitter']

export function VideoToPostsModal({ isOpen, onClose }: VideoToPostsModalProps) {
  const { t } = useTranslation()
  const { brands, selectedBrandId, settings, addPost, updateSettings } = useData()

  // State
  const [step, setStep] = useState<Step>('url')
  const [inputMode, setInputMode] = useState<InputMode>('url')
  const [videoUrl, setVideoUrl] = useState('')
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [transcript, setTranscript] = useState('')
  const [manualTranscript, setManualTranscript] = useState('')
  const [showManualInput, setShowManualInput] = useState(false)

  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('Instagram')
  const [selectedStyle, setSelectedStyle] = useState<ContentStyle>('viral')
  const [numberOfPosts, setNumberOfPosts] = useState(10)

  const [generatedPosts, setGeneratedPosts] = useState<string[]>([])
  const [postSelections, setPostSelections] = useState<PostSelection[]>([])
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editedContent, setEditedContent] = useState('')
  const [schedulingIndex, setSchedulingIndex] = useState<number | null>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState('')

  const selectedBrand = brands.find(b => b.id === selectedBrandId) || brands[0]

  // Fetch video info and transcript
  const handleFetchVideo = async () => {
    setError('')
    setIsLoading(true)
    setProgress(t('videoToPosts.fetchingVideo'))

    try {
      const videoId = extractVideoId(videoUrl)
      if (!videoId) {
        throw new Error(t('videoToPosts.invalidUrl'))
      }

      // Fetch video info
      const info = await fetchVideoInfo(videoId)
      setVideoInfo(info)
      setProgress(t('videoToPosts.fetchingTranscript'))

      // Try to fetch transcript (with YouTube API key if available)
      try {
        const transcriptText = await fetchTranscript(videoId, settings.youtubeApiKey)
        setTranscript(transcriptText)
        setStep('configure')
      } catch {
        // Transcript fetch failed, show manual input option
        setShowManualInput(true)
        setError(t('videoToPosts.transcriptError'))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('videoToPosts.fetchError'))
    } finally {
      setIsLoading(false)
      setProgress('')
    }
  }

  // Use manual transcript
  const handleUseManualTranscript = () => {
    if (manualTranscript.trim().length < 100) {
      setError(t('videoToPosts.transcriptTooShort'))
      return
    }
    setTranscript(manualTranscript)
    setShowManualInput(false)
    setError('')
    setStep('configure')
  }

  // Handle direct manual transcript submission (from manual tab)
  const handleSubmitManualTranscript = () => {
    if (manualTranscript.trim().length < 100) {
      setError(t('videoToPosts.transcriptTooShort'))
      return
    }
    setTranscript(manualTranscript)
    setError('')
    setStep('configure')
  }

  // Generate posts from video
  const handleGenerate = async () => {
    if (!settings.openRouterApiKey) {
      setError(t('generateModal.apiKeyMissing'))
      return
    }

    if (!selectedBrand) {
      setError(t('generateModal.selectBrand'))
      return
    }

    setStep('generating')
    setIsLoading(true)
    setError('')
    setProgress(t('videoToPosts.generatingPosts'))

    try {
      const posts = await generateFromVideo({
        brand: selectedBrand,
        platform: selectedPlatform,
        transcript,
        videoTitle: videoInfo?.title || 'Video',
        numberOfPosts,
        apiKey: settings.openRouterApiKey,
        model: settings.selectedModel,
        style: selectedStyle
      })

      setGeneratedPosts(posts)
      // Initialize post selections - all selected by default, as drafts
      setPostSelections(posts.map(() => ({
        selected: true,
        scheduledFor: null,
        status: 'draft' as const
      })))
      setStep('results')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('videoToPosts.generateError'))
      setStep('configure')
    } finally {
      setIsLoading(false)
      setProgress('')
    }
  }

  // Edit a post
  const handleStartEdit = (index: number) => {
    setEditingIndex(index)
    setEditedContent(generatedPosts[index])
  }

  const handleSaveEdit = () => {
    if (editingIndex !== null) {
      const newPosts = [...generatedPosts]
      newPosts[editingIndex] = editedContent
      setGeneratedPosts(newPosts)
      setEditingIndex(null)
      setEditedContent('')
    }
  }

  const handleCancelEdit = () => {
    setEditingIndex(null)
    setEditedContent('')
  }

  // Toggle post selection
  const handleToggleSelection = (index: number) => {
    setPostSelections(prev => prev.map((sel, i) =>
      i === index ? { ...sel, selected: !sel.selected } : sel
    ))
  }

  // Toggle all selections
  const handleToggleAllSelections = () => {
    const allSelected = postSelections.every(sel => sel.selected)
    setPostSelections(prev => prev.map(sel => ({ ...sel, selected: !allSelected })))
  }

  // Open scheduling for a post
  const handleOpenScheduling = (index: number) => {
    // Set default to tomorrow at 9am
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(9, 0, 0, 0)

    setPostSelections(prev => prev.map((sel, i) =>
      i === index ? { ...sel, scheduledFor: sel.scheduledFor || tomorrow, status: 'scheduled' } : sel
    ))
    setSchedulingIndex(index)
  }

  // Confirm scheduling for a post
  const handleConfirmScheduling = (date: Date) => {
    if (schedulingIndex === null) return
    setPostSelections(prev => prev.map((sel, i) =>
      i === schedulingIndex ? { ...sel, scheduledFor: date, status: 'scheduled' } : sel
    ))
    setSchedulingIndex(null)
  }

  // Cancel scheduling
  const handleCancelScheduling = () => {
    setSchedulingIndex(null)
  }

  // Set post as draft (remove scheduling)
  const handleSetAsDraft = (index: number) => {
    setPostSelections(prev => prev.map((sel, i) =>
      i === index ? { ...sel, scheduledFor: null, status: 'draft' } : sel
    ))
  }

  // Save single post
  const handleSavePost = (index: number) => {
    if (!selectedBrand) return
    const content = generatedPosts[index]
    const selection = postSelections[index]

    addPost({
      brandId: selectedBrand.id,
      platform: selectedPlatform,
      content,
      status: selection.status,
      scheduledFor: selection.scheduledFor?.toISOString()
    })

    // Mark as unselected after saving
    setPostSelections(prev => prev.map((sel, i) =>
      i === index ? { ...sel, selected: false } : sel
    ))
  }

  // Save all selected posts
  const handleSaveSelected = () => {
    if (!selectedBrand) return

    generatedPosts.forEach((content, index) => {
      const selection = postSelections[index]
      if (!selection.selected) return

      addPost({
        brandId: selectedBrand.id,
        platform: selectedPlatform,
        content,
        status: selection.status,
        scheduledFor: selection.scheduledFor?.toISOString()
      })
    })
    handleClose()
  }

  // Remove a post from results
  const handleRemovePost = (index: number) => {
    setGeneratedPosts(posts => posts.filter((_, i) => i !== index))
    setPostSelections(prev => prev.filter((_, i) => i !== index))
  }

  // Reset and close
  const handleClose = () => {
    setStep('url')
    setInputMode('url')
    setVideoUrl('')
    setVideoInfo(null)
    setTranscript('')
    setManualTranscript('')
    setShowManualInput(false)
    setGeneratedPosts([])
    setPostSelections([])
    setEditingIndex(null)
    setSchedulingIndex(null)
    setError('')
    onClose()
  }

  const handleBack = () => {
    if (step === 'configure') {
      setStep('url')
      setShowManualInput(false)
    } else if (step === 'results') {
      setStep('configure')
    }
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
          className={`relative w-full mx-4 ${step === 'results' ? 'max-w-4xl' : 'max-w-2xl'} max-h-[90vh] overflow-hidden`}
        >
          <Card className="p-6 bg-card border-border flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {step !== 'url' && step !== 'generating' && (
                  <button
                    onClick={handleBack}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-white"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                <h2 className="text-xl font-bold">{t('videoToPosts.title')}</h2>
              </div>
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
              </div>
            )}

            {/* Step 1: URL Input */}
            {step === 'url' && (
              <div className="space-y-4">
                {/* Input Mode Tabs */}
                <div className="flex gap-2 p-1 rounded-lg bg-background border border-border">
                  <button
                    onClick={() => { setInputMode('url'); setError(''); }}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      inputMode === 'url'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-white'
                    }`}
                  >
                    {t('videoToPosts.urlMode')}
                  </button>
                  <button
                    onClick={() => { setInputMode('manual'); setError(''); }}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      inputMode === 'manual'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-white'
                    }`}
                  >
                    {t('videoToPosts.manualMode')}
                  </button>
                </div>

                {/* URL Mode */}
                {inputMode === 'url' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">{t('videoToPosts.pasteUrl')}</label>
                      <input
                        type="text"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://youtube.com/watch?v=..."
                        className="w-full px-4 py-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-primary"
                      />
                    </div>

                    {/* Video Preview */}
                    {videoInfo && (
                      <div className="p-4 rounded-lg bg-background border border-border">
                        <div className="flex gap-4">
                          <img
                            src={videoInfo.thumbnail}
                            alt={videoInfo.title}
                            className="w-32 h-20 object-cover rounded"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoInfo.videoId}/hqdefault.jpg`
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm line-clamp-2">{videoInfo.title}</h3>
                            <p className="text-xs text-muted-foreground mt-1">{videoInfo.channelName}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Manual Transcript Input (fallback when auto-extract fails) */}
                    {showManualInput && (
                      <div className="space-y-3">
                        <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                          <p className="text-sm text-orange-400 mb-2">{t('videoToPosts.manualTranscriptHint')}</p>
                          <p className="text-xs text-orange-400/70">{t('videoToPosts.apiKeyHint')}</p>
                        </div>
                        <textarea
                          value={manualTranscript}
                          onChange={(e) => setManualTranscript(e.target.value)}
                          placeholder={t('videoToPosts.pasteTranscript')}
                          rows={6}
                          className="w-full px-4 py-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-primary resize-none"
                        />
                        <Button onClick={handleUseManualTranscript} className="w-full">
                          {t('videoToPosts.useTranscript')}
                        </Button>
                      </div>
                    )}

                    {/* Progress */}
                    {progress && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        {progress}
                      </div>
                    )}

                    {!showManualInput && (
                      <Button
                        onClick={handleFetchVideo}
                        disabled={!videoUrl.trim() || isLoading}
                        className="w-full"
                      >
                        {isLoading ? t('videoToPosts.fetching') : t('videoToPosts.fetchVideo')}
                      </Button>
                    )}
                  </>
                )}

                {/* Manual Mode - Direct Transcript Input */}
                {inputMode === 'manual' && (
                  <>
                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <p className="text-sm text-blue-400">{t('videoToPosts.manualModeHint')}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">{t('videoToPosts.transcriptLabel')}</label>
                      <textarea
                        value={manualTranscript}
                        onChange={(e) => setManualTranscript(e.target.value)}
                        placeholder={t('videoToPosts.pasteTranscript')}
                        rows={10}
                        className="w-full px-4 py-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-primary resize-none"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {manualTranscript.length} {t('videoToPosts.characters')} ({t('videoToPosts.min100')})
                      </p>
                    </div>
                    <Button
                      onClick={handleSubmitManualTranscript}
                      disabled={manualTranscript.trim().length < 100}
                      className="w-full"
                    >
                      {t('videoToPosts.continueWithTranscript')}
                    </Button>
                  </>
                )}

                {/* Error */}
                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Configure */}
            {step === 'configure' && (
              <div className="space-y-4">
                {/* Video Info */}
                {videoInfo && (
                  <div className="p-3 rounded-lg bg-background/50 border border-border">
                    <p className="text-sm font-medium line-clamp-1">{videoInfo.title}</p>
                    <p className="text-xs text-muted-foreground">{videoInfo.channelName}</p>
                  </div>
                )}

                {/* Brand */}
                <div>
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
                <div>
                  <label className="block text-sm font-medium mb-2">{t('generateModal.platform')}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {SUPPORTED_PLATFORMS.map((platform) => (
                      <button
                        key={platform}
                        onClick={() => setSelectedPlatform(platform)}
                        className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          selectedPlatform === platform
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background border border-border hover:border-white/20'
                        }`}
                      >
                        {platform === 'Twitter' ? 'X' : platform}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Style Selection */}
                <div>
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
                      >
                        {t(`generateModal.styleOptions.${style.value}`)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Number of Posts */}
                <div>
                  <label className="block text-sm font-medium mb-2">{t('videoToPosts.numberOfPosts')}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {POST_COUNT_OPTIONS.map((count) => (
                      <button
                        key={count}
                        onClick={() => setNumberOfPosts(count)}
                        className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          numberOfPosts === count
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background border border-border hover:border-white/20'
                        }`}
                      >
                        {count} {t('videoToPosts.posts')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Model Selection */}
                <div>
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
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleGenerate}
                  disabled={!settings.openRouterApiKey}
                  className="w-full"
                >
                  {t('videoToPosts.generateButton', { count: numberOfPosts })}
                </Button>
              </div>
            )}

            {/* Step 3: Generating */}
            {step === 'generating' && (
              <div className="py-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <div className="h-8 w-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t('videoToPosts.generating')}</h3>
                <p className="text-sm text-muted-foreground">{t('videoToPosts.generatingHint')}</p>
              </div>
            )}

            {/* Step 4: Results */}
            {step === 'results' && (
              <div className="flex flex-col min-h-0 flex-1">
                {/* Results Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleToggleAllSelections}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors"
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        postSelections.every(sel => sel.selected)
                          ? 'bg-primary border-primary'
                          : 'border-border'
                      }`}>
                        {postSelections.every(sel => sel.selected) && (
                          <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      {t('videoToPosts.selectAll')}
                    </button>
                    <span className="text-sm text-muted-foreground">
                      ({postSelections.filter(s => s.selected).length}/{generatedPosts.length} {t('videoToPosts.selected')})
                    </span>
                  </div>
                  <Button
                    onClick={handleSaveSelected}
                    size="sm"
                    disabled={!postSelections.some(s => s.selected)}
                  >
                    {t('videoToPosts.saveSelected')}
                  </Button>
                </div>

                {/* Posts List */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                  {generatedPosts.map((post, index) => {
                    const selection = postSelections[index]
                    if (!selection) return null

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 rounded-lg border transition-colors ${
                          selection.selected
                            ? 'bg-background border-primary/30'
                            : 'bg-background/50 border-border opacity-60'
                        }`}
                      >
                        {editingIndex === index ? (
                          <div className="space-y-3">
                            <textarea
                              value={editedContent}
                              onChange={(e) => setEditedContent(e.target.value)}
                              rows={4}
                              className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm focus:outline-none focus:border-primary resize-none"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={handleSaveEdit}>
                                {t('videoToPosts.save')}
                              </Button>
                              <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                                {t('videoToPosts.cancel')}
                              </Button>
                            </div>
                          </div>
                        ) : schedulingIndex === index ? (
                          /* Scheduling Mode */
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{t('videoToPosts.schedulePost')}</span>
                              <button
                                onClick={handleCancelScheduling}
                                className="text-muted-foreground hover:text-white transition-colors"
                              >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                            <div className="text-xs text-muted-foreground line-clamp-2 mb-2">{post}</div>
                            <DateTimePicker
                              selectedDateTime={selection.scheduledFor}
                              onDateTimeSelect={handleConfirmScheduling}
                              minDate={new Date()}
                            />
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start gap-3">
                              {/* Checkbox */}
                              <button
                                onClick={() => handleToggleSelection(index)}
                                className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center transition-colors ${
                                  selection.selected
                                    ? 'bg-primary border-primary'
                                    : 'border-border hover:border-white/30'
                                }`}
                              >
                                {selection.selected && (
                                  <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </button>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">
                                      {t('videoToPosts.postNumber', { number: index + 1 })}
                                    </span>
                                    {/* Status Badge */}
                                    {selection.status === 'scheduled' && selection.scheduledFor && (
                                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                                        {selection.scheduledFor.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        {' '}
                                        {selection.scheduledFor.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                                      </span>
                                    )}
                                    {selection.status === 'draft' && (
                                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground border border-border">
                                        {t('videoToPosts.draft')}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => handleStartEdit(index)}
                                      className="p-1 text-muted-foreground hover:text-white transition-colors"
                                      title={t('videoToPosts.edit')}
                                    >
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => handleRemovePost(index)}
                                      className="p-1 text-muted-foreground hover:text-red-400 transition-colors"
                                      title={t('videoToPosts.remove')}
                                    >
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                                <p className="text-sm whitespace-pre-wrap">{post}</p>

                                {/* Action buttons */}
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {selection.status === 'draft' ? (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleOpenScheduling(index)}
                                    >
                                      {t('videoToPosts.addToCalendar')}
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleSetAsDraft(index)}
                                    >
                                      {t('videoToPosts.removeSchedule')}
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleSavePost(index)}
                                  >
                                    {t('videoToPosts.saveNow')}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </motion.div>
                    )
                  })}
                </div>

                {/* Summary Footer */}
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-muted-foreground">
                      <span className="text-white font-medium">{postSelections.filter(s => s.selected && s.status === 'scheduled').length}</span> {t('videoToPosts.toSchedule')},
                      {' '}
                      <span className="text-white font-medium">{postSelections.filter(s => s.selected && s.status === 'draft').length}</span> {t('videoToPosts.toDraft')}
                    </div>
                    <Button
                      onClick={handleSaveSelected}
                      disabled={!postSelections.some(s => s.selected)}
                    >
                      {t('videoToPosts.saveSelected')} ({postSelections.filter(s => s.selected).length})
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
