import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useData, type Platform } from '../../context/DataContext'
import { generateFromVideo, AVAILABLE_MODELS, CONTENT_STYLES, type ContentStyle } from '../../services/openrouter'
import { extractVideoId, fetchVideoInfo, fetchTranscript, type VideoInfo } from '../../services/youtube'
import { Button } from '../ui/button'
import { Card } from '../ui/card'

interface VideoToPostsModalProps {
  isOpen: boolean
  onClose: () => void
}

type Step = 'url' | 'configure' | 'generating' | 'results'

const POST_COUNT_OPTIONS = [5, 10, 15]
const SUPPORTED_PLATFORMS: Platform[] = ['Facebook', 'Instagram', 'Twitter']

export function VideoToPostsModal({ isOpen, onClose }: VideoToPostsModalProps) {
  const { t } = useTranslation()
  const { brands, selectedBrandId, settings, addPost, updateSettings } = useData()

  // State
  const [step, setStep] = useState<Step>('url')
  const [videoUrl, setVideoUrl] = useState('')
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [transcript, setTranscript] = useState('')
  const [manualTranscript, setManualTranscript] = useState('')
  const [showManualInput, setShowManualInput] = useState(false)

  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('Instagram')
  const [selectedStyle, setSelectedStyle] = useState<ContentStyle>('viral')
  const [numberOfPosts, setNumberOfPosts] = useState(10)

  const [generatedPosts, setGeneratedPosts] = useState<string[]>([])
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editedContent, setEditedContent] = useState('')

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

      // Try to fetch transcript
      try {
        const transcriptText = await fetchTranscript(videoId)
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

  // Save single post as draft
  const handleSaveDraft = (content: string) => {
    if (!selectedBrand) return
    addPost({
      brandId: selectedBrand.id,
      platform: selectedPlatform,
      content,
      status: 'draft'
    })
  }

  // Save all posts as drafts
  const handleSaveAllDrafts = () => {
    if (!selectedBrand) return
    generatedPosts.forEach(content => {
      addPost({
        brandId: selectedBrand.id,
        platform: selectedPlatform,
        content,
        status: 'draft'
      })
    })
    handleClose()
  }

  // Remove a post from results
  const handleRemovePost = (index: number) => {
    setGeneratedPosts(posts => posts.filter((_, i) => i !== index))
  }

  // Reset and close
  const handleClose = () => {
    setStep('url')
    setVideoUrl('')
    setVideoInfo(null)
    setTranscript('')
    setManualTranscript('')
    setShowManualInput(false)
    setGeneratedPosts([])
    setEditingIndex(null)
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

                {/* Manual Transcript Input */}
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

                {/* Error */}
                {error && !showManualInput && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
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
                  <p className="text-sm text-muted-foreground">
                    {t('videoToPosts.generatedCount', { count: generatedPosts.length })}
                  </p>
                  <Button onClick={handleSaveAllDrafts} size="sm">
                    {t('videoToPosts.saveAllDrafts')}
                  </Button>
                </div>

                {/* Posts List */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                  {generatedPosts.map((post, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-lg bg-background border border-border"
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
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="text-xs text-muted-foreground">
                              {t('videoToPosts.postNumber', { number: index + 1 })}
                            </span>
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
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSaveDraft(post)}
                            >
                              {t('videoToPosts.saveDraft')}
                            </Button>
                          </div>
                        </>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
